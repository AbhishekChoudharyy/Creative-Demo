const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://off-type.com/cdn/shop/files/OTBrut-Regular.woff2';
const dest = path.join(__dirname, '../public/fonts/OTBrut-Regular.woff2');

const file = fs.createWriteStream(dest);

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  if (res.statusCode === 200) {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(dest);
      console.log('Downloaded OTBrut-Regular.woff2 successfully! Size:', stats.size, 'bytes');
    });
  } else {
    console.error('Failed to download font. Status:', res.statusCode);
  }
}).on('error', (err) => {
  console.error('Error:', err);
});
