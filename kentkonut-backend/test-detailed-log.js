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

    // İlerleme çubuğu için
    const totalTables = allTables.length;
    let currentTable = 0;

    for (const tableName of allTables) {
      currentTable++;
      const progress = Math.round((currentTable / totalTables) * 100);
      
      try {
        console.log(`📊 [${progress}%] ${tableName} tablosu işleniyor...`);
        
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
          
          console.log(`✅ ${tableName}: ${cleanedData.length} kayıt işlendi (Toplam: ${totalRecords})`);
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

    console.log('\n🎉 Mevcut veri seed dönüşümü tamamlandı!');
    console.log(`📁 Backup Dizini: ${backupDir}`);
    console.log(`📊 JSON Backup: ${jsonFileName}`);
    console.log(`📋 Toplam Kayıt: ${totalRecords}`);
    console.log(`📊 İşlenen Tablo: ${tablesProcessed}/${allTables.length}`);
    
    console.log('\n🚀 Kullanım:');
    console.log(`   JSON Backup: node restore-seed.js ${jsonFileName}`);

    // Detaylı tablo özeti
    console.log('\n📊 DETAYLI TABLO ÖZETİ:');
    console.log('=' .repeat(60));
    
    const tablesWithData = [];
    const emptyTables = [];
    
    allTables.forEach(table => {
      const count = seedData.tables[table]?.length || 0;
      if (count > 0) {
        tablesWithData.push({ table, count });
      } else {
        emptyTables.push(table);
      }
    });
    
    // Veri içeren tablolar
    console.log('\n✅ VERİ İÇEREN TABLOLAR:');
    tablesWithData
      .sort((a, b) => b.count - a.count) // Kayıt sayısına göre sırala
      .forEach(({ table, count }) => {
        const percentage = ((count / totalRecords) * 100).toFixed(1);
        console.log(`   📊 ${table.padEnd(25)}: ${count.toString().padStart(4)} kayıt (${percentage}%)`);
      });
    
    // Boş tablolar
    if (emptyTables.length > 0) {
      console.log('\n⏭️ BOŞ TABLOLAR:');
      emptyTables.forEach(table => {
        console.log(`   📊 ${table.padEnd(25)}: 0 kayıt`);
      });
    }
    
    // İstatistikler
    console.log('\n📈 İSTATİSTİKLER:');
    console.log('=' .repeat(60));
    console.log(`   📊 Toplam Tablo Sayısı    : ${allTables.length}`);
    console.log(`   ✅ Veri İçeren Tablo       : ${tablesWithData.length}`);
    console.log(`   ⏭️ Boş Tablo               : ${emptyTables.length}`);
    console.log(`   📋 Toplam Kayıt Sayısı    : ${totalRecords}`);
    console.log(`   📊 Ortalama Kayıt/Tablo   : ${Math.round(totalRecords / tablesWithData.length)}`);
    console.log(`   📁 Dosya Boyutu (tahmini) : ${Math.round((JSON.stringify(seedData).length / 1024 / 1024) * 100) / 100} MB`);
    
    // En büyük tablolar
    if (tablesWithData.length > 0) {
      console.log('\n🏆 EN BÜYÜK TABLOLAR:');
      tablesWithData
        .slice(0, 5)
        .forEach(({ table, count }, index) => {
          const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
          console.log(`   ${medal} ${table}: ${count} kayıt`);
        });
    }
    
    console.log('\n' + '=' .repeat(60));

    return {
      backupDir,
      jsonFile: jsonFileName,
      totalRecords,
      tablesProcessed,
      allTables: allTables.length
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
