console.log('🔄 Mevcut uygulama verilerini seed formatına çeviriliyor...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function convertCurrentDataToSeed() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // Yedekleme dizinini oluştur
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups', `current-data-${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`📁 Backup dizini oluşturuldu: ${backupDir}`);

    // Seed dosyası için veri yapısı
    const seedData = {
      metadata: {
        timestamp: new Date().toISOString(),
        description: 'Mevcut uygulama verilerinden oluşturulan seed',
        version: '1.0',
        totalRecords: 0
      },
      tables: {}
    };

    // Test için sadece birkaç tablo
    const testTables = ['user', 'project', 'news', 'tag'];

    let totalRecords = 0;

    for (const tableName of testTables) {
      try {
        console.log(`📊 ${tableName} tablosu işleniyor...`);
        
        const data = await prisma[tableName].findMany({
          orderBy: { id: 'asc' }
        });

        if (data.length > 0) {
          // ID'leri temizle
          const cleanedData = data.map(record => {
            const cleaned = { ...record };
            delete cleaned.id;
            delete cleaned.createdAt;
            delete cleaned.updatedAt;
            return cleaned;
          });

          seedData.tables[tableName] = cleanedData;
          totalRecords += cleanedData.length;
          
          console.log(`✅ ${tableName}: ${cleanedData.length} kayıt işlendi`);
        } else {
          seedData.tables[tableName] = [];
          console.log(`⏭️ ${tableName}: Boş tablo`);
        }
      } catch (error) {
        console.log(`⚠️ ${tableName}: Hata - ${error.message}`);
        seedData.tables[tableName] = [];
      }
    }

    seedData.metadata.totalRecords = totalRecords;

    // JSON backup oluştur
    const jsonFileName = `current-data-backup-${timestamp}.json`;
    const jsonFilePath = path.join(backupDir, jsonFileName);
    
    fs.writeFileSync(jsonFilePath, JSON.stringify(seedData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    console.log('\n🎉 Mevcut veri seed dönüşümü tamamlandı!');
    console.log(`📁 Backup Dizini: ${backupDir}`);
    console.log(`📊 JSON Backup: ${jsonFileName}`);
    console.log(`📋 Toplam Kayıt: ${totalRecords}`);
    
    console.log('\n🚀 Kullanım:');
    console.log(`   JSON Backup: node restore-seed.js ${jsonFileName}`);

    return {
      backupDir,
      jsonFile: jsonFileName,
      totalRecords
    };

  } catch (error) {
    console.error('❌ Mevcut veri dönüşümü başarısız:', error);
    throw error;
  }
}

// Çalıştır
convertCurrentDataToSeed()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
