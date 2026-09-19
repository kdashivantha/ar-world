# ArWorld

Angular PWA: point your phone camera at a **printed world map** and see 3D landmarks (Eiffel Tower, Pisa, Statue of Liberty) placed by geography.

**Live (after Pages is enabled):** https://kdashivantha.github.io/ar-world/

## Stack

- Angular 21 + PWA (service worker)
- MindAR image tracking + Three.js
- GeoJSON landmarks + equirectangular projection
- GitHub Pages deploy

## Quick start

```bash
npm install --ignore-scripts
npm start
```

Open http://localhost:4200/ → **Open AR**. Use hash routes: `/#/ar`.

`mind-ar` is installed with `--ignore-scripts` on Windows so the optional native `canvas` dependency is skipped (browser AR does not need it).

### Optional asset tooling

```bash
npm run generate:models   # procedural GLBs in public/models
npm run compile:mind      # world-map.png → world-map.mind (needs Puppeteer/Chrome)
```

## Print & test

1. Print [`public/ar/world-map.png`](public/ar/world-map.png) at A3/A4 (exact crop).
2. If `world-map.mind` is missing, run `npm run compile:mind`, or the app falls back to MindAR’s sample [`card.png`](public/ar/card.png) / [`card.mind`](public/ar/card.mind).
3. On a phone, use **HTTPS** (GitHub Pages URL). Allow camera → Start.

## Sketchfab models

Demo ships small procedural GLBs. Replace files under `public/models/` with downloadable [Sketchfab](https://sketchfab.com/) GLBs and update attribution in [`public/landmarks.geojson`](public/landmarks.geojson).

## Map image credit

Printable map is derived from Wikimedia Commons
[Equirectangular projection](https://commons.wikimedia.org/wiki/File:Equirectangular_projection_SW.jpg) (public domain / free reuse — verify license on Commons for your use).

## Deploy

Push to `master`/`main`. Enable **Settings → Pages → Source: GitHub Actions**.

Repo: https://github.com/kdashivantha/ar-world.git
