// Media API Test Script
async function testMediaAPI() {
  try {
    console.log('🧪 Testing Media API...');
    
    const response = await fetch('/api/media?limit=5');
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    console.log('📊 Media count:', data.data?.length || 0);
    console.log('📊 Pagination:', data.pagination);
    
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Run test
testMediaAPI();
