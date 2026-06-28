# Bacolod Quarry Supply Co. — Demo Website

A simple, mobile-friendly demo website for a quarry company near Bacolod City,
Negros Occidental. It lets customers browse materials, place a demo order, and
track deliveries on a live map of Negros Island.

Built as a **static site** (no build step) and ready to deploy to **Vercel**
with clean URLs (`/`, `/order`, `/track`).

> **Demo only.** All data is mock. No backend, no accounts, no payments.

## Pages

| Page | File | What it does |
|------|------|--------------|
| Landing | `index.html` | Hero, company intro, product cards, why-choose-us, service area, call-to-action |
| Order Form | `order.html` | Short order form → demo confirmation with a sample Order ID |
| Order Tracking | `track.html` | Search an Order ID → order summary + live Leaflet map with 10 moving trucks |

**Demo Order ID:** `BQ-2026-001`

## Tech

- Plain **HTML, CSS, and JavaScript** — no build step, no framework.
- **[Leaflet](https://leafletjs.com/)** + **OpenStreetMap** tiles for the free map (loaded from a CDN).
- All sample data (products, the demo order, and the 10 trucks) lives in `js/data.js`.

## Folder structure

```
Bacolod Quarry Supply/
├── index.html          # Landing page          → /
├── order.html          # Order form            → /order
├── track.html          # Tracking + live map   → /track
├── css/
│   └── styles.css      # Shared earth-tone styles, responsive
├── js/
│   ├── data.js         # Shared mock data (products, order, 10 trucks) + helpers
│   ├── landing.js      # Renders product cards
│   ├── order.js        # Form validation + demo confirmation
│   └── track.js        # Map, truck markers, animation, truck list
├── assets/
│   └── hero.svg        # Hero background illustration
├── vercel.json         # Vercel config (clean URLs: /order, /track)
├── package.json        # Local dev + deploy scripts
└── README.md
```

## How to run it locally

The map tiles load over `http://`, so open the site through a local web server
(not by double-clicking the HTML file). Use a server that understands clean URLs
so `/order` and `/track` resolve correctly.

```bash
cd "Bacolod Quarry Supply"
npm install      # installs the `serve` dev server
npm run dev      # serves on http://localhost:3000 with clean URLs
```

Or, if you have the Vercel CLI, run the site exactly as it will run in
production (this reads `vercel.json`):

```bash
vercel dev
```

> Tip: plain `python3 -m http.server` works too, but it does **not** support
> clean URLs — you'd have to visit `/order.html` and `/track.html` directly.
> Prefer `npm run dev` or `vercel dev`.

## Deploy to Vercel

This site is a static deployment — no build step, no framework.

**Option A — Vercel CLI:**

```bash
cd "Bacolod Quarry Supply"
npm install -g vercel     # one time
vercel                    # preview deploy (follow the prompts)
vercel --prod             # production deploy   (same as: npm run deploy)
```

When prompted, accept the defaults. Framework Preset = **Other**, Build Command
= *(none)*, Output Directory = *(leave blank / root)*. `vercel.json` handles the
clean-URL routing.

**Option B — Git + Vercel dashboard:**

1. Push this folder to a GitHub repo.
2. In the [Vercel dashboard](https://vercel.com/new), click **Add New → Project**
   and import the repo.
3. If this folder is inside a larger repo, set **Root Directory** to
   `Bacolod Quarry Supply`.
4. Framework Preset: **Other**. Leave Build Command empty. Click **Deploy**.

That's it — Vercel serves the static files and applies the clean URLs from
`vercel.json`.

## Try the demo

1. Open the home page and click **Order Materials** (or **Order This** on any product).
2. Fill in the short form and click **Place Order** — you’ll get a sample Order ID
   and a **Track My Order** button.
3. On the tracking page, enter **`BQ-2026-001`** and click **Track Order**.
4. Watch the 10 trucks slowly move toward Bacolod City. Click any truck marker,
   or use **View on Map** in the truck list to zoom to it.

## Customizing the demo

- **Products, order, trucks, coordinates, statuses** → edit `js/data.js`.
- **Colors / branding** → edit the CSS variables at the top of `css/styles.css`.
- **Truck speed** → change the `step` value and timer interval in
  `startAnimation()` inside `js/track.js`.
