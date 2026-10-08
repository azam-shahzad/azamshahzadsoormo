"""Drawing primitives: fonts, cached text, easing, compositing, the depot-day wheel, the avatar orb."""
import math, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from assets import FONT

W, H = 1920, 1080
NAVY = (12, 22, 38); NAVY2 = (18, 32, 54); CREAM = (244, 240, 230); CREAM2 = (250, 247, 240)
INK = (30, 36, 51); GREEN = (61, 107, 82); GREEN_L = (110, 170, 135); GOLD = (184, 145, 63)
LINE = (226, 220, 200); RED = (214, 72, 62)

INTER = "/usr/share/fonts/opentype/inter/Inter-%s.otf"
@functools.lru_cache(None)
def font(kind, size):
    path = {"serif": FONT + "SourceSerif4Display-Bold.ttf", "serifsb": FONT + "SourceSerif4Display-Semibold.ttf",
            "mono": FONT + "JetBrainsMono-Medium.ttf", "monob": FONT + "JetBrainsMono-Bold.ttf"}.get(kind)
    if path is None: path = INTER % kind
    return ImageFont.truetype(path, size)

def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def prog(t, a, b): return clamp((t - a) / (b - a)) if b > a else float(t >= a)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return 4*x*x*x if x < .5 else 1 - (-2*x + 2) ** 3 / 2
def ease_back(x, s=1.4): x = clamp(x); return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2
def lerp(a, b, x): return a + (b - a) * x
def mix(c1, c2, x): return tuple(int(round(lerp(a, b, x))) for a, b in zip(c1, c2))

@functools.lru_cache(4096)
def text_img(text, kind, size, color, tracking=0):
    f = font(kind, size)
    if tracking:
        widths = [f.getlength(ch) for ch in text]
        tw = int(sum(widths) + tracking * (len(text) - 1)) + 4
    else:
        tw = int(f.getlength(text)) + 4
    asc, desc = f.getmetrics()
    im = Image.new("RGBA", (max(tw, 1), asc + desc + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if tracking:
        x = 0
        for ch, w in zip(text, widths):
            d.text((x, 0), ch, font=f, fill=color); x += w + tracking
    else:
        d.text((0, 0), text, font=f, fill=color)
    return im

def with_alpha(im, a):
    if a >= 0.999: return im
    im = im.copy(); al = np.asarray(im.getchannel("A"), np.float32) * a
    im.putalpha(Image.fromarray(al.astype(np.uint8))); return im

def paste(base, im, x, y, alpha=1.0, anchor="lt"):
    if alpha <= 0.003: return
    w, h = im.size
    if anchor[0] == "m": x -= w / 2
    elif anchor[0] == "r": x -= w
    if anchor[1] == "m": y -= h / 2
    elif anchor[1] == "b": y -= h
    base.alpha_composite(with_alpha(im, alpha), (int(round(x)), int(round(y))))

def text(base, s, x, y, kind, size, color, alpha=1.0, anchor="lt", tracking=0):
    im = text_img(s, kind, size, tuple(color), tracking); paste(base, im, x, y, alpha, anchor); return im.size

def wrap(s, kind, size, width):
    f = font(kind, size); words = s.split(); lines = [[]]
    for w in words:
        trial = " ".join(lines[-1] + [w])
        if f.getlength(trial) > width and lines[-1]: lines.append([w])
        else: lines[-1].append(w)
    return lines

def caption(base, s, x, y, width, t, dur, kind="Medium", size=30, color=CREAM, alpha=1.0, align="l", lh=1.38, fade_out=None):
    """Word-by-word reveal paced across the spoken duration."""
    if t < -0.2 or alpha <= 0: return
    lines = wrap(s, kind, size, width); f = font(kind, size); total = max(1, len(s)); ci = 0
    out_a = 1.0 if fade_out is None else 1 - prog(t, fade_out, fade_out + 0.35)
    for li, ws in enumerate(lines):
        lw = f.getlength(" ".join(ws)); cx = x if align == "l" else x - lw / 2 if align == "m" else x - lw
        yy = y + li * size * lh
        for w in ws:
            wt = (ci / total) * dur * 0.92; ci += len(w) + 1
            p = ease_out(prog(t, wt - 0.05, wt + 0.28))
            if p > 0:
                paste(base, text_img(w, kind, size, tuple(color)), cx, yy + (1 - p) * 10, p * alpha * out_a)
            cx += f.getlength(w + " ")

def rrect(size, r, fill, outline=None, width=0, ss=2):
    w, h = size; im = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], r * ss, fill=fill, outline=outline, width=width * ss)
    return im.resize((w, h), Image.LANCZOS)

@functools.lru_cache(64)
def shadow(w, h, r, blur=28, op=90):
    pad = blur * 2; im = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([pad, pad + 10, pad + w, pad + h + 10], r, fill=(10, 18, 30, op))
    return im.filter(ImageFilter.GaussianBlur(blur)), pad

def pill(label, kind="SemiBold", size=20, fg=CREAM, bg=GREEN, padx=16, pady=8, tracking=0, dot=None):
    t = text_img(label, kind, size, fg, tracking); w = t.size[0] + padx * 2 + (22 if dot else 0); h = size + pady * 2 + 4
    im = rrect((int(w), int(h)), h // 2, bg)
    x0 = padx
    if dot:
        d = ImageDraw.Draw(im); cy = h / 2; d.ellipse([padx, cy - 5, padx + 10, cy + 5], fill=dot); x0 += 22
    im.alpha_composite(t, (int(x0), int((h - t.size[1]) / 2) + 2))
    return im

# ---------------------------------------------------------------- the depot-day wheel (vector rebuild)
# Geometry from the approved brand file (1816 px reference canvas, centre 905,897).
WC = 905; WR_DISC = 195; WR_RING = 468; WR_NODE = 524; WR_ORBIT = 708
RING_NODES = [("eQ Connect", "RUNS", 0), ("eQ Optimiser", "RUNS", 45), ("eQ Energy", "RUNS", 90),
              ("eQ Control", "OFFLINE-SAFE", 135), ("eQ Care", "RUNS", 180), ("eQ Hub", "RUNS", 225),
              ("eQ Travel", "RUNS", 270), ("eQ Insight", "SUPERVISES", 315)]
OUTER_NODES = [("eQ Forecast", "PREDICTS", 0), ("eQ Valuate", "USED-BUS PRICE", 135)]
ALL_NODES = [n for n, _, _ in RING_NODES] + [n for n, _, _ in OUTER_NODES]

def _pol(r, deg):
    a = math.radians(deg); return WC + r * math.sin(a), WC - r * math.cos(a)

def draw_wheel(st, size, ss=2, ground=True, label_scale=1.0):
    """st: dict with keys center, ring, orbit, nodes{name:presence}, lit{name:0..1}, labels{name:a}, dim{name:a}, halo."""
    S = size * ss; k = S / 1816.0
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    P = lambda x, y: (x * k, y * k)
    if ground:
        g = st.get("ground", 1.0)
        if g > 0:
            d.ellipse([*P(WC - 880, WC - 880), *P(WC + 880, WC + 880)], fill=CREAM + (int(255 * g),))
    lw = max(1, int(3 * k * st.get('line_scale', 1)))
    # dotted orbit
    orb = st.get("orbit", 1.0)
    if orb > 0:
        n = 140
        for i in range(int(n * orb)):
            x, y = _pol(WR_ORBIT, i * 360 / n); r = 1.7 * k * st.get('line_scale', 1) + 0.5
            d.ellipse([x * k - r, y * k - r, x * k + r, y * k + r], fill=(222, 206, 160, 200))
    ring = st.get("ring", 1.0)
    if ring > 0:
        a = ring * 360
        d.arc([*P(WC - WR_RING, WC - WR_RING), *P(WC + WR_RING, WC + WR_RING)], -90, -90 + a, fill=LINE + (255,), width=lw)
        for _, _, deg in RING_NODES:
            if deg <= a + 0.1:
                sp = clamp((a - deg) / 40)
                x0, y0 = _pol(WR_DISC + 6, deg); x1, y1 = _pol(WR_DISC + 6 + (WR_RING - WR_DISC - 6) * sp, deg)
                d.line([*P(x0, y0), *P(x1, y1)], fill=LINE + (255,), width=lw)
    # dashed gold leads to the outer nodes
    for name, _, deg in OUTER_NODES:
        p = st.get("nodes", {}).get(name, 0)
        if p > 0:
            r0, r1 = WR_DISC + 8, WR_DISC + 8 + (WR_ORBIT - 20 - WR_DISC) * p
            off = 0 if deg == 0 else 0
            rr = r0
            while rr < r1:
                xa, ya = _pol(rr, deg + off); xb, yb = _pol(min(rr + 10, r1), deg + off)
                d.line([*P(xa, ya), *P(xb, yb)], fill=(mix(CREAM, (214, 186, 120), st.get("dim", {}).get(name, 1)) + (255,)) if ground else (214, 186, 120, int(255 * st.get("dim", {}).get(name, 1))), width=max(1, int(2.5 * k)))
                rr += 20
    # centre disc
    c = st.get("center", 1.0)
    if c > 0:
        cs = ease_back(c, 1.2); r = WR_DISC * cs; halo = (WR_DISC + 12) * cs
        d.ellipse([*P(WC - halo, WC - halo), *P(WC + halo, WC + halo)], fill=(232, 236, 225, int(255 * clamp(c * 2))))
        d.ellipse([*P(WC - r, WC - r), *P(WC + r, WC + r)], fill=CREAM2 + (255,), outline=(122, 156, 136, 255), width=max(1, int(4 * k)))
    # nodes
    for name, verb, deg in RING_NODES + OUTER_NODES:
        p = st.get("nodes", {}).get(name, 0)
        if p <= 0: continue
        outer = name in ("eQ Forecast", "eQ Valuate")
        rad = WR_ORBIT if outer else WR_NODE
        if name == "eQ Forecast": rad = 730
        x, y = _pol(rad, deg)
        dim = st.get("dim", {}).get(name, 1.0)
        lit = st.get("lit", {}).get(name, 1.0)
        base = GOLD if (outer or name == "eQ Insight") else GREEN
        col = mix(mix(CREAM, base, 0.35), base, lit)
        r = 15 * st.get('node_scale', 1) * ease_back(p, 2.0)
        if ground: col = mix(CREAM, col, dim); a = 255
        else: a = int(255 * dim)
        hl = st.get("halo", {}).get(name, 0)
        if hl > 0:
            hr = r + 26 * hl * st.get('node_scale', 1)
            hc = mix(CREAM, base, 0.28 * hl * dim) + (255,) if ground else base + (int(70 * hl * dim),)
            d.ellipse([x * k - hr * k, y * k - hr * k, x * k + hr * k, y * k + hr * k], fill=hc)
        if name == "eQ Insight":
            d.ellipse([x * k - r * k, y * k - r * k, x * k + r * k, y * k + r * k], fill=CREAM2 + (a,), outline=col + (a,), width=max(1, int(4.5 * k)))
        else:
            d.ellipse([x * k - r * k, y * k - r * k, x * k + r * k, y * k + r * k], fill=col + (a,))
    out = im.resize((size, size), Image.LANCZOS) if ss != 1 else im
    # labels (drawn at output resolution for crispness)
    sc = size / 1816.0
    if c > 0 and st.get("center_text", 1.0) > 0:
        ct = st.get("center_text", 1.0) * clamp(c * 1.5 - 0.3)
        text(out, "The depot", WC * sc, (WC - 70) * sc, "serif", max(8, int(58 * sc * label_scale)), INK, ct, "mm")
        text(out, "day", WC * sc, (WC + 5) * sc, "serif", max(8, int(58 * sc * label_scale)), GREEN, ct * st.get("day", 1.0), "mm")
        text(out, "24 / 7 · ON SITE", WC * sc, (WC + 80) * sc, "SemiBold", max(7, int(24 * sc * label_scale)), (80, 86, 100), ct, "mm", tracking=max(1, int(3 * sc)))
    for name, verb, deg in RING_NODES + OUTER_NODES:
        la = st.get("labels", {}).get(name, 0) * st.get("dim", {}).get(name, 1.0)
        if la <= 0: continue
        outer = name in ("eQ Forecast", "eQ Valuate")
        vcol = GOLD if (outer or name == "eQ Insight") else GREEN
        nsz = max(8, int(36 * sc * label_scale)); vsz = max(7, int(24 * sc * label_scale)); tr = max(1, int(3 * sc * label_scale))
        if name == "eQ Forecast":
            x, y = _pol(730, 0); text(out, verb, x * sc, (y - 82) * sc, "SemiBold", vsz, vcol, la, "mb", tracking=tr)
            text(out, name, x * sc, (y - 40) * sc, "Bold", nsz, INK, la, "mb"); continue
        if name == "eQ Valuate":
            x, y = _pol(WR_ORBIT, 135); text(out, name, (x + 28) * sc, (y + 40) * sc, "Bold", nsz, INK, la, "lt")
            text(out, verb, (x + 28) * sc, (y + 40 + 42 * label_scale) * sc, "SemiBold", vsz, vcol, la, "lt", tracking=tr); continue
        x, y = _pol(WR_NODE, deg)
        if deg == 0:
            text(out, name, x * sc, (y - 76) * sc, "Bold", nsz, INK, la, "mb"); text(out, verb, x * sc, (y - 35) * sc, "SemiBold", vsz, vcol, la, "mb", tracking=tr)
        elif deg == 180:
            text(out, name, x * sc, (y + 48) * sc, "Bold", nsz, INK, la, "mt"); text(out, verb, x * sc, (y + 48) * sc + nsz * 1.25, "SemiBold", vsz, vcol, la, "mt", tracking=tr)
        else:
            dx = 44 if deg in (90, 270) else 96; dy = -38 if deg in (90, 270) else -62
            sgn = 1 if deg < 180 else -1; anc = "lt" if deg < 180 else "rt"
            text(out, name, (x + sgn * dx) * sc, (y + dy) * sc, "Bold", nsz, INK, la, anc); text(out, verb, (x + sgn * dx) * sc, (y + dy) * sc + nsz * 1.25, "SemiBold", vsz, vcol, la, anc, tracking=tr)
    return out

def wheel_full(**over):
    st = dict(center=1, ring=1, orbit=1, nodes={n: 1 for n in ALL_NODES}, lit={n: 1 for n in ALL_NODES},
              labels={n: 1 for n in ALL_NODES}, dim={}, halo={})
    st.update(over); return st

@functools.lru_cache(32)
def locator_img(active, size=232):
    """Corner locator: only the active node in colour with its label; the rest at 30%."""
    dim = {n: (1.0 if (active == "ALL" or n == active) else 0.3) for n in ALL_NODES}
    st = wheel_full(dim=dim, labels={}, center_text=0, halo={active: 1.0} if active != "ALL" else {}, node_scale=2.7, line_scale=2.2)
    im = draw_wheel(st, size, ss=3)
    return im

def locator(base, active, alpha=1.0, prev=None, x=None, y=None, cross=1.0, size=232):
    x = W - size - 34 if x is None else x; y = 30 if y is None else y
    if prev and cross < 1: paste(base, locator_img(prev, size), x, y, alpha * (1 - cross))
    paste(base, locator_img(active, size), x, y, alpha * (cross if prev else 1))
    if active not in ("ALL", None) and alpha > 0:
        verb = {n: v for n, v, _ in RING_NODES + OUTER_NODES}[active]
        col = GOLD if active in ("eQ Forecast", "eQ Valuate", "eQ Insight") else GREEN
        p = pill(f"{active}  ·  {verb}", "SemiBold", 17, CREAM, col + (235,), 14, 7)
        paste(base, p, x + size / 2, y + size + 8, alpha * cross, "mt")

# ---------------------------------------------------------------- avatar orb ("the AI operator" voice avatar)
@functools.lru_cache(8)
def orb_core(r):
    s = r * 2 + 8; yy, xx = np.mgrid[0:s, 0:s].astype(np.float32); c = s / 2
    d = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / r
    lx, ly = (xx - c + r * 0.35) / r, (yy - c + r * 0.45) / r; spec = np.exp(-(lx ** 2 + ly ** 2) * 3.0)
    base = np.array([24, 52, 66], np.float32); rim = np.array([88, 168, 128], np.float32)
    col = base[None, None] * (1 - d[..., None] * 0.3) + rim[None, None] * (d[..., None] ** 3) * 0.9 + 140 * spec[..., None] * np.array([0.6, 0.9, 0.8])
    a = np.clip((1 - d) * r * 0.8, 0, 1) * 255
    im = np.dstack([np.clip(col, 0, 255), a]).astype(np.uint8)
    return Image.fromarray(im, "RGBA")

@functools.lru_cache(8)
def glow(r, col):
    s = int(r * 5); im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(im).ellipse([s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r], fill=col + (255,))
    return im.filter(ImageFilter.GaussianBlur(r * 0.55))

def avatar(base, cx, cy, r, env, spec, t, alpha=1.0, label=True, small=False):
    """Audio-reactive voice avatar: breathing core, spectrum ring, orbiting rings."""
    if alpha <= 0: return
    e = float(env)
    g = glow(int(r * 1.15), (70, 160, 120)); paste(base, g, cx, cy, alpha * (0.25 + 0.55 * e), "mm")
    S = int(r * 3.2) * 2; ov = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(ov); c = S / 2; k = 2
    nb = 72 if not small else 48
    for i in range(nb):
        ang = 2 * math.pi * i / nb + t * 0.15
        band = spec[(i * 48 // nb) % 48] if i < nb / 2 else spec[((nb - 1 - i) * 48 // nb) % 48]
        L = (6 + 48 * band * (0.35 + e)) * (0.5 if small else 1)
        r0 = (r * 1.18) * k; r1 = r0 + L * k
        col = mix((90, 150, 120), (230, 205, 140), clamp(band * 1.3))
        d.line([c + r0 * math.cos(ang), c + r0 * math.sin(ang), c + r1 * math.cos(ang), c + r1 * math.sin(ang)],
               fill=col + (int(220 * (0.35 + 0.65 * band)),), width=int(3 * k if not small else 2 * k))
    for j, (rr, sp, wdt) in enumerate([(1.55, 0.4, 1.5), (1.72, -0.25, 1.0)]):
        rad = r * rr * k * (1 + 0.02 * e); a0 = math.degrees(t * sp) % 360
        d.arc([c - rad, c - rad, c + rad, c + rad], a0, a0 + 250, fill=(184, 145, 63, 150 if j == 0 else 90), width=int(wdt * k * 2))
    ov = ov.resize((S // 2, S // 2), Image.LANCZOS); paste(base, ov, cx, cy, alpha, "mm")
    cr = int(r * (1 + 0.05 * e)); core = orb_core(r)
    if cr != r: core = core.resize((cr * 2 + 8, cr * 2 + 8), Image.BILINEAR)
    paste(base, core, cx, cy, alpha, "mm")
    # inner "voice" line
    lw = Image.new("RGBA", (int(r * 2.2), int(r)), (0, 0, 0, 0)); dl = ImageDraw.Draw(lw); pts = []
    for i in range(60):
        x = i / 59; amp = math.sin(x * math.pi) * (0.08 + 0.42 * e) * r * 0.5
        y = r / 2 + amp * math.sin(x * 14 + t * 9) * math.sin(x * 5 + t * 3)
        pts.append((r * 0.2 + x * r * 1.6, y))
    dl.line(pts, fill=(235, 245, 238, 230), width=3 if not small else 2)
    paste(base, lw, cx - r * 0.1, cy, alpha * 0.95, "mm")
    if label:
        text(base, "enrouteQ", cx, cy + r * 1.95 + 6, "serif", 34 if not small else 22, CREAM, alpha, "mt")
        text(base, "AI DEPOT OPERATOR", cx, cy + r * 1.95 + (52 if not small else 34), "SemiBold", 15 if not small else 11, (150, 190, 168), alpha, "mt", tracking=4)

# ---------------------------------------------------------------- backgrounds
@functools.lru_cache(4)
def panel_bg(w, h, top=NAVY2, bot=NAVY):
    g = np.linspace(0, 1, h)[:, None, None]; yy, xx = np.mgrid[0:h, 0:w]
    c = np.array(top)[None, None] * (1 - g) + np.array(bot)[None, None] * g
    rad = np.exp(-(((xx - w * 0.5) / (w * 0.7)) ** 2 + ((yy - h * 0.32) / (h * 0.5)) ** 2))[..., None]
    c = c + rad * np.array([10, 26, 22])
    return Image.fromarray(np.dstack([np.clip(c, 0, 255), np.full((h, w), 255)]).astype(np.uint8), "RGBA")

@functools.lru_cache(4)
def cream_bg(w, h):
    yy, xx = np.mgrid[0:h, 0:w]; rad = np.exp(-(((xx - w * 0.5) / (w * 0.8)) ** 2 + ((yy - h * 0.45) / (h * 0.8)) ** 2))[..., None]
    c = np.array([232, 226, 212])[None, None] * (1 - rad) + np.array(CREAM2)[None, None] * rad
    return Image.fromarray(np.dstack([c, np.full((h, w), 255)]).astype(np.uint8), "RGBA")

@functools.lru_cache(2)
def vignette(strength=0.55):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    return (1 - strength * np.clip(d / 2, 0, 1) ** 1.3)[..., None].astype(np.float32)

_GRAIN = None
def grain(i):
    global _GRAIN
    if _GRAIN is None:
        rng = np.random.default_rng(1)
        _GRAIN = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]
    g = _GRAIN[i % 6]; return np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]
