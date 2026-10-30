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
- `svc-*.webp` — glossy illustrated Services icons in the TimeEdit style, Truxco blue + mint (Figma "Services Opt 05", sprite "Icons / Services (TimeEdit style, sprite)").
- `ic-*.webp` — glossy illustrated icons in the TimeEdit style for About, Why choose Truxco, Featured listings and Testimonials (Figma sprite "Icons / General (TimeEdit style, sprite)").
- `il-*.svg` — earlier outline spot icons (no longer used on the page) (outline, Truxco blue, mint accent, sparkle), in the style of timeedit.com.
- `icon-*.svg` — small UI icons (check, phone, chevron, arrows).

- `bus-*.webp` — 3D bus renders with the background removed (transparent, soft ground shadow), used in the hero, What we offer and Featured listings. Source renders live in Figma ("3D bus renders (source)").

- `about-technician.png` — AI-generated, photo-realistic workshop image for the About section, with the Truxco logo printed on the uniform (Figma "3D render / Technician (realistic)").
- `listing-*.webp` — AI-generated, photo-realistic dealer-yard photos used in Featured listings (Figma "Photo / … (real)").

Listing details are sample data (make, price, year, mileage, seats, Euro class) and should be replaced with real stock. Still placeholders, as in Figma: testimonials, the logo and the trust seal.
