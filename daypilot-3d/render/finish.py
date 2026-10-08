"""Assemble deliverables from the rendered chunks + score.

    python3 render/finish.py

-> out/DayPilot_3D_30s_1080p30.mp4         (H.264 + AAC, -14 LUFS)
-> out/DayPilot_3D_30s_1080p30_silent.mp4  (picture only)
-> out/stills/*.jpg + out/contact_sheet.jpg (key frames pulled from the final film)
"""
import glob
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'out')
FINAL = os.path.join(OUT, 'DayPilot_3D_30s_1080p30.mp4')
SILENT = os.path.join(OUT, 'DayPilot_3D_30s_1080p30_silent.mp4')
AUDIO = os.path.join(OUT, 'daypilot_audio.wav')
KEY_TIMES = [0.6, 2.6, 4.4, 6.0, 8.0, 10.4, 12.3, 13.6, 15.9, 17.2, 19.2, 21.4, 22.4, 25.6, 27.4, 29.9]


def run(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


parts = sorted(glob.glob(os.path.join(OUT, 'tmp', 'part*.mp4')))
if len(parts) != 3:
    sys.exit(f'expected 3 rendered parts, found {len(parts)}')
lst = os.path.join(OUT, 'tmp', 'parts.txt')
with open(lst, 'w') as f:
    f.writelines(f"file '{p}'\n" for p in parts)
run('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', SILENT)

# two-pass loudness normalisation to -14 LUFS / -1.5 dBTP, with a 28 Hz high-pass for rumble
af = 'highpass=f=28,loudnorm=I=-14:TP=-1.5:LRA=11'
probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', AUDIO, '-af', af + ':print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
af2 = (f"{af}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
       f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
run('ffmpeg', '-y', '-loglevel', 'error', '-i', SILENT, '-i', AUDIO, '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-af', af2, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', FINAL)

os.makedirs(os.path.join(OUT, 'stills'), exist_ok=True)
for old in glob.glob(os.path.join(OUT, 'stills', 'f*.*')):
    os.remove(old)
for t in KEY_TIMES:
    frame = round(t * 30)
    run('ffmpeg', '-y', '-loglevel', 'error', '-i', SILENT, '-vf', f'select=eq(n\\,{frame})', '-vframes', '1',
        '-q:v', '2', os.path.join(OUT, 'stills', f'f{frame:04d}.jpg'))
run(sys.executable, os.path.join(ROOT, 'render', 'contact_sheet.py'), os.path.join(OUT, 'stills'), os.path.join(OUT, 'contact_sheet.jpg'), '4')

info = run('ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration',
           '-of', 'compact', FINAL).stdout
print(info)
print('wrote', FINAL, SILENT)
