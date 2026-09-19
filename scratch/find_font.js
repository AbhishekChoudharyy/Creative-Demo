const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  const res = await get('https://off-type.com/products/brut');
  console.log('Status:', res.statusCode);
  const regex = /(https?:)?\/\/[^\s"'<>]+\.woff2?/gi;
  const matches = res.data.match(regex) || [];
  console.log('Matches:', [...new Set(matches)]);
}

run();
