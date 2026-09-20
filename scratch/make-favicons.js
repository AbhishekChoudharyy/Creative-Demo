const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function makeFavicons() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="108" fill="#1E90FF"/>
  <g fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="118" cy="256" r="58" />
    <polygon points="256,188 322,320 190,320" />
    <rect x="336" y="194" width="122" height="122" rx="6" />
  </g>
</svg>`;

  fs.writeFileSync('public/favicon.svg', svg);
  console.log('Wrote public/favicon.svg');

  const svgBuf = Buffer.from(svg);

  // Generate PNG sizes
  await sharp(svgBuf).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(svgBuf).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(svgBuf).resize(48, 48).png().toFile('public/favicon-48x48.png');
  await sharp(svgBuf).resize(64, 64).png().toFile('public/favicon-64x64.png');
  await sharp(svgBuf).resize(128, 128).png().toFile('public/favicon-128x128.png');
  await sharp(svgBuf).resize(256, 256).png().toFile('public/favicon-256x256.png');
  console.log('Generated PNG sizes');

  // Build a true multi-resolution ICO file (16x16, 32x32, 48x48, 256x256)
  // ICO format stores PNG data directly for modern systems or BMP for older
  const icoSizes = [16, 32, 48, 256];
  const pngBuffers = await Promise.all(icoSizes.map(s => sharp(svgBuf).resize(s, s).png().toBuffer()));

  // ICO header: 6 bytes
  // ICONDIR: reserved (2 bytes: 0), type (2 bytes: 1 for icon), count (2 bytes: icoSizes.length)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoSizes.length, 4);

  // Directory entries: 16 bytes each
  const dirEntries = [];
  let currentOffset = 6 + icoSizes.length * 16;

  for (let i = 0; i < icoSizes.length; i++) {
    const s = icoSizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // image offset in file
    dirEntries.push(entry);
    currentOffset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  console.log('Created valid multi-resolution favicon.ico for public and src/app');
}

makeFavicons().catch(console.error);
