# Truxco homepage — design record

Saved snapshot of the agreed design (website + Figma), 4 Nov 2026.
Figma saves itself automatically; the Figma file link below is the source of truth for the design.

- Website (Design canvas): https://claude.ai/artifact/QnxH1xVyvcQ8cYTejVcJ45 — source copy in `website/Main.dc.html`
- Figma file "Truxco Website Option2": https://www.figma.com/design/dy5FgQjP3SIjBIkFOql3IF
  - Pages: Truxco — Homepage · Colour System · Components & Controls

## Hero section — FINAL, do not change
Locked in Figma (layer "Hero band (FINAL — do not change)", node 58:263).

- Background: linear-gradient(135deg, #0E2A16 0%, #0E162A 50%, #2A0E25 100%) with the bus-yard drone photo (`assets/hero-yard.jpg`) clipped inside the banner, cover, at 20% opacity (client request, 4 Nov). No dots, no animation.
- Height: fills the first screen (website: `min-height: calc(100svh - 37px)` after the 37px utility bar; Figma: 867px for a 1440×900 screen).
- Navigation bar: 72px high, radius 16px, background rgba(255,255,255,.04), border rgba(255,255,255,.10).
  - Logo left · links centred: Home, Buses, About, Contact us (#BCC3D7, active #FFFFFF, Inter Semi Bold 15)
  - Right: "Talk to us →" gold gradient (#EAD98F → #DCC86F → #C4A24A), text #151923, 52px high, radius 6px, 10px inset.
- Heading: "BUY & SELL BUSES IN EUROPE" — Barlow Bold 60, white.
- Subtitle: "With 200+ inspected buses, we have just the right one for your fleet" — Inter 18, #D9DDE8.
- Search box: white, 72px high, radius 16px, no inner padding, shadow 0 16 40 rgba(0,0,0,.25).
  - Fields: Bus make or model · All countries · Price range (dividers #D9DDE8)
  - Search button: icon only, 88×72, green #278641, white search icon 38px, flush to the box edge.
- "Advanced filter" link removed.
- Stats (option A), 56px below the search box, top divider rgba(255,255,255,.1), 32px padding:
  - Gold line icons 26px (#DCC86F) beside Barlow Bold 40 white numbers, Inter 15 #BCC3D7 labels.
  - 200+ Buses in stock · 24 Countries delivered to · 1,400+ Happy buyers · 10+ years In the bus business.

## Other agreed decisions
- Corner system (option D): containers 16px, buttons inside 6px, 10px inset.
- Listings cards: radius 16, buttons radius 6 (also the prev/next arrows); specs Year | Mileage ("512,000 km") | Seats with Mileage taking the spare width; meta line "Inspected · Euro 6"; Mercedes Sprinter shows "Price on request" (no excl. VAT) until a real price is given.
- Workshop section: photos taken from Figma — large top: handshake in the bus yard (`assets/workshop-handshake.jpg`), bottom left: technician at the wheel (`assets/workshop-wheel.jpg`), bottom right: papers and keys handover (`assets/workshop-papers.jpg`); photos radius 16; steps 01–03 in a fixed 28px number column (#9CB1E7) so all titles line up; 4px between step title and text; "More about Truxco" button radius 6.
- Footer: solid #0D1016 background (no photo). Wordmark "Buy. Sell. Drive Away." between the link columns and the bottom bar, fully visible at the 1240px content width, colour #BCC3D7 at 16% opacity.
- Services cards: radius 16, 32px padding all round (link has no extra padding, so top and bottom space match); links (Browse buses / Talk to our team / Get a free valuation) pinned to the bottom of each card so all three line up (Figma: ServiceCard › Points grows).
- Shop by type: light grey #F4F4F4 image area, bus cut-outs cropped to the wheels, no shadow and no background (`assets/bus-*-clean.png`).
- Fonts: Barlow Bold (headings), Inter (body). Keep fonts, spacing and alignment consistent site-wide.
- Colour System in Figma: brand scales, light/dark tokens, tetradic scales (#45DE57, #4580DE, #DE45CC, #DEA345) and a Tetradic Light/Dark theme.
- Components & Controls page: Button, Icon button, Toggle, Checkbox, Radio, Copy field, Loading button (motion: press 140ms, state 200ms, move 260ms, draw 320ms).

## Working rules from the client
- Apply changes to both the website and Figma unless told otherwise.
- When asked for options, show them first and do not apply until one is chosen.

## Improvements applied to the website (not Figma), 4 Nov
- Heading in sentence case: "Buy and sell buses across Europe"; subtitle "200+ inspected buses, ready for your fleet". Hero no longer forced to full screen, so listings show on a laptop.
- Trust strip under the hero: Inspected in our own workshop · Export papers included · Delivery across Europe · Inspection report with every bus.
- Listings: filter chips, "View all 200+ buses", photo count, location, New in (green) / Reserved (gold) badges, "Inspection report (PDF)" link.
- Accent rules: green = actions, gold = small premium accents, services icons navy on #ECEEF4, green checks, dark links. No magenta.
- Workshop: real yard drone photos (`assets/yard-a.jpg`, `assets/yard-b.jpg`) and a dashed slot for a real workshop photo from Truxco.
- Testimonials: three cards. Only Henrik Larsson was in the original design; Marta Kowalska and Jan de Vries, locations and badges are PLACEHOLDERS to replace with real Truxco content.
- Testimonial cards: green top border, gold quote mark and stars, name in green #278641, initials in a solid green #278641 circle (fill only, no ring). Prev/next arrows (44px, radius 6) scroll the row one card at a time; 3 cards visible on desktop, 2 on tablet, 1 on phone. Section padding 80px top; Sell section top padding 64px.
- Services cards (final, client choice): light green tile #E2F8E8 with green #278641 icon, navy #0E162A checks, green #278641 link, "For buyers / operators / sellers" labels in blue #3050A6 like the "Our services" eyebrow — same on all three cards.
- Sell section steps 1–3: number circles in blue #3050A6 (same blue as labels and eyebrows).

## Figma synced with the website (4 Nov)
Applied in Figma: sentence-case heading and subtitle, shorter hero (hugs content, ~588px), trust strip, "View all 200+ buses", filter chips, card location + inspection report link + New in/Reserved badges + photo count, services (green tiles/icons/links, navy checks, blue labels), sell step circles #3050A6, new Testimonials section (TestimonialCard component, 3 cards, arrows), Sell section top padding 64.
Kept as it was in Figma on request: the "Our own workshop" photos (Figma has its own pictures there; the website uses yard photos + a placeholder).
- Client edits in Figma (synced to website): Testimonials padding 48px top and bottom; Sell section top padding 48px; Footer top padding 96px.
- Shop by type (polish): heading on one line with a green "View all buses →" link on the right; cards radius 16; all four buses the same height (118px) standing on one shared ground line 40px above the image bottom; "Explore …" links and hover line in green #278641; tags stay blue.
- Sell section (polish): intro text no longer runs past the column; steps list gets a top divider; inputs and button radius 6, button 52px high; placeholders for mileage, email and phone; required "*" in red #B42318 (was magenta); the two columns are vertically centred.
- Footer (polish): phone and email pills get gold line icons, radius 6, 44px tap height; link columns spaced 12px with 8px under the headings; gap above the wordmark 40px (was 56); links and legal links turn white on hover, pills brighten on hover.
- Navigation (polish, client request): active page shows a 2px gold #DCC86F underline under the link (Home), marked aria-current="page"; on hover other links get a short gold underline (website). Hero lock was lifted only for this edit and re-applied.
