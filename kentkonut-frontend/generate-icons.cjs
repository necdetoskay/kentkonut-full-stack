const sharp = require('sharp');

const input = 'public/logo.png';
const output192 = 'public/images/icons/icon-192x192.png';
const output512 = 'public/images/icons/icon-512x512.png';

sharp(input)
  .resize(192, 192)
  .toFile(output192, (err) => {
    if (err) console.error('192x192 ikon hatası:', err);
    else console.log('icon-192x192.png oluşturuldu');
  });

sharp(input)
  .resize(512, 512)
  .toFile(output512, (err) => {
    if (err) console.error('512x512 ikon hatası:', err);
    else console.log('icon-512x512.png oluşturuldu');
  }); 