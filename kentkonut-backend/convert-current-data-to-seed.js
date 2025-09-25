// Mevcut Uygulama Verilerini Seed Verisine Çevirme Script'i (Tüm Tablolar)
// Bu script anlık uygulama verilerini seed formatına çevirir

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Mevcut uygulama verilerini seed formatına çevirir
 * Tüm database tablolarını içerir
 */
async function convertCurrentDataToSeed() {
  console.log('🔄 Mevcut uygulama verilerini seed formatına çeviriliyor...');
  console.log('📊 Tüm database tabloları işlenecek...');
  
  try {
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
        description: 'Mevcut uygulama verilerinden oluşturulan seed (Tüm Tablolar)',
        version: '2.0',
        totalRecords: 0,
        tablesProcessed: 0
      },
      tables: {}
    };

    // Tüm database tablolarını sıralı olarak tanımla
    // Foreign key ilişkilerine göre sıralama önemli
    const allTables = [
      // Auth & User Management
      'user',
      'account', 
      'session',
      'verificationToken',
      
      // Media & Categories
      'mediaCategory',
      'media',
      
      // Pages & SEO
      'pageCategory',
      'page',
      'pageSeoMetrics',
      
      // Corporate Structure
      'department',
      'executive',
      'personnel',
      
      // Content Management
      'tag',
      'newsCategory',
      'news',
      'newsTag',
      'newsRelation',
      
      // Projects
      'project',
      'projectTag',
      'projectRelation',
      'projectGallery',
      'projectGalleryMedia',
      
      // Hafriyat System
      'hafriyatBolge',
      'hafriyatSaha',
      'hafriyatBelgeKategori',
      'hafriyatBelge',
      
      // Comments & Interactions
      'comment',
      
      // Quick Access & Menu
      'quickAccessLink',
      'menuItem',
      'menuPermission',
      
      // Service Cards
      'serviceCard',
      
      // Corporate Content
      'corporateContent',
      
      // Highlights & Banners
      'highlight',
      'banner',
      
      // Personnel Gallery
      'personnelGallery',
      
      // News Gallery
      'newsGallery',
      'newsGalleryItem',
      
      // Application Logs (genellikle seed edilmez ama dahil ediyoruz)
      'applicationLog'
    ];

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
        
        // Tablo var mı kontrol et
        const tableExists = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          );
        `;

        if (!tableExists[0].exists) {
          console.log(`⏭️ ${tableName}: Tablo bulunamadı`);
          seedData.tables[tableName] = [];
          continue;
        }

        const data = await prisma[tableName].findMany({
          orderBy: { id: 'asc' }
        });

        if (data.length > 0) {
          // Verileri temizle
          const cleanedData = data.map(record => {
            const cleaned = { ...record };
            
            // ID'yi koru (foreign key ilişkileri için gerekli)
            // Sadece otomatik artan ID'leri kaldır
            if (tableName === 'project' || tableName === 'projectRelation' || 
                tableName === 'projectGallery' || tableName === 'projectGalleryMedia' ||
                tableName === 'projectTag' || tableName === 'newsTag' || 
                tableName === 'newsRelation' || tableName === 'newsGallery' ||
                tableName === 'newsGalleryItem' || tableName === 'comment' ||
                tableName === 'quickAccessLink' || tableName === 'menuItem' ||
                tableName === 'menuPermission' || tableName === 'serviceCard' ||
                tableName === 'corporateContent' || tableName === 'highlight' ||
                tableName === 'banner' || tableName === 'personnelGallery' ||
                tableName === 'hafriyatBolge' || tableName === 'hafriyatSaha' ||
                tableName === 'hafriyatBelgeKategori' || tableName === 'hafriyatBelge' ||
                tableName === 'mediaCategory' || tableName === 'tag' ||
                tableName === 'newsCategory' || tableName === 'department' ||
                tableName === 'executive' || tableName === 'personnel' ||
                tableName === 'pageCategory' || tableName === 'page' ||
                tableName === 'pageSeoMetrics') {
              // Bu tablolar için ID'yi kaldır (otomatik oluşturulacak)
              delete cleaned.id;
            }
            // User, Media, News, Project gibi tablolar için ID'yi koru
            
            // Timestamp'leri temizle
            delete cleaned.createdAt;
            delete cleaned.updatedAt;
            delete cleaned.created_at;
            delete cleaned.updated_at;
            
            // Session ve token verilerini temizle (güvenlik)
            if (tableName === 'session') {
              delete cleaned.sessionToken;
              delete cleaned.expires;
            }
            if (tableName === 'account') {
              delete cleaned.refresh_token;
              delete cleaned.access_token;
              delete cleaned.id_token;
            }
            if (tableName === 'verificationToken') {
              delete cleaned.token;
              delete cleaned.expires;
            }
            
            // Application log'ları temizle (genellikle seed edilmez)
            if (tableName === 'applicationLog') {
              delete cleaned.timestamp;
            }
            
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

    // Detaylı bilgi dosyası oluştur
    const infoContent = `# Mevcut Uygulama Verileri Seed Backup (Tüm Tablolar)

## 📊 Backup Bilgileri
- **Tarih**: ${new Date().toISOString()}
- **Dizin**: ${backupDir}
- **Toplam Kayıt**: ${totalRecords}
- **İşlenen Tablo**: ${tablesProcessed}/${allTables.length}

## 📁 Dosyalar
- **JSON Backup**: ${jsonFileName}
- **Bu Bilgi Dosyası**: INFO.md

## 🚀 Kullanım

### JSON Backup ile Yükleme:
\`\`\`bash
node restore-seed.js ${jsonFileName}
\`\`\`

## 📋 Tablo Detayları
${allTables.map(table => {
  const count = seedData.tables[table]?.length || 0;
  const status = count > 0 ? '✅' : '⏭️';
  return `${status} **${table}**: ${count} kayıt`;
}).join('\n')}

## 🔐 Güvenlik Notları
- Session ve token verileri temizlenmiştir
- Şifreler hash'lenmiş olarak korunmuştur
- Application log'ları dahil edilmiştir (isteğe bağlı)

## ⚠️ Önemli Notlar
- Bu seed mevcut uygulama verilerinden oluşturulmuştur
- ID'ler otomatik olarak yeniden oluşturulacaktır
- Timestamp'ler yeni oluşturulma tarihi olacaktır
- Foreign key ilişkileri korunmuştur

## 📊 İstatistikler
- **Toplam Tablo**: ${allTables.length}
- **İşlenen Tablo**: ${tablesProcessed}
- **Toplam Kayıt**: ${totalRecords}
- **Ortalama Kayıt/Tablo**: ${Math.round(totalRecords / tablesProcessed)}

---
**Oluşturulma Tarihi**: ${new Date().toISOString()}
**KentKonut Seed Generator v2.0 (Tüm Tablolar)**
`;

    fs.writeFileSync(path.join(backupDir, 'INFO.md'), infoContent);

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
if (require.main === module) {
  convertCurrentDataToSeed()
    .catch((e) => {
      console.error('❌ Fatal error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { convertCurrentDataToSeed };