import fs from 'node:fs/promises';
import sharp from 'sharp';

const goldGradient = `
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0dcae"/>
    <stop offset="0.48" stop-color="#c9a96a"/>
    <stop offset="1" stop-color="#8a6936"/>
  </linearGradient>`;

const background = `
  <radialGradient id="bg" cx="50%" cy="34%" r="82%">
    <stop offset="0" stop-color="#262017"/>
    <stop offset="0.52" stop-color="#15130f"/>
    <stop offset="1" stop-color="#0a0907"/>
  </radialGradient>`;

function mark({ size, ring, star, core, halo, border = false }) {
  const scale = star / 18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>${background}${goldGradient}</defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="${halo}" fill="none" stroke="#c9a96a" stroke-opacity="0.09"/>
  <circle cx="256" cy="256" r="${ring}" fill="none" stroke="url(#gold)" stroke-opacity="0.62"/>
  <g transform="translate(256 256) scale(${scale.toFixed(4)}) translate(-32 -32)">
    <path d="M32 14c1.6 9.4 7.4 15.2 16.8 16.8C39.4 32.4 33.6 38.2 32 47.6c-1.6-9.4-7.4-15.2-16.8-16.8C24.6 29.2 30.4 23.4 32 14Z" fill="none" stroke="url(#gold)" stroke-width="${(6 / scale).toFixed(2)}" stroke-linejoin="round"/>
  </g>
  <circle cx="256" cy="256" r="${core}" fill="url(#gold)"/>
  ${border ? '<rect x="22" y="22" width="468" height="468" fill="none" stroke="#c9a96a" stroke-opacity="0.24" stroke-width="3"/>' : ''}
</svg>`;
}

const regular = (size) => mark({ size, ring: 178, star: 124, core: 15, halo: 214, border: true });
const maskable = (size) => mark({ size, ring: 148, star: 104, core: 13, halo: 182, border: false });

const targets = [
  ['assets/icons/icon-192.png', regular(192)],
  ['assets/icons/icon-512.png', regular(512)],
  ['assets/icons/icon-maskable-192.png', maskable(192)],
  ['assets/icons/icon-maskable-512.png', maskable(512)],
  ['assets/apple-touch-icon.png', regular(180)],
];

await fs.mkdir('assets/icons', { recursive: true });

for (const [path, svg] of targets) {
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(path);
  const stat = await fs.stat(path);
  console.log(`${path} (${Math.round(stat.size / 1024)} KB)`);
}
