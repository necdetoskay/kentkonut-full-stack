"use client";

import { useState, useEffect, useCallback } from 'react';
import { corporateApiFetch } from '@/utils/corporateApi';

export interface VersionInfo {
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  changes: string[];
  type: 'initial' | 'feature' | 'bugfix' | 'infrastructure' | 'security';
  author: string;
}

interface UseVersionInfoReturn {
  versionInfo: VersionInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVersionInfo(type: 'current' | 'latest' | 'basic' = 'current'): UseVersionInfoReturn {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersionInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await corporateApiFetch<any>(`/api/system/version?type=${type}`);
      setVersionInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchVersionInfo();
  }, [fetchVersionInfo]);

  return {
    versionInfo,
    loading,
    error,
    refresh: fetchVersionInfo
  };
}

interface UseVersionHistoryReturn {
  versions: VersionInfo[];
  currentVersion: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVersionHistory(): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersionHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/system/version?type=history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
        setCurrentVersion(data.currentVersion || '');
      } else {
        const errorData = await response.json();
        setError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVersionHistory();
  }, [fetchVersionHistory]);

  return {
    versions,
    currentVersion,
    loading,
    error,
    refresh: fetchVersionHistory
  };
}

// Update version info
export async function updateVersionInfo(updates: Partial<VersionInfo>): Promise<boolean> {
  try {
    const response = await fetch('/api/system/version', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_current',
        ...updates
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating version info:', error);
    return false;
  }
}

// Add new version
export async function addNewVersion(versionData: Omit<VersionInfo, 'releaseDate'>): Promise<boolean> {
  try {
    const response = await fetch('/api/system/version', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add_version',
        ...versionData
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error adding new version:', error);
    return false;
  }
}
