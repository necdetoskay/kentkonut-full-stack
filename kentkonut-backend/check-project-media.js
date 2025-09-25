const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('🏢 Project tablosundaki mediaId değerleri:');
data.tables.project.forEach((project, i) => {
  console.log(`${i+1}. ${project.title} - mediaId: ${project.mediaId}`);
});

console.log('\n📁 Media tablosundaki ID değerleri:');
data.tables.media.forEach((media, i) => {
  console.log(`${i+1}. ${media.filename} - ID: ${media.id || 'YOK'}`);
});
