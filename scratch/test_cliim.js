import https from 'node:https';
import fs from 'node:fs';

const coding = 'quVNRTf';
const candidates = [
  `https://nc.cliim.net/api/page/detail?coding=${coding}`,
  `https://biz.cliim.net/api/page/detail?coding=${coding}`,
  `https://nc.cliim.net/page/detail?coding=${coding}`,
  `https://biz.cliim.net/page/detail?coding=${coding}`,
  `https://nc.cliim.net/api/v1/page/detail?coding=${coding}`,
  `https://biz.cliim.net/api/v1/page/detail?coding=${coding}`,
  `https://nc.cliim.net/api/idcode/detail?coding=${coding}`,
  `https://biz.cliim.net/api/idcode/detail?coding=${coding}`
];

async function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ url, status: res.statusCode, json });
        } catch (e) {
          resolve({ url, status: res.statusCode, text: data.slice(0, 80) });
        }
      });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function run() {
  for (const c of candidates) {
    const res = await check(c);
    console.log(c, res.status, res.json ? 'JSON!' : res.text || res.error);
    if (res.json && res.json.status !== 404 && res.json.code !== 404) {
      fs.writeFileSync('scratch/supplier_products.json', JSON.stringify(res.json, null, 2));
      console.log('SUCCESS saved to scratch/supplier_products.json');
      return;
    }
  }
}

run();
