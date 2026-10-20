import fs from 'node:fs/promises';
import sharp from 'sharp';

const width = 1200;
const height = 630;

const covers = [
  { id: 'baldurs-gate-3', left: 726, top: 226, width: 186, height: 279 },
  { id: 'planescape-torment-enhanced-edition', left: 850, top: 190, width: 204, height: 306 },
  { id: 'disco-elysium-the-final-cut', left: 990, top: 226, width: 186, height: 279 },
];

const frameOverlay = covers.map((cover) => `
  <rect x="${cover.left - 1}" y="${cover.top - 1}" width="${cover.width + 2}" height="${cover.height + 2}" fill="none" stroke="#d3b274" stroke-opacity="0.6"/>
`).join('');

const background = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="78%" cy="32%" r="62%">
      <stop offset="0" stop-color="#b4894b" stop-opacity="0.3"/>
      <stop offset="0.48" stop-color="#6a4f2b" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#12110e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="leftShade" cx="20%" cy="70%" r="70%">
      <stop offset="0" stop-color="#1d1913" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#12110e" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="#12110e"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="url(#leftShade)"/>
  <circle cx="946" cy="279" r="268" fill="none" stroke="#c9a96a" stroke-opacity="0.09"/>
  <circle cx="946" cy="279" r="382" fill="none" stroke="#c9a96a" stroke-opacity="0.055"/>
  <circle cx="946" cy="279" r="494" fill="none" stroke="#c9a96a" stroke-opacity="0.035"/>
  <g filter="url(#soft)" fill="#000" opacity="0.72">
    ${covers.map((cover) => `<rect x="${cover.left + 8}" y="${cover.top + 16}" width="${cover.width}" height="${cover.height}"/>`).join('')}
  </g>
  <rect x="34.5" y="34.5" width="1131" height="561" fill="none" stroke="#c9a96a" stroke-opacity="0.32"/>
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.6"/>
</svg>`;

const text = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="M72 108h64" stroke="#c9a96a" stroke-width="1"/>
  <text x="72" y="143" fill="#c9a96a" font-family="Lato" font-size="12" letter-spacing="3.1">THE CRPG CODEX · A FIELD GUIDE</text>
  <text x="68" y="270" fill="#ece4d2" font-family="Baskerville" font-size="74" letter-spacing="-1.5">So many worlds,</text>
  <text x="68" y="344" fill="#c9a96a" font-family="Baskerville" font-size="74" font-style="italic" letter-spacing="-1.5">so little time.</text>
  <text x="72" y="408" fill="#b3a996" font-family="Lato" font-size="19" letter-spacing="0.2">A cover-led catalogue of 154 computer</text>
  <text x="72" y="435" fill="#b3a996" font-family="Lato" font-size="19" letter-spacing="0.2">role-playing games, 1985—2026.</text>
  <path d="M72 492h92" stroke="#6f5731" stroke-width="1"/>
  <text x="72" y="525" fill="#8f8576" font-family="Lato" font-size="11" letter-spacing="2.5">NO ACCOUNTS · NO SCORES · NO BACKLOG GUILT</text>
  <text x="72" y="574" fill="#6e6558" font-family="Lato" font-size="10" letter-spacing="2.2">154 GAMES · 17 PLATFORMS · 7 FAMILIES</text>
  ${frameOverlay}
</svg>`;

const coverInputs = await Promise.all(covers.map(async (cover) => ({
  input: await sharp(`assets/covers/${cover.id}.jpg`)
    .resize(cover.width, cover.height, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toBuffer(),
  left: cover.left,
  top: cover.top,
})));

await sharp(Buffer.from(background))
  .composite([
    ...coverInputs,
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile('assets/og.jpg');

const stat = await fs.stat('assets/og.jpg');
console.log(`Wrote assets/og.jpg (${Math.round(stat.size / 1024)} KB)`);
