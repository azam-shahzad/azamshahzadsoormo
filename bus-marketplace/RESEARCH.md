# UX research notes: Fleetmark bus marketplace

## About the sources

The brief asked for Mobbin MCP research. The Mobbin MCP server was not connected in the build session, so no Mobbin screens were pulled. The patterns below come from established European vehicle and commercial-vehicle marketplace conventions: general car portals, truck and bus classifieds, and B2B dealer platforms. They should be checked against Mobbin references once the connector is available.

## Homepage layouts

| Pattern seen across automotive marketplaces | Decision for Fleetmark |
| --- | --- |
| Search is the hero. A short form with body-type tabs, make, price and location, plus a live result count on the button ("Show 1,234 cars") | Hero search with animated body-type tabs (`All / Coach / City bus / Intercity / Minibus / Electric`) and a live count: "Show 24 buses" |
| Trust stats right below the fold (listings, dealers, countries) | Stats band that counts up when it scrolls into view |
| Category tiles with an illustration per vehicle class | Five vehicle-class tiles with counts |
| Featured or "top offers" grid | Six featured cards |
| A segment spotlight (EV, leasing) | Zero-emission band with battery-health and range stats |
| Seller CTA and dealer plans in the lower half | Trust pillars, top dealers, a sell CTA, and dealer plans on `/dealers` |

## Vehicle listing pages

- **Results count at the top, sort on the right, grid/list toggle.** All three are here. The count rolls between values (SlidingNumber).
- **Active filter chips above the results, each removable, plus "Reset all".** Chips animate in and out, and the other chips reflow.
- **Cards follow a fixed hierarchy:** image, then class and year, then title, then a 2×2 spec grid (mileage, seats, first registration, emission class), then price with VAT status, then location and seller.
- **B2B detail:** every price is **net in EUR** and states its VAT status: "Net, excl. VAT" or "Margin scheme".
- **Empty state** explains how to widen the search and offers "Reset filters" and "Save search".

## Search and filters

- On desktop the filters sit in a sticky left sidebar. On mobile they open in a **bottom sheet** with a draggable handle and a sticky "Show N buses" button.
- Facet counts next to every option. Counts are computed excluding the facet's own selection, the standard "disjunctive faceting" behaviour.
- Range sliders for price, year and mileage. Toggles for wheelchair access, VAT-deductible-only and saved-only.
- Filters specific to buses: **emission class** (Euro 5, 6, 6e, zero emission), **drivetrain** (diesel, electric, hybrid, CNG, hydrogen), and **seats + standing places**.
- All filter state lives in the URL, so searches can be shared and bookmarked.

## Vehicle detail pages

- A large gallery with thumbnails, a counter and arrow controls. The thumbnail selection ring glides between thumbnails.
- On desktop a **sticky price panel** sits on the right: the net price, the gross price at the seller country's VAT rate, and a reverse-charge tooltip. It also holds Contact, Phone and Inspection actions and a seller trust card (rating, response time, verified badge).
- On mobile a **sticky bottom action bar** shows the price and a "Contact seller" button.
- Four key facts above the fold, then tabs: Overview, Specifications, Equipment, and Delivery & paperwork (export plates, reverse-charge VAT).
- A financing calculator with a down-payment slider and a term toggle. The monthly rate rolls as you change them.
- The contact form opens in a dialog. It validates on blur, its error messages give the fix instead of blaming the user, and a success state confirms the send.

## Seller dashboard

- A sidebar with an account card, sections and plan usage (listing slots progress bar).
- KPI tiles (views, enquiries, active listings, stock value) that count up.
- Tabs for Listings (table with a live/paused switch and a row actions menu), Enquiries (unread dots) and Performance (views chart, buyer-origin bars).

## Motion (Animate UI)

The motion level is subtle, the default for a premium B2B product. All values come from Animate UI's motion tokens, and every animation has a reduced-motion fallback.

| Where | Primitive or token |
| --- | --- |
| Nav hover, dashboard sidebar | `Highlight` (gliding surface, `spring.highlight`) |
| Hero search tabs, detail and dashboard tabs | Animate UI `Tabs` + `TabsHighlight` + `TabsContents` |
| Cards and category tiles | Press feedback at `scale.choice` (0.985) on `spring.press`; colour, shadow and image-zoom hover only |
| Results grid and filter chips | Layout reflow on `spring.reflow`, enter/exit on `transition.fade` |
| Selects, dropdown menu, tooltips, dialog, drawers, accordion, checkbox, switch, slider, toggle group, progress | Animate UI's Radix primitives (import swap) |
| Page entrances | `Effects` (fade, 2–4px blur, 16px slide), with `inView` below the fold |
| Stats, KPIs, result count, monthly rate | `CountingNumber`, `SlidingNumber` |
| Save button | `IconButton` with a particle burst |
| Sell wizard steps | Form-steps pattern (`shift.step`, `transition.panelOut`/`panelIn`) |
