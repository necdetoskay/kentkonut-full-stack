const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testCompleteGalleryFunctionality() {
  console.log('🧪 Testing Complete Hafriyat Saha Gallery & SEO Functionality');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check categories
    console.log('\n1️⃣ Checking Gallery Categories...');
    const categories = await db.hafriyatResimKategori.findMany();
    console.log(`✅ Found ${categories.length} categories`);
    if (categories.length === 0) {
      throw new Error('No categories found! Gallery won\'t work.');
    }
    
    // 2. Check bolges
    console.log('\n2️⃣ Checking Bolges...');
    const bolges = await db.hafriyatBolge.findMany({ take: 1 });
    if (bolges.length === 0) {
      throw new Error('No bolges found! Cannot create saha.');
    }
    console.log(`✅ Found bolge: ${bolges[0].ad} (ID: ${bolges[0].id})`);
    
    // 3. Create test saha with SEO and Gallery
    console.log('\n3️⃣ Creating Test Saha with SEO and Gallery...');
    const testSahaData = {
      ad: `Test Saha - ${Date.now()}`,
      konumAdi: 'Test Konumu',
      enlem: 40.7128,
      boylam: -74.0060,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 45,
      tonBasiUcret: 150.50,
      kdvOrani: 20,
      toplamTon: 5000,
      tamamlananTon: 2250,
      aciklama: 'Test açıklaması',
      aktif: true,
      bolge: {
        connect: { id: bolges[0].id }
      },
      // SEO Fields
      seoTitle: 'Test Saha SEO Başlığı',
      seoDescription: 'Bu test sahası için SEO açıklaması',
      seoKeywords: 'test, hafriyat, saha, seo',
      seoLink: 'test-saha-slug',
      seoCanonicalUrl: 'https://example.com/test-saha',
      // Gallery Images
      resimler: {
        create: [
          {
            baslik: 'Test Resim 1',
            dosyaAdi: 'test1.jpg',
            orjinalAd: 'Test Image 1',
            dosyaYolu: 'https://picsum.photos/800/600?random=1',
            altMetin: 'Test görseli 1',
            aciklama: 'Bu bir test görseli',
            kategoriId: categories[0].id,
            sira: 0
          },
          {
            baslik: 'Test Resim 2',
            dosyaAdi: 'test2.jpg',
            orjinalAd: 'Test Image 2',
            dosyaYolu: 'https://picsum.photos/800/600?random=2',
            altMetin: 'Test görseli 2',
            aciklama: 'Bu ikinci test görseli',
            kategoriId: categories[0].id,
            sira: 1
          }
        ]
      }
    };
    
    const createdSaha = await db.hafriyatSaha.create({
      data: testSahaData,
      include: {
        bolge: true,
        resimler: {
          include: {
            kategori: true
          }
        }
      }
    });
    
    console.log(`✅ Created Test Saha: ${createdSaha.ad} (ID: ${createdSaha.id})`);
    console.log(`   📊 SEO Title: ${createdSaha.seoTitle}`);
    console.log(`   📊 SEO Description: ${createdSaha.seoDescription}`);
    console.log(`   🖼️  Gallery Images: ${createdSaha.resimler.length}`);
    
    // 4. Test Read (GET)
    console.log('\n4️⃣ Testing Saha Read with Gallery...');
    const readSaha = await db.hafriyatSaha.findUnique({
      where: { id: createdSaha.id },
      include: {
        bolge: true,
        resimler: {
          include: {
            kategori: true
          },
          orderBy: { sira: 'asc' }
        }
      }
    });
    
    console.log(`✅ Read Saha: ${readSaha.ad}`);
    console.log(`   📊 All SEO fields present: ${!!(readSaha.seoTitle && readSaha.seoDescription)}`);
    console.log(`   🖼️  Gallery Images: ${readSaha.resimler.length}`);
    readSaha.resimler.forEach((resim, index) => {
      console.log(`     ${index + 1}. ${resim.baslik} (${resim.kategori.ad})`);
    });
    
    // 5. Test Update with different gallery
    console.log('\n5️⃣ Testing Saha Update with Gallery Change...');
    const updatedSaha = await db.hafriyatSaha.update({
      where: { id: createdSaha.id },
      data: {
        seoTitle: 'Updated SEO Title',
        seoKeywords: 'updated, keywords, test',
        resimler: {
          deleteMany: {}, // Delete all existing images
          create: [
            {
              baslik: 'Updated Test Resim 1',
              dosyaAdi: 'updated1.jpg',
              orjinalAd: 'Updated Test Image 1',
              dosyaYolu: 'https://picsum.photos/800/600?random=3',
              altMetin: 'Updated test görseli 1',
              aciklama: 'Bu updated test görseli',
              kategoriId: categories[0].id,
              sira: 0
            },
            {
              baslik: 'Updated Test Resim 2',
              dosyaAdi: 'updated2.jpg',
              orjinalAd: 'Updated Test Image 2',
              dosyaYolu: 'https://picsum.photos/800/600?random=4',
              altMetin: 'Updated test görseli 2',
              aciklama: 'Bu ikinci updated test görseli',
              kategoriId: categories[0].id,
              sira: 1
            },
            {
              baslik: 'Updated Test Resim 3',
              dosyaAdi: 'updated3.jpg',
              orjinalAd: 'Updated Test Image 3',
              dosyaYolu: 'https://picsum.photos/800/600?random=5',
              altMetin: 'Updated test görseli 3',
              aciklama: 'Bu üçüncü updated test görseli',
              kategoriId: categories[0].id,
              sira: 2
            }
          ]
        }
      },
      include: {
        resimler: {
          include: {
            kategori: true
          },
          orderBy: { sira: 'asc' }
        }
      }
    });
    
    console.log(`✅ Updated Saha: ${updatedSaha.ad}`);
    console.log(`   📊 Updated SEO Title: ${updatedSaha.seoTitle}`);
    console.log(`   🖼️  New Gallery Images: ${updatedSaha.resimler.length}`);
    updatedSaha.resimler.forEach((resim, index) => {
      console.log(`     ${index + 1}. ${resim.baslik} (${resim.kategori.ad})`);
    });
    
    // 6. Test API endpoint simulation (validate data structure)
    console.log('\n6️⃣ Testing API Data Structure...');
    const apiTestData = {
      ad: 'API Test Saha',
      konumAdi: 'API Test Konumu',
      enlem: 41.0082,
      boylam: 28.9784,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 75,
      tonBasiUcret: 200,
      kdvOrani: 20,
      bolgeId: bolges[0].id,
      seoTitle: 'API Test SEO Title',
      seoDescription: 'API Test SEO Description',
      seoKeywords: 'api, test, keywords',
      seoLink: 'api-test-slug',
      seoCanonicalUrl: 'https://example.com/api-test',
      resimler: [
        {
          url: 'https://picsum.photos/800/600?random=6',
          alt: 'API Test Image 1',
          description: 'API test description 1'
        },
        {
          url: 'https://picsum.photos/800/600?random=7', 
          alt: 'API Test Image 2',
          description: 'API test description 2'
        }
      ]
    };
    
    // This simulates what the API would do
    const defaultCategory = await db.hafriyatResimKategori.findFirst({
      orderBy: { id: 'asc' }
    });
    
    const apiCreateData = { ...apiTestData };
    apiCreateData.bolge = { connect: { id: apiTestData.bolgeId } };
    delete apiCreateData.bolgeId;
    
    if (apiTestData.resimler && apiTestData.resimler.length > 0) {
      apiCreateData.resimler = {
        create: apiTestData.resimler.map((resim, index) => ({
          baslik: resim.alt || 'Saha Görseli',
          dosyaAdi: resim.url.split('/').pop() || 'image.jpg',
          orjinalAd: resim.alt || 'Saha Görseli',
          dosyaYolu: resim.url,
          altMetin: resim.alt || '',
          aciklama: resim.description || '',
          kategoriId: defaultCategory.id,
          sira: index
        }))
      };
    }
    
    const apiCreatedSaha = await db.hafriyatSaha.create({
      data: apiCreateData,
      include: {
        bolge: true,
        resimler: {
          include: {
            kategori: true
          }
        }
      }
    });
    
    console.log(`✅ API Test Saha Created: ${apiCreatedSaha.ad} (ID: ${apiCreatedSaha.id})`);
    console.log(`   📊 SEO Fields: ${Object.keys(apiCreatedSaha).filter(key => key.startsWith('seo')).length}/5`);
    console.log(`   🖼️  Gallery Images: ${apiCreatedSaha.resimler.length}`);
    
    // 7. Cleanup
    console.log('\n7️⃣ Cleaning up test data...');
    await db.hafriyatSaha.delete({ where: { id: createdSaha.id } });
    await db.hafriyatSaha.delete({ where: { id: apiCreatedSaha.id } });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('=' .repeat(60));
    console.log('✅ SEO fields work correctly');
    console.log('✅ Gallery images work correctly');
    console.log('✅ Create operations work');
    console.log('✅ Read operations work');
    console.log('✅ Update operations work');
    console.log('✅ API data structure works');
    console.log('✅ Cleanup works');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.$disconnect();
  }
}

testCompleteGalleryFunctionality();
