const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const path = require('path');

async function testMediaUpload() {
  try {
    console.log('🚀 Testing KentWebMediaUploader API...');
    
    // Test image oluştur (1x1 piksel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8D, 0xB8, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Test dosyasını kaydet
    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, testImageBuffer);

    // FormData oluştur
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-hafriyat-image.png',
      contentType: 'image/png'
    });
    formData.append('customFolder', 'hafriyat');
    formData.append('width', '800');
    formData.append('height', '450');

    console.log('📤 Uploading test image to /api/media with customFolder=hafriyat...');
    
    const response = await fetch('http://localhost:3002/api/media', {
      method: 'POST',
      body: formData
    });

    const responseData = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));    if (response.ok && responseData.success) {
      console.log('✅ SUCCESS: Image uploaded successfully!');
      console.log('🖼️ Image URL:', responseData.data.url);
      
      // Dosyanın gerçekten doğru klasöre kaydedilip kaydedilmediğini kontrol et
      if (responseData.data.url.includes('/hafriyat/')) {
        console.log('✅ SUCCESS: File saved to correct folder (hafriyat)!');
      } else {
        console.log('❌ ERROR: File saved to wrong folder!');
        console.log('Expected: /hafriyat/, Got:', responseData.data.url);
      }
    } else {
      console.log('❌ ERROR: Upload failed');
      console.log('Error:', responseData.error || 'Unknown error');
    }

    // Test dosyasını temizle
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testMediaUpload();
