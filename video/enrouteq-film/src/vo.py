import json, sys, soundfile as sf, numpy as np
sys.path.insert(0, sys.argv[1])
from script import SCENES
from kokoro_onnx import Kokoro
k = Kokoro(sys.argv[2]+"/kokoro-v1.0.onnx", sys.argv[2]+"/voices-v1.0.bin")
out = {}
for sid, lines, _ in SCENES:
    for i,(cap,tts) in enumerate(lines):
        a, sr = k.create(tts or cap, voice="bm_george", speed=0.97, lang="en-gb")
        a = np.asarray(a, dtype=np.float32)
        # trim silence
        idx = np.where(np.abs(a) > 0.01)[0]
        a = a[max(0, idx[0]-480): idx[-1]+2400]
        fn = f"{sys.argv[1]}/vo/{sid}_{i}.wav"; sf.write(fn, a, sr)
        out[f"{sid}_{i}"] = len(a)/sr
        print(sid, i, round(len(a)/sr,2), flush=True)
json.dump(out, open(sys.argv[1]+"/vo/durations.json","w"), indent=1)
