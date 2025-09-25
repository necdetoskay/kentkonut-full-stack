console.log('📑 Menu kayıtlarını yüklüyor...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreMenuRecords() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // Yedekleme dosyasını oku
    const backupPath = path.join(__dirname, 'backups', 'current-data-2025-09-25T05-35-23-529Z', 'current-data-backup-2025-09-25T05-35-23-529Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('🗑️ Menu tablosunu temizliyor...');
    await prisma.menuItem.deleteMany();
    
    console.log('📥 Menu kayıtlarını yükleniyor...');
    
    if (backupData.tables.menuItem && backupData.tables.menuItem.length > 0) {
      // Menu kayıtlarını düzelt
      const fixedMenuItems = backupData.tables.menuItem.map(menu => ({
        ...menu,
        parentId: menu.parentId === 'menu-kurumsal' ? null : menu.parentId // menu-kurumsal ID'sini null yap
      }));
      
      await prisma.menuItem.createMany({
        data: fixedMenuItems,
        skipDuplicates: true
      });
      
      console.log(`✅ MenuItem: ${fixedMenuItems.length} kayıt yüklendi`);
      
      // Yüklenen menu kayıtlarını listele
      console.log('\n📑 Yüklenen Menu Kayıtları:');
      fixedMenuItems.forEach((menu, i) => {
        console.log(`${i+1}. ${menu.title} - parentId: ${menu.parentId}`);
      });
    }
    
    // Son durumu kontrol et
    const menuCount = await prisma.menuItem.count();
    console.log(`\n📊 Toplam Menu Kayıt Sayısı: ${menuCount}`);
    
    console.log('\n🎉 Menu kayıtları başarıyla yüklendi!');
    
  } catch (error) {
    console.error('❌ Menu yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreMenuRecords();
