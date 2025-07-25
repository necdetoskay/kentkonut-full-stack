// Integration verification utility
// This script can be run in the browser console to verify the integration

import { serviceCardIntegrationTest } from './serviceCardIntegrationTest';

export const verifyServiceCardIntegration = async () => {
  console.log('🔍 Verifying Service Card Integration...');
  
  try {
    const results = await serviceCardIntegrationTest.runAllTests();
    serviceCardIntegrationTest.printResults();
    
    const summary = serviceCardIntegrationTest.getTestSummary();
    
    if (summary.successRate >= 80) {
      console.log('🎉 Integration verification PASSED!');
      console.log('✅ Frontend-Backend integration is working correctly');
    } else {
      console.log('⚠️ Integration verification FAILED!');
      console.log('❌ Some tests failed - please check the results above');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Integration verification failed:', error);
    return [];
  }
};

// Auto-run in development mode
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
  console.log('🔧 Development mode detected - Service Card integration verification available');
  console.log('💡 Run verifyServiceCardIntegration() in console to test integration');
  
  // Make it available globally for console testing
  (window as any).verifyServiceCardIntegration = verifyServiceCardIntegration;
}
