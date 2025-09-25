const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('📁 Media tablosundaki categoryId değerleri:');
data.tables.media.forEach((media, i) => {
  console.log(`${i+1}. ${media.filename} - categoryId: ${media.categoryId}`);
});

console.log('\n📂 MediaCategory tablosundaki ID değerleri:');
data.tables.mediaCategory.forEach((category, i) => {
  console.log(`${i+1}. ${category.name} - ID: ${category.id || 'YOK'}`);
});
