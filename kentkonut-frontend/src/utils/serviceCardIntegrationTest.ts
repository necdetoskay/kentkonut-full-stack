import { serviceCardService } from '../services/serviceCardService';
import { getApiBaseUrl } from '../config/ports';

export interface IntegrationTestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  duration?: number;
}

export class ServiceCardIntegrationTest {
  private results: IntegrationTestResult[] = [];

  async runAllTests(): Promise<IntegrationTestResult[]> {
    this.results = [];
    
    console.log('🧪 Starting Service Card Integration Tests...');
    
    await this.testAPIConnection();
    await this.testFetchServiceCards();
    await this.testImageURLGeneration();
    await this.testClickTracking();
    await this.testErrorHandling();
    
    console.log('✅ Integration tests completed');
    return this.results;
  }

  private async testAPIConnection(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test basic API connectivity
      const response = await fetch(`${getApiBaseUrl()}/api/public/hizmetlerimiz`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        this.results.push({
          testName: 'API Connection',
          success: true,
          message: `API is reachable (${response.status})`,
          duration
        });
      } else {
        this.results.push({
          testName: 'API Connection',
          success: false,
          message: `API returned ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.results.push({
        testName: 'API Connection',
        success: false,
        message: 'Failed to connect to API',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  private async testFetchServiceCards(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const serviceCards = await serviceCardService.getActiveServiceCards();
      const duration = Date.now() - startTime;
      
      if (serviceCards && serviceCards.length > 0) {
        this.results.push({
          testName: 'Fetch Service Cards',
          success: true,
          message: `Successfully fetched ${serviceCards.length} service cards`,
          data: serviceCards,
          duration
        });
      } else {
        this.results.push({
          testName: 'Fetch Service Cards',
          success: false,
          message: 'No service cards returned',
          duration
        });
      }
    } catch (error) {
      this.results.push({
        testName: 'Fetch Service Cards',
        success: false,
        message: 'Failed to fetch service cards',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  private async testImageURLGeneration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const serviceCards = await serviceCardService.getActiveServiceCards({ limit: 1 });
      
      if (serviceCards && serviceCards.length > 0) {
        const card = serviceCards[0];
        const imageUrl = serviceCardService.getImageUrl(card.imageUrl);
        
        // Test if the generated URL is valid
        const isValidUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
        
        this.results.push({
          testName: 'Image URL Generation',
          success: isValidUrl,
          message: isValidUrl ? `Generated valid image URL: ${imageUrl}` : `Invalid image URL: ${imageUrl}`,
          data: { originalUrl: card.imageUrl, generatedUrl: imageUrl },
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          testName: 'Image URL Generation',
          success: false,
          message: 'No service cards available for testing',
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        testName: 'Image URL Generation',
        success: false,
        message: 'Failed to test image URL generation',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  private async testClickTracking(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const serviceCards = await serviceCardService.getActiveServiceCards({ limit: 1 });
      
      if (serviceCards && serviceCards.length > 0) {
        const card = serviceCards[0];
        const clickResult = await serviceCardService.trackCardClick(card.id);
        
        this.results.push({
          testName: 'Click Tracking',
          success: clickResult,
          message: clickResult ? `Successfully tracked click for ${card.title}` : `Failed to track click for ${card.title}`,
          data: { cardId: card.id, cardTitle: card.title },
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          testName: 'Click Tracking',
          success: false,
          message: 'No service cards available for testing',
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        testName: 'Click Tracking',
        success: false,
        message: 'Failed to test click tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test with invalid card ID
      const clickResult = await serviceCardService.trackCardClick(99999);
      
      // This should return false for invalid ID, not throw an error
      this.results.push({
        testName: 'Error Handling',
        success: !clickResult, // We expect this to fail gracefully
        message: clickResult ? 'Unexpected success with invalid ID' : 'Properly handled invalid card ID',
        duration: Date.now() - startTime
      });
    } catch (error) {
      // If it throws an error, that's also acceptable error handling
      this.results.push({
        testName: 'Error Handling',
        success: true,
        message: 'Properly threw error for invalid card ID',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  getTestSummary(): { total: number; passed: number; failed: number; successRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;
    
    return { total, passed, failed, successRate };
  }

  printResults(): void {
    console.log('\n📊 Service Card Integration Test Results:');
    console.log('=' .repeat(50));
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${status} ${result.testName}: ${result.message}${duration}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const summary = this.getTestSummary();
    console.log('\n📈 Summary:');
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${summary.successRate.toFixed(1)}%`);
  }
}

// Export singleton instance
export const serviceCardIntegrationTest = new ServiceCardIntegrationTest();
