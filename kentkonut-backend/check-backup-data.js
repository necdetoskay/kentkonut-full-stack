const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('📊 Yedekleme dosyasındaki tablolar:');
Object.keys(data.tables).forEach(table => {
  const count = data.tables[table].length;
  if(count > 0) {
    console.log(`   ${table}: ${count} kayıt`);
  }
});

console.log('\n🔍 Önemli tablolar detayı:');
console.log(`   📰 news: ${data.tables.news?.length || 0} kayıt`);
console.log(`   🏢 project: ${data.tables.project?.length || 0} kayıt`);
console.log(`   🏗️ hafriyatBolge: ${data.tables.hafriyatBolge?.length || 0} kayıt`);
console.log(`   ⛏️ hafriyatSaha: ${data.tables.hafriyatSaha?.length || 0} kayıt`);
console.log(`   📁 hafriyatBelgeKategori: ${data.tables.hafriyatBelgeKategori?.length || 0} kayıt`);
console.log(`   📄 hafriyatBelge: ${data.tables.hafriyatBelge?.length || 0} kayıt`);

// News tablosundaki ilk kaydı kontrol et
if (data.tables.news && data.tables.news.length > 0) {
  console.log('\n📰 İlk haber kaydı:');
  console.log(JSON.stringify(data.tables.news[0], null, 2));
}

// Project tablosundaki ilk kaydı kontrol et
if (data.tables.project && data.tables.project.length > 0) {
  console.log('\n🏢 İlk proje kaydı:');
  console.log(JSON.stringify(data.tables.project[0], null, 2));
}
