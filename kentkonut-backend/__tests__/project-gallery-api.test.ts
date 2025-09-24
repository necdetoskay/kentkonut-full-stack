import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Project Gallery API Endpoint Tests', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3021';
  let testProjectId: number;
  let testGalleryId: number;
  let testSubGalleryId: number;
  let testMediaId: number;

  beforeAll(async () => {
    // Test projesi oluştur
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Project for API',
        slug: 'test-project-api',
        content: 'Test project content for API testing',
        authorId: 'test-user-id',
        published: true
      })
    });

    const projectData = await response.json();
    testProjectId = projectData.data.id;
    console.log('✅ Test project created via API:', testProjectId);
  });

  afterAll(async () => {
    // Test verilerini temizle
    if (testProjectId) {
      await fetch(`${API_BASE_URL}/api/projects/${testProjectId}`, {
        method: 'DELETE'
      });
      console.log('✅ Test data cleaned up');
    }
  });

  describe('Gallery API Tests', () => {
    it('should create a root gallery via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'İç Mekan',
          description: 'İç mekan görselleri',
          order: 0
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('İç Mekan');
      expect(data.data.projectId).toBe(testProjectId);
      expect(data.data.parentId).toBeNull();

      testGalleryId = data.data.id;
      console.log('✅ Root gallery created via API:', testGalleryId);
    });

    it('should create a sub-gallery via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Salon',
          description: 'Salon görselleri',
          parentId: testGalleryId,
          order: 0
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Salon');
      expect(data.data.parentId).toBe(testGalleryId);

      testSubGalleryId = data.data.id;
      console.log('✅ Sub-gallery created via API:', testSubGalleryId);
    });

    it('should list galleries via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].title).toBe('İç Mekan');

      console.log('✅ Galleries listed via API');
    });

    it('should get gallery details via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testGalleryId}`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('İç Mekan');
      expect(data.data.children.length).toBeGreaterThan(0);

      console.log('✅ Gallery details retrieved via API');
    });

    it('should update gallery via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testGalleryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'İç Mekan - Güncellendi',
          description: 'Güncellenmiş iç mekan açıklaması'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('İç Mekan - Güncellendi');

      console.log('✅ Gallery updated via API');
    });
  });

  describe('Media API Tests', () => {
    it('should add media to gallery via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'salon-genel.jpg',
          originalName: 'Salon Genel Görünüm.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          fileUrl: '/uploads/salon-genel.jpg',
          thumbnailUrl: '/uploads/thumbs/salon-genel.jpg',
          title: 'Salon Genel Görünüm',
          description: 'Salonun genel görünümü',
          alt: 'Salon genel görünüm fotoğrafı',
          order: 0
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.fileName).toBe('salon-genel.jpg');
      expect(data.data.galleryId).toBe(testSubGalleryId);

      testMediaId = data.data.id;
      console.log('✅ Media added to gallery via API:', testMediaId);
    });

    it('should add another media to gallery via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'salon-detay.jpg',
          originalName: 'Salon Detay.jpg',
          fileSize: 2048000,
          mimeType: 'image/jpeg',
          fileUrl: '/uploads/salon-detay.jpg',
          thumbnailUrl: '/uploads/thumbs/salon-detay.jpg',
          title: 'Salon Detay',
          description: 'Salon detay görünümü',
          alt: 'Salon detay fotoğrafı',
          order: 1
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.fileName).toBe('salon-detay.jpg');

      console.log('✅ Another media added to gallery via API');
    });

    it('should list gallery media via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.media.length).toBe(2);
      expect(data.data.pagination.total).toBe(2);
      expect(data.data.pagination.hasMore).toBe(false);

      console.log('✅ Gallery media listed via API');
    });

    it('should list gallery media with pagination via API', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media?page=1&limit=1`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.media.length).toBe(1);
      expect(data.data.pagination.total).toBe(2);
      expect(data.data.pagination.hasMore).toBe(true);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(1);

      console.log('✅ Gallery media pagination works via API');
    });
  });

  describe('Error Handling API Tests', () => {
    it('should return 400 for invalid project ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/invalid/galleries`);

      expect(response.status).toBe(400);
      console.log('✅ Invalid project ID error handled via API');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/99999/galleries`);

      expect(response.status).toBe(404);
      console.log('✅ Non-existent project error handled via API');
    });

    it('should return 400 for missing title in gallery creation', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Gallery without title'
        })
      });

      expect(response.status).toBe(400);
      console.log('✅ Missing title error handled via API');
    });

    it('should return 404 for non-existent gallery', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/99999`);

      expect(response.status).toBe(404);
      console.log('✅ Non-existent gallery error handled via API');
    });

    it('should return 400 for missing required fields in media creation', async () => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Media without required fields'
        })
      });

      expect(response.status).toBe(400);
      console.log('✅ Missing required fields error handled via API');
    });
  });

  describe('Performance API Tests', () => {
    it('should handle multiple gallery creation efficiently', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `Performance Test Gallery ${i}`,
              description: `Performance test gallery ${i}`,
              order: i
            })
          })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(10000); // 10 saniyeden az olmalı
      console.log(`✅ Created 10 galleries via API in ${duration}ms`);
    });

    it('should handle multiple media creation efficiently', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: `perf-test-${i}.jpg`,
              originalName: `Performance Test ${i}.jpg`,
              fileSize: 1000000,
              mimeType: 'image/jpeg',
              fileUrl: `/uploads/perf-test-${i}.jpg`,
              order: i
            })
          })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(15000); // 15 saniyeden az olmalı
      console.log(`✅ Created 20 media items via API in ${duration}ms`);
    });
  });
});
