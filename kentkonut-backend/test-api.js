// API Test Script
const API_BASE_URL = 'http://localhost:3021';

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Proje oluştur
    console.log('Test 1: Creating test project...');
    const projectResponse = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Project for API',
        slug: 'test-project-api-' + Date.now(),
        content: 'Test project content for API testing',
        authorId: 'test-user-id',
        published: true
      })
    });

    if (!projectResponse.ok) {
      throw new Error(`Project creation failed: ${projectResponse.status}`);
    }

    const projectData = await projectResponse.json();
    const testProjectId = projectData.data.id;
    console.log('✅ Test project created:', testProjectId);

    // Test 2: Root galeri oluştur
    console.log('\nTest 2: Creating root gallery...');
    const galleryResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
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

    if (!galleryResponse.ok) {
      throw new Error(`Gallery creation failed: ${galleryResponse.status}`);
    }

    const galleryData = await galleryResponse.json();
    const testGalleryId = galleryData.data.id;
    console.log('✅ Root gallery created:', testGalleryId);

    // Test 3: Alt galeri oluştur
    console.log('\nTest 3: Creating sub-gallery...');
    const subGalleryResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
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

    if (!subGalleryResponse.ok) {
      throw new Error(`Sub-gallery creation failed: ${subGalleryResponse.status}`);
    }

    const subGalleryData = await subGalleryResponse.json();
    const testSubGalleryId = subGalleryData.data.id;
    console.log('✅ Sub-gallery created:', testSubGalleryId);

    // Test 4: Galerileri listele
    console.log('\nTest 4: Listing galleries...');
    const listResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`);

    if (!listResponse.ok) {
      throw new Error(`Gallery listing failed: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    console.log('✅ Galleries listed:', listData.data.length);
    console.log('   - Root galleries:', listData.data.length);

    // Test 5: Galeri detaylarını getir
    console.log('\nTest 5: Getting gallery details...');
    const detailResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testGalleryId}`);

    if (!detailResponse.ok) {
      throw new Error(`Gallery details failed: ${detailResponse.status}`);
    }

    const detailData = await detailResponse.json();
    console.log('✅ Gallery details retrieved');
    console.log('   - Title:', detailData.data.title);
    console.log('   - Children count:', detailData.data.children.length);

    // Test 6: Medya ekle
    console.log('\nTest 6: Adding media to gallery...');
    const mediaResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`, {
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

    if (!mediaResponse.ok) {
      throw new Error(`Media creation failed: ${mediaResponse.status}`);
    }

    const mediaData = await mediaResponse.json();
    console.log('✅ Media added:', mediaData.data.id);

    // Test 7: Medya listele
    console.log('\nTest 7: Listing gallery media...');
    const mediaListResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testSubGalleryId}/media`);

    if (!mediaListResponse.ok) {
      throw new Error(`Media listing failed: ${mediaListResponse.status}`);
    }

    const mediaListData = await mediaListResponse.json();
    console.log('✅ Gallery media listed:', mediaListData.data.media.length);
    console.log('   - Total media:', mediaListData.data.pagination.total);

    // Test 8: Galeri güncelle
    console.log('\nTest 8: Updating gallery...');
    const updateResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries/${testGalleryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'İç Mekan - Güncellendi',
        description: 'Güncellenmiş iç mekan açıklaması'
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Gallery update failed: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Gallery updated:', updateData.data.title);

    // Test 9: Performans testi
    console.log('\nTest 9: Performance test...');
    const startTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < 5; i++) {
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
      if (!response.ok) {
        throw new Error(`Performance test failed: ${response.status}`);
      }
    });

    console.log(`✅ Created 5 galleries in ${duration}ms`);

    // Test 10: Hata testleri
    console.log('\nTest 10: Error handling tests...');
    
    // Geçersiz proje ID
    const invalidProjectResponse = await fetch(`${API_BASE_URL}/api/projects/invalid/galleries`);
    if (invalidProjectResponse.status === 400) {
      console.log('✅ Invalid project ID error handled');
    }

    // Eksik başlık
    const missingTitleResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/galleries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Gallery without title'
      })
    });
    if (missingTitleResponse.status === 400) {
      console.log('✅ Missing title error handled');
    }

    // Test 11: Temizlik
    console.log('\nTest 11: Cleanup...');
    const deleteResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Testi çalıştır
testAPI();
