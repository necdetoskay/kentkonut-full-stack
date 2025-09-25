console.log('🔄 Son yedeklenen kayıtları geri yüklüyor...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreLatestBackup() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // En son yedekleme dosyasını bul
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
    try {
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      const newsCount = await prisma.news.count();
      const personnelCount = await prisma.personnel.count();
      const departmentCount = await prisma.department.count();
      const executiveCount = await prisma.executive.count();
      
      console.log(`   👤 Kullanıcı: ${userCount}`);
      console.log(`   🏢 Proje: ${projectCount}`);
      console.log(`   📰 Haber: ${newsCount}`);
      console.log(`   👥 Personel: ${personnelCount}`);
      console.log(`   🏛️ Birim: ${departmentCount}`);
      console.log(`   👔 Yönetici: ${executiveCount}`);
    } catch (error) {
      console.log(`   ⚠️ Veritabanı durumu kontrol edilemedi: ${error.message}`);
    }
    
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
    
    // Verileri yükle (foreign key ilişkilerine göre sıralama)
    const loadOrder = [
      'user', 'mediaCategory', 'media', 'pageCategory', 'page', 'pageSeoMetrics',
      'department', 'executive', 'personnel', 'tag', 'newsCategory', 'news',
      'project', 'projectTag', 'projectRelation', 'projectGallery', 'projectGalleryMedia',
      'hafriyatBolge', 'hafriyatSaha', 'hafriyatBelgeKategori', 'hafriyatBelge',
      'comment', 'quickAccessLink', 'menuItem', 'menuPermission', 'serviceCard',
      'corporateContent', 'highlight', 'banner', 'personnelGallery', 'newsGallery',
      'newsGalleryItem', 'applicationLog'
    ];
    
    let totalImported = 0;
    
    for (const tableName of loadOrder) {
      const records = backupData.tables[tableName];
      if (records && records.length > 0) {
        try {
          // ID'yi koruyan tablolar için özel işlem
          if (tableName === 'user' || tableName === 'media' || tableName === 'news' || tableName === 'project') {
            // Bu tablolar için ID'yi koru
            await prisma[tableName].createMany({
              data: records,
              skipDuplicates: true
            });
          } else {
            // Diğer tablolar için normal yükleme
            await prisma[tableName].createMany({
              data: records,
              skipDuplicates: true
            });
          }
          
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
    try {
      const newUserCount = await prisma.user.count();
      const newProjectCount = await prisma.project.count();
      const newNewsCount = await prisma.news.count();
      const newPersonnelCount = await prisma.personnel.count();
      const newDepartmentCount = await prisma.department.count();
      const newExecutiveCount = await prisma.executive.count();
      
      console.log(`   👤 Kullanıcı: ${newUserCount}`);
      console.log(`   🏢 Proje: ${newProjectCount}`);
      console.log(`   📰 Haber: ${newNewsCount}`);
      console.log(`   👥 Personel: ${newPersonnelCount}`);
      console.log(`   🏛️ Birim: ${newDepartmentCount}`);
      console.log(`   👔 Yönetici: ${newExecutiveCount}`);
    } catch (error) {
      console.log(`   ⚠️ Yeni durum kontrol edilemedi: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Geri yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreLatestBackup();
