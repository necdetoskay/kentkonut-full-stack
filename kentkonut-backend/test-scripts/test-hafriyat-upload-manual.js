// Test custom folder upload to hafriyat
const fs = require('fs');
const path = require('path');

async function testHafriyatUpload() {
  console.log('🧪 Testing Hafriyat Custom Folder Upload');
  console.log('='.repeat(50));

  // Create a simple test file
  const testFilePath = path.join(__dirname, 'test-hafriyat-image.txt');
  fs.writeFileSync(testFilePath, 'This is a test file for hafriyat upload');

  try {
    // Create FormData for the upload
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Append file
    formData.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-hafriyat-image.txt',
      contentType: 'text/plain'
    });
    
    // Add required parameters
    formData.append('categoryId', '1'); // Bannerlar category
    formData.append('customFolder', 'hafriyat'); // Custom folder
    formData.append('alt', 'Test hafriyat file');
    formData.append('caption', 'Test upload for hafriyat custom folder');

    console.log('\n📤 Sending POST request to /api/media');
    console.log('Parameters:');
    console.log('- categoryId: 1');
    console.log('- customFolder: hafriyat');
    console.log('- filename: test-hafriyat-image.txt');

    // Make the request
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3001/api/media', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'your-session-cookie-here' // You'd need actual session
      }
    });

    const result = await response.text();
    console.log('\n📥 Response Status:', response.status);
    console.log('Response Body:', result);

    if (response.ok) {
      const data = JSON.parse(result);
      console.log('\n✅ Upload successful!');
      console.log('File URL:', data.url);
      console.log('File Path:', data.path);
    } else {
      console.log('\n❌ Upload failed');
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
  } finally {
    // Cleanup test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

testHafriyatUpload().catch(console.error);
