// Test pages API endpoint
async function testPagesAPI() {
  try {
    console.log('🧪 Testing pages API...');
    
    const response = await fetch('http://localhost:3001/api/pages');
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('✅ Found', data.data.length, 'pages');
      data.data.forEach((page, index) => {
        console.log(`📄 Page ${index + 1}:`, {
          id: page.id,
          title: page.title,
          slug: page.slug,
          isActive: page.isActive,
          categoryId: page.categoryId,
          category: page.category?.name || 'No category'
        });
      });
    } else {
      console.log('❌ No data returned or error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Import fetch for Node.js environment
import fetch from 'node-fetch';
testPagesAPI();
