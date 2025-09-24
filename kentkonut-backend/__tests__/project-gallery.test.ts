import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Project Gallery API Tests', () => {
  let testProjectId: number;
  let testGalleryId: number;
  let testSubGalleryId: number;
  let testMediaId: number;

  beforeAll(async () => {
    // Test projesi oluştur
    const project = await prisma.project.create({
      data: {
        title: 'Test Project for Gallery',
        slug: 'test-project-gallery',
        content: 'Test project content',
        authorId: 'test-user-id',
        published: true
      }
    });
    testProjectId = project.id;
    console.log('✅ Test project created:', testProjectId);
  });

  afterAll(async () => {
    // Test verilerini temizle
    await prisma.projectGalleryMedia.deleteMany({
      where: { gallery: { projectId: testProjectId } }
    });
    await prisma.projectGallery.deleteMany({
      where: { projectId: testProjectId }
    });
    await prisma.project.delete({
      where: { id: testProjectId }
    });
    console.log('✅ Test data cleaned up');
    await prisma.$disconnect();
  });

  describe('Gallery Creation Tests', () => {
    it('should create a root gallery', async () => {
      const gallery = await prisma.projectGallery.create({
        data: {
          projectId: testProjectId,
          title: 'İç Mekan',
          description: 'İç mekan görselleri',
          order: 0
        }
      });

      expect(gallery).toBeDefined();
      expect(gallery.title).toBe('İç Mekan');
      expect(gallery.projectId).toBe(testProjectId);
      expect(gallery.parentId).toBeNull();
      expect(gallery.isActive).toBe(true);

      testGalleryId = gallery.id;
      console.log('✅ Root gallery created:', testGalleryId);
    });

    it('should create a sub-gallery', async () => {
      const subGallery = await prisma.projectGallery.create({
        data: {
          projectId: testProjectId,
          parentId: testGalleryId,
          title: 'Salon',
          description: 'Salon görselleri',
          order: 0
        }
      });

      expect(subGallery).toBeDefined();
      expect(subGallery.title).toBe('Salon');
      expect(subGallery.parentId).toBe(testGalleryId);
      expect(subGallery.projectId).toBe(testProjectId);

      testSubGalleryId = subGallery.id;
      console.log('✅ Sub-gallery created:', testSubGalleryId);
    });

    it('should create another sub-gallery', async () => {
      const subGallery = await prisma.projectGallery.create({
        data: {
          projectId: testProjectId,
          parentId: testGalleryId,
          title: 'Mutfak',
          description: 'Mutfak görselleri',
          order: 1
        }
      });

      expect(subGallery).toBeDefined();
      expect(subGallery.title).toBe('Mutfak');
      expect(subGallery.parentId).toBe(testGalleryId);
      console.log('✅ Another sub-gallery created');
    });
  });

  describe('Gallery Listing Tests', () => {
    it('should list root galleries', async () => {
      const galleries = await prisma.projectGallery.findMany({
        where: {
          projectId: testProjectId,
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

      expect(galleries).toBeDefined();
      expect(galleries.length).toBe(1);
      expect(galleries[0].title).toBe('İç Mekan');
      expect(galleries[0].children.length).toBe(2);
      expect(galleries[0]._count.children).toBe(2);
      console.log('✅ Root galleries listed correctly');
    });

    it('should get gallery details with children', async () => {
      const gallery = await prisma.projectGallery.findFirst({
        where: {
          id: testGalleryId,
          projectId: testProjectId,
          isActive: true
        },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
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

      expect(gallery).toBeDefined();
      expect(gallery?.title).toBe('İç Mekan');
      expect(gallery?.children.length).toBe(2);
      expect(gallery?._count.children).toBe(2);
      expect(gallery?._count.media).toBe(0);
      console.log('✅ Gallery details retrieved correctly');
    });
  });

  describe('Media Management Tests', () => {
    it('should add media to gallery', async () => {
      const media = await prisma.projectGalleryMedia.create({
        data: {
          galleryId: testSubGalleryId,
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

      expect(media).toBeDefined();
      expect(media.fileName).toBe('salon-genel.jpg');
      expect(media.galleryId).toBe(testSubGalleryId);
      expect(media.mimeType).toBe('image/jpeg');

      testMediaId = media.id;
      console.log('✅ Media added to gallery:', testMediaId);
    });

    it('should add another media to gallery', async () => {
      const media = await prisma.projectGalleryMedia.create({
        data: {
          galleryId: testSubGalleryId,
          fileName: 'salon-detay.jpg',
          originalName: 'Salon Detay.jpg',
          fileSize: BigInt(2048000),
          mimeType: 'image/jpeg',
          fileUrl: '/uploads/salon-detay.jpg',
          thumbnailUrl: '/uploads/thumbs/salon-detay.jpg',
          title: 'Salon Detay',
          description: 'Salon detay görünümü',
          alt: 'Salon detay fotoğrafı',
          order: 1
        }
      });

      expect(media).toBeDefined();
      expect(media.fileName).toBe('salon-detay.jpg');
      console.log('✅ Another media added to gallery');
    });

    it('should list gallery media', async () => {
      const media = await prisma.projectGalleryMedia.findMany({
        where: {
          galleryId: testSubGalleryId,
          isActive: true
        },
        orderBy: { order: 'asc' }
      });

      expect(media).toBeDefined();
      expect(media.length).toBe(2);
      expect(media[0].fileName).toBe('salon-genel.jpg');
      expect(media[1].fileName).toBe('salon-detay.jpg');
      console.log('✅ Gallery media listed correctly');
    });
  });

  describe('Hierarchy Tests', () => {
    it('should create nested gallery structure', async () => {
      // 3 seviyeli hiyerarşi oluştur
      const level1 = await prisma.projectGallery.create({
        data: {
          projectId: testProjectId,
          title: 'Dış Mekan',
          description: 'Dış mekan görselleri',
          order: 1
        }
      });

      const level2 = await prisma.projectGallery.create({
        data: {
          projectId: testProjectId,
          parentId: level1.id,
          title: 'Bahçe',
          description: 'Bahçe görselleri',
          order: 0
        }
      });

      const level3 = await prisma.projectGallery.create({
        data: {
          projectId: testProjectId,
          parentId: level2.id,
          title: 'Çiçek Bahçesi',
          description: 'Çiçek bahçesi görselleri',
          order: 0
        }
      });

      expect(level1.parentId).toBeNull();
      expect(level2.parentId).toBe(level1.id);
      expect(level3.parentId).toBe(level2.id);

      console.log('✅ 3-level hierarchy created');
    });

    it('should count media in nested galleries', async () => {
      // Alt galeriye medya ekle
      await prisma.projectGalleryMedia.create({
        data: {
          galleryId: testSubGalleryId,
          fileName: 'salon-ekstra.jpg',
          originalName: 'Salon Ekstra.jpg',
          fileSize: BigInt(1536000),
          mimeType: 'image/jpeg',
          fileUrl: '/uploads/salon-ekstra.jpg',
          title: 'Salon Ekstra',
          order: 2
        }
      });

      // Parent galerinin toplam medya sayısını kontrol et
      const parentGallery = await prisma.projectGallery.findFirst({
        where: { id: testGalleryId },
        include: {
          children: {
            include: {
              media: true
            }
          }
        }
      });

      const totalMedia = parentGallery?.children.reduce((total, child) => {
        return total + child.media.length;
      }, 0) || 0;

      expect(totalMedia).toBe(3); // 3 medya olmalı
      console.log('✅ Media count in nested galleries is correct');
    });
  });

  describe('Error Handling Tests', () => {
    it('should not create gallery with invalid project ID', async () => {
      await expect(
        prisma.projectGallery.create({
          data: {
            projectId: 99999, // Geçersiz ID
            title: 'Test Gallery',
            order: 0
          }
        })
      ).rejects.toThrow();
      console.log('✅ Invalid project ID error handled correctly');
    });

    it('should not create gallery with invalid parent ID', async () => {
      await expect(
        prisma.projectGallery.create({
          data: {
            projectId: testProjectId,
            parentId: 99999, // Geçersiz parent ID
            title: 'Test Gallery',
            order: 0
          }
        })
      ).rejects.toThrow();
      console.log('✅ Invalid parent ID error handled correctly');
    });

    it('should not create media with invalid gallery ID', async () => {
      await expect(
        prisma.projectGalleryMedia.create({
          data: {
            galleryId: 99999, // Geçersiz gallery ID
            fileName: 'test.jpg',
            originalName: 'test.jpg',
            fileSize: BigInt(1000),
            mimeType: 'image/jpeg',
            fileUrl: '/test.jpg',
            order: 0
          }
        })
      ).rejects.toThrow();
      console.log('✅ Invalid gallery ID error handled correctly');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of galleries efficiently', async () => {
      const startTime = Date.now();
      
      // 50 galeri oluştur
      const galleries = [];
      for (let i = 0; i < 50; i++) {
        galleries.push({
          projectId: testProjectId,
          title: `Test Gallery ${i}`,
          description: `Test gallery ${i} description`,
          order: i
        });
      }

      await prisma.projectGallery.createMany({
        data: galleries
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 5 saniyeden az olmalı
      console.log(`✅ Created 50 galleries in ${duration}ms`);
    });

    it('should handle large number of media efficiently', async () => {
      const startTime = Date.now();
      
      // 100 medya oluştur
      const media = [];
      for (let i = 0; i < 100; i++) {
        media.push({
          galleryId: testSubGalleryId,
          fileName: `test-image-${i}.jpg`,
          originalName: `Test Image ${i}.jpg`,
          fileSize: BigInt(1000000),
          mimeType: 'image/jpeg',
          fileUrl: `/uploads/test-image-${i}.jpg`,
          order: i
        });
      }

      await prisma.projectGalleryMedia.createMany({
        data: media
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10 saniyeden az olmalı
      console.log(`✅ Created 100 media items in ${duration}ms`);
    });
  });
});
