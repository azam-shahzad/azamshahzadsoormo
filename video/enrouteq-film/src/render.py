"""Frame renderer for the enrouteQ film. Usage: render.py <first_frame> <last_frame_exclusive> <out.mp4>"""
import sys, subprocess, math, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from gfx import *
from timeline import build
from assets import CLIP, FOOTAGE, IMG

FPS = 24
TL, TOTAL = build()
SC = {s["id"]: s for s in TL}
RMS = np.nan_to_num(np.load("vo_rms.npy")); SPEC = np.nan_to_num(np.load("vo_spec.npy"))
# smooth the envelope: fast attack, slow release
_e = np.zeros_like(RMS); v = 0
for i, x in enumerate(RMS):
    v = v + (x - v) * (0.6 if x > v else 0.18); _e[i] = v
ENV = np.clip(_e * 1.6, 0, 1)
SPEC = np.clip((SPEC + np.roll(SPEC, 1, 0) + np.roll(SPEC, -1, 0)) / 3, 0, 1)
LP = 640  # left (avatar) panel width
XF = 0.6  # crossfade length

# ------------------------------------------------------------------ footage
class Reader:
    def __init__(self, path, off, speed):
        self.path, self.off, self.speed = path, off, speed; self.p = None; self.idx = -1; self.frame = None
        self.max = int(float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                            capture_output=True, text=True).stdout) * 24) - 2
    def _open(self, idx):
        if self.p: self.p.kill()
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{idx / 24:.4f}", "-i", self.path, "-vf", "scale=1920:1080",
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        self.idx = idx - 1
    def get(self, lt):
        want = min(self.max, max(0, int((self.off + max(0, lt) * self.speed) * 24)))
        if self.p is None or want < self.idx or want > self.idx + 48: self._open(want)
        while self.idx < want:
            b = self.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: self.max = self.idx; break
            self.frame = np.frombuffer(b, np.uint8).reshape(H, W, 3); self.idx += 1
        return self.frame

READERS = {}
def footage(sid, lt, zoom=1.0, grade_dark=0.0, key=None):
    clip, off, sp, l0, l1, g = FOOTAGE[sid]
    k = key or sid
    if k not in READERS: READERS[k] = Reader(CLIP[clip], off, sp)
    f = READERS[k].get(lt - l0).astype(np.float32)
    if zoom != 1.0:
        im = Image.fromarray(f.astype(np.uint8)); cw, ch = W / zoom, H / zoom
        im = im.crop((int((W - cw) / 2), int((H - ch) / 2), int((W + cw) / 2), int((H + ch) / 2))).resize((W, H), Image.BILINEAR)
        f = np.asarray(im, np.float32)
    # filmic grade: lift blacks slightly toward navy, gentle S-curve, vignette
    x = f / 255.0; x = x * x * (3 - 2 * x) * 0.35 + x * 0.65
    x = x * (1 - grade_dark) * vignette(0.55) + np.array([0.012, 0.02, 0.035])
    return Image.fromarray(np.clip(x * 255, 0, 255).astype(np.uint8)).convert("RGBA")

BAR = 132
def letterbox(base, a=1.0):
    d = ImageDraw.Draw(base); c = (6, 10, 18, int(255 * a))
    ov = Image.new("RGBA", (W, BAR), c); base.alpha_composite(ov, (0, 0)); base.alpha_composite(ov, (0, H - BAR))

def footage_caption(base, sc, lt, fi):
    ln = current_line(sc, lt)
    if ln is not None:
        i, l = ln
        caption(base, l["cap"], W / 2, H - BAR + 34, 1300, lt - l["t"], l["d"], "Medium", 30, CREAM, 1.0, "m", 1.3,
                fade_out=next_line_t(sc, i))
    avatar(base, 96, H - BAR / 2, 30, ENV[fi], SPEC[fi], fi / FPS, 1.0, label=False, small=True)

def current_line(sc, lt):
    cur = None
    for i, l in enumerate(sc["lines"]):
        if lt >= l["t"] - 0.15: cur = (i, l)
    if cur and lt > cur[1]["t"] + cur[1]["d"] + 1.6 and cur[0] == len(sc["lines"]) - 1: return cur
    return cur

def next_line_t(sc, i):
    if i + 1 < len(sc["lines"]): return sc["lines"][i + 1]["t"] - sc["lines"][i]["t"] - 0.35
    return None

def L(sc, i): return sc["lines"][i]["t"]
def D(sc, i): return sc["lines"][i]["d"]
def at(sc, i, frac): return L(sc, i) + D(sc, i) * frac

# ------------------------------------------------------------------ split layout (avatar left, detail right)
def left_panel(base, sc, lt, fi, eyebrow, title, ecol=GREEN_L, title_t=0.0, show_caption=True, prev=None):
    base.alpha_composite(panel_bg(LP, H), (0, 0))
    avatar(base, LP / 2, 250, 88, ENV[fi], SPEC[fi], fi / FPS)
    p = ease_out(prog(lt, title_t, title_t + 0.7))
    if prev and p < 1:
        pe, pt, pc = prev; q = 1 - p
        text(base, pe, 70, 548 - 12 * p, "SemiBold", 19, pc, q, tracking=4)
        text(base, pt, 66, 578 - 12 * p, "serif", 66, CREAM, q)
    text(base, eyebrow, 70, 548 + 14 * (1 - p), "SemiBold", 19, ecol, p, tracking=4)
    text(base, title, 66, 578 + 14 * (1 - p), "serif", 66, CREAM, p)
    rw = int(110 * ease_out(prog(lt, title_t + 0.25, title_t + 0.9)))
    if rw > 2: base.alpha_composite(Image.new("RGBA", (rw, 3), GOLD + (255,)), (70, 676))
    if show_caption:
        ln = current_line(sc, lt)
        if ln:
            i, l = ln
            caption(base, l["cap"], 70, 712, 510, lt - l["t"], l["d"], "Medium", 29, (226, 232, 228), 1.0, "l", 1.42,
                    fade_out=next_line_t(sc, i))
    base.alpha_composite(Image.new("RGBA", (1, H), (255, 255, 255, 28)), (LP, 0))

def right_cream(base):
    base.alpha_composite(cream_bg(W - LP, H), (LP, 0))

# ------------------------------------------------------------------ image cards with ken burns + callouts
@functools.lru_cache(8)
def src_img(name):
    im = Image.open(IMG + name).convert("RGB")
    redact = {"3.webp": [(30, 44, 172, 106), (360, 118, 580, 150), (386, 978, 716, 1006)],
              "2.webp": [(52, 340, 152, 1100)]}.get(name, [])
    for box in redact:   # plates, VIN and sale financials are blurred out
        reg = im.crop(box).filter(ImageFilter.GaussianBlur(9)); im.paste(reg, box)
    return im

@functools.lru_cache(8)
def card_mask(w, h, r=20):
    m = Image.new("L", (w * 2, h * 2), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w * 2 - 1, h * 2 - 1], r * 2, fill=255)
    return m.resize((w, h), Image.LANCZOS)

def cam_at(keys, lt):
    if lt <= keys[0][0]: return keys[0][1:]
    for a, b in zip(keys, keys[1:]):
        if lt < b[0]:
            x = ease_io(prog(lt, a[0], b[0])); return tuple(lerp(p, q, x) for p, q in zip(a[1:], b[1:]))
    return keys[-1][1:]

def image_card(base, name, rect, keys, callouts, lt, alpha=1.0, tag=None):
    x0, y0, cw, ch = rect; src = src_img(name)
    cx, cy, sw = cam_at(keys, lt); sh = sw * ch / cw
    cx = clamp(cx, sw / 2, src.width - sw / 2); cy = clamp(cy, sh / 2, max(sh / 2, src.height - sh / 2))
    box = (cx - sw / 2, cy - sh / 2, cx + sw / 2, cy + sh / 2)
    card = src.crop(tuple(int(v) for v in box)).resize((cw, ch), Image.BILINEAR).convert("RGBA")
    s = cw / sw
    ov = Image.new("RGBA", (cw, ch), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    act = [c for c in callouts if c["t"] <= lt < c.get("end", 1e9) + 0.4]
    dimv = 0
    for c in act:
        p = ease_out(prog(lt, c["t"], c["t"] + 0.5)) * (1 - prog(lt, c.get("end", 1e9), c.get("end", 1e9) + 0.4)); dimv = max(dimv, p)
    if dimv > 0:
        d.rectangle([0, 0, cw, ch], fill=(12, 22, 38, int(120 * dimv)))
    labels = []
    for c in act:
        p = ease_out(prog(lt, c["t"], c["t"] + 0.5)) * (1 - prog(lt, c.get("end", 1e9), c.get("end", 1e9) + 0.4))
        bx = [(c["box"][0] - box[0]) * s, (c["box"][1] - box[1]) * s, (c["box"][2] - box[0]) * s, (c["box"][3] - box[1]) * s]
        g = 10 * (1 - p)
        d.rounded_rectangle([bx[0] - g, bx[1] - g, bx[2] + g, bx[3] + g], 10, fill=(0, 0, 0, 0))
        col = c.get("col", GREEN)
        d.rounded_rectangle([bx[0] - g - 4, bx[1] - g - 4, bx[2] + g + 4, bx[3] + g + 4], 12, outline=col + (int(255 * p),), width=4)
        labels.append((c, bx, p, col))
    card.alpha_composite(ov)
    card.putalpha(Image.fromarray((np.asarray(card_mask(cw, ch), np.float32)).astype(np.uint8)))
    sh_im, pad = shadow(cw, ch, 20); paste(base, sh_im, x0 - pad, y0 - pad, alpha)
    paste(base, card, x0, y0, alpha)
    for c, bx, p, col in labels:
        pl = pill(c["label"], "SemiBold", 20, CREAM, col + (245,), 16, 9, dot=CREAM)
        lx = clamp(x0 + bx[0], x0 + 10, x0 + cw - pl.width - 10)
        ly = y0 + bx[1] - pl.height - 16 if bx[1] > 70 else y0 + bx[3] + 16
        paste(base, pl, lx, ly + 10 * (1 - p), alpha * p)
    if tag:
        paste(base, pill(tag, "SemiBold", 17, INK, (255, 255, 255, 235), 14, 7, dot=GOLD), x0 + 18, y0 + ch - 50, alpha)

# ------------------------------------------------------------------ scenes
def s_night(sc, lt, fi):
    b = footage("night", lt); letterbox(b)
    text(b, "02:07  ·  ELECTRIC BUS DEPOT", 72, 54, "mono", 22, (200, 210, 220), prog(lt, 0.6, 1.6), tracking=3)
    stats = [("40", "buses to charge", 0.0), ("1", "grid limit you can't cross", 0.33), ("24", "prices a day, every hour", 0.68)]
    for k, (n, lab, fr) in enumerate(stats):
        t0 = at(sc, 1, fr); p = ease_out(prog(lt, t0, t0 + 0.6)); q = 1 - prog(lt, sc["dur"] - 0.6, sc["dur"])
        if p <= 0: continue
        y = 300 + k * 128; x = 1440 + 30 * (1 - p)
        bg = rrect((410, 104), 14, (8, 14, 24, 170)); paste(b, bg, x, y, p * q)
        paste(b, Image.new("RGBA", (4, 70), GOLD + (255,)), x + 20, y + 17, p * q)
        text(b, n, x + 42, y + 12, "serif", 56, CREAM, p * q)
        text(b, lab, x + 42 + 30 + 34 * len(n), y + 36, "Medium", 22, (210, 220, 225), p * q)
    footage_caption(b, sc, lt, fi); return b

def s_operator(sc, lt, fi):
    b = footage("operator", lt); letterbox(b)
    text(b, "02:14  ·  CONTROL ROOM", 72, 54, "mono", 22, (200, 210, 220), prog(lt, 0.3, 1.2), tracking=3)
    t1 = at(sc, 1, 0.15); p = ease_out(prog(lt, t1, t1 + 0.5)); q = 1 - prog(lt, at(sc, 3, 0.6), at(sc, 3, 0.6) + 0.5)
    if p > 0:
        card = rrect((470, 196), 16, (10, 16, 28, 205)); x, y = 1380 + 30 * (1 - p), 250; paste(b, card, x, y, p * q)
        text(b, "CHARGER REPORT", x + 26, y + 22, "SemiBold", 16, (170, 180, 190), p * q, tracking=3)
        text(b, "Status", x + 26, y + 66, "Medium", 24, CREAM, p * q); paste(b, pill("CHARGING", "Bold", 17, CREAM, GREEN + (255,), 12, 6), x + 300, y + 62, p * q)
        p2 = ease_out(prog(lt, at(sc, 1, 0.65), at(sc, 1, 0.65) + 0.4))
        text(b, "Energy delivered", x + 26, y + 120, "Medium", 24, CREAM, p * q)
        paste(b, pill("0 kWh", "Bold", 17, CREAM, RED + (255,), 12, 6), x + 300, y + 116, p * q * p2)
    t2 = L(sc, 2); p = ease_out(prog(lt, t2, t2 + 0.5))
    if p > 0:
        x, y = 1380 + 30 * (1 - p), 470
        paste(b, pill("1 bus won't leave the depot", "SemiBold", 21, CREAM, (150, 50, 44, 235), 18, 10, dot=(255, 180, 170)), x, y, p * q)
    footage_caption(b, sc, lt, fi); return b

def wheel_build_state(sc, lt):
    c = ease_out(prog(lt, L(sc, 0) - 0.3, L(sc, 0) + 0.6))
    ring = ease_io(prog(lt, at(sc, 0, 0.25), at(sc, 0, 0.6)))
    nodes, labels = {}, {}
    order = ["eQ Connect", "eQ Optimiser", "eQ Energy", "eQ Control", "eQ Care", "eQ Hub", "eQ Travel"]
    t0 = at(sc, 0, 0.6)
    for k, n in enumerate(order):
        ts = t0 + k * 0.2; nodes[n] = prog(lt, ts, ts + 0.45); labels[n] = prog(lt, ts + 0.15, ts + 0.5)
    for n, f in (("eQ Forecast", 0.25), ("eQ Valuate", 0.6)):
        ts = at(sc, 1, f); nodes[n] = prog(lt, ts, ts + 0.6); labels[n] = prog(lt, ts + 0.3, ts + 0.7)
    ts = at(sc, 2, 0.46); nodes["eQ Insight"] = prog(lt, ts, ts + 0.5); labels["eQ Insight"] = prog(lt, ts + 0.15, ts + 0.6)
    halo = {"eQ Insight": math.sin(math.pi * prog(lt, ts, ts + 1.4))}
    return dict(center=c, ring=ring, orbit=ease_io(prog(lt, L(sc, 1) - 0.2, at(sc, 1, 0.5))), nodes=nodes, lit=nodes, labels=labels,
                halo=halo, day=prog(lt, at(sc, 0, 0.42), at(sc, 0, 0.55)), ground=0)

def s_wheel(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    wi = draw_wheel(wheel_build_state(sc, lt), 980, ss=2, ground=False, label_scale=1.15)
    paste(b, wi, LP + (W - LP) / 2, H / 2 + 6, 1.0, "mm")
    ins = L(sc, 2)
    if lt < ins: left_panel(b, sc, lt, fi, "THE DEPOT DAY  ·  24/7 ON SITE", "enrouteQ", GREEN_L, 0.1)
    else: left_panel(b, sc, lt, fi, "SUPERVISES", "eQ Insight", GOLD, ins, prev=("THE DEPOT DAY  ·  24/7 ON SITE", "enrouteQ", GREEN_L))
    return b

def s_insight(sc, lt, fi):
    sw = 6.0
    if lt < sw + XF:
        f = footage("insight", lt); letterbox(f)
        paste(f, pill("Simulation  ·  your depot", "SemiBold", 20, CREAM, (20, 30, 48, 220), 18, 10, dot=GOLD), 72, BAR + 30, prog(lt, 0.4, 1.0))
        locator(f, "eQ Insight", prog(lt, 0.2, 0.8)); footage_caption(f, sc, lt, fi)
        if lt < sw: return f
    b = Image.new("RGBA", (W, H)); right_cream(b)
    keys = [(sw, 1000, 650, 2000), (at(sc, 1, 0.2), 1000, 650, 2000), (at(sc, 1, 0.5), 520, 420, 1100),
            (L(sc, 2), 520, 420, 1100), (at(sc, 2, 0.35), 1030, 520, 1500), (sc["dur"] + 1, 1000, 600, 1650)]
    calls = [dict(t=at(sc, 1, 0.3), end=L(sc, 2) - 0.1, box=(30, 190, 470, 490), label="Simulated grid draw at the peak"),
             dict(t=at(sc, 1, 0.75), end=L(sc, 2) - 0.1, box=(600, 320, 1440, 1025), label="Your depot, modelled bus by bus", col=GOLD),
             dict(t=at(sc, 2, 0.15), box=(985, 192, 1470, 240), label="Flagged before anything goes live", col=RED)]
    image_card(b, "4.webp", (LP + 70, 330, W - LP - 140, 690), keys, calls, lt, 1.0, tag="Depot simulator  ·  eQ Insight")
    left_panel(b, sc, lt, fi, "SUPERVISES", "eQ Insight", GOLD, sw)
    locator(b, "eQ Insight", 1.0)
    if lt < sw + XF:
        f.alpha_composite(with_alpha(b, prog(lt, sw, sw + XF))); return f
    return b

def s_live(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); b.alpha_composite(cream_bg(W, H))
    pulse = prog(lt, at(sc, 0, 0.55), at(sc, 0, 0.55) + 0.35)
    sh = ease_io(prog(lt, sc["dur"] - 1.15, sc["dur"] + 0.1))
    size = int(lerp(880, 232, sh)); cx = lerp(W / 2, W - 34 - 116, sh); cy = lerp(H / 2, 30 + 116, sh)
    ring = [n for n, _, _ in RING_NODES]
    st = wheel_full(lit={**{n: pulse for n in ring}, "eQ Forecast": 1, "eQ Valuate": 1},
                    halo={n: math.sin(math.pi * prog(lt, at(sc, 0, 0.55), at(sc, 0, 0.55) + 0.9)) for n in ring},
                    labels={n: 1 - sh * 3 for n in ALL_NODES}, center_text=1 - sh * 3, ground=sh,
                    node_scale=lerp(1, 2.7, sh), line_scale=lerp(1, 2.2, sh))
    paste(b, draw_wheel(st, size, ss=2, ground=sh > 0.01), cx, cy, 1.0, "mm")
    avatar(b, 120, H - 110, 34, ENV[fi], SPEC[fi], fi / FPS, 1 - sh, label=False, small=True)
    ln = current_line(sc, lt)
    if ln: caption(b, ln[1]["cap"], W / 2, H - 120, 1200, lt - ln[1]["t"], ln[1]["d"], "Medium", 30, INK, 1 - sh, "m")
    return b

def battery(b, x, y, a, soc=0.20, floor=0.25):
    w, h = 300, 46
    paste(b, rrect((w, h), 10, (255, 255, 255, 30), (230, 235, 240, 220), 2), x, y, a)
    paste(b, rrect((8, 20), 3, (230, 235, 240, 220)), x + w + 4, y + 13, a)
    fw = int((w - 12) * soc)
    if fw > 4: paste(b, rrect((fw, h - 12), 6, (230, 110, 90, 255)), x + 6, y + 6, a)
    fx = x + 6 + (w - 12) * floor; paste(b, Image.new("RGBA", (3, h + 20), GOLD + (255,)), fx, y - 10, a)
    text(b, "25% floor", fx, y + h + 14, "SemiBold", 16, (230, 205, 150), a, "mt")

def s_connect(sc, lt, fi):
    b = footage("connect", lt); letterbox(b)
    locator(b, "eQ Connect", prog(lt, -0.2, 0.4))
    p1 = ease_out(prog(lt, at(sc, 0, 0.4), at(sc, 0, 0.4) + 0.5))
    if p1 > 0:
        paste(b, pill("On the live map  ·  charging state", "SemiBold", 21, CREAM, (16, 26, 42, 225), 18, 10, dot=(110, 200, 150)), 1370 + 20 * (1 - p1), 360, p1)
    p2 = ease_out(prog(lt, at(sc, 0, 0.72), at(sc, 0, 0.72) + 0.5))
    if p2 > 0:
        x, y = 1370 + 20 * (1 - p2), 440; paste(b, rrect((470, 170), 16, (10, 16, 28, 215)), x, y, p2)
        text(b, "STATE OF CHARGE", x + 26, y + 20, "SemiBold", 16, (170, 180, 190), p2, tracking=3)
        text(b, f"{int(lerp(31, 20, ease_out(prog(lt, at(sc, 0, 0.72), at(sc, 0, 0.72) + 1.0))))}%", x + 360, y + 12, "serif", 44, (240, 140, 120), p2)
        battery(b, x + 26, y + 70, p2)
    footage_caption(b, sc, lt, fi); return b

def s_travel(sc, lt, fi):
    b = footage("travel", lt, zoom=lerp(1.0, 1.09, ease_io(prog(lt, 0, sc["dur"])))); letterbox(b)
    locator(b, "eQ Travel", 1.0, prev="eQ Connect", cross=prog(lt, 0, 0.25))
    p = ease_out(prog(lt, at(sc, 0, 0.25), at(sc, 0, 0.25) + 0.5))
    if p > 0:
        x, y = 1310 + 20 * (1 - p), 380; paste(b, rrect((540, 196), 16, (10, 16, 28, 220)), x, y, p)
        text(b, "NEXT SERVICE JOURNEY", x + 26, y + 22, "SemiBold", 16, (170, 180, 190), p, tracking=3)
        hp = ease_out(prog(lt, at(sc, 0, 0.55), at(sc, 0, 0.55) + 0.5))
        paste(b, rrect((488, 74), 12, GREEN + (int(255 * hp),)), x + 26, y + 70, p)
        text(b, "139", x + 46, y + 80, "monob", 40, CREAM, p)
        text(b, "Burlöv – Lund", x + 150, y + 86, "SemiBold", 32, CREAM, p)
        text(b, "Departure time highlighted", x + 26, y + 158, "Medium", 17, (170, 190, 180), p * hp)
    footage_caption(b, sc, lt, fi); return b

def s_optimiser(sc, lt, fi):
    sw = 4.0
    if lt < sw + XF:
        f = footage("optimiser", lt); letterbox(f); locator(f, "eQ Optimiser", 1.0, prev="eQ Travel", cross=prog(lt, 0, 0.25))
        footage_caption(f, sc, lt, fi)
        if lt < sw: return f
    b = Image.new("RGBA", (W, H)); right_cream(b)
    keys = [(sw, 760, 420, 1520), (at(sc, 0, 0.8), 760, 420, 1520), (L(sc, 1), 740, 470, 1500), (sc["dur"] + 1, 760, 450, 1400)]
    calls = [dict(t=sw + 0.4, end=L(sc, 1) - 0.1, box=(15, 275, 1465, 465), label="Charge on arrival: over the connection", col=RED),
             dict(t=L(sc, 1), box=(15, 470, 1465, 570), label="Scheduled: cheapest hours, under the limit", col=GREEN)]
    image_card(b, "5.webp", (LP + 70, 330, W - LP - 140, 690), keys, calls, lt, 1.0, tag="Peak power demand  ·  smart charging")
    left_panel(b, sc, lt, fi, "RUNS", "eQ Optimiser", GREEN_L, sw)
    locator(b, "eQ Optimiser", 1.0)
    if lt < sw + XF:
        f.alpha_composite(with_alpha(b, prog(lt, sw, sw + XF))); return f
    return b

def s_energy(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); b.alpha_composite(panel_bg(W - LP, H, (14, 26, 44), (8, 15, 27)), (LP, 0))
    left_panel(b, sc, lt, fi, "RUNS", "eQ Energy", GREEN_L, 0.0)
    locator(b, "eQ Energy", 1.0, prev="eQ Optimiser", cross=prog(lt, 0, 0.25))
    paste(b, pill("Real site  ·  energy", "SemiBold", 19, CREAM, (255, 255, 255, 30), 16, 8, dot=(110, 200, 150)), LP + 70, 70, prog(lt, 0.2, 0.8))
    hit = L(sc, 2); dimc = 1 - 0.9 * ease_out(prog(lt, hit - 0.05, hit + 0.4))
    x0, x1, base_y = LP + 120, W - 120, 820; top = 300
    limit_y = base_y - 200
    # axis + grid limit
    paste(b, Image.new("RGBA", (x1 - x0, 2), (255, 255, 255, 60)), x0, base_y, dimc)
    lp = prog(lt, 0.4, 1.4)
    dl = Image.new("RGBA", (x1 - x0, 3), (0, 0, 0, 0)); dd = ImageDraw.Draw(dl)
    for xx in range(0, int((x1 - x0) * lp), 22): dd.line([xx, 1, xx + 12, 1], fill=(230, 205, 150, 200), width=2)
    paste(b, dl, x0, limit_y, dimc); text(b, "grid limit", x1, limit_y - 34, "SemiBold", 18, (230, 205, 150), dimc * lp, "rt", tracking=2)
    # the 166 -> 3.2 kW bar
    c0 = at(sc, 1, 0.3); cp = ease_io(prog(lt, c0, c0 + 2.4))
    val = 166 * (1 - cp) + 3.2 * cp
    hmax = base_y - top; hb = max(4, hmax * val / 166)
    bx = x0 + 200; bw = 240; appear = ease_out(prog(lt, 0.6, 1.5))
    if appear > 0:
        ghost = rrect((bw, int(hmax)), 10, (0, 0, 0, 0), (230, 110, 90, 140), 2); paste(b, ghost, bx, base_y - hmax, dimc * prog(lt, c0, c0 + 0.5))
        col = mix((230, 110, 90), (110, 200, 150), cp)
        bar = rrect((bw, int(max(6, hb * appear))), 10, col + (255,)); paste(b, bar, bx, base_y - hb * appear, dimc)
        num = f"{val:.1f} kW" if cp > 0.85 else f"{val:.0f} kW"
        text(b, num, bx + bw / 2, base_y - hb * appear - 20, "monob", 46, CREAM, dimc * appear, "mb")
        text(b, "unmanaged peak" if cp < 0.5 else "managed peak", bx + bw / 2, base_y + 22, "SemiBold", 20, (170, 185, 195), dimc * appear, "mt", tracking=2)
        # managed load curve that stays under the limit
        cv = ease_io(prog(lt, c0 + 1.2, c0 + 3.2))
        if cv > 0:
            ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov); pts = []
            cx0 = bx + bw + 120; cx1 = x1 - 20
            for i in range(int(80 * cv) + 1):
                u = i / 80; pts.append((cx0 + (cx1 - cx0) * u, base_y - 130 - 40 * math.sin(u * math.pi * 3) * 0.5 - 20 * math.sin(u * 7)))
            if len(pts) > 1: od.line(pts, fill=(110, 200, 150, 230), width=4)
            paste(b, ov, 0, 0, dimc)
            text(b, "managed through the night", cx0, base_y + 22, "SemiBold", 20, (130, 200, 160), dimc * cv, "lt", tracking=2)
    # 98%
    hp = prog(lt, hit - 0.05, hit + 0.55)
    if hp > 0:
        sc_ = ease_back(hp, 1.3)
        im = text_img("98%", "serif", 330, CREAM)
        im = im.resize((max(1, int(im.width * (0.7 + 0.3 * sc_))), max(1, int(im.height * (0.7 + 0.3 * sc_)))), Image.LANCZOS)
        paste(b, im, LP + (W - LP) / 2, 470, clamp(hp * 2), "mm")
        text(b, "PEAK CUT  ·  166 kW → 3.2 kW", LP + (W - LP) / 2, 700, "SemiBold", 24, (230, 205, 150), prog(lt, hit + 0.5, hit + 1.1), "mm", tracking=5)
    cp3 = prog(lt, L(sc, 3) - 0.2, L(sc, 3) + 0.5)
    if cp3 > 0:
        text(b, "Real site — a bus depot night runs the same way, in simulation at a real depot.", LP + (W - LP) / 2, 960, "Medium", 22,
             (190, 200, 210), cp3, "mm")
    return b

def s_care(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    left_panel(b, sc, lt, fi, "RUNS", "eQ Care", GREEN_L, 0.0); locator(b, "eQ Care", 1.0, prev="eQ Energy", cross=prog(lt, 0, 0.25))
    cx, cy, cw = LP + (W - LP) / 2 - 340, 260, 680
    p = ease_out(prog(lt, 0.3, 0.9))
    sh_im, pad = shadow(cw, 520, 20); paste(b, sh_im, cx - pad, cy - pad + 20 * (1 - p), p)
    paste(b, rrect((cw, 520), 20, (255, 255, 255, 255)), cx, cy + 20 * (1 - p), p)
    y = cy + 20 * (1 - p)
    text(b, "CHARGING ALERT", cx + 40, y + 38, "SemiBold", 18, (190, 130, 40), p, tracking=4)
    text(b, "Handshake fault", cx + 40, y + 70, "serif", 44, INK, p)
    rows = [("Charger reports", "CHARGING", GREEN, at(sc, 0, 0.2)), ("Power flowing", "0.0 kW", RED, at(sc, 0, 0.4))]
    for k, (lab, val, col, t0) in enumerate(rows):
        q = ease_out(prog(lt, t0, t0 + 0.45)); yy = y + 160 + k * 92
        paste(b, Image.new("RGBA", (cw - 80, 1), (220, 215, 205, 255)), cx + 40, yy - 18, p)
        text(b, lab, cx + 40, yy + 6, "Medium", 28, INK, q)
        paste(b, pill(val, "Bold", 20, CREAM, col + (255,), 16, 8), cx + cw - 40, yy, q, "rt")
    q = ease_out(prog(lt, at(sc, 0, 0.72), at(sc, 0, 0.72) + 0.5)); yy = y + 380
    if q > 0:
        bn = rrect((cw - 80, 92), 14, (232, 241, 234, 255)); paste(b, bn, cx + 40, yy + 10 * (1 - q), q)
        text(b, "Bus flagged before pull-out", cx + 72, yy + 18 + 10 * (1 - q), "Bold", 28, GREEN, q)
        text(b, "Caught on site, not on the road", cx + 72, yy + 54 + 10 * (1 - q), "Medium", 20, (90, 110, 100), q)
    return b

def wheel_focus(b, active, lt, size=860, cx=None, cy=None, verb_hold=True, extra=None):
    dim = {n: (1.0 if n == active else 0.3) for n in ALL_NODES}
    st = wheel_full(dim=dim, labels={active: 1.0}, halo={active: 0.6 + 0.4 * math.sin(lt * 3)}, ground=0)
    if extra: st.update(extra)
    paste(b, draw_wheel(st, size, ss=2, ground=False, label_scale=1.2), cx or LP + (W - LP) / 2, cy or H / 2, 1.0, "mm")

def s_hub(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    wheel_focus(b, "eQ Hub", lt); left_panel(b, sc, lt, fi, "RUNS", "eQ Hub", GREEN_L, 0.0)
    return b

def s_control(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    wheel_focus(b, "eQ Control", lt); left_panel(b, sc, lt, fi, "OFFLINE-SAFE", "eQ Control", GREEN_L, 0.0)
    # the connection drops; the site keeps running
    t0 = at(sc, 0, 0.12); br = ease_out(prog(lt, t0, t0 + 0.5))
    x = LP + 140; y0, y1 = 140, 420
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    gap = 40 * br; mid = (y0 + y1) / 2
    for yy in range(y0, y1, 16):
        if abs(yy - mid) < gap: continue
        d.line([x, yy, x, yy + 8], fill=(120, 130, 140, 200), width=3)
    paste(b, ov, 0, 0, prog(lt, 0, 0.4))
    text(b, "CLOUD", x, y0 - 34, "SemiBold", 16, (110, 120, 130), prog(lt, 0, 0.4), "mt", tracking=3)
    if br > 0:
        text(b, "×", x, mid, "Bold", 40, RED, br, "mm")
        text(b, "connection lost", x + 30, mid - 14, "SemiBold", 18, RED, br, "lt")
    q = ease_out(prog(lt, at(sc, 0, 0.55), at(sc, 0, 0.55) + 0.5))
    paste(b, pill("Site running  ·  offline-safe", "SemiBold", 22, CREAM, GREEN + (255,), 20, 11, dot=(170, 230, 190)), LP + (W - LP) / 2, H - 120, q, "mt")
    return b

def icon(kind, col):
    im = Image.new("RGBA", (240, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if kind == "peak":
        pts = [(i * 4, 90 - 60 * math.exp(-((i - 30) / 12) ** 2) - 10 * math.sin(i / 5)) for i in range(60)]
        d.line(pts, fill=col, width=5)
        for xx in range(0, 240, 18): d.line([xx, 40, xx + 9, 40], fill=GOLD, width=2)
    elif kind == "price":
        for i, hgt in enumerate([30, 26, 22, 40, 70, 84, 60, 44, 36, 50]): d.rectangle([i * 24, 110 - hgt, i * 24 + 16, 110], fill=col)
    else:
        d.rounded_rectangle([20, 30, 200, 96], 14, outline=col, width=5)
        for xx in (40, 80, 120): d.rectangle([xx, 44, xx + 28, 66], fill=col)
        d.ellipse([50, 88, 74, 112], fill=col); d.ellipse([150, 88, 174, 112], fill=col)
        d.ellipse([196, 6, 230, 40], fill=(214, 120, 60))
    return im

def s_forecast(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    mv = ease_io(prog(lt, L(sc, 1) - 0.6, L(sc, 1) + 0.3))
    size = int(lerp(860, 470, mv)); cy = lerp(H / 2, 290, mv)
    lift = ease_out(prog(lt, 0.2, 1.0))
    wheel_focus(b, "eQ Forecast", lt, size, cy=cy, extra=dict(halo={"eQ Forecast": 0.5 + 0.5 * lift}))
    left_panel(b, sc, lt, fi, "PREDICTS", "eQ Forecast", GOLD, 0.0)
    cards = [("peak", "The peak", "Tomorrow's grid draw"), ("price", "The price", "Hour by hour"), ("risk", "Buses at risk", "Of leaving short")]
    cw = 360; gapx = 30; x0 = LP + ((W - LP) - (3 * cw + 2 * gapx)) / 2
    for k, (ic, ttl, sub) in enumerate(cards):
        t0 = at(sc, 1, 0.1 + 0.28 * k); q = ease_out(prog(lt, t0, t0 + 0.5))
        if q <= 0: continue
        x = x0 + k * (cw + gapx); y = 600 + 30 * (1 - q)
        sh_im, pad = shadow(cw, 330, 18, 20, 60); paste(b, sh_im, x - pad, y - pad, q)
        paste(b, rrect((cw, 330), 18, (255, 255, 255, 255)), x, y, q)
        paste(b, icon(ic, GOLD if ic != "risk" else GREEN), x + 60, y + 40, q)
        text(b, ttl, x + 36, y + 196, "serif", 38, INK, q); text(b, sub, x + 36, y + 252, "Medium", 22, (100, 108, 120), q)
    return b

def s_benefit(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    left_panel(b, sc, lt, fi, "SETTLED PER SITE", "What it was worth", GREEN_L, 0.0)
    locator(b, "ALL", 1.0)
    cx = LP + (W - LP) / 2
    p = ease_out(prog(lt, 0.2, 0.7))
    text(b, "SETTLED CUSTOMER BENEFIT", cx, 330, "SemiBold", 22, (120, 110, 90), p, "mm", tracking=5)
    v = 22034 * ease_out(prog(lt, 0.4, 2.4))
    text(b, f"{int(v):,} kr".replace(",", " "), cx, 470, "serif", 170, GREEN, p, "mm")
    for k, (lab, col) in enumerate([("Cost savings", GREEN), ("Grid services", GOLD)]):
        q = ease_out(prog(lt, 1.8 + 0.3 * k, 2.3 + 0.3 * k))
        paste(b, pill(lab, "SemiBold", 24, CREAM, col + (255,), 22, 12, dot=CREAM), cx + (-20 if k == 0 else 20), 620, q, "rt" if k == 0 else "lt")
    return b

def s_valuate(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); right_cream(b)
    keys = [(-0.5, 700, 300, 1500), (1.6, 700, 300, 1500), (2.8, 1150, 180, 900), (sc["dur"] + 1, 1150, 200, 980)]
    calls = [dict(t=0.6, end=2.4, box=(355, 45, 830, 150), label="Bus passport", col=GOLD),
             dict(t=2.8, box=(945, 76, 1372, 120), label="Grade sets the used-bus price", col=GOLD)]
    image_card(b, "3.webp", (LP + 70, 330, W - LP - 140, 690), keys, calls, lt, 1.0, tag="Plates, VIN and sale figures hidden")
    left_panel(b, sc, lt, fi, "USED-BUS PRICE", "eQ Valuate", GOLD, 0.0)
    locator(b, "eQ Valuate", 1.0, prev="ALL", cross=prog(lt, 0, 0.25))
    return b

@functools.lru_cache(4)
def still(clip, t, blur=0):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", CLIP[clip], "-frames:v", "1", "-vf", "scale=1920:1080",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    im = Image.fromarray(np.frombuffer(raw, np.uint8).reshape(H, W, 3)).convert("RGBA")
    return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im

def s_bridge(sc, lt, fi):
    b = Image.new("RGBA", (W, H)); b.alpha_composite(panel_bg(W - LP, H, (14, 26, 44), (8, 15, 27)), (LP, 0))
    left_panel(b, sc, lt, fi, "IN DEVELOPMENT", "eQ Bridge", GOLD, 0.0)
    paste(b, pill("eQ Bridge  ·  in development", "SemiBold", 19, INK, GOLD + (255,), 16, 8), LP + 70, 64, prog(lt, 0.2, 0.7))
    cw, ch = 560, 600; y = 200
    for k, (clip, ts, who, lang, msg, sub, t0) in enumerate([
            ("depot", 2.5, "DRIVER", "PL", "Spóźnię się.", "I'm running late", at(sc, 1, 0.05)),
            ("operator", 9.0, "MANAGER", "SV", "Jag blir sen.", "Read in Swedish", at(sc, 1, 0.55))]):
        x = LP + 70 + k * (cw + 50); q = ease_out(prog(lt, 0.3 + 0.4 * k, 0.9 + 0.4 * k))
        st = still(clip, ts).resize((int(ch * 16 / 9), ch), Image.BILINEAR)
        st = st.crop((int((st.width - cw) / 2), 0, int((st.width + cw) / 2), ch))
        arr = np.asarray(st, np.float32); arr[..., :3] *= 0.6; st = Image.fromarray(arr.astype(np.uint8), "RGBA")
        st.putalpha(card_mask(cw, ch, 18)); paste(b, st, x, y + 20 * (1 - q), q)
        text(b, who, x + 28, y + 26, "SemiBold", 16, (200, 210, 220), q, tracking=4)
        m = ease_back(prog(lt, t0, t0 + 0.5), 1.6)
        if m > 0:
            bub = rrect((cw - 60, 168), 22, (255, 255, 255, 240) if k == 0 else (232, 241, 234, 245))
            paste(b, bub, x + 30, y + ch - 200 + 20 * (1 - m), clamp(m))
            paste(b, pill(lang, "Bold", 15, CREAM, (GREEN if k else GOLD) + (255,), 10, 5), x + 56, y + ch - 180 + 20 * (1 - m), clamp(m))
            text(b, msg, x + 56, y + ch - 140 + 20 * (1 - m), "serif", 44, INK, clamp(m))
            text(b, sub, x + 58, y + ch - 80 + 20 * (1 - m), "Medium", 20, (100, 108, 120), clamp(m))
    ar = ease_io(prog(lt, at(sc, 1, 0.4), at(sc, 1, 0.6)))
    if ar > 0:
        ax = LP + 70 + cw + 4; ov = Image.new("RGBA", (46, 40), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        d.line([4, 20, 4 + 34 * ar, 20], fill=GOLD + (255,), width=4); d.polygon([(30, 8), (44, 20), (30, 32)], fill=GOLD + (int(255 * ar),))
        paste(b, ov, ax, y + ch / 2 - 20, 1.0)
    return b

def s_close(sc, lt, fi):
    card_t = L(sc, 3) - 0.45
    if lt < card_t + 0.8:
        f = footage("close", lt, zoom=lerp(1.12, 1.0, ease_out(prog(lt, 0, card_t))), grade_dark=0.1); letterbox(f)
        wa = 0.6 * ease_io(prog(lt, L(sc, 1) - 0.3, L(sc, 1) + 1.2))
        if wa > 0:
            st = wheel_full(ground=0.85, center_text=1, halo={n: 0.4 for n, _, _ in RING_NODES})
            paste(f, draw_wheel(st, 700, ss=1, ground=True), W / 2, H / 2, wa, "mm")
        footage_caption(f, sc, lt, fi)
        if lt < card_t: return f
    b = Image.new("RGBA", (W, H)); b.alpha_composite(panel_bg(W, H, (16, 30, 50), (6, 12, 22)))
    avatar(b, W / 2, 300, 70, ENV[fi], SPEC[fi], fi / FPS, ease_out(prog(lt, card_t, card_t + 0.8)), label=False)
    p = ease_out(prog(lt, L(sc, 3), L(sc, 3) + 0.7))
    wm1 = text_img("enroute", "serif", 128, CREAM); wm2 = text_img("Q", "serif", 128, (120, 190, 150))
    tw = wm1.width + wm2.width - 4; x = W / 2 - tw / 2
    paste(b, wm1, x, 470 + 16 * (1 - p), p); paste(b, wm2, x + wm1.width - 4, 470 + 16 * (1 - p), p)
    text(b, "The AI operator for the electric bus depot.", W / 2, 650, "Medium", 32, (200, 214, 208), prog(lt, L(sc, 3) + 0.5, L(sc, 3) + 1.2), "mt")
    rw = int(160 * ease_out(prog(lt, L(sc, 3) + 0.3, L(sc, 3) + 1.0)))
    if rw > 2: paste(b, Image.new("RGBA", (rw, 3), GOLD + (255,)), W / 2 - rw / 2, 720)
    l4 = sc["lines"][4]
    caption(b, "So the depot runs itself, and the two a.m. call doesn't come.", W / 2, 790, 1400, lt - l4["t"], l4["d"], "Medium", 30, (235, 228, 210), 1.0, "m")
    fade = prog(lt, sc["dur"] - 1.2, sc["dur"] - 0.1)
    if fade > 0: b.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * fade))))
    if lt < card_t + 0.8:
        f.alpha_composite(with_alpha(b, prog(lt, card_t, card_t + 0.8))); return f
    return b

SCENE_FN = dict(night=s_night, operator=s_operator, wheel=s_wheel, insight=s_insight, live=s_live, connect=s_connect,
                travel=s_travel, optimiser=s_optimiser, energy=s_energy, care=s_care, hub=s_hub, control=s_control,
                forecast=s_forecast, benefit=s_benefit, valuate=s_valuate, bridge=s_bridge, close=s_close)

def frame(fi):
    t = fi / FPS
    for k, sc in enumerate(TL):
        if sc["start"] <= t < sc["start"] + sc["dur"]: break
    lt = t - sc["start"]
    img = SCENE_FN[sc["id"]](sc, lt, fi)
    # crossfade into the next scene across the boundary
    if k + 1 < len(TL) and lt > sc["dur"] - XF / 2:
        nx = TL[k + 1]; a = ease_io(prog(lt, sc["dur"] - XF / 2, sc["dur"] + XF / 2))
        img = img.copy(); img.alpha_composite(with_alpha(SCENE_FN[nx["id"]](nx, lt - sc["dur"], fi), a))
    if k > 0 and lt < XF / 2:
        pv = TL[k - 1]; a = ease_io(prog(lt + pv["dur"], pv["dur"] - XF / 2, pv["dur"] + XF / 2))
        prev = SCENE_FN[pv["id"]](pv, lt + pv["dur"], fi).copy(); prev.alpha_composite(with_alpha(img, a)); img = prev
    if k == 0: img.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - ease_io(prog(t, 0.0, 1.6)))))))
    arr = np.asarray(img.convert("RGB"), np.float32) + grain(fi) * 3.2
    return np.clip(arr, 0, 255).astype(np.uint8)

if __name__ == "__main__":
    a, bnd, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    if out.endswith(".jpg"):
        Image.fromarray(frame(a)).save(out, quality=88); sys.exit()
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for fi in range(a, bnd):
        enc.stdin.write(frame(fi).tobytes())
        if fi % 48 == 0: print(out, fi, flush=True)
    enc.stdin.close(); enc.wait()
