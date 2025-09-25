const fs = require('fs');

// Yedekleme dosyasını oku
const data = JSON.parse(fs.readFileSync('backups/current-data-2025-09-25T05-35-23-529Z/current-data-backup-2025-09-25T05-35-23-529Z.json', 'utf8'));

console.log('📰 News tablosundaki categoryId değerleri:');
data.tables.news.forEach((news, i) => {
  console.log(`${i+1}. ${news.title} - categoryId: ${news.categoryId}`);
});

console.log('\n📂 NewsCategory tablosundaki ID değerleri:');
data.tables.newsCategory.forEach((category, i) => {
  console.log(`${i+1}. ${category.name} - ID: ${category.id || 'YOK'}`);
});

console.log('\n🏢 Project tablosundaki authorId değerleri:');
data.tables.project.forEach((project, i) => {
  console.log(`${i+1}. ${project.title} - authorId: ${project.authorId}`);
});

console.log('\n👤 User tablosundaki ID değerleri:');
data.tables.user.forEach((user, i) => {
  console.log(`${i+1}. ${user.name} - ID: ${user.id || 'YOK'}`);
});
