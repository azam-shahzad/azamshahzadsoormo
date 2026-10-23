# Truxel Energy — Design System v1.0 (LOCKED)

This folder holds the Truxel website and the design system it is built on.
The system is **locked**: future redesigns, new pages and edits must reuse it
as-is. Visual consistency comes from never changing the base.

Logo: `assets/truxel-logo.svg` (navy `#0B3142` + green `#5DE975`). Brand colours come from the logo.

Figma file (variables, text styles, components, homepage):
https://www.figma.com/design/qeWV8gGHR6OTqX4PJRvtwV

## Files

| File | Role | May it change? |
|---|---|---|
| `css/tokens.css` | Colours, fonts, type scale, spacing, radius, shadow, motion | **No.** Append new tokens only. |
| `css/components.css` | Base styles and every component | **No.** Append new component blocks only. |
| `index.html` | Homepage | Content (text, numbers, images) yes. Structure and classes no. |
| `styleguide.html` | Visual reference of every token and component | Update only when a new token/component is appended. |
| `js/main.js` | Nav, tabs, form, hero chart | Bug fixes only. |

## The rules

1. **Never edit an existing token value or name** in `tokens.css`.
2. **Never edit an existing component rule** in `components.css`. To add a variant, append a new modifier class (for example `.btn--outline`) at the end of the file.
3. **No literal colours, font sizes or spacing in HTML or new CSS.** Use `var(--c-*)`, `var(--fs-*)`, `var(--sp-*)`.
4. **Signal Green (`--c-volt`) is for live power and the main action only.** At most one green button per screen.
5. **One navy band at a time.** Never place two `.section--band` sections next to each other.
6. **Three typefaces only**: Archivo (display, width 104–125%), IBM Plex Sans (body), IBM Plex Mono (numbers and labels).
7. **Numbers always use the mono face with units** (`412.6 MW`, `50.00 Hz`, `68 %`).
8. **Dark mode is automatic.** It changes token values only; never write dark-mode rules inside components.
9. **New pages** start by copying the `<head>`, `.nav` and `.footer` from `index.html` unchanged.

## Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--c-grid` Truxel Navy | `#0B3142` | `#071016` | Brand, hero, bands, footer |
| `--c-volt` Signal Green | `#5DE975` | `#6BEE82` | Primary CTA, live data |
| `--c-copper` Copper | `#B05A2B` | `#D9814F` | Storage, icons, figures |
| `--c-solar` Solar | `#D9B44A` | `#E3C463` | Charts |
| `--c-paper` Paper | `#F3F5F1` | `#0A151B` | Page background |
| `--c-surface` Surface | `#FFFFFF` | `#0F1F27` | Cards, inputs |
| `--c-ink` Ink | `#0D1E28` | `#E6EEEA` | Text |
| `--c-ok / warn / crit` | `#2E7D5B / #B7791F / #B3392F` | | Status only |

## Type scale

| Token | Size | Use |
|---|---|---|
| `--fs-3xl` | 42–84px fluid | H1 |
| `--fs-2xl` | 32–52px fluid | H2, big stats |
| `--fs-xl` | 26–36px fluid | Quotes, case numbers |
| `--fs-lg` | 22px | H3, card titles |
| `--fs-md` | 18px | Lead text |
| `--fs-base` | 16px | Body |
| `--fs-sm` | 14px | Labels, buttons |
| `--fs-xs` | 12px | Captions, eyebrows |

## Components

`.nav` · `.hero` · `.panel` + `.readout` · `.strip` · `.eyebrow` · `.btn` (`--volt`, `--ghost`, `--sm`) · `.link` ·
`.badge` (`--live`, `--ok`, `--warn`, `--crit`) · `.card` · `.steps` · `.stats` · `.tabs` + `.tabpanel` ·
`.checklist` · `.kv` · `.quote` · `.case` + `.bar` · `.faq` · `.field` + `.input` · `.cta` · `.footer`

Layout: `.container` · `.section` (`--band`, `--tint`) · `.section-head` · `.split` · `.cards`

## Homepage sections (in order)

Navigation → Hero with live telemetry → Trust strip → Platform → How it works → Results →
Solutions by sector → Case study → FAQ → Demo request → Footer
