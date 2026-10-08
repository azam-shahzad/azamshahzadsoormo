"""DayPilot film score + sound design, synthesised from scratch (no samples, no licences).

    python3 audio/score.py  ->  out/daypilot_audio.wav  (48 kHz stereo, 30 s)

Every cue below is timed to the same seconds as src/main.js.
"""
import os
import wave
import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
mix = np.zeros((2, N))
verb_send = np.zeros((2, N))


# ------------------------------------------------------------------ helpers
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, start, gain=1.0, pan=0.0, verb=0.25):
    """Add a mono signal at `start` seconds, equal-power pan (-1..1), with a reverb send."""
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[0, i:i + len(sig)] += sig * l
    mix[1, i:i + len(sig)] += sig * r
    verb_send[0, i:i + len(sig)] += sig * l * verb
    verb_send[1, i:i + len(sig)] += sig * r * verb


def tt(d):
    return np.arange(int(d * SR)) / SR


def env_adsr(d, a=0.01, r=0.1):
    t = tt(d)
    e = np.minimum(1, t / max(a, 1e-4))
    e *= np.clip((d - t) / max(r, 1e-4), 0, 1)
    return e


def stft_shape(x, gain_fn, n=2048, hop=512):
    """Time-varying spectral shaping: gain_fn(frame_time, freqs) -> gains."""
    win = np.hanning(n)
    pad = np.concatenate([np.zeros(n), x, np.zeros(n)])
    frames = 1 + (len(pad) - n) // hop
    out = np.zeros(len(pad))
    norm = np.zeros(len(pad))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    for k in range(frames):
        s = k * hop
        seg = pad[s:s + n] * win
        spec = np.fft.rfft(seg) * gain_fn((s - n + n / 2) / SR, freqs)
        out[s:s + n] += np.fft.irfft(spec) * win
        norm[s:s + n] += win ** 2
    out /= np.maximum(norm, 1e-6)
    return out[n:n + len(x)]


def noise_sweep(d, f0, f1, bw=0.6, curve=1.0):
    """Band of noise whose centre glides f0 -> f1 (log), bw in octaves."""
    x = rng.standard_normal(int(d * SR))

    def g(ft, freqs):
        u = np.clip(ft / d, 0, 1) ** curve
        fc = f0 * (f1 / f0) ** u
        lo = np.log2(np.maximum(freqs, 1) / fc)
        return np.exp(-0.5 * (lo / bw) ** 2)
    return stft_shape(x, g)


def whoosh(d, f0=300, f1=4000, peak=0.6, bw=0.8):
    x = noise_sweep(d, f0, f1, bw)
    t = tt(d)
    e = np.where(t < peak * d, (t / (peak * d)) ** 2, np.exp(-(t - peak * d) / (0.18 * d)))
    return x * e / (np.abs(x).max() + 1e-9)


def click(freq=2600, d=0.05, body=0.5):
    t = tt(d)
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # crude high-pass
    s = 0.6 * np.sin(2 * np.pi * freq * t) * np.exp(-t * 160) + 0.25 * n * np.exp(-t * 400)
    s += body * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 70)
    return s


def key_tap():
    d = 0.06
    t = tt(d)
    f = rng.uniform(2200, 3600)
    n = noise_sweep(d, f, f, 0.5)
    n /= np.abs(n).max() + 1e-9
    return 0.55 * n * np.exp(-t * 120) + 0.5 * np.sin(2 * np.pi * rng.uniform(150, 210) * t) * np.exp(-t * 90)


def thump(f0=120, f1=48, d=0.35, decay=11):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t * 25)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * decay)


def boom(d=2.2):
    t = tt(d)
    f = 34 + 40 * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 1.7)
    s += 0.25 * whoosh(d, 900, 120, peak=0.02, bw=1.2)
    return s


def bell(freq, d=2.5, bright=1.0):
    t = tt(d)
    parts = [(1, 1.0, 1.4), (2.0, 0.45, 2.2), (2.76, 0.35 * bright, 3.0), (5.4, 0.18 * bright, 4.5), (8.93, 0.08 * bright, 6)]
    s = sum(a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * dec) for k, a, dec in parts)
    return s * np.minimum(1, t / 0.002)


def pluck(freq, d=1.2, tone=1.0):
    t = tt(d)
    s = sum((1 / k) * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (2.5 + k * 2.2 / tone)) for k in range(1, 9))
    return s * np.minimum(1, t / 0.003)


def pad(notes, start, d, gain, bright_fn=None, detune=0.12, pan_spread=0.5):
    """Warm detuned saw pad; brightness envelope via harmonic roll-off (no filters needed)."""
    t = tt(d)
    bright = bright_fn(t + start) if bright_fn else np.full(len(t), 6.0)
    for j, m in enumerate(notes):
        for dt in (-detune, detune):
            f = midi(m + dt)
            sig = np.zeros(len(t))
            for k in range(1, 14):
                if f * k > 9000:
                    break
                sig += (1 / k) * np.exp(-k / bright) * np.sin(2 * np.pi * f * k * t + k * j)
            pan = pan_spread * (np.sin(j * 1.7) + (0.3 if dt > 0 else -0.3)) / 1.3
            place(sig / len(notes), start, gain, pan, verb=0.5)


def smooth_env(d, points):
    """Piecewise-linear envelope from [(time, value)] relative to the cue start."""
    t = tt(d)
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


# ------------------------------------------------------------------ MUSIC
D = 50  # D3
DMAJ9 = [D - 12, D - 5, D + 4, D + 11, D + 16]          # D2 A2 F#3 C#4 E4
TENSION = [D - 12, D - 11, D - 5, D + 1, D + 6]         # D2 Eb2 A2 Eb3 G#3 — unresolved
BM9 = [D - 15, D - 8, D + 2, D + 9, D + 13]             # B1 F#2 D3 A3 C#4
GMAJ9 = [D - 19, D - 12, D - 1, D + 6, D + 9]           # G1 D2 B2 F#3 A3
A69 = [D - 17, D - 10, D - 1, D + 4, D + 11]            # A1 E2 B2 F#3 C#4

def enveloped(fn, start, d, points):
    """Render a cue in isolation, multiply by an envelope, then add it to the mix."""
    global mix, verb_send
    keep, keepv = mix.copy(), verb_send.copy()
    mix[:] = 0; verb_send[:] = 0
    fn()
    e = np.ones(N)
    i0, i1 = int(start * SR), min(N, int((start + d) * SR))
    e[:i0] = 0; e[i1:] = 0
    e[i0:i1] = smooth_env(d, points)[: i1 - i0]
    mix = keep + mix * e
    verb_send = keepv + verb_send * e


# intro pad: closed, then opens wide with the dashboard reveal
enveloped(lambda: pad(DMAJ9, 0.0, 5.6, 0.32, lambda x: np.interp(x, [0, 1.5, 3.2, 4.6, 6], [1.2, 2.2, 2.5, 7, 6])),
          0.0, 5.6, [(0, 0), (0.6, 0.35), (3.0, 0.5), (4.2, 1.0), (5.0, 0.8), (5.6, 0)])

# problem: dissonant pad + driving pulse, cut dead at the freeze
enveloped(lambda: pad(TENSION, 5.0, 5.9, 0.26, lambda x: np.interp(x, [5, 10.7], [2.5, 6.5]), detune=0.2),
          5.0, 5.9, [(0, 0), (0.8, 0.8), (5.5, 1.0), (5.68, 0.0), (5.9, 0)])
for i, st in enumerate(np.arange(5.0, 10.7, 0.25)):
    g = 0.18 + 0.22 * (st - 5) / 5.7
    place(thump(90, 40, 0.22, 16), st, g * (1.3 if i % 4 == 0 else 0.8), 0, verb=0.05)
for st in np.arange(7.0, 10.7, 0.125):
    hat = noise_sweep(0.04, 9000, 9000, 0.6) * np.exp(-tt(0.04) * 120)
    place(hat / (np.abs(hat).max() + 1e-9), st, 0.05 + 0.05 * (st - 7) / 3.7, 0.3 * np.sin(st * 9), verb=0.1)
riser = whoosh(2.2, 400, 7000, peak=0.98, bw=0.7)
place(riser, 8.5, 0.32, 0, verb=0.3)
# freeze: the beat stops — a reversed air tail sucks out
air = whoosh(0.5, 3000, 600, peak=0.05, bw=1.0)
place(air, 10.7, 0.12, 0, verb=0.6)

# release groove after "Plan my day." (100 BPM, beat = 0.6 s)
BEAT = 0.6
prog = [(13.0, DMAJ9), (15.4, BM9), (17.8, GMAJ9), (20.2, A69), (22.6, DMAJ9)]
for k, (st, ch) in enumerate(prog):
    d = (prog[k + 1][0] if k + 1 < len(prog) else 24.4) - st + 0.4
    enveloped(lambda st=st, ch=ch, d=d: pad(ch, st, d, 0.22, lambda x: np.full_like(x, 5.0)),
              st, d, [(0, 0), (0.15, 1), (d - 0.4, 1), (d, 0)])
    # plucked arpeggio in 8ths
    tones = sorted(ch[1:]) + [ch[2] + 12, ch[3] + 12]
    for j in range(int((d - 0.4) / (BEAT / 2))):
        n = tones[(j * 3) % len(tones)] + 12
        place(pluck(midi(n), 0.9, 1.3), st + j * BEAT / 2, 0.075, np.sin(j * 1.3) * 0.5, verb=0.45)
    place(pluck(midi(ch[0] + 12), 2.2, 0.6), st, 0.22, 0, verb=0.15)  # bass
for j, st in enumerate(np.arange(13.0, 24.0, BEAT)):
    if j % 2 == 0:
        place(thump(110, 45, 0.3, 12), st, 0.32, 0, verb=0.05)
    sh = noise_sweep(0.05, 7000, 7000, 0.7) * np.exp(-tt(0.05) * 80)
    place(sh / (np.abs(sh).max() + 1e-9), st + BEAT / 2, 0.045, 0.4, verb=0.1)

# calm resolve + CTA pad
enveloped(lambda: pad([D - 12, D - 5, D + 4, D + 9, D + 16, D + 21], 24.0, 6.0, 0.28, lambda x: np.interp(x, [24, 26, 30], [6, 4, 4.5])),
          24.0, 6.0, [(0, 0), (0.5, 1), (2.2, 0.75), (3.0, 0.55), (5.3, 0.6), (6.0, 0.0)])

# ------------------------------------------------------------------ SOUND DESIGN
# 0–5 intro
place(whoosh(1.5, 1500, 9000, peak=0.7, bw=0.5), 0.1, 0.22, -0.6, verb=0.4)          # light streak
for f in (midi(86), midi(93)):
    place(bell(f, 2.5, 0.6), 0.95, 0.05, 0.3, verb=0.7)                                # glassy power-on
place(boom(2.0), 0.0, 0.25, 0, verb=0.2)
for i, st in enumerate([1.55, 1.71, 1.87, 2.03, 2.19]):                               # headline words
    place(thump(260 + 25 * i, 140, 0.18, 22), st, 0.18, (i - 2) * 0.15, verb=0.3)
place(whoosh(1.3, 200, 3500, peak=0.55, bw=0.9), 3.15, 0.45, 0, verb=0.35)             # words fly past
place(whoosh(1.0, 3500, 300, peak=0.2, bw=0.9), 3.9, 0.22, 0.4, verb=0.4)

# 5–11 problem
for i in range(10):                                                                   # cards break off
    place(whoosh(0.5, 600, 2600, peak=0.4, bw=0.7), 5.0 + i * 0.075, 0.07, np.sin(i * 2.1) * 0.7, verb=0.3)
for st, pan in [(6.9, -0.6), (7.35, 0.5), (7.8, -0.4), (8.25, 0.7)]:                  # notifications pile in
    place(whoosh(0.6, 400, 3000, peak=0.6, bw=0.7), st - 0.2, 0.12, pan, verb=0.3)
    place(bell(midi(88), 0.6, 0.5) * np.exp(-tt(0.6) * 4), st + 0.35, 0.07, pan, verb=0.3)
    place(bell(midi(95), 0.6, 0.5) * np.exp(-tt(0.6) * 4), st + 0.43, 0.06, pan, verb=0.3)
place(thump(200, 90, 0.25, 14), 7.0, 0.16, 0, verb=0.4)                                # caption hits
place(thump(200, 90, 0.25, 14), 9.5, 0.18, 0, verb=0.4)

# 11–13 command bar
place(whoosh(0.8, 300, 2500, peak=0.75, bw=0.8), 10.85, 0.3, 0, verb=0.3)
place(click(2400, 0.06, 0.4), 11.68, 0.35, 0.2, verb=0.15)
for i in range(12):
    place(key_tap(), 11.85 + i * 0.055, 0.32, 0.05 * np.sin(i), verb=0.08)
place(click(1500, 0.08, 0.9), 12.6, 0.5, 0, verb=0.2)                                 # Enter
for j, m in enumerate([86, 90, 93, 98]):                                              # thinking shimmer
    place(bell(midi(m), 0.8, 0.4), 12.64 + j * 0.08, 0.035, (j - 1.5) * 0.3, verb=0.6)
place(boom(1.8), 12.95, 0.32, 0, verb=0.3)                                            # release
place(whoosh(0.9, 6000, 500, peak=0.1, bw=1.1), 12.95, 0.2, 0, verb=0.4)

# 13–16.5 prioritise
for i in range(10):
    place(whoosh(0.9, 500, 3200, peak=0.55, bw=0.6), 13.0 + i * 0.055, 0.06, np.sin(i * 1.7) * 0.8, verb=0.25)
    place(click(3200, 0.03, 0.2), 14.2 + i * 0.055, 0.1, np.sin(i * 1.7) * 0.6, verb=0.1)  # landings
place(whoosh(0.8, 800, 2400, peak=0.5, bw=0.6), 14.75, 0.12, -0.3, verb=0.2)          # re-rank
for i in range(5):                                                                    # P-tag stamps
    place(thump(240 + 30 * i, 120, 0.15, 25), 15.55 + i * 0.17, 0.2, -0.4, verb=0.15)
    place(click(3000 + 200 * i, 0.04, 0.0), 15.55 + i * 0.17, 0.16, -0.4, verb=0.15)

# 16.5–20 summarise
place(click(2600, 0.05, 0.4), 17.36, 0.32, 0.1, verb=0.15)
place(whoosh(0.9, 700, 3500, peak=0.5, bw=0.6), 17.55, 0.2, 0, verb=0.3)              # flip
for j, m in enumerate([86, 90, 93]):
    place(bell(midi(m), 1.6, 0.7), 18.4 + j * 0.07, 0.05, (j - 1) * 0.3, verb=0.6)     # summary ready

# 20–24 focus time
place(thump(150, 300, 0.25, 12), 20.25, 0.14, 0.4, verb=0.3)                          # block extrudes
place(click(2200, 0.05, 0.5), 21.03, 0.3, 0.4, verb=0.1)                              # grab
drag = noise_sweep(0.75, 900, 1800, 0.5)
place(drag / (np.abs(drag).max() + 1e-9) * env_adsr(0.75, 0.15, 0.3), 21.12, 0.07, 0.4, verb=0.2)
for k in range(8):                                                                    # half-hour detents
    place(click(4200, 0.02, 0.0), 21.18 + k * 0.085, 0.06, 0.4, verb=0.05)
place(thump(220, 100, 0.2, 20), 21.88, 0.3, 0.4, verb=0.15)                           # snap
place(bell(midi(86), 1.4, 0.5), 21.95, 0.06, 0.4, verb=0.5)
place(bell(midi(93), 1.4, 0.5), 22.03, 0.06, 0.4, verb=0.5)
for st in (22.85, 23.17):                                                             # tasks done
    place(bell(midi(91), 0.9, 0.4), st, 0.05, -0.4, verb=0.4)
    place(bell(midi(98), 0.9, 0.4), st + 0.06, 0.04, -0.4, verb=0.4)

# 24–30 calm + CTA
place(whoosh(1.2, 2000, 300, peak=0.3, bw=0.9), 24.0, 0.12, 0, verb=0.5)               # press flat
place(whoosh(1.6, 800, 150, peak=0.3, bw=1.0), 26.1, 0.18, 0, verb=0.5)                # slab recedes
for i, st in enumerate([26.65, 26.78, 26.91, 27.04]):
    place(thump(300 - 20 * i, 150, 0.18, 22), st, 0.14, (i - 1.5) * 0.2, verb=0.35)
place(boom(2.6), 27.25, 0.4, 0, verb=0.3)                                             # logo hit
for j, m in enumerate([74, 81, 86, 90]):
    place(bell(midi(m), 2.6, 0.8), 27.3 + j * 0.05, 0.05, (j - 1.5) * 0.35, verb=0.7)
place(whoosh(0.7, 300, 2800, peak=0.85, bw=0.7), 27.85, 0.22, 0, verb=0.3)             # button rises
place(click(3800, 0.03, 0.0), 28.75, 0.12, 0.2, verb=0.1)                             # hover
place(click(1800, 0.08, 1.0), 29.0, 0.55, 0.1, verb=0.2)                              # press
for j, m in enumerate([86, 90, 93, 98]):                                              # confirmation
    place(bell(midi(m), 1.0, 0.6), 29.06 + j * 0.06, 0.06, (j - 1.5) * 0.25, verb=0.6)

# ------------------------------------------------------------------ reverb + master
def make_ir(d=2.2, seed=3):
    r = np.random.default_rng(seed)
    t = tt(d)
    ir = r.standard_normal((2, len(t))) * np.exp(-t * 3.2)
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    # darker tail
    ir = np.stack([stft_shape(ch, lambda ft, f: 1 / (1 + (f / (5000 - 1500 * min(1, ft / d))) ** 2)) for ch in ir])
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


ir = make_ir()
L = N + ir.shape[1]
nfft = 1 << int(np.ceil(np.log2(L)))
wet = np.stack([np.fft.irfft(np.fft.rfft(verb_send[c], nfft) * np.fft.rfft(ir[c], nfft), nfft)[:N] for c in range(2)])
out = mix + 0.55 * wet
# gentle bus glue + soft clip, then fade the last frames so the hold ends clean
out = np.tanh(out * 1.1) / 1.1
fade = np.ones(N)
fade[-int(0.35 * SR):] = np.linspace(1, 0, int(0.35 * SR)) ** 2
fade[:int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
out *= fade
out /= np.abs(out).max() / 0.89

os.makedirs('out', exist_ok=True)
pcm = (np.clip(out.T, -1, 1) * 32767).astype('<i2')
with wave.open('out/daypilot_audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote out/daypilot_audio.wav')
