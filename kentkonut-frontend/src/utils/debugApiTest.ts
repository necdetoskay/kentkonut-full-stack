// Debug utility for testing API connections
import { getApiBaseUrl } from '../config/ports';

export const testBackendConnection = async () => {
  const backendUrl = getApiBaseUrl();
  
  console.log('🔧 Testing backend connection...');
  console.log('🔧 Backend URL:', backendUrl);
  
  try {
    // Test basic connection
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    console.log('❤️ Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('❤️ Health check data:', healthData);
    }
    
    // Test banner endpoint
    const bannerResponse = await fetch(`${backendUrl}/api/public/banners`);
    console.log('🎯 Banner API status:', bannerResponse.status);
    
    if (bannerResponse.ok) {
      const bannerData = await bannerResponse.json();
      console.log('🎯 Banner API data:', bannerData);
      console.log('🎯 Banner groups count:', bannerData.length);
      
      if (bannerData.length > 0) {
        console.log('🎯 First group:', bannerData[0]);
        console.log('🎯 First group banners:', bannerData[0].banners?.length || 0);
      }
      
      return bannerData;
    } else {
      console.error('❌ Banner API failed with status:', bannerResponse.status);
      const errorText = await bannerResponse.text();
      console.error('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.error('❌ Error details:', error.message);
  }
};

// Auto-run in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testBackendConnection();
  }, 1000);
}
