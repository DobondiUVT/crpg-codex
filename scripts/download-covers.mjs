import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
global.window = global;
require('../data/games.js');

const games = window.CRPG_GAMES;
const matches = JSON.parse(await fs.readFile(new URL('./steam-matches.json', import.meta.url), 'utf8'));

const steamOverrides = {
  'atom-rpg': 552620,
  fallout: 38400,
  'colony-ship-a-post-earth-roleplaying-game': 648410,
  'avernum-the-complete-saga-1-6': 208400,
  'geneforge-saga': 1424710,
  'the-temple-of-elemental-evil-re-release': 3843520,
  'neverwinter-nights-2-enhanced-edition': 2738630,
};

// Full-bleed 2:3 covers for entries whose store asset is a landscape header
// or a near-square box scan. Sourced from SteamGridDB.
const directCovers = {
  'arcanum-of-steamworks-and-magick-obscura': 'https://cdn2.steamgriddb.com/grid/380c64c40baeb6ad28db5eef95b6dc0a.png',
  'betrayal-collection': 'https://cdn2.steamgriddb.com/grid/d8c4b9a46ef46a0b3dae8a1e1279a8d8.png',
  drakensang: 'https://cdn2.steamgriddb.com/grid/888f3acf10e90e8b16022e86afbab83c.png',
  'drakensang-the-river-of-time': 'https://cdn2.steamgriddb.com/grid/9508e33866145631ca76768f61282f2c.png',
  'eschalon-book-ii': 'https://cdn2.steamgriddb.com/grid/03e98208aa19e1e298d759f230c0f863.png',
  'eschalon-book-iii': 'https://cdn2.steamgriddb.com/grid/5cb98d6b292a324f482604bcc614fd35.png',
  'icewind-dale-ii': 'https://cdn2.steamgriddb.com/grid/5486bc1e779e65b2253cec15c40ee322.png',
  'lands-of-lore-1-2': 'https://cdn2.steamgriddb.com/grid/3c42783f8fc4cb336aa9f56868d32e15.png',
  'legend-of-grimrock': 'https://cdn2.steamgriddb.com/grid/67a00e4d31786c71df7d83c4eba5b3cf.png',
  'legend-of-grimrock-2': 'https://cdn2.steamgriddb.com/grid/2488294e5b8aa832810695a56cbeacdf.png',
  'might-and-magic-6-pack-limited-edition': 'https://cdn2.steamgriddb.com/grid/13554372e84991a63871e8b520b1fb21.png',
  'might-and-magic-vii-for-blood-and-honor': 'https://cdn2.steamgriddb.com/grid/b581b628e985efa530ea56811d764624.png',
  'might-and-magic-viii-day-of-the-destroyer': 'https://cdn2.steamgriddb.com/grid/98343d8881de4b59e74c26a83b5d1691.png',
  'might-and-magic-x-legacy': 'https://cdn2.steamgriddb.com/grid/82ccbdd3f53800fe4077971695692dc1.jpg',
  'avernum-4-greed-and-glory': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3882020/fc96b53f7d7b083ccdd044ee4bc6f8d2314f2cda/library_600x900_2x.jpg',
  'legends-of-amberland-iii-the-crimson-tower': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3823520/b095cf2962d0d96591a571b4e2f79562dd7a38e8/library_600x900_2x.jpg',
  'the-temple-of-elemental-evil-re-release': 'https://images.gog-statics.com/734f8a229be127060b0fdf1227068f57f7b094d538b3abcfd8cc1582c6691c40.png',
  'geneforge-saga': 'https://cdn.cloudflare.steamstatic.com/steam/apps/200960/library_600x900_2x.jpg',
};

const wikiCovers = {
  'icewind-dale-ii': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Icewind_dale_II_box_shot_211.jpg',
  'lands-of-lore-1-2': 'https://upload.wikimedia.org/wikipedia/en/c/c8/Lands_of_Lore_-_The_Throne_of_Chaos.PNG',
  'might-and-magic-6-pack-limited-edition': 'https://upload.wikimedia.org/wikipedia/en/f/f0/MightAndMagic6Box.jpg',
  'might-and-magic-vii-for-blood-and-honor': 'https://upload.wikimedia.org/wikipedia/en/0/0b/MightAndMagic7Box.jpg',
  'might-and-magic-viii-day-of-the-destroyer': 'https://upload.wikimedia.org/wikipedia/en/d/db/Might_and_Magic_VIII_-_Day_of_the_Destroyer_Coverart.png',
  'might-and-magic-ix': 'https://upload.wikimedia.org/wikipedia/en/f/f2/Might_and_Magic_IX_box.jpg',
  'ultima-1-2-3': 'https://upload.wikimedia.org/wikipedia/en/6/64/Ultima_1_box.jpg',
  'ultima-iv-quest-of-the-avatar': 'https://upload.wikimedia.org/wikipedia/en/f/ff/Ultima_IV_box.jpg',
  'ultima-4-5-6': 'https://upload.wikimedia.org/wikipedia/en/8/89/Ultima5box.jpg',
  'ultima-vii-the-complete-edition': 'https://upload.wikimedia.org/wikipedia/en/b/b3/Ultima_VII_Black_Gate_box.jpg',
  'ultima-underworld-1-2': 'https://upload.wikimedia.org/wikipedia/en/d/dd/Ultima_Underworld_cover.png',
  'neverwinter-nights-2': 'https://upload.wikimedia.org/wikipedia/en/1/1b/Neverwinter_Nights_2_box_art.jpg',
  'the-temple-of-elemental-evil': 'https://upload.wikimedia.org/wikipedia/en/1/1a/The_Temple_of_Elemental_Evil_Coverart.png',
};

const generatedCovers = new Set([
  'avernum-the-complete-saga-1-6',
]);

const coverDir = new URL('../assets/covers/', import.meta.url);
const rawDir = new URL('./raw/', import.meta.url);
await fs.mkdir(coverDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchBuffer(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'CRPGCodex/1.0 (personal non-commercial catalogue)',
          accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1500) throw new Error('File too small');
      return buffer;
    } catch (error) {
      lastError = error;
      await sleep(500 * attempt);
    }
  }
  throw lastError;
}

const steamUrls = (appid) => [
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`,
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_616x353.jpg`,
];

async function getRawSource(game) {
  if (directCovers[game.id]) {
    return {
      type: 'gog',
      url: directCovers[game.id],
      buffer: await fetchBuffer(directCovers[game.id]),
    };
  }

  if (wikiCovers[game.id]) {
    return {
      type: 'wikipedia',
      url: wikiCovers[game.id],
      buffer: await fetchBuffer(wikiCovers[game.id]),
    };
  }

  const row = matches.find((entry) => entry.id === game.id);
  const appid = steamOverrides[game.id] || row?.match?.appid;
  if (!appid) throw new Error('No source');

  let lastError;
  for (const url of steamUrls(appid)) {
    try {
      const buffer = await fetchBuffer(url, 1);
      return { type: 'steam', url, appid, buffer };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function processCover(buffer, game) {
  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width || 600;
  const height = metadata.height || 900;
  const ratio = width / height;

  const output = path.join(coverDir.pathname, `${game.id}.jpg`);

  if (ratio < 0.8) {
    await image
      .resize(600, 900, { fit: 'cover', position: 'top', kernel: 'lanczos3' })
      .sharpen({ sigma: 0.35 })
      .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(output);
    return { width, height, layout: 'cover' };
  }

  const background = await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(600, 900, { fit: 'cover', position: 'attention', kernel: 'lanczos3' })
    .blur(34)
    .modulate({ brightness: 0.48, saturation: 1.15 })
    .toBuffer();

  const foreground = await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(548, 824, { fit: 'inside', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.45 })
    .toBuffer();

  const foregroundMeta = await sharp(foreground).metadata();
  const left = Math.round((600 - (foregroundMeta.width || 548)) / 2);
  const top = Math.round((900 - (foregroundMeta.height || 824)) / 2);

  await sharp(background)
    .composite([
      { input: foreground, left, top },
      {
        input: Buffer.from(
          '<svg width="600" height="900" xmlns="http://www.w3.org/2000/svg">' +
            '<rect width="600" height="900" fill="none"/>' +
            `<rect x="${left - 1}" y="${top - 1}" width="${(foregroundMeta.width || 548) + 2}" height="${(foregroundMeta.height || 824) + 2}" fill="none" stroke="#d8b879" stroke-opacity=".35" stroke-width="2"/>` +
          '</svg>'
        ),
        left: 0,
        top: 0,
      },
    ])
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(output);

  return { width, height, layout: 'framed' };
}

let cursor = 0;
const results = [];
const workerCount = 2;
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;

async function worker() {
  while (cursor < games.length) {
    const index = cursor;
    cursor += 1;
    const game = games[index];
    if (only && !only.has(game.id)) continue;
    if (generatedCovers.has(game.id)) {
      results.push({ id: game.id, title: game.title, layout: 'generated' });
      console.log(String(index + 1).padStart(3, '0'), game.title, '→ generated mosaic');
      continue;
    }
    try {
      const source = await getRawSource(game);
      await fs.writeFile(path.join(rawDir.pathname, `${game.id}.source`), source.buffer);
      const info = await processCover(source.buffer, game);
      results.push({ id: game.id, title: game.title, ...(source.type === 'steam' ? { type: 'steam', appid: source.appid } : { type: source.type, url: source.url }), ...info });
      console.log(String(index + 1).padStart(3, '0'), game.title, '→', info.layout, `${info.width}x${info.height}`, source.type);
    } catch (error) {
      results.push({ id: game.id, title: game.title, error: error.message });
      console.error(String(index + 1).padStart(3, '0'), game.title, '→ ERROR', error.message);
    }
    await sleep(80);
  }
}

await Promise.all(Array.from({ length: workerCount }, () => worker()));
results.sort((a, b) => games.findIndex((game) => game.id === a.id) - games.findIndex((game) => game.id === b.id));
if (!only) await fs.writeFile(new URL('./cover-manifest.json', import.meta.url), JSON.stringify(results, null, 2));

const errors = results.filter((result) => result.error);
console.log(`\nProcessed ${results.length - errors.length}/${games.length} covers. Errors: ${errors.length}`);
if (errors.length) {
  for (const error of errors) console.log('MISSING', error.id, error.title, error.error);
  process.exitCode = 1;
}
