const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('📊 TÜM TABLOLAR VE KAYIT SAYILARI:');
console.log('=' .repeat(50));

let totalRecords = 0;
Object.keys(data.tables).forEach(table => {
  const count = data.tables[table].length;
  totalRecords += count;
  console.log(`${table.padEnd(25)}: ${count.toString().padStart(3)} kayıt`);
});

console.log('=' .repeat(50));
console.log(`TOPLAM KAYIT SAYISI: ${totalRecords}`);

console.log('\n🔍 EKSİK TABLOLAR:');
const missingTables = [
  'account', 'session', 'verificationToken', 'pageCategory', 'pageSeoMetrics',
  'newsTag', 'newsRelation', 'projectTag', 'hafriyatBelge', 'menuPermission',
  'serviceCard', 'corporateContent', 'personnelGallery', 'newsGallery',
  'newsGalleryItem', 'applicationLog'
];

missingTables.forEach(table => {
  const count = data.tables[table]?.length || 0;
  console.log(`${table.padEnd(25)}: ${count.toString().padStart(3)} kayıt`);
});

console.log('\n📊 MEVCUT VERİTABANI DURUMU:');
console.log('Bu bilgiyi almak için: node -e "require(\'./prisma/consolidated-seed\').getDatabaseStatus().then(console.log)"');
