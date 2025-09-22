import React, { useState, useEffect } from 'react';
import { serviceCardService } from '../services/serviceCardService';
import { ServiceCard } from '../types/serviceCard';

const ServiceCardAPITest: React.FC = () => {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAPIConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResults([]);
    
    try {
      addTestResult('🔍 Testing API connection...');
      
      // Test fetching service cards
      const data = await serviceCardService.getActiveServiceCards({ limit: 10 });
      
      if (data && data.length > 0) {
        setServices(data);
        addTestResult(`✅ Successfully fetched ${data.length} service cards`);
        
        // Test click tracking on first service
        if (data[0]) {
          addTestResult(`🖱️ Testing click tracking for: ${data[0].title}`);
          const clickResult = await serviceCardService.trackCardClick(data[0].id);
          addTestResult(`${clickResult ? '✅' : '❌'} Click tracking ${clickResult ? 'successful' : 'failed'}`);
        }
        
        // Test image URL generation
        data.forEach(service => {
          const imageUrl = serviceCardService.getImageUrl(service.imageUrl);
          addTestResult(`🖼️ Image URL for ${service.title}: ${imageUrl}`);
        });
        
      } else {
        addTestResult('⚠️ No service cards received');
        setError('No service cards found');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addTestResult(`❌ API test failed: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPIConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Service Card API Test</h2>
        
        <div className="mb-6">
          <button
            onClick={testAPIConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>
        </div>

        {/* Test Results */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Service Cards Display */}
        {services.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Fetched Service Cards ({services.length}):</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <img
                      src={serviceCardService.getImageUrl(service.imageUrl)}
                      alt={service.altText || service.title}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xMDAgNjQtMjUtMjUtMjUgMjUtMTUtMTUtMzUgMjV2MTVoOTB2LTE1eiIgZmlsbD0iIzljYTNhZiIvPgo8Y2lyY2xlIGN4PSI4NSIgY3k9IjUwIiByPSIxMCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <h4 className="font-semibold text-lg mb-2" style={{ color: service.color }}>
                    {service.title}
                  </h4>
                  {service.shortDescription && (
                    <p className="text-gray-600 text-sm mb-2">{service.shortDescription}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID: {service.id}</div>
                    <div>Slug: {service.slug}</div>
                    <div>Order: {service.displayOrder}</div>
                    <div>Featured: {service.isFeatured ? 'Yes' : 'No'}</div>
                    <div>Clicks: {service.clickCount}</div>
                    <div>Views: {service.viewCount}</div>
                    {service.targetUrl && (
                      <div>Target: {service.targetUrl} {service.isExternal ? '(External)' : '(Internal)'}</div>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const result = await serviceCardService.trackCardClick(service.id);
                      addTestResult(`🖱️ Click tracked for ${service.title}: ${result ? 'Success' : 'Failed'}`);
                    }}
                    className="mt-3 w-full bg-green-500 hover:bg-green-700 text-white text-sm py-1 px-2 rounded"
                  >
                    Test Click Tracking
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCardAPITest;
