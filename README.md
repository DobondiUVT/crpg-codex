# The CRPG Codex

A cover-led, static catalogue of 154 computer role-playing games from 1985 to 2026. Adapted from the [r/CRPG recommendations wiki](https://www.reddit.com/r/CRPG/wiki/recommendations).

There is no framework, build step, account system, or analytics. The site is plain HTML, CSS, and JavaScript, designed to be served directly from GitHub Pages.

## What is here

- **154 games**, each with local cover art at `assets/covers/<id>.jpg`
- **Platform filters** across 17 exact platforms, grouped into seven families
- **Search, era filters, sorting, and grid/list views**
- **Quality and popularity scores** for every game, sortable from the library toolbar
- **Direct store links** to Steam or GOG, with no affiliate parameters
- **Detail dialog deep links** such as `#game/baldurs-gate-3`
- **A daily featured cover** and a random shelf picker
- **Dark and light themes**, with the choice remembered locally
- **Installable PWA** with standalone display, offline app shell, Apple touch icon, and safe-area support for iPhone notches
- **No progress tracking, accounts, or third-party scripts**

The only browser storage keys are `crpg-codex-theme` and `crpg-codex-view`.

## Run it locally

From the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4173/>.

Any static file server will do. Opening `index.html` directly with `file://` may prevent some browser features from working normally, so a local server is recommended.

## Structure

```text
index.html            Page structure and copy
styles.css            Complete visual system, including responsive and light themes
app.js                Filtering, rendering, dialogs, charts, and interactions
sw.js                 Service worker: offline app shell and runtime cover caching
manifest.webmanifest  PWA manifest, install metadata, and icons
data/games.js         The 154 catalogue entries
data/stores.js        Direct Steam or GOG links for every entry
data/scores.js        Quality and popularity scores for every entry
assets/covers/        600 × 900 JPEG cover art
assets/icons/         PWA icons (regular and maskable)
assets/apple-touch-icon.png  iOS home-screen icon
assets/favicon.svg    Site icon
assets/og.jpg         1200 × 630 social preview image
assets/noise.svg      Grain texture
scripts/              Development-only cover sourcing and image generation helpers
```

Game data uses a compact line format:

```text
Title|Released|Platforms|Note
```

The loader normalises platform aliases, sorts them into a stable order, and derives the game ID from the title.

## Scores

Every entry has two 0–100 scores in `data/scores.js`:

- **Quality** blends Metacritic critic scores with Bayesian-adjusted Steam user reception. Entries with no critic aggregate use a confidence-weighted player score instead.
- **Popularity** is audience reach, derived from Steam review volume on a logarithmic scale. GOG-only entries use review-equivalent estimates based on comparable releases.

The scores are editorial reading aids, not objective rankings. They are shown on every card and in each detail panel, and can be sorted from the library toolbar.

## Store links

Every catalogue entry has a direct store URL in `data/stores.js`. Steam is used where a game has a Steam page; GOG is used for the 14 titles that live there instead. Links open in a new tab and carry no affiliate or tracking parameters.

Store availability can change over time. If a link moves, update the single entry in `data/stores.js`.

## Regenerating assets

The development helpers require Node.js and the `sharp` package:

```sh
npm install
node scripts/make-og.mjs
node scripts/make-icons.mjs
node scripts/make-avernum-saga.mjs
```

The cover sourcing pipeline is in `scripts/download-covers.mjs`. The Avernum Complete Saga cover is a generated mosaic and is skipped by the downloader. It is kept for reference and may depend on external storefront URLs that change. The committed covers are the source of truth for the site itself.

The social preview can also be regenerated with `node scripts/make-og.mjs`.

## Installing

The site is installable on HTTPS (including GitHub Pages).

- **iPhone / iPad:** open the site in Safari, tap **Share**, then **Add to Home Screen**.
- **Chrome / Edge:** use the install icon in the address bar, or the browser menu.

The service worker caches the app shell and covers as they are viewed, so previously visited parts of the shelf remain available offline. If you change the app shell, bump `CACHE_VERSION` in `sw.js` so installed copies refresh their cached files.

## Deployment

The site is designed for GitHub Pages from the repository root:

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Set the source to **Deploy from a branch**.
4. Choose the `main` branch and the `/ (root)` folder.
5. Save and wait for the published URL.

`.nojekyll` is included so GitHub Pages serves the files as-is.

## Credits

Catalogue adapted from the r/CRPG recommendations wiki. Cover art belongs to the respective publishers and developers and is shown for identification and appreciation. Some replacement full-bleed covers use community assets from SteamGridDB. No affiliation is implied. Store links are provided for convenience only.
