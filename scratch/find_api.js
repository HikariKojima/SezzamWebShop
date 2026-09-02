import https from 'node:https';

https.get('https://h5.clewm.net/assets/js/index.js?v=1787714625752', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const matches = data.match(/https?:\/\/[^"'\s)]+|api\/[^"'\s)]+/g);
    console.log(matches ? matches.slice(0, 30) : 'None');
  });
});
