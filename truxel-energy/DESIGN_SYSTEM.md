# Truxel — Design System v2.0 (LOCKED)

The Truxel website and the design system it is built on. Layout and UX follow
the solarams.com reference; logo, colours and every word of content come from
Truxel (truxel.ai). The system is **locked**: new pages and edits reuse it as-is.

- Logo: `assets/truxel-logo.svg` (navy `#0B3142` + green `#5DE975`)
- Photos: `assets/img/` (taken from the truxel.ai page export)
- Figma (v1, earlier design; needs updating to v2): https://www.figma.com/design/qeWV8gGHR6OTqX4PJRvtwV

## Files

| File | Role | May it change? |
|---|---|---|
| `css/tokens.css` | Colours, fonts, type scale, spacing, radius, shadow, motion | **No.** Append new tokens only. |
| `css/components.css` | Base styles and every component | **No.** Append new blocks only. |
| `index.html` | Homepage | Text, numbers and images yes. Structure and classes no. |
| `styleguide.html` | Visual reference of tokens and components | Update when a token/component is appended. |
| `js/main.js` | Mobile menu, contact form | Bug fixes only. |

## Rules

1. Never edit or rename an existing token or component rule. Add new ones at the end of the file.
2. No literal colours, sizes or spacing in HTML or new CSS. Use `var(--c-*)`, `var(--fs-*)`, `var(--sp-*)`, `var(--r-*)`.
3. **Truxel Green** (`--c-green`) is for the primary button and highlights on dark. On light backgrounds, green text uses `--c-green-text`.
4. One accent phrase per heading at most, set in `.accent` (Instrument Serif italic).
5. Buttons are always pills with the round arrow icon (`.btn` + `.btn__icon`).
6. Alternate light sections with **night** bands (`.night`). Never two night bands in a row.
7. Three typefaces only: IBM Plex Sans (everything), Instrument Serif italic (accent words), IBM Plex Mono (small labels, numbering).
8. Dark mode changes token values only.
9. New pages copy the `<head>`, `.nav` and `.footer` from `index.html` unchanged.
10. Content comes from Truxel only. Do not add invented figures, clients or testimonials.

## Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--c-navy` | `#0B3142` | — | Logo, brand |
| `--c-green` | `#5DE975` | — | Primary button, accents on dark |
| `--c-green-text` | `#1E9A44` | `#6BEE82` | Green text on light surfaces |
| `--c-bg` / `--c-surface` | `#F6F8F7` / `#FFFFFF` | `#071A23` / `#0C2530` | Page, cards |
| `--c-ink` / `--c-ink-2` / `--c-ink-3` | `#0B3142` / `#557079` / `#9AABB1` | `#E8F1EE` / `#9DB3B9` / `#5F7A82` | Text levels |
| `--c-night` / `--c-night-2` | `#061D27` / `#0C2A37` | `#03121A` / `#0A2430` | Dark bands, dark cards |

## Components

`.nav` (floating pill) · `.hero` + `.chip` + `.hero__card` · `.marquee` · `.about` + `.mega` · `.illustration` ·
`.services` + `.service` · `.gallery` + `.tile` · `.stats` + `.stat` · `.night` · `.why-grid` + `.why-card` · `.network` ·
`.ready` · `.contact` + `.form` + `.field` + `.input` · `.footer` · `.btn` (`--green`, `--light`) · `.eyebrow` · `.accent` · `.muted`

## Homepage sections (in order)

Floating nav → Hero → Marquee → About → Services → Gallery → Who we work with (impact + stats) →
Why Nebula (night) → Ready to start → Contact (night) → Footer
