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
- Workshop (polish 2): step numbers 01–03 in gold #DCC86F and sitting on the title line; step titles 18px on both website and Figma (were 17 / 19).
- Testimonials (polish): arrows show state — "previous" is dimmed (40%) at the start, "next" dims at the end; on the website both arrows hide when all cards already fit (e.g. 3 cards on desktop). Figma shows the start state.
- Hero (polish, client request): soft dark shade over the bottom 45% of the banner (transparent → rgba(13,16,22,.55)) so the stats read clearly over the yard photo; bottom padding under the stats 48px (was 36). Lock re-applied.

## Figma housekeeping (4 Nov)
- Design Rationale page updated to the current design (sentence-case heading, hero shade, colour rules without magenta, richer listing cards, green primary / gold accent components).
- Components & Controls: Button "Sell" (magenta) variants replaced by "Accent" (gold "Talk to us →"); Primary buttons now brand green (Green/700, hover Green/800, disabled Green/300); Loading button idle/loading green.
- Old option frames (Trusted by operators A–C, Testimonial D–F, Triadic palette) moved to a new "Archive" page — nothing deleted.
- 5 Nov — client asked to undo the Components button change: Button set is back to Primary = blue (Blue/500, hover Blue/600, pressed Blue/700, disabled Blue/200) and Sell = magenta "+ Post your bus" (Magenta/600, hover/pressed Magenta/700); Loading button idle/loading back to Blue/500. (Design Rationale and Archive changes kept.)
- 5 Nov (later) — the button undo was reverted on request: Components are back to green Primary (Green/700, hover/pressed Green/800, disabled Green/300), gold "Talk to us →" Accent, and green Loading button. Hero band re-locked.
- 5 Nov — reverted two Figma edits from today (1–3 pm): "Talk to us" had been changed to solid amber #DEA345 and three hero stat icons to green #348C43; both back to the gold gradient button and gold #DCC86F icons, matching the website. Hero re-locked.

## Tanveer feedback — Figma page "Truxco — Homepage V2 (Tanveer FeedBack)" only (5 Nov)
Main homepage page and website NOT changed.
- Top black utility bar removed.
- Header logo X in green #278641 (was blue #1582FF).
- Navigation labels in capitals (HOME, BUSES, ABOUT, CONTACT US), +6% letter spacing.
- "Talk to us" → "Post a Bus", button fill bound to Amber/500 (#DEA345), white text and arrow.
- Hero stat icons (all four) in green #278641 (were gold).
- Search icon bigger and bolder: 40px (was 38) with a medium-bold 2.8 stroke (3.6 was too heavy), white on green.
- New "Video tour" section (option B) after Our services: white card, "See it for yourself" / "Take a tour of our yard and workshop", short text, 3 green-check chips, green "Book a visit to the yard →" link; 16:9 poster (yard photo) with green play button, "▶ Yard & workshop tour" and "1:30" labels. Poster and length are placeholders until the real video.
- Video tour redesigned (A label + D layout, clean): white card, 640×360 video left (green play + soft white ring, "1:30"), right: "See it for yourself", "Take a tour of our yard and workshop", 3 chapters with green timestamps (0:00 The yard · 0:35 Inspection bay · 1:05 Delivery) on thin dividers, green "Book a visit to the yard →". Chips removed for a sleeker look.
- Video play button: 80px circle bound to Amber/500 with a soft white ring (22%), white play icon (single clean vector, ~27×32, rounded corners, no stroke), optically centred.
- Footer logo X also green #278641 (was blue #3C64D0), matching the header logo.
- Footer phone and email icons green #278641 (were gold); pill text unchanged.
- "Post a Bus" label 18px (was 15); button box kept at 154×52 (fixed size, side padding 20, content centred).
- "Post a Bus" arrow replaced by a 2-line chevron ( > ), white, 2.6 stroke, tight icon (9×16) with a 10px gap from the text; box still 154×52.
- Video poster enlarged to 720×405 (was 640×360); gap to the text column 48px; play button re-centred.

## V2 web preview (Tanveer feedback), 6 Nov
Separate link: https://claude.ai/artifact/5fQmU77HRx2xtJU8nshYa1 — source copy in `website-v2/Main.dc.html`. The main website (QnxH1x…) is unchanged.
Applied: no utility bar; green X logo (`assets/logo-green-x.svg`, also in footer and the intro animation); uppercase nav; Amber #DEA345 "Post a Bus" (white 18px, chevron, 154×52; mobile menu too); green stat icons; bolder 40px search icon; Video tour section after Our services (video left with amber play button, chapters right); green footer contact icons.
- V2 preview: Workshop now uses the three Figma photos (handshake large, wheel and papers below), same as the Figma V2 page.

## Used buses listing page (V2 style), 16 Nov
Second artboard "UsedBuses.dc.html" in the V2 preview (https://claude.ai/artifact/5fQmU77HRx2xtJU8nshYa1, canvas now opens in canvas view). Copy in `website-v2/UsedBuses.dc.html`. Not in Figma yet.
- Same header as V2 (no utility bar, green X, uppercase nav with BUSES active, amber "Post a Bus"), compact hero with breadcrumb, "Used buses for sale" and the same search bar; trust strip; footer.
- Left filter panel (collapsible groups): Bus type with counts (working), Make, Price, Year, Mileage, Seats, Emission class (Euro 6 toggle, working), Gearbox, Location; "Clear all".
- Results: count, removable filter chips, working Sort (newest, price, year, mileage), 3-column card grid (same card as home), pagination, empty state.
- "Can't find the right bus?" navy request band with green button and phone.
- The live truxco.se page renders its listings with JavaScript, so no real stock data could be read. First 4 cards reuse the homepage listings; the other 5 are examples with [PRICE]/[YEAR]/[KM]/[SEATS] placeholders; pagination "[LAST]" is a placeholder.
- Used buses: search bar removed from the banner (the filter panel does the searching); banner bottom padding 56px.
- Used buses: the search bar is back as a single field with a light placeholder, "Search by make, model or location…", plus the green search button (it replaces the three fields: make/model, country, price).
- Used buses cards: "Send enquiry" button removed; "View details" is the only button and fills the card width (the homepage cards still have both).
- Used buses: "Home / Buses" breadcrumb removed from the banner.
- Used buses cards: "View details" is now solid green (#278641) with white text.
- Used buses sidebar redesign: filter icon + active-filter count, bus type as icon tiles (2-column, green selected state), € prefix on price + quick price buttons, Euro 6 on/off switch, buttons for mileage/seats, Any/Automatic/Manual toggle for gearbox, "Save search & get alerts" button at the bottom.
- Used buses pagination redesign: white bar (16px corners) with Previous (grey) on the left, page numbers in the middle (current page green), navy Next on the right. Below it: "Showing 1–N of 72 buses" plus a thin green progress bar. On mobile only the arrows show. 72 and 8 pages are example numbers.
- Used buses sidebar v2 (sleek): light border and soft shadow instead of a heavy border; small uppercase grey section titles; bus type as rounded chips with counts (selected one is navy); price and year as soft grey min/max fields with no presets; Euro 6 as a single switch line; mileage/seats/gearbox as chips; "Clear all" is grey and turns green on hover; Save search is a soft grey button.
- Used buses sidebar: reverted to the previous tiles design at the user's request (the sleek v2 was rolled back); the new pagination stays.
- Used buses sidebar, Bus type: icons removed. Each type is a full-width, text-only row (44px tall) with its count in a small rounded label on the right (green with white number when selected, grey otherwise), so long names like "City buses" no longer wrap.
- Used buses: amber "Post a Bus" button removed from the header (desktop and mobile menu). The homepage V2 still has it.
- Used buses "Request a bus" band redesign: 2 columns. Left: eyebrow, headline with "We’ll find it." in light green, 3 numbered steps, green "Send a bus request →" button and a phone button with icon. Right: coach cutout on a green glow with a "Typical reply: within 1 working day" card. Faint dot pattern. Stacks on mobile. Placeholder copy to confirm: "Takes about two minutes", "Including buses not listed online", "With photos, history and a price".
- Figma: added frame "Truxco — Used buses V2 (Tanveer FeedBack)" (node 431:610) on page 246:5108, to the right of the Homepage V2 frame. Sections:
  - Header + listing banner (cloned from the V2 hero; BUSES active, Post a Bus hidden, single search field)
  - Trust strip (clone)
  - Listing: Filters sidebar with text-only bus type rows, plus 9 bus cards in 3 columns (clones of the homepage cards, Send enquiry hidden, View details green)
  - Pagination
  - Request-a-bus band with the uploaded coach cutout
  - Footer (clone)
  Colours are bound to the file variables.
- Bus detail page (V2), new third artboard "BusDetail.dc.html", for truxco.se/en/buses/14 with sample data: Volvo 9700 HD.
  - Dark banner: back link, tags (Coach, New in, Workshop inspected), large title with the year, location, Save and Share.
  - Gallery overlaps the banner: large photo with arrows, video and photo counter, plus 5 thumbnails (working).
  - Sticky price card: €129,000, financing pill, 4 spec tiles, green Send enquiry, Book a viewing, contact person, trust list.
  - Sticky section tabs.
  - Sections: Overview with highlights, Specifications (3 groups), Equipment (sample list), Inspection report with checklist and workshop photo, How buying works (4 steps).
  - Similar buses, then the request band and the footer.
  - On mobile, a sticky bottom bar shows the price and Send enquiry.
  - The View details buttons on the listing cards link here.
  - Placeholders like [ENGINE], [HP], [DATE] and [NAME] need the real data, which truxco.se did not provide because it was not reachable.
- Bus detail updates: "250 people viewed this week"; financing pill removed; contact box redesigned (sample name Johan Andersson, solid green avatar with initials and online dot, "Your bus expert", language chips, Call and Email buttons); section tabs now an underline style (active tab green with a green bar); Specifications shown as tiles in 3 groups with icons (label on top, value below) to make it less crowded.
- Bus detail tabs simplified to match the reference: no card or shadow, plain text tabs (Inter Medium 15, wider spacing) on a full-width grey line, active tab green with a 3px green underline; still sticky.
- Bus detail price card made compact so it fits on laptop screens (525px tall; it was 825px):
  - Removed the "Price" label. Price is now 38px. Spec tiles are smaller, with the icon beside the text.
  - Buttons are 50 and 46px tall. The trust list is a single small line inside the card.
  - Contact box is tighter: languages are one line of text, Call and Email buttons are 40px.
  - The card stops being sticky on screens shorter than 640px.
- Bus detail Specifications and Equipment simplified, no more boxes. Specs: 3 columns (Vehicle / Engine and drive / Size and seating) split by thin vertical lines, green uppercase group titles with icons, grey label above a bold value, airy spacing. Equipment: plain 3-column checklist with small solid-green check circles. Mobile: specs in 1 column, equipment in 2.
- Bus detail price card simplified (546px tall): 28px padding, 24px gaps, thin dividers between 4 sections.
  - Price section: "Price excl. VAT" label above a 40px price.
  - Specs section: 2x2 plain label/value pairs with no tiles or icons.
  - Buttons section: green Send enquiry and outline Book a viewing, no icons.
  - Contact section: avatar, name and "Bus sales", plus round call and email icons.
  - Removed: trust line, eyebrow label, language line and online dot.
- Bus detail: thin divider under every spec item. All [PLACEHOLDERS] on the page are replaced with example values, which need to be confirmed against the real listing:
  - Engine and size: Volvo D11K 11 litre, 460 hp, I-Shift; 13.8 m long, 3.7 m high, 11 m³ luggage.
  - Dates: first registered March 2017; serviced October 2026; inspected 12 October 2026; tyres 8 mm tread.
  - Description and similar buses: description sentence; prices, years, km and seats for the similar-bus cards.
- Bus detail price card reverted to the tiles + contact-box design at the user's request, with more spacing: 26px padding, 22px gaps, 10px tile gaps, roomier tiles (12/14px), contact box 18px padding / 16px gap, 48px avatar. 601px tall.
- Bus detail specs: no divider under the last item in each column; divider and column lines slightly darker (#DFE3EC, was #ECEEF4).
- Bus detail price card tiles: white icon box removed, icons enlarged from 18px to 24px; nothing else changed.
- Price card tile icons now 32px (same size the white box was), stroke 1.7.
- Contact box: languages line moved 4px down from the name; Call/Email buttons moved down (box gap 16px to 22px).
- "How buying works" redesigned as a dark navy feature panel: green glow + faint dot pattern, eyebrow "From our yard to your depot", horizontal timeline with 56px green icon nodes (last node white = destination) on a green gradient line, big outlined numbers 01–04, white titles, light-grey text; bottom bar "Buying from abroad? We help you with every step." + green "Start with an enquiry". Mobile: vertical timeline.
- "How buying works": the dark version was reverted at the user's request (no black). It is back to the light design with more colour: soft green gradient background with a green border, a "Simple and safe" eyebrow, each step in a white card with a green shadow and a lift on hover, green gradient icon tiles, amber number badges, and dashed green connectors between the cards.
- "How buying works" toned down to the original layout with a light touch of colour: very light green panel (#F6FBF7, border #E2EEE5), amber number badges, light-green dashed connectors; no cards, eyebrow or gradient.
- "How buying works" sleek version: white panel, 44px light-green circles with thin green outline icons, a thin grey line joining them, a green "STEP 01–04" label, then title and text. No badges, shadows or gradients.
- Bus detail: one icon system across the Overview, Specifications, Equipment, Inspection and How buying works sections. Every icon is the same line family at 20px, stroke 1.8, green #278641. Icons that sit in a container all use the same 40px light-green circle (#F3FCF5, border #C5F1D1), in the overview highlights, spec group headers, inspection header and steps. Check marks in Equipment and Inspection, and the PDF icon, are plain 20px icons.
- Inspection header: icon and "Inspection report" title now share one centred row; the "Checked in…" line sits below, left-aligned with the icon.
- Bus detail: main button renamed "Send enquiry" → "Get an Offer" (price card and mobile sticky bar).
- Bus detail tabs: removed the stray vertical scrollbar. The tabs no longer scroll vertically, and the horizontal scrollbar is hidden. The base line is now an inset shadow, so the green active underline is no longer clipped.
- Bus status system (Available / Reserved / Sold):
  - Cards (listing and similar buses): white pill at the image top-right with a coloured dot. Green #278641 = Available, amber #DEA345 = Reserved, grey #8693B6 = Sold. Sold cards show the photo in greyscale at 60% opacity.
  - Data: each bus has a `status` field (default Available). Sample data: Volvo 7900 Electric is Reserved (it used to be a "Reserved" badge), Iveco Daily Line is Sold.
  - Bus detail: white "● Available" tag first in the hero tags, and a green pill "● Available · ready for viewing" above the price, with a soft pulsing dot (off with reduced motion).
  - Suggested rules for the other states on the detail page, not built yet: Reserved = amber pill "Reserved until [date]" and a "Join the waiting list" button; Sold = grey pill, buttons replaced by "See similar buses".
- "Can’t find the right bus?" band (Used buses + Bus detail): the coach cutout is replaced by the support-agent photo from Figma (node 437:930, uploaded as /_blob/4c695799953b218865a34d33f232d3ef, saved in assets/support-agent.png). It is bottom-aligned like in Figma (left -4%, width 108%), its left and top edges fade into the navy card, and the "Typical reply" chip still sits on top. Mobile: the photo is full width under the text.
- Bus detail "Similar buses" cards simplified. Kept: photo with type, status pill and photo count, the bus name, and a full-width green View details button. Removed: location, price, specs row, inspected line and report link.
- Similar buses cards: location line and price (with "excl. VAT") added back under the name; the View details button stays. Still no specs, inspected line or report link.
- Bus detail "Get an Offer" now opens a popup (in the price card and the mobile bar):
  - Layout: dark blurred overlay, a 560px white dialog, and a bus summary at the top (thumbnail, "Volvo 9700 HD · 2017", "€129,000 excl. VAT · Ref. TX-14"), with a round close button.
  - Form: Full name* and Company; Email* and Phone (2 columns; 1 column on mobile); Country select; Message pre-filled with the bus name; an "Also send me similar buses" checkbox; a green "Send request" button and a privacy note.
  - Submit: shows a "Request sent" success state with a Close button.
  - Closing: Esc, the X or a click outside.
  - Behaviour: required fields use the browser's own checks. In the tall canvas view the popup opens near the button, and in a normal browser window it is centred. Nothing is actually sent; this is a prototype.
- Get an Offer popup made compact so it fits every screen with no scroll. Checked heights: 1366×640 → 492px, 375×667 → 515px, 320×568 → 530px.
  - Fields: Name* + Email* in one row, Phone + Company in the next, both rows stay 2 columns on mobile. The message box is 2 rows ("Please send me your best offer for this bus."). Country select and the "similar buses" checkbox are removed.
  - Size: dialog is 520px wide, with a smaller bus summary and title.
  - Small screens: inputs shrink on screens under 700px tall, and the privacy note hides under 600px.
- Get an Offer popup restyled to look more modern:
  - Layout: an 820px two-panel dialog with 24px corners.
  - Left panel: bus photo with a navy gradient, the "Available" chip, "Coach · 2017 · Ref. TX-14", name, price, and two perks (Reply within 1 working day, No obligation).
  - Right panel: "FREE OFFER" eyebrow and the "Get your best price" heading. Fields are soft grey with 12px corners and turn white with a green focus ring. There is a pill-shaped gradient "Send request →" button and a "Johan Andersson will handle your request personally" line.
  - Close button: round, and it rotates on hover.
  - Success state: green gradient check and a navy "Done" button.
  - Mobile: the photo becomes a 104px banner above the form.
  - No scroll at any size. Checked heights: 1366×640 → 445px, 375×667 → 587px, 320×568 → 536px.
- Get an Offer popup: kept the modern two-panel style but brought back the earlier content.
  - Left panel: "Available" chip, "Volvo 9700 HD · 2017", "€129,000 excl. VAT · Ref. TX-14". Perks and meta line removed.
  - Right panel: "Get an offer" heading, "Johan will send you an offer within 1 working day." subtitle, name/email/phone/company, message, Send request, and the privacy note.
  - Success state: "Thanks! …" text and a Close button.
  - Photo is cropped to the bus front (object-position 78% 40%).
  - Still no scroll. Checked heights: 1366×640 → 442px, 375×667 → 593px, 320×568 → 530px.
- Get an Offer popup changes:
  - Buttons: Send request and Close now use the site's standard green button (solid #278641, 6px corners, hover #1F6E35, 54px tall). The gradient pill is gone.
  - Size: the popup is a bit taller and roomier, with 36/34px padding, 20px gaps and 48px inputs.
  - Still no scroll. Checked heights: 1366×640 → 526px, 375×667 → 613px, 320×568 → 532px.
  - Small screens: the compact sizes only apply under 600px screen height.
- Offer popup message pre-filled as "I’m interested in buying the Volvo 9700 HD (Ref. TX-14). Please send me your best offer." On mobile the message box is 3 lines (14px) and spacing is tightened on short phones; still no scroll (checked 1366×640, 1280×600, 375×667, 360×640, 320×568, 390×844).
- Contact us page (V2): new 4th artboard "Contact.dc.html". The content comes from the live truxco.se/en/contact-us page: phone, Mon–Fri 08:00–17:00 CET, info@truxco.se, "We reply within 24 hours", "Truxco AB, Staffanstorp, Skåne, Sweden, by appointment only", Get directions, the languages SV/EN/DE/PL, and the form fields.
  - UX strategy (JTBD): visitors come to buy, sell, visit or ask something else. The hidden "Type of request" dropdown is replaced by 4 visible topic cards (Buy a bus / Sell a bus / Visit the yard / Something else). The selected card changes the message placeholder.
  - Layout:
    - Dark hero: "We reply within 24 hours" pill and the heading "Let’s talk buses."
    - Overlapping form card "Send a message" with the topic cards, name*, email*, phone, message, and a "Send Enquiry" button. Sending shows a "Message sent" state.
    - Right column: support-agent photo card "Talk to a real person" with language chips, plus Call / Email / Visit cards with arrow buttons.
    - "Visit us" banner: the aerial yard photo with a pulsing Truxco pin and an address card with Get directions and Book a visit. Book a visit selects "Visit the yard" in the form.
    - "Quick answers" FAQ with 4 questions, then the footer.
  - Nav: CONTACT US is active.
- Navigation linked across all 4 V2 pages:
  - Header nav: the items are now real links. Home → Main.dc.html, Buses → UsedBuses.dc.html, About → Main.dc.html#workshop, Contact us → Contact.dc.html.
  - Mobile menu: same links.
  - Footer: Coaches, City buses, Minibuses and Electric → UsedBuses; About us → Main#workshop; How it works → BusDetail#delivery; Contact → Contact; Sell with us → Main#sell; Inspections → BusDetail#inspection. Careers, FAQ and Press stay "#".
  - Active tab: Home on Main, Buses on the listing and detail pages, Contact us on Contact.
  - Already linked before: the logo goes to Main, View details goes to BusDetail, and "Back to all buses" goes to UsedBuses.
- Contact "Talk to a real person" card filled out, because it looked too empty:
  - Look: green glow in the top-left, card 360px tall, agent photo blending in on the right.
  - Text: a "Support team · Mon–Fri 08–17" pill with a pulsing dot, a 26px two-line title, and the line "No bots, no call centre. Our bus specialists answer you directly."
  - Languages: a "We speak" label with Svenska / English / Deutsch / Polski chips.
  - Buttons: a green "Call now" and an outline "Email".
  - Mobile: a stronger dark gradient so the text stays readable over the photo.
- Contact agent card: "Talk to a real person" on one line; Call now / Email buttons removed (the Call and Email cards below already cover these).
- Contact top grid: the black agent card has no shadow and is wider (columns 1.35fr/1fr → 1.2fr/1fr, right column 553px). Form card and right column now end on the same line: the grid is stretched, the agent card grows to fill, and the form content is vertically centred.
- Contact: "We reply within 24 hours" pill removed from the hero; it now replaces "Support team · Mon–Fri 08–17" as the pill at the top of the black agent card.
- Contact "Quick answers" redesigned: the left heading + accordion is replaced by a centred heading and 4 equal white answer cards in one row (2 columns on tablet, 1 on mobile). Each card has a 44px green icon circle (clock, eye, truck, globe), a bold question and the answer, all visible. Below the cards: "Still have a question? Send us a message".
