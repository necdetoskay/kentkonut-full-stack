import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProjectGallery() {
  console.log('🧪 Starting Project Gallery Tests...\n');

  try {
    // Test 1: Proje oluştur
    console.log('Test 1: Creating test project...');
    const project = await prisma.project.create({
      data: {
        title: 'Test Project for Gallery',
        slug: 'test-project-gallery-' + Date.now(),
        content: 'Test project content',
        authorId: 'admin-user-1',
        published: true
      }
    });
    console.log('✅ Test project created:', project.id);

    // Test 2: Root galeri oluştur
    console.log('\nTest 2: Creating root gallery...');
    const rootGallery = await prisma.projectGallery.create({
      data: {
        projectId: project.id,
        title: 'İç Mekan',
        description: 'İç mekan görselleri',
        order: 0
      }
    });
    console.log('✅ Root gallery created:', rootGallery.id);

    // Test 3: Alt galeri oluştur
    console.log('\nTest 3: Creating sub-gallery...');
    const subGallery = await prisma.projectGallery.create({
      data: {
        projectId: project.id,
        parentId: rootGallery.id,
        title: 'Salon',
        description: 'Salon görselleri',
        order: 0
      }
    });
    console.log('✅ Sub-gallery created:', subGallery.id);

    // Test 4: Medya ekle
    console.log('\nTest 4: Adding media to gallery...');
    const media = await prisma.projectGalleryMedia.create({
      data: {
        galleryId: subGallery.id,
        fileName: 'salon-genel.jpg',
        originalName: 'Salon Genel Görünüm.jpg',
        fileSize: BigInt(1024000),
        mimeType: 'image/jpeg',
        fileUrl: '/uploads/salon-genel.jpg',
        thumbnailUrl: '/uploads/thumbs/salon-genel.jpg',
        title: 'Salon Genel Görünüm',
        description: 'Salonun genel görünümü',
        alt: 'Salon genel görünüm fotoğrafı',
        order: 0
      }
    });
    console.log('✅ Media added:', media.id);

    // Test 5: Galerileri listele
    console.log('\nTest 5: Listing galleries...');
    const galleries = await prisma.projectGallery.findMany({
      where: {
        projectId: project.id,
        parentId: null,
        isActive: true
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            children: true,
            media: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });
    console.log('✅ Galleries listed:', galleries.length);
    console.log('   - Root galleries:', galleries.length);
    console.log('   - First gallery children:', galleries[0]?.children.length || 0);

    // Test 6: Galeri detaylarını getir
    console.log('\nTest 6: Getting gallery details...');
    const galleryDetails = await prisma.projectGallery.findFirst({
      where: {
        id: rootGallery.id,
        projectId: project.id,
        isActive: true
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            media: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        },
        media: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            children: true,
            media: true
          }
        }
      }
    });
    console.log('✅ Gallery details retrieved');
    console.log('   - Title:', galleryDetails?.title);
    console.log('   - Children count:', galleryDetails?.children.length || 0);
    console.log('   - Media count:', galleryDetails?.children[0]?.media.length || 0);

    // Test 7: Medya listele
    console.log('\nTest 7: Listing gallery media...');
    const galleryMedia = await prisma.projectGalleryMedia.findMany({
      where: {
        galleryId: subGallery.id,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });
    console.log('✅ Gallery media listed:', galleryMedia.length);

    // Test 8: Hiyerarşi testi
    console.log('\nTest 8: Testing hierarchy...');
    const hierarchyTest = await prisma.projectGallery.create({
      data: {
        projectId: project.id,
        title: 'Dış Mekan',
        description: 'Dış mekan görselleri',
        order: 1
      }
    });

    const level2 = await prisma.projectGallery.create({
      data: {
        projectId: project.id,
        parentId: hierarchyTest.id,
        title: 'Bahçe',
        description: 'Bahçe görselleri',
        order: 0
      }
    });

    const level3 = await prisma.projectGallery.create({
      data: {
        projectId: project.id,
        parentId: level2.id,
        title: 'Çiçek Bahçesi',
        description: 'Çiçek bahçesi görselleri',
        order: 0
      }
    });

    console.log('✅ 3-level hierarchy created');
    console.log('   - Level 1:', hierarchyTest.title);
    console.log('   - Level 2:', level2.title);
    console.log('   - Level 3:', level3.title);

    // Test 9: Performans testi
    console.log('\nTest 9: Performance test...');
    const startTime = Date.now();
    
    const mediaItems = [];
    for (let i = 0; i < 10; i++) {
      mediaItems.push({
        galleryId: subGallery.id,
        fileName: `test-image-${i}.jpg`,
        originalName: `Test Image ${i}.jpg`,
        fileSize: BigInt(1000000),
        mimeType: 'image/jpeg',
        fileUrl: `/uploads/test-image-${i}.jpg`,
        order: i
      });
    }

    await prisma.projectGalleryMedia.createMany({
      data: mediaItems
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ Created 10 media items in ${duration}ms`);

    // Test 10: Temizlik
    console.log('\nTest 10: Cleanup...');
    await prisma.projectGalleryMedia.deleteMany({
      where: { gallery: { projectId: project.id } }
    });
    await prisma.projectGallery.deleteMany({
      where: { projectId: project.id }
    });
    await prisma.project.delete({
      where: { id: project.id }
    });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Testi çalıştır
testProjectGallery();
