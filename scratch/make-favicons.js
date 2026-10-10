const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function makeFavicons() {
  const srcImage = path.join(__dirname, '../public/apple-touch-icon.png');
  const srcBuf = fs.readFileSync(srcImage);

  // 1. Generate PNG sizes
  const sizes = [16, 32, 48, 64, 128, 256];
  for (const s of sizes) {
    await sharp(srcBuf).resize(s, s).png().toFile(`public/favicon-${s}x${s}.png`);
  }
  console.log('Generated PNG favicon sizes from apple-touch-icon.png');

  // 2. Build multi-resolution ICO file (16, 32, 48, 64, 128, 256)
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(icoSizes.map(s => sharp(srcBuf).resize(s, s).png().toBuffer()));

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoSizes.length, 4);

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
  fs.copyFileSync(srcImage, 'src/app/icon.png');
  console.log('Created valid multi-resolution favicon.ico for public and src/app');

  // 3. SVG with embedded apple-touch-icon data URI
  const b64 = srcBuf.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <image width="180" height="180" href="data:image/png;base64,${b64}"/>
</svg>`;
  fs.writeFileSync('public/favicon.svg', svg);
  console.log('Updated public/favicon.svg with apple-touch-icon base64');
}

makeFavicons().catch(console.error);
