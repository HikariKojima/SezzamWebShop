import https from 'node:https';
import fs from 'node:fs';

const coding = 'quVNRTf';
const endpoints = [
  `https://h5.clewm.net/gateway/cli-api/page/detail?coding=${coding}`,
  `https://api.clewm.net/v2/page/detail?coding=${coding}`,
  `https://cli.im/api/qrcode/detail?coding=${coding}`,
  `https://h5.clewm.net/api/page/detail?coding=${coding}`,
  `https://qr61.cn/api/page/detail?coding=${coding}`
];

async function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ url, status: res.statusCode, json });
        } catch (e) {
          resolve({ url, status: res.statusCode, text: data.slice(0, 100) });
        }
      });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function main() {
  for (const ep of endpoints) {
    const res = await check(ep);
    console.log(ep, res.status, res.json ? 'JSON FOUND!' : 'No JSON');
    if (res.json) {
      fs.writeFileSync('scratch/supplier_data.json', JSON.stringify(res.json, null, 2));
      console.log('Saved to scratch/supplier_data.json');
      return;
    }
  }
}

main();
