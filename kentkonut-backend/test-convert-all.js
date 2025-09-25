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

    // Tüm tabloları tanımla
    const allTables = [
      'user', 'account', 'session', 'verificationToken',
      'mediaCategory', 'media', 'pageCategory', 'page', 'pageSeoMetrics',
      'department', 'executive', 'personnel', 'tag', 'newsCategory', 'news',
      'newsTag', 'newsRelation', 'project', 'projectTag', 'projectRelation',
      'projectGallery', 'projectGalleryMedia', 'hafriyatBolge', 'hafriyatSaha',
      'hafriyatBelgeKategori', 'hafriyatBelge', 'comment', 'quickAccessLink',
      'menuItem', 'menuPermission', 'serviceCard', 'corporateContent',
      'highlight', 'banner', 'personnelGallery', 'newsGallery', 'newsGalleryItem',
      'applicationLog'
    ];

    const seedData = {
      metadata: {
        timestamp: new Date().toISOString(),
        description: 'Mevcut uygulama verilerinden oluşturulan seed (Tüm Tablolar)',
        version: '2.0',
        totalRecords: 0,
        tablesProcessed: 0
      },
      tables: {}
    };

    let totalRecords = 0;
    let tablesProcessed = 0;

    // İlk 10 tabloyu test et
    const testTables = allTables.slice(0, 10);

    for (const tableName of testTables) {
      try {
        console.log(`📊 ${tableName} tablosu işleniyor...`);
        
        const data = await prisma[tableName].findMany({
          orderBy: { id: 'asc' }
        });

        if (data.length > 0) {
          const cleanedData = data.map(record => {
            const cleaned = { ...record };
            delete cleaned.id;
            delete cleaned.createdAt;
            delete cleaned.updatedAt;
            delete cleaned.created_at;
            delete cleaned.updated_at;
            return cleaned;
          });

          seedData.tables[tableName] = cleanedData;
          totalRecords += cleanedData.length;
          tablesProcessed++;
          
          console.log(`✅ ${tableName}: ${cleanedData.length} kayıt işlendi`);
        } else {
          seedData.tables[tableName] = [];
          tablesProcessed++;
          console.log(`⏭️ ${tableName}: Boş tablo`);
        }
      } catch (error) {
        console.log(`⚠️ ${tableName}: Hata - ${error.message}`);
        seedData.tables[tableName] = [];
        tablesProcessed++;
      }
    }

    seedData.metadata.totalRecords = totalRecords;
    seedData.metadata.tablesProcessed = tablesProcessed;

    // JSON backup oluştur
    const jsonFileName = `current-data-backup-${timestamp}.json`;
    const jsonFilePath = path.join(backupDir, jsonFileName);
    
    fs.writeFileSync(jsonFilePath, JSON.stringify(seedData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    console.log('\n🎉 Test tamamlandı!');
    console.log(`📁 Backup Dizini: ${backupDir}`);
    console.log(`📊 JSON Backup: ${jsonFileName}`);
    console.log(`📋 Toplam Kayıt: ${totalRecords}`);
    console.log(`📊 İşlenen Tablo: ${tablesProcessed}/${testTables.length}`);

    return {
      backupDir,
      jsonFile: jsonFileName,
      totalRecords,
      tablesProcessed
    };

  } catch (error) {
    console.error('❌ Hata:', error);
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
