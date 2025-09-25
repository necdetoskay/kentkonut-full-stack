const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFooterTables() {
  try {
    console.log('🔍 Footer tabloları kontrol ediliyor...');
    
    console.log('footerColumn:', await prisma.footerColumn.count());
    console.log('footerLink:', await prisma.footerLink.count());
    console.log('footerSection:', await prisma.footerSection.count());
    console.log('footerItem:', await prisma.footerItem.count());
    console.log('siteSetting:', await prisma.siteSetting.count());
    console.log('contactInfo:', await prisma.contactInfo.count());
    
  } catch (error) {
    console.log('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFooterTables();
