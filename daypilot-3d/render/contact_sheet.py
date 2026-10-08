"""Tile rendered stills into a labelled contact sheet: python3 render/contact_sheet.py out/stills out/contact_sheet.png [cols]"""
import glob, sys
from PIL import Image, ImageDraw, ImageFont

src, dst = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
files = sorted(glob.glob(f'{src}/f*.png') + glob.glob(f'{src}/f*.jpg'))
tw, th = 640, 360
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 34)), (14, 15, 18))
try:
    font = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf', 20)
except OSError:
    font = ImageFont.load_default()
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    frame = int(f.split('/f')[-1][:4])
    x, y = (i % cols) * tw, (i // cols) * (th + 34)
    sheet.paste(Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 34))
    d.text((x + 10, y + 6), f'{frame / 30:05.2f}s  ·  frame {frame}', fill=(255, 212, 59), font=font)
sheet.save(dst, quality=92) if dst.endswith('.jpg') else sheet.save(dst)
print('wrote', dst)
