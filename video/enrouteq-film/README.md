# enrouteQ: depot film (2:50, 1920×1080, 24 fps)

`enrouteQ_depot_film_web.mp4` is the web/phone copy. The 230 MB master (CRF 20) is not committed.

## How it's built
- **Voiceover**: Kokoro TTS (`bm_george`, British male), generated line by line from `src/script.py`. Every scene's timing comes from the measured VO lengths (`src/timeline.py`).
- **Avatar**: an audio-reactive "AI operator" voice avatar (an orb with a live spectrum ring), driven by the VO's per-frame RMS and spectrum. It sits in the left panel. On footage beats it shrinks into the lower letterbox.
- **Right side**: your screenshots with Ken Burns moves and timed callouts, the depot-day wheel rebuilt as vectors (`gfx.draw_wheel`), and kinetic type for the beats that have no screen yet.
- **Footage**: the five Higgsfield clips, with a filmic grade, vignette, grain and 2.39:1 letterbox.
- **Audio**: a procedural score (`music.py`) ducked under the VO, with the clips' own ambience as a bed. There's a hush before the 98% hit. The mix measures about −14 LUFS.

## Re-render
```
pip install kokoro-onnx soundfile   # plus kokoro-v1.0.onnx + voices-v1.0.bin from the kokoro-onnx GitHub release
python vo.py <src_dir> <kokoro_dir> && python music.py && python mix.py
python render.py 0 4089 out.mp4      # or split into ranges and concat
```
Paths to clips/images/fonts are in `src/assets.py`.

## Open items (from the storyboard)
- **eQ Hub**: there's no VO line yet. The beat holds the wheel with Hub lit for 2.4 s.
- **eQ Energy 98%**: animated from the real figures (166 kW → 3.2 kW). Composite the real site-energy screenshot under it when available.
- **Screens not supplied** (#9 map, #10 SOC, #12 forecast, #15 benefit, #16 alerts): those beats use typographic overlays and the wheel instead.
- **eQ Valuate**: add the "in development" label if it isn't live yet.
- **HeyGen presenter**: the left panel (640 px) is the slot for a real avatar. Swap the `avatar()` call in `left_panel()` for the HeyGen frames.
