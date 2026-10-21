import sharp from 'sharp';

// Builds the Complete Saga cover from four full-bleed Avernum covers.
const tiles = [
  'avernum-escape-from-the-pit',
  'avernum-2-crystal-souls',
  'avernum-3-ruined-world',
  'avernum-6',
];

const composites = [];
for (let index = 0; index < tiles.length; index += 1) {
  const image = await sharp(`assets/covers/${tiles[index]}.jpg`)
    .resize(300, 450, { fit: 'cover' })
    .toBuffer();
  composites.push({
    input: image,
    left: (index % 2) * 300,
    top: Math.floor(index / 2) * 450,
  });
}

await sharp({
  create: { width: 600, height: 900, channels: 3, background: '#111' },
})
  .composite(composites)
  .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile('assets/covers/avernum-the-complete-saga-1-6.jpg');

console.log('assets/covers/avernum-the-complete-saga-1-6.jpg');
