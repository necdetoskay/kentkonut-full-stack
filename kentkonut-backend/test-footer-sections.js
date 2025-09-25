const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFooterSections() {
  try {
    console.log('🔍 Footer sections test ediliyor...');
    
    const sections = await prisma.footerSection.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    });
    
    console.log('✅ Footer sections başarıyla alındı:');
    console.log('Toplam section sayısı:', sections.length);
    
    sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title || section.key} (${section.type}) - ${section.items.length} öğe`);
    });
    
  } catch (error) {
    console.error('❌ Footer sections test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFooterSections();
