import json, os
from script import SCENES
HERE = os.path.dirname(os.path.abspath(__file__))
DUR = json.load(open(os.path.join(HERE, "vo/durations.json")))
LEAD = {"night": 1.5, "wheel": 0.6, "live": 0.5, "energy": 0.5, "hub": 0, "close": 0.8}
TAIL = {"energy": 0.9, "close": 3.6, "operator": 0.8, "wheel": 0.9, "insight": 0.7}
GAPS = {("energy", 1): 1.0, ("energy", 2): 0.9, ("close", 3): 0.8, ("close", 4): 0.3, ("close", 2): 0.5,
        ("operator", 3): 0.5, ("bridge", 1): 0.5}

def build():
    t = 0.0; out = []
    for sid, lines, mind in SCENES:
        lt = LEAD.get(sid, 0.4); starts = []; durs = []
        for i, _ in enumerate(lines):
            if i: lt += GAPS.get((sid, i), 0.32)
            d = DUR[f"{sid}_{i}"]; starts.append(lt); durs.append(d); lt += d
        lt += TAIL.get(sid, 0.5)
        dur = max(mind if not lines else 0, lt) if lines else mind
        out.append(dict(id=sid, start=t, dur=dur, lines=[dict(t=s, d=d, cap=l[0]) for s, d, l in zip(starts, durs, lines)]))
        t += dur
    return out, t

if __name__ == "__main__":
    tl, total = build()
    for s in tl: print(f"{s['id']:10s} {s['start']:7.2f} {s['dur']:6.2f}")
    print("total", total)
