import numpy as np, soundfile as sf, subprocess, json
from timeline import build
from assets import CLIP, FOOTAGE
SR = 44100; FPS = 24
tl, TOTAL = build()
N = int((TOTAL + 1)*SR)
def load(fn):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", fn, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
vo = np.zeros(N)
for s in tl:
    for i, l in enumerate(s["lines"]):
        a = load(f"vo/{s['id']}_{i}.wav"); st = int((s["start"] + l["t"])*SR)
        vo[st:st+len(a)] += a[:N-st]
amb = np.zeros(N)
for s in tl:
    if s["id"] not in FOOTAGE: continue
    clip, off, sp, l0, l1, g = FOOTAGE[s["id"]]
    a = load(CLIP[clip]); dur = (l1 if l1 else s["dur"]) + 0.5
    seg = a[int(off*SR): int(off*SR) + int(dur*SR)]
    if len(seg) < int(dur*SR): seg = np.concatenate([seg, seg[::-1]])[:int(dur*SR)]
    n = len(seg); f = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n))/(0.6*SR))
    st = int((s["start"] + l0)*SR); amb[st:st+n] += (seg*f*g)[:N-st]
amb /= max(1e-9, np.abs(amb).max()); amb *= 0.32
# whooshes at scene changes
rng = np.random.default_rng(3); wh = np.zeros(N)
for s in tl[1:]:
    n = int(0.9*SR); x = rng.standard_normal(n); k = np.hanning(n)**2
    y = np.convolve(x, np.ones(40)/40, "same") * k
    st = int((s["start"] - 0.55)*SR); wh[st:st+n] += y[:N-st]
wh /= np.abs(wh).max(); wh *= 0.06
mus = np.load("music.npy")[:N]; mus = np.pad(mus, (0, N - len(mus)))
# ducking from VO envelope
win = int(0.05*SR); e = np.sqrt(np.convolve(vo**2, np.ones(win)/win, "same"))
e = np.convolve((e > 0.01).astype(float), np.ones(int(0.35*SR))/(0.35*SR), "same")
duck = 1 - 0.5*np.clip(e, 0, 1)
vo_n = vo/np.abs(vo).max()*0.9
mix = vo_n*1.0 + mus*0.30*duck + amb*duck**0.5 + wh
mix = np.tanh(mix*1.05)/np.tanh(1.05)
L = mix; R = np.concatenate([np.zeros(8), mix[:-8]])*0.97 + mix*0.03
st = np.stack([L, R], 1)*0.9
sf.write("mix.wav", st.astype(np.float32), SR)
# per-frame features for the avatar
nf = int(TOTAL*FPS) + 2; hop = SR//FPS
rms = np.zeros(nf); spec = np.zeros((nf, 48))
edges = np.geomspace(90, 6000, 49)
fr = np.fft.rfftfreq(2048, 1/SR)
for i in range(nf):
    c = i*hop; w = vo[max(0, c-1024): c+1024]
    if len(w) < 2048: w = np.pad(w, (0, 2048-len(w)))
    rms[i] = np.sqrt((w**2).mean())
    m = np.abs(np.fft.rfft(w*np.hanning(2048)))
    spec[i] = [m[(fr >= edges[k]) & (fr < edges[k+1])].mean() for k in range(48)]
rms /= rms.max(); spec = np.log1p(spec*4); spec /= np.percentile(spec, 99.5); spec = np.clip(spec, 0, 1)
np.save("vo_rms.npy", rms); np.save("vo_spec.npy", spec)
print("mix ok", TOTAL)
