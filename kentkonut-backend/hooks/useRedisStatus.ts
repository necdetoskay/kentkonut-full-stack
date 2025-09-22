"use client";

import { useState, useEffect, useCallback } from 'react';

interface RedisStatus {
  connected: boolean;
  error: string | null;
  timestamp: string;
  loading: boolean;
}

export function useRedisStatus() {
  const [status, setStatus] = useState<RedisStatus>({
    connected: false,
    error: null,
    timestamp: new Date().toISOString(),
    loading: true
  });

  const checkRedisStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const response = await fetch('/api/system/redis-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: data.connected,
          error: data.error,
          timestamp: data.timestamp,
          loading: false
        });
      } else {
        // If unauthorized or other error, assume disconnected
        setStatus({
          connected: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
          loading: false
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkRedisStatus();

    // Set up interval to check every 10 seconds
    const interval = setInterval(checkRedisStatus, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [checkRedisStatus]);

  return {
    ...status,
    refresh: checkRedisStatus
  };
}
