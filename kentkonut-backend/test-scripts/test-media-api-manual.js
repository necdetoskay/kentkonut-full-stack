const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

async function testMediaUpload() {
  try {
    console.log('🧪 Testing Media API manually...\n');

    // Test image path
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Check if test image exists
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found. Creating a simple test image...');
      
      // Create a simple test PNG (1x1 pixel)
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8E, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
        0x42, 0x60, 0x82
      ]);
      
      fs.writeFileSync(testImagePath, testImageBuffer);
      console.log('✅ Test image created\n');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    formData.append('customFolder', 'hafriyat');
    formData.append('width', '800');
    formData.append('height', '450');

    console.log('📤 Uploading to /api/media...');
    console.log('📁 Custom Folder: hafriyat');
    console.log('📏 Dimensions: 800x450');
    console.log('🔗 URL: http://localhost:3001/api/media\n');

    // Make the request
    const response = await fetch('http://localhost:3001/api/media', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let form-data set it with boundary
        ...formData.getHeaders()
      }
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📡 Response Body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ Upload successful!');
      console.log('🔗 Uploaded URL:', data.data?.url);
      console.log('📁 Expected folder: /hafriyat/');
      
      // Verify the file exists
      if (data.data?.url) {
        const fileUrl = `http://localhost:3001${data.data.url}`;
        console.log('🔍 Checking file accessibility:', fileUrl);
        
        const checkResponse = await fetch(fileUrl);
        console.log('📂 File accessible:', checkResponse.ok ? '✅ YES' : '❌ NO');
      }
    } else {
      console.log('\n❌ Upload failed!');
      console.log('💥 Status:', response.status);
      console.log('💥 Error:', responseText);
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

// Run the test
testMediaUpload();
