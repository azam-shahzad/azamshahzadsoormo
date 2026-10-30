# Truxco.se — homepage

Static HTML/CSS/JS build of the Figma design
[Truxco.se Prototype → Option 01 · Truxco.se Classic](https://www.figma.com/design/sEz3FfAcZMI8zpIhCkqxlY/Truxco.se-Prototype?node-id=0-1).

Open `index.html` in a browser. No build step. `hero-options.html` shows the four hero + search variants.

## Design
- One page background (`#F5F4F2`) for every section except the footer.
- Single-color headings, no underlines.
- Two fonts: Barlow (headings) and Inter (body).
- Sections follow the options picked in Figma: split hero with search and coach render, About as a bento grid, Services grouped by customer need, What we offer as photo cards, Featured listings as a carousel.
- Responsive down to 375px, mobile menu, email validation on the valuation form.

## Assets
All icons in `assets/` are local SVGs (no download step):
- `il-*.svg` — illustrated spot icons (outline, Truxco blue, mint accent, sparkle), in the style of timeedit.com.
- `ic-check.svg`, `icon-*.svg` — small UI icons (check, phone, chevron, arrows).

- `bus-*.webp` — 3D bus renders with the background removed (transparent, soft ground shadow), used in the hero, What we offer and Featured listings. Source renders live in Figma ("3D bus renders (source)").

- `about-technician.webp` — AI-generated, photo-realistic workshop image for the About section, with the original Truxco logo (from truxco.se) printed on the uniform (Figma "3D render / Technician (realistic)").
- `listing-*.webp` — AI-generated, photo-realistic dealer-yard photos used in Featured listings (Figma "Photo / … (real)").

Still placeholders, as in Figma: listing data (`[Make & Model]` etc.), testimonials, the logo and the trust seal.
