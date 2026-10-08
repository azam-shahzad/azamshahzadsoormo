# DayPilot: 3D product film

This is a 30-second, 1920×1080, 30 fps promotional film for **DayPilot**, a daily AI assistant. The interface is treated as a physical object in 3D space: a graphite-framed glass dashboard, cards with real thickness, a mirrored stage floor, depth of field, dust particles and spline-driven camera moves. All UI text stays readable.

| File | What it is |
|---|---|
| `out/DayPilot_3D_30s_1080p30.mp4` | Final film, H.264 + AAC 256k, normalised to −14 LUFS |
| `out/DayPilot_3D_30s_1080p30_silent.mp4` | Picture only |
| `out/daypilot_audio.wav` | Score and sound design stem, 48 kHz stereo |
| `out/contact_sheet.jpg`, `out/stills/` | Key frames pulled from the final film |

## Story and copy

| Time | Beat | On-screen copy |
|---|---|---|
| 0–1.5 s | A light streak runs along the slab's bevel and the dashboard powers on | none |
| 1.5–5 s | The headline rises out of depth and flies past the lens, then the camera pulls back to reveal the dashboard | **Your day. Sorted by AI.** |
| 5–11 s | The dashboard breaks into floating cards; notifications pile in; the camera drifts and tilts; everything freezes | **Too many tabs.** / **Too much to remember.** |
| 11–13 s | The command bar flies in; the cursor clicks; the text types in; Enter sends a shockwave | `Plan my day.` |
| 13–16.5 s | Cards fly onto the board, tasks re-rank, and P1/P2/P3 tags stamp in | **01 Prioritize your tasks.** |
| 16.5–20 s | The cursor clicks *Summarize* and the note flips into a 3-point summary | **02 Summarize your notes.** |
| 20–24 s | A focus block extrudes over a conflict; the cursor drags it to 10–12 AM, where it snaps and shows *Protected*; two tasks tick green | **03 Make time for focused work.** |
| 24–26.5 s | The cards press flat into a calm, planned dashboard | none |
| 26.5–30 s | The dashboard recedes, the 3D logo extrudes, and the button rises, is clicked and gets a light sweep; final hold | **DayPilot** · **Less planning. More doing.** · **Try DayPilot** |

Palette: graphite stage `#0E0F12`, off-white glass `#F7F5EF`, charcoal text `#202020`, DayPilot yellow `#FFD43B`, and signal green `#36D675` for completed and successful actions. Type is Inter and Inter Display.

## How it is built

- `src/main.js` holds the three.js scene. Every object's state is a pure function of time `t`, so any frame renders deterministically. It covers camera tracks (Catmull–Rom), card choreography, post-processing (depth of field, bloom, vignette and grain) and a HUD layer for typography and the cursor, drawn after post so text stays sharp.
- `src/ui.js` paints every interface surface with Canvas 2D in "slab units". The same drawing code bakes a card into the dashboard texture and renders it as its own 3D card, so the hand-off between them is seamless.
- `audio/score.py` synthesizes the original score and SFX (numpy only, no samples) on the same timeline.
- `render/render.mjs` steps frames in headless Chromium and pipes them to ffmpeg. `render/finish.py` joins the chunks, normalises loudness, muxes the audio and pulls stills.

```bash
npm install                     # three.js
# live preview with a scrubber (Space = play/pause, ←/→ = step a frame)
npx serve .  # then open http://localhost:3000/src/index.html
# render
python3 audio/score.py
for i in 0 1 2; do node render/render.mjs --from $((i*300)) --to $((i*300+300)) --out out/tmp/part$i.mp4; done
python3 render/finish.py
# quick checks
node render/render.mjs --stills 2.6s,12.4s,29.9s      # PNG stills to out/stills/
```

## Notes and limitations

- Reflections, glass and depth of field are real-time WebGL captured frame by frame, not a ray-traced render. The cloud machine renders on CPU (SwiftShader), at about 4–5 s per frame.
- The music and SFX are synthesized originals. A licensed track can replace `out/daypilot_audio.wav`; `finish.py` re-muxes and re-normalises it.
- The DayPilot mark (a yellow tile with a navigation pointer) is a placeholder. Supply a real logo to replace it.
