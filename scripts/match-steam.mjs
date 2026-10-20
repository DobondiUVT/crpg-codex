import fs from 'node:fs/promises';

const games = JSON.parse(await fs.readFile('scripts/games-source.json', 'utf8'));

const stop = new Set([
  'the', 'a', 'an', 'of', 'and', 'for', 'in', 'to', 'on', 'with', 'at', 'by',
  'edition', 'enhanced', 'definitive', 'ultimate', 'director', 'directors', 'cut',
  'remastered', 'classic', 'complete', 'collection', 'saga', 'pack', 'game',
  'year', 'goty', 're', 'release', 'series', 'special', 'limited',
]);

const normalize = (value) => value
  .replace(/[®™]/g, '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const tokens = (value) => normalize(value).split(/\s+/).filter((token) => token && !stop.has(token));

const badName = (name) => /(soundtrack|demo|dlc|toolkit|artbook|art book|season pass|upgrade|supporter|bonus content|digital deluxe|expansion pass)/i.test(name);

function score(query, candidate) {
  const q = new Set(tokens(query));
  const c = new Set(tokens(candidate));
  if (!q.size || !c.size) return 0;
  let intersection = 0;
  for (const token of q) if (c.has(token)) intersection += 1;
  const jaccard = intersection / (q.size + c.size - intersection);
  const qn = normalize(query);
  const cn = normalize(candidate);
  let bonus = 0;
  if (qn === cn) bonus = 1.5;
  else if (cn.startsWith(qn) || qn.startsWith(cn)) bonus = 0.6;
  else if (cn.includes(qn) || qn.includes(cn)) bonus = 0.25;
  const first = normalize(candidate).split(' ')[0];
  if (q.has(first)) bonus += 0.15;
  return jaccard + bonus;
}

async function search(term) {
  const url = 'https://store.steampowered.com/api/storesearch/?term=' + encodeURIComponent(term) + '&l=english&cc=US';
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (CRPG Codex personal catalogue)' } });
  if (!response.ok) throw new Error('Steam ' + response.status);
  const json = await response.json();
  return Array.isArray(json.items) ? json.items : [];
}

const results = [];

for (const [index, game] of games.entries()) {
  const queries = [game.title];
  const base = game.title.split(/\s+[—–]\s+/)[0];
  const noParens = game.title.replace(/\s*\([^)]*\)/g, '');
  const noEdition = noParens
    .replace(/\s*[—–-]\s*(Enhanced|Definitive|Ultimate|Director'?s Cut|Director'?s Cut Edition|Game of the Year Edition|Re-Release|Classic|Gold Edition|Special Edition).*$/i, '')
    .replace(/\s*(Enhanced|Definitive|Ultimate|Game of the Year) Edition$/i, '')
    .replace(/\s*[—–]\s*.*$/, '');
  if (!queries.includes(base)) queries.push(base);
  if (!queries.includes(noParens)) queries.push(noParens);
  if (!queries.includes(noEdition)) queries.push(noEdition);

  let best = null;
  const seen = new Set();
  for (const query of queries) {
    let items = [];
    try {
      items = await search(query);
    } catch (error) {
      results.push({ id: game.id, title: game.title, error: error.message });
      break;
    }
    const candidates = items
      .filter((item) => item.type === 'app' && !badName(item.name))
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .map((item) => ({ ...item, score: score(game.title, item.name) }))
      .sort((a, b) => b.score - a.score);
    if (candidates.length && (!best || candidates[0].score > best.score)) best = candidates[0];
    if (best && best.score >= 1.5) break;
    await new Promise((resolve) => setTimeout(resolve, 240));
  }

  const row = {
    id: game.id,
    title: game.title,
    query: queries[queries.length - 1],
    match: best ? { appid: best.id, name: best.name, score: Number(best.score.toFixed(3)) } : null,
    candidates: (best ? [best] : []).map(({ id, name, score }) => ({ appid: id, name, score: Number(score.toFixed(3)) })),
  };
  results.push(row);
  console.log(String(index + 1).padStart(3, '0'), game.title, '=>', best ? best.name + ' [' + best.id + '] ' + best.score.toFixed(2) : 'NO MATCH');
  await new Promise((resolve) => setTimeout(resolve, 300));
}

await fs.writeFile('scripts/steam-matches.json', JSON.stringify(results, null, 2));
console.log('\nWrote', results.length, 'rows. Missing:', results.filter((row) => !row.match).length);
