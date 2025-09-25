const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('🔍 Footer ile ilgili tablolar:');

// Footer tablolarını kontrol et
const footerTables = [
  'footerColumn', 'footerLink', 'footerSection', 'footerItem',
  'siteSetting', 'contactInfo', 'feedback', 'feedbackAttachment'
];

footerTables.forEach(table => {
  const count = data.tables[table]?.length || 0;
  console.log(`📊 ${table}: ${count} kayıt`);
  
  if (count > 0 && data.tables[table]) {
    console.log(`   İlk kayıt:`, JSON.stringify(data.tables[table][0], null, 2));
  }
});

console.log('\n📋 Tüm tablolar:');
Object.keys(data.tables).forEach(table => {
  const count = data.tables[table].length;
  if (count > 0) {
    console.log(`${table}: ${count} kayıt`);
  }
});
