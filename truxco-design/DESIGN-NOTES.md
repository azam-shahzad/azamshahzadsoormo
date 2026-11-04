# Truxco homepage — design record

Saved snapshot of the agreed design (website + Figma), 4 Nov 2026.
Figma saves itself automatically; the Figma file link below is the source of truth for the design.

- Website (Design canvas): https://claude.ai/artifact/QnxH1xVyvcQ8cYTejVcJ45 — source copy in `website/Main.dc.html`
- Figma file "Truxco Website Option2": https://www.figma.com/design/dy5FgQjP3SIjBIkFOql3IF
  - Pages: Truxco — Homepage · Colour System · Components & Controls

## Hero section — FINAL, do not change
Locked in Figma (layer "Hero band (FINAL — do not change)", node 58:263).

- Background: linear-gradient(135deg, #0E2A16 0%, #0E162A 50%, #2A0E25 100%). No dots, no animation.
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
- Footer: aerial bus-yard photo background (`assets/footer-yard.jpg`) under a dark overlay rgba(13,16,22,.86 → .94). Wordmark "Buy. Sell. Drive Away." between the link columns and the bottom bar, fully visible at the 1240px content width, colour #BCC3D7 at 16% opacity.
- Services cards: links (Browse buses / Talk to our team / Get a free valuation) pinned to the bottom of each card so all three line up (Figma: ServiceCard › Points grows).
- Shop by type: light grey #F4F4F4 image area, bus cut-outs cropped to the wheels, no shadow and no background (`assets/bus-*-clean.png`).
- Fonts: Barlow Bold (headings), Inter (body). Keep fonts, spacing and alignment consistent site-wide.
- Colour System in Figma: brand scales, light/dark tokens, tetradic scales (#45DE57, #4580DE, #DE45CC, #DEA345) and a Tetradic Light/Dark theme.
- Components & Controls page: Button, Icon button, Toggle, Checkbox, Radio, Copy field, Loading button (motion: press 140ms, state 200ms, move 260ms, draw 320ms).

## Working rules from the client
- Apply changes to both the website and Figma unless told otherwise.
- When asked for options, show them first and do not apply until one is chosen.
