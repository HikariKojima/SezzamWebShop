import https from 'node:https';

https.get('https://h5.clewm.net/js/chunk-common.1eb1754e.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const urls = data.match(/https?:\/\/[a-zA-Z0-9.\-_/]+/g);
    console.log('URLs:', Array.from(new Set(urls || [])).slice(0, 30));
  });
});
