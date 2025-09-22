const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBanners() {
  try {
    console.log('🔍 Banner kayıtları kontrol ediliyor...');
    
    const banners = await prisma.banner.findMany({
      select: {
        id: true,
        title: true,
        imageUrl: true,
        isActive: true
      }
    });
    
    console.log(`📊 Toplam ${banners.length} banner bulundu:`);
    
    banners.forEach(banner => {
      console.log(`- ID: ${banner.id}, Başlık: ${banner.title}, Resim: ${banner.imageUrl}, Aktif: ${banner.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBanners();