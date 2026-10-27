# Lamplit — Quillon interactive portfolio

A real-time three.js scene of a hardcover book on a lamp-lit desk. Each page holds one case: a
16:10 screen recording that rests on its poster frame and plays while hovered (on touch screens,
visible pages play by themselves). Click or drag pages to turn them; use → / ← / Space / Page Up /
Page Down / Home / End, or deep links such as `#7`.

## Commands

```bash
npm ci          # install from the lockfile
npm run dev     # local dev server (StrictMode)
npm run lint    # oxlint
npm run build   # strict type-check (tsc -b) + production build into dist/
npm run preview # serve dist/
```

`?q=low` / `?q=high` forces the phone / desktop rendering budget.

## Assets

Every image and video is loaded at runtime from `https://assets.uberdesigner.ai/lamplit/`
(`ASSETS` in `src/data/cases.ts`), with `crossOrigin="anonymous"`; the host must send CORS headers.
Fonts are self-hosted through @fontsource and bundled into `dist/`.

- If the logo or mark fails to load, the scene does not start: the headline stays and a message
  asks the visitor to reload. The console names both URLs.
- If a case poster fails to load, that page shows "Preview unavailable" with the case title and the
  console names the poster URL; the rest of the book works.
- If a case video fails to load, its page keeps showing the poster.

## Deployment

The build uses a relative base (`base: './'` in `vite.config.ts`), so `dist/` works from any
sub-path. `.github/workflows/deploy-pages.yml` (at the repository root) builds this project and
publishes it to GitHub Pages at `/lamplit/`, alongside the existing root site copied unchanged.
It runs on pushes to `main` and needs **Settings → Pages → Source: GitHub Actions**.

## Accessibility

- Arrow / Page / Space / Home / End keys are ignored while typing in a field, and Space / Enter on a
  focused link or button are left to that control.
- A case index (all 21 cases, the contents, the back cover and "close the book") is reachable with
  Tab; it stays visually hidden until one of its links has focus.
- With `prefers-reduced-motion: reduce` the camera does not tilt toward the pointer.
