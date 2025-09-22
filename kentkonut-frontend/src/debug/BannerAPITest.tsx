import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import bannerService, { BANNER_POSITION_UUIDS } from '../services/bannerService';
import { getApiBaseUrl } from '../config/ports';

export function BannerAPITest() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', data: any) => {
    setResults(prev => [...prev, { test, status, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);

    // Test 1: Health check
    try {
      const healthResponse = await apiClient.get('/api/health');
      addResult('Health Check', 'success', healthResponse);
    } catch (error) {
      addResult('Health Check', 'error', error);
    }

    // Test 2: Direct fetch to health endpoint
    try {
      const directResponse = await fetch(`${getApiBaseUrl()}/api/health`);
      const directData = await directResponse.json();
      addResult('Direct Health Check', 'success', { status: directResponse.status, data: directData });
    } catch (error) {
      addResult('Direct Health Check', 'error', error);
    }

    // Test 3: Banner position endpoint
    try {
      const bannerResponse = await apiClient.get(`/api/public/banners/position/${BANNER_POSITION_UUIDS.HERO}`);
      addResult('Banner Position API', 'success', bannerResponse);
    } catch (error) {
      addResult('Banner Position API', 'error', error);
    }

    // Test 4: Direct fetch to banner endpoint
    try {
      const directBannerResponse = await fetch(`${getApiBaseUrl()}/api/public/banners/position/${BANNER_POSITION_UUIDS.HERO}`);
      const directBannerData = await directBannerResponse.json();
      addResult('Direct Banner Position', 'success', { 
        status: directBannerResponse.status, 
        headers: Object.fromEntries(directBannerResponse.headers.entries()),
        data: directBannerData 
      });
    } catch (error) {
      addResult('Direct Banner Position', 'error', error);
    }

    // Test 5: Banner service method
    try {
      const serviceResponse = await bannerService.getHeroBannerByUUID();
      addResult('Banner Service Method', 'success', serviceResponse);
    } catch (error) {
      addResult('Banner Service Method', 'error', error);
    }

    // Test 6: CORS preflight test
    try {
      const corsResponse = await fetch(`${getApiBaseUrl()}/api/public/banners/position/${BANNER_POSITION_UUIDS.HERO}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      addResult('CORS Preflight', 'success', { 
        status: corsResponse.status,
        headers: Object.fromEntries(corsResponse.headers.entries())
      });
    } catch (error) {
      addResult('CORS Preflight', 'error', error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Banner API Connection Test</h1>
        <p className="text-gray-600">Testing connection between frontend and backend API</p>
        <div className="mt-4">
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Backend URL:</strong> {getApiBaseUrl()}</p>
          <p><strong>Hero UUID:</strong> {BANNER_POSITION_UUIDS.HERO}</p>
        </div>
      </div>

      <div className="mb-4">
        <button 
          onClick={runTests}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded border ${
              result.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{result.test}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                result.status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {result.timestamp}
            </div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {results.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">
          No test results yet. Click "Run Tests" to start.
        </div>
      )}
    </div>
  );
}
