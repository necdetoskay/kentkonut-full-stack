console.log('🔄 Veri geri yükleme testi başlatılıyor...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testRestore() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // Mevcut yedekleme dosyalarını listele
    const backupsDir = path.join(__dirname, 'backups');
    console.log(`📁 Backup dizini: ${backupsDir}`);
    
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir, { withFileTypes: true });
      console.log('\n📋 Mevcut yedekleme dosyaları:');
      
      files.forEach(file => {
        if (file.isDirectory()) {
          const dirPath = path.join(backupsDir, file.name);
          const jsonFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
          jsonFiles.forEach(jsonFile => {
            console.log(`   📄 ${file.name}/${jsonFile}`);
          });
        } else if (file.name.endsWith('.json')) {
          console.log(`   📄 ${file.name}`);
        }
      });
    }
    
    // En son yedekleme dosyasını bul
    const latestBackup = 'current-data-backup-2025-09-25T05-35-23-529Z.json';
    const backupPath = path.join(backupsDir, 'current-data-2025-09-25T05-35-23-529Z', latestBackup);
    
    if (fs.existsSync(backupPath)) {
      console.log(`\n📥 Yedekleme dosyası bulundu: ${latestBackup}`);
      
      // Yedekleme dosyasını oku
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      console.log(`📊 Yedekleme bilgileri:`);
      console.log(`   📅 Tarih: ${backupData.metadata.timestamp}`);
      console.log(`   📋 Toplam Kayıt: ${backupData.metadata.totalRecords}`);
      console.log(`   📊 İşlenen Tablo: ${backupData.metadata.tablesProcessed}`);
      
      // Tablo detayları
      console.log(`\n📊 Tablo Detayları:`);
      Object.keys(backupData.tables).forEach(table => {
        const count = backupData.tables[table].length;
        if (count > 0) {
          console.log(`   ✅ ${table}: ${count} kayıt`);
        }
      });
      
      console.log('\n🚀 Geri yükleme için komut:');
      console.log(`   node restore-seed.js ${latestBackup}`);
      
    } else {
      console.log('❌ Yedekleme dosyası bulunamadı');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRestore();
