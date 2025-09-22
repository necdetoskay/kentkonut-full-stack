// Test hafriyat custom folder with curl-like request
console.log('🧪 Testing Hafriyat Custom Folder Upload via API');

// Test data for the request
const testData = {
  categoryId: '1', // Bannerlar category
  customFolder: 'hafriyat',
  filename: 'test-hafriyat-image.txt',
  referer: 'http://localhost:3001/dashboard/hafriyat/sahalar/yeni'
};

console.log('Test Parameters:');
console.table(testData);

console.log('\nExpected behavior:');
console.log('- effectiveCustomFolder should be "hafriyat"');
console.log('- File should be saved to: public/hafriyat/filename.txt');
console.log('- URL should be: /hafriyat/filename.txt');
console.log('- Database record should have correct URL');

console.log('\nWorkaround logic:');
console.log('1. If customFolder is null and referer contains "/hafriyat/"');
console.log('   → Set effectiveCustomFolder = "hafriyat"');
console.log('2. If customFolder is null and categoryId = "1"');
console.log('   → Set effectiveCustomFolder = "hafriyat"');

console.log('\n✅ API route changes completed!');
console.log('Next: Test with actual upload from hafriyat page');
console.log('Watch terminal for debug logs showing:');
console.log('- 🔍 [MEDIA_UPLOAD_DEBUG] Received parameters');
console.log('- 🔧 [MEDIA_UPLOAD_DEBUG] Applied hafriyat workaround');
console.log('- 🔍 [MEDIA_UPLOAD_DEBUG] URL generation');
