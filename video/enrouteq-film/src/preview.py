import sys, time
from PIL import Image
import render
ts = [float(x) for x in sys.argv[2:]]
ims = []
for t in ts:
    t0 = time.time(); fi = int(t * 24); ims.append(Image.fromarray(render.frame(fi)).resize((960, 540))); print(t, round(time.time() - t0, 2), flush=True)
cols = 2; rows = (len(ims) + 1) // 2
sheet = Image.new("RGB", (960 * cols, 540 * rows))
for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 960, (i // cols) * 540))
sheet.save(sys.argv[1], quality=85)
