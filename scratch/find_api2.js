import https from 'node:https';

https.get('https://h5.clewm.net/js/index.3794578c.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const apis = data.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
    console.log('APIS found:', Array.from(new Set(apis || [])).slice(0, 30));
  });
});
