const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('📑 Menu tablosundaki kayıtlar:');
console.log('Toplam menu kayıt sayısı:', data.tables.menuItem?.length || 0);

if (data.tables.menuItem && data.tables.menuItem.length > 0) {
  data.tables.menuItem.forEach((menu, i) => {
    console.log(`${i+1}. ${menu.title} - parentId: ${menu.parentId}`);
  });
} else {
  console.log('❌ Menu kayıtları bulunamadı!');
}

console.log('\n🔍 Menu tablosu detayları:');
if (data.tables.menuItem && data.tables.menuItem.length > 0) {
  console.log('İlk menu kaydı:');
  console.log(JSON.stringify(data.tables.menuItem[0], null, 2));
}
