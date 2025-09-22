const { PrismaClient } = require('@prisma/client');

// SEO utility functions (inline implementation)
function generateSeoLink(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[çğıöşüÇĞIÖŞÜ]/g, (char) => {
      const map = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
      };
      return map[char] || char;
    })
    .replace(/[^\w\s-]/g, '')     // Remove special chars except letters, numbers, spaces, and dashes
    .replace(/\s+/g, '-')          // Replace spaces with dashes
    .replace(/-+/g, '-')           // Replace multiple dashes with single
    .trim()
    .replace(/^-|-$/g, '');        // Remove leading/trailing dashes
}

function generateCanonicalUrl(seoLink) {
  return `/hafriyat/${seoLink}`;
}

const prisma = new PrismaClient();

async function updateSeoLinks() {
  console.log('🔗 Hafriyat sahalarının SEO linklerini güncelleniyor...');

  try {
    // Tüm aktif hafriyat sahalarını getir
    const sahalar = await prisma.hafriyatSaha.findMany({
      where: {
        aktif: true
      },
      select: {
        id: true,
        ad: true,
        konumAdi: true,
        seoLink: true,
        seoCanonicalUrl: true
      }
    });

    console.log(`📊 Toplam ${sahalar.length} aktif saha bulundu.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const saha of sahalar) {
      // SEO link boş ise oluştur
      if (!saha.seoLink) {
        // Saha adı ve konum adını birleştirerek SEO link oluştur
        const combinedName = `${saha.ad} ${saha.konumAdi}`;
        const seoLink = generateSeoLink(combinedName);
        const canonicalUrl = generateCanonicalUrl(seoLink);

        // Aynı SEO link var mı kontrol et
        const existingLink = await prisma.hafriyatSaha.findFirst({
          where: {
            seoLink: seoLink,
            id: { not: saha.id }
          }
        });

        let finalSeoLink = seoLink;
        if (existingLink) {
          // Eğer aynı link varsa, ID'nin son 8 karakterini ekle
          finalSeoLink = `${seoLink}-${saha.id.slice(-8)}`;
        }

        // Sahayı güncelle
        await prisma.hafriyatSaha.update({
          where: { id: saha.id },
          data: {
            seoLink: finalSeoLink,
            seoCanonicalUrl: generateCanonicalUrl(finalSeoLink)
          }
        });

        console.log(`✅ ${saha.ad} (${saha.konumAdi}) -> SEO Link: ${finalSeoLink}`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${saha.ad} (${saha.konumAdi}) -> SEO Link zaten var: ${saha.seoLink}`);
        skippedCount++;
      }
    }

    console.log(`\n📈 Güncelleme tamamlandı:`);
    console.log(`   ✅ Güncellenen: ${updatedCount}`);
    console.log(`   ⏭️  Atlanan: ${skippedCount}`);
    console.log(`   📊 Toplam: ${sahalar.length}`);

  } catch (error) {
    console.error('❌ SEO link güncelleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  updateSeoLinks();
}

module.exports = { updateSeoLinks };