# Fleetmark: European bus buy & sell marketplace

A premium B2B marketplace front end for buying and selling buses and coaches across Europe, built with React. Prices are in EUR (net, with VAT status) and the interface is in English.

## Stack

- React 19, TypeScript and Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- [`@animate-ui/react`](https://animate-ui.com) and Motion for all animation, built on Radix UI primitives
- React Router (hash routing, so it runs on any static host)
- lucide-react icons

## Pages

| Route | What it is |
| --- | --- |
| `#/` | Home: hero search, stats, vehicle classes, featured buses, zero-emission spotlight, trust pillars, dealers |
| `#/buses` | Listings: faceted filters (sidebar or mobile bottom sheet), chips, sort, grid/list, animated results |
| `#/buses/:id` | Vehicle detail: gallery, sticky price panel with VAT, contact dialog, financing calculator, spec tabs |
| `#/sell` | Four-step listing wizard with live preview |
| `#/dealers` | Verified sellers and dealer plans |
| `#/dashboard` | Seller hub: KPIs, listings table, enquiries, performance |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
```

## Notes

- The data is mock data (`src/data/buses.ts`): 24 vehicles and 7 sellers.
- The vehicle images are vector illustrations (`src/components/BusArt.tsx`), coloured per listing. Replace them with real photos when connecting a backend.
- Saved buses are stored in `localStorage` and the app keeps working when storage is blocked.
- Design and UX rationale: [RESEARCH.md](RESEARCH.md).
