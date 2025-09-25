console.log('🔄 Veri geri yükleme işlemi başlatılıyor...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // Yedekleme dosyasını oku
    const backupPath = path.join(__dirname, 'backups', 'current-data-2025-09-25T05-35-23-529Z', 'current-data-backup-2025-09-25T05-35-23-529Z.json');
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Yedekleme dosyası bulunamadı');
      return;
    }
    
    console.log('📥 Yedekleme dosyası okunuyor...');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📊 Yedekleme bilgileri:`);
    console.log(`   📅 Tarih: ${backupData.metadata.timestamp}`);
    console.log(`   📋 Toplam Kayıt: ${backupData.metadata.totalRecords}`);
    console.log(`   📊 İşlenen Tablo: ${backupData.metadata.tablesProcessed}`);
    
    // Mevcut veritabanı durumunu kontrol et
    console.log('\n📊 Mevcut veritabanı durumu:');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const newsCount = await prisma.news.count();
    
    console.log(`   👤 Kullanıcı: ${userCount}`);
    console.log(`   🏢 Proje: ${projectCount}`);
    console.log(`   📰 Haber: ${newsCount}`);
    
    console.log('\n🚀 Geri yükleme işlemi başlatılacak...');
    console.log('⚠️ Bu işlem mevcut verileri silecek ve yedekleme verilerini yükleyecek!');
    
    // Geri yükleme işlemini başlat
    console.log('\n🔄 Veriler temizleniyor...');
    
    // Tabloları temizle (foreign key ilişkilerine göre sıralama)
    const tablesToClear = [
      'comment', 'projectTag', 'projectRelation', 'projectGalleryMedia', 'projectGallery',
      'newsTag', 'newsRelation', 'newsGalleryItem', 'newsGallery', 'personnelGallery',
      'quickAccessLink', 'menuPermission', 'menuItem', 'serviceCard', 'corporateContent',
      'highlight', 'banner', 'hafriyatBelge', 'hafriyatSaha', 'hafriyatBolge',
      'project', 'news', 'personnel', 'executive', 'department', 'tag', 'newsCategory',
      'media', 'mediaCategory', 'pageSeoMetrics', 'page', 'pageCategory',
      'session', 'account', 'verificationToken', 'user', 'applicationLog'
    ];
    
    for (const table of tablesToClear) {
      try {
        const count = await prisma[table].count();
        if (count > 0) {
          await prisma[table].deleteMany();
          console.log(`   ✅ ${table}: ${count} kayıt silindi`);
        }
      } catch (error) {
        console.log(`   ⚠️ ${table}: Temizleme hatası - ${error.message}`);
      }
    }
    
    console.log('\n📥 Veriler yükleniyor...');
    
    // Verileri yükle
    let totalImported = 0;
    for (const [tableName, records] of Object.entries(backupData.tables)) {
      if (records.length > 0) {
        try {
          await prisma[tableName].createMany({
            data: records,
            skipDuplicates: true
          });
          console.log(`   ✅ ${tableName}: ${records.length} kayıt yüklendi`);
          totalImported += records.length;
        } catch (error) {
          console.log(`   ⚠️ ${tableName}: Yükleme hatası - ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Geri yükleme tamamlandı!');
    console.log(`📋 Toplam yüklenen kayıt: ${totalImported}`);
    
    // Yeni durumu kontrol et
    console.log('\n📊 Yeni veritabanı durumu:');
    const newUserCount = await prisma.user.count();
    const newProjectCount = await prisma.project.count();
    const newNewsCount = await prisma.news.count();
    
    console.log(`   👤 Kullanıcı: ${newUserCount}`);
    console.log(`   🏢 Proje: ${newProjectCount}`);
    console.log(`   📰 Haber: ${newNewsCount}`);
    
  } catch (error) {
    console.error('❌ Geri yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
