# Ghost City

**Ghost City** is a static web app that visualizes the history of Ottoman-era mosques in Belgrade. Choose a decade, see which mosques existed then on the map, and read short descriptions and traveler quotes.

## What it does

- **Decade slider** — Pick a decade; the map and cards show only mosques that existed then (built on or before, demolished on or after, or still standing).
- **Map** — Points in Belgrade; opacity by status (Established/Renovated = solid, Damaged = semi-transparent, Demolished = not shown). Click or hover a point for a popup: image, name, what happened, and how in that decade.
- **Cards** — One card per mosque: image, short description, traveler quote, and quote author. Clicking a card selects it (highlight on map and in the list). Selection is reflected in the URL as `?mosque=Name`.

## Tech

- Static HTML, CSS, and JavaScript. No build step.
- [Leaflet](https://leafletjs.com/) for the map (Carto tiles; no API key).
- [Lexend](https://fonts.google.com/specimen/Lexend) as the default font.
- Data: `data/mosque_about.json` and `data/mosques_decades.json` (generated from the CSV files).

## Data

- **mosque_about.csv** — One row per mosque (name, decades, coordinates, image URL, description, traveler quote, quote author). Keep this in the repo; JSON is generated from it.
- **mosques_decades.csv** — Events per mosque per decade (what happened, how). Same: source of truth; JSON is generated.

To regenerate JSON after editing the CSVs:

```bash
python3 scripts/csv_to_json.py
```

## Run locally

Serve the project root with any static server. Examples:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .

# Then open http://localhost:8000 (or the port shown).
```

Browsers may block `fetch()` of local JSON files when opening `file://` directly; use a local server.

## Deploy on Cloudflare Pages

1. Push the repo to GitHub (no `app.py`, no `requirements.txt`; only static files + data).
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create project** → **Connect to Git** → select the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave empty, or `python3 scripts/csv_to_json.py` if you want to build JSON during deploy)
   - **Build output directory:** `/` (or `.` — the root is the site)
4. Deploy. Your site will be at `https://<project>.pages.dev`.

If you prefer to build JSON in CI: add a build step that runs `python3 scripts/csv_to_json.py` and ensure `data/*.json` are in the output directory (or commit the JSON and skip the build step).

## License

Part of the DH project “Lost Mosques of Belgrade. Reconstruction.”
