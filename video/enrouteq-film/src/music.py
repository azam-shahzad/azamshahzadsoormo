import numpy as np, soundfile as sf, json
from timeline import build
SR = 44100
tl, TOTAL = build()
S = {s["id"]: s for s in tl}
def at(sid, i=None):
    s = S[sid]; return s["start"] if i is None else s["start"] + s["lines"][i]["t"]
N = int((TOTAL + 1) * SR)
rng = np.random.default_rng(7)
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def env_adsr(n, a, r):
    e = np.ones(n); na = min(n, int(a*SR)); nr = min(n, int(r*SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e
def add(buf, start, sig, gain=1.0):
    i = int(start*SR); j = min(len(buf), i+len(sig))
    if j > i: buf[i:j] += sig[:j-i] * gain

def pad_note(f, dur, bright=0.5, a=1.8, r=2.2):
    n = int(dur*SR); t = np.arange(n)/SR; out = np.zeros(n)
    for det in (-0.0021, 0.0, 0.0023):
        ph = rng.uniform(0, 6.28)
        for h in range(1, 8):
            amp = (1/h**(1.9-bright)) * (0.5 + 0.5*np.sin(2*np.pi*0.07*h*t + h))
            out += amp*np.sin(2*np.pi*f*(1+det)*h*t + ph*h)
    return out*env_adsr(n, a, r)/12

def pluck(f, dur=0.6, dec=0.22):
    n = int(dur*SR); t = np.arange(n)/SR
    s = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2*f*t) + 0.12*np.sin(2*np.pi*3*f*t)
    return s*np.exp(-t/dec)*np.minimum(1, t/0.004)

def boom(dur=3.0, f0=62, f1=38):
    n = int(dur*SR); t = np.arange(n)/SR
    f = f1 + (f0-f1)*np.exp(-t/0.12); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.9)*np.minimum(1, t/0.003)

def noise_sweep(dur, lo, hi, rise=True):
    n = int(dur*SR); x = rng.standard_normal(n); y = np.zeros(n); s = 0.0
    fc = np.geomspace(lo, hi, n) if rise else np.geomspace(hi, lo, n)
    a = 1 - np.exp(-2*np.pi*fc/SR)
    for k in range(n):
        s += a[k]*(x[k]-s); y[k] = s
    return y

pads = np.zeros(N); arps = np.zeros(N); low = np.zeros(N); fx = np.zeros(N)
CH = {"Dm": [50, 57, 62, 65, 69], "Bb": [46, 53, 58, 62, 65], "F": [41, 53, 57, 60, 65], "C": [48, 55, 60, 64, 67],
      "Gm": [43, 55, 58, 62, 67], "Am": [45, 52, 57, 60, 64], "Dsus": [50, 57, 62, 64, 69]}
def chord_seq(t0, t1, seq, bar, gain, bright):
    t = t0; i = 0
    while t < t1 - 0.5:
        d = min(bar, t1 - t)
        for n in CH[seq[i % len(seq)]]:
            add(pads, t, pad_note(midi(n), d + 2.0, bright), gain)
        t += bar; i += 1

# A: night tension (drone + heartbeat)
tA1 = at("wheel")
dr = pad_note(midi(38), tA1+2, 0.2, a=3.0, r=2.5) + pad_note(midi(45), tA1+2, 0.2, a=4, r=2.5)*0.7
add(low, 0, dr, 0.9)
chord_seq(at("operator"), tA1, ["Dsus", "Dm"], 7.0, 0.35, 0.3)
t = 1.0
while t < tA1 - 1.0:
    add(low, t, boom(0.6, 70, 45), 0.35); add(low, t+0.28, boom(0.5, 60, 42), 0.22); t += 1.25
for k, t in enumerate(np.arange(at("operator", 0), tA1 - 0.5, 0.625)):
    add(fx, t, pluck(midi(86), 0.2, 0.03), 0.05)
# B: reveal
tB1 = at("live")
chord_seq(tA1, tB1, ["F", "C", "Dm", "Bb"], 3.6, 0.5, 0.55)
for t in np.arange(tA1 + 3.6, tB1 - 2.0, 0.45):
    seq = [65, 69, 72, 77]; add(arps, t, pluck(midi(seq[int(round((t-tA1)/0.45)) % 4]), 0.5, 0.18), 0.08)
add(fx, tB1 - 2.2, noise_sweep(2.2, 200, 9000), 0.10)
# C: live groove
tE2 = at("energy", 2)
tC1 = at("care")
beat = 60/100
chord_seq(tB1, tE2 - 1.2, ["Dm", "Bb", "F", "C"], beat*8, 0.48, 0.65)
arp = [62, 65, 69, 74, 69, 65, 72, 69]
for k, t in enumerate(np.arange(tB1, tE2 - 1.2, beat/2)):
    add(arps, t, pluck(midi(arp[k % 8]), 0.5, 0.16), 0.11)
for t in np.arange(tB1, tE2 - 1.2, beat):
    add(low, t, boom(0.5, 75, 45), 0.32)
add(low, tB1, boom(3.0), 0.9)
add(fx, tE2 - 2.1, noise_sweep(1.0, 300, 7000), 0.07)
# Hit on 98%
add(low, tE2, boom(4.0, 70, 34), 1.2)
for n in CH["F"] + [72, 77]:
    add(pads, tE2, pad_note(midi(n), 6.0, 0.8, a=0.02, r=4.5), 0.5)
add(fx, tE2, noise_sweep(1.5, 8000, 300, rise=False), 0.12)
# D: continuing lighter
tD1 = at("bridge")
chord_seq(tE2 + 3.0, tD1, ["Bb", "F", "C", "Dm"], beat*8, 0.42, 0.55)
arp2 = [65, 69, 72, 77, 72, 69, 74, 72]
for k, t in enumerate(np.arange(tE2 + 4.8, tD1 - 0.5, beat/2)):
    add(arps, t, pluck(midi(arp2[k % 8]), 0.5, 0.14), 0.085)
for t in np.arange(tE2 + 4.8, tD1 - 0.5, beat*2):
    add(low, t, boom(0.5, 70, 45), 0.25)
chord_seq(tD1, at("close"), ["Gm", "Bb", "F"], 4.3, 0.42, 0.45)
# E: close resolution
tEnd = TOTAL
chord_seq(at("close"), tEnd, ["Bb", "F", "C", "Dm", "Bb", "C", "F"], 3.1, 0.52, 0.6)
for k, t in enumerate(np.arange(at("close") + 3.1, at("close", 3) - 0.3, beat)):
    add(arps, t, pluck(midi([69, 72, 77, 81][k % 4]), 0.8, 0.3), 0.07)
add(fx, at("close", 3) - 2.0, noise_sweep(2.0, 200, 8000), 0.08)
add(low, at("close", 3), boom(5.0, 65, 33), 1.0)

def reverb(x, sec=3.2, wet=0.35):
    n = int(sec*SR); t = np.arange(n)/SR
    ir = rng.standard_normal(n)*np.exp(-t/(sec/6.5)); ir /= np.sqrt((ir**2).sum())
    L = 1 << int(np.ceil(np.log2(len(x)+n)))
    y = np.fft.irfft(np.fft.rfft(x, L)*np.fft.rfft(ir, L), L)[:len(x)]
    return x*(1-wet) + y*wet*3
mus = reverb(pads + arps*1.0 + fx, 3.5, 0.45) + low*0.8
# hush before the 98% hit
tt = np.arange(N)/SR
g = np.ones(N)
m = (tt > tE2 - 1.3) & (tt < tE2); g[m] = np.clip(1 - (tt[m] - (tE2 - 1.3))/0.5, 0.05, 1)
mus *= g
# end fade
mus *= np.clip((TOTAL - tt)/2.5, 0, 1)
mus *= np.clip(tt/1.5, 0, 1)
mus /= np.abs(mus).max() + 1e-9
np.save("music.npy", mus.astype(np.float32))
print("music ok", len(mus)/SR)
