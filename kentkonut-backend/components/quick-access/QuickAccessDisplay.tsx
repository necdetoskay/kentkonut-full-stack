'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Link as LinkIcon,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface QuickAccessLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  moduleType: string;
  moduleId: string | number;
  createdAt: string;
  updatedAt: string;
}

interface QuickAccessDisplayProps {
  moduleType: 'page' | 'news' | 'project' | 'department';
  moduleId: string | number;
  title?: string;
  variant?: 'default' | 'compact' | 'sidebar' | 'inline';
  showTitle?: boolean;
  showCount?: boolean;
  maxItems?: number;
  className?: string;
  enableCache?: boolean; // Enable client-side caching
  lazy?: boolean; // Enable lazy loading
}

export function QuickAccessDisplay({
  moduleType,
  moduleId,
  title = 'Hızlı Erişim',
  variant = 'default',
  showTitle = true,
  showCount = false,
  maxItems,
  className = '',
  enableCache = true,
  lazy = false
}: QuickAccessDisplayProps) {
  const [links, setLinks] = useState<QuickAccessLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);

  // Client-side cache
  const cacheKey = useMemo(() =>
    `quick-access-${moduleType}-${moduleId}`,
    [moduleType, moduleId]
  );

  // Get cached data
  const getCachedData = useCallback(() => {
    if (!enableCache || typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

        if (!isExpired) {
          return data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('Failed to get cached data:', error);
    }

    return null;
  }, [cacheKey, enableCache]);

  // Set cached data
  const setCachedData = useCallback((data: QuickAccessLink[]) => {
    if (!enableCache || typeof window === 'undefined') return;

    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [cacheKey, enableCache]);

  // Fetch links for this module
  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached data first
      const cachedData = getCachedData();
      if (cachedData) {
        // Ensure cached data is an array
        const cachedArray = Array.isArray(cachedData) ? cachedData : [];
        let filteredLinks = cachedArray.filter((link: QuickAccessLink) => link.isActive);

        // Apply maxItems limit if specified
        if (maxItems && maxItems > 0) {
          filteredLinks = filteredLinks.slice(0, maxItems);
        }

        setLinks(filteredLinks);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/quick-access-links/module/${moduleType}/${moduleId}`);

      if (response.ok) {
        const responseData = await response.json();

        // Extract data from API response (API returns { data: [...], message, timestamp })
        const data = responseData.data || responseData;

        // Ensure data is an array
        const linksArray = Array.isArray(data) ? data : [];

        // Cache the raw data
        setCachedData(linksArray);

        let filteredLinks = linksArray.filter((link: QuickAccessLink) => link.isActive);

        // Apply maxItems limit if specified
        if (maxItems && maxItems > 0) {
          filteredLinks = filteredLinks.slice(0, maxItems);
        }

        setLinks(filteredLinks);
      } else if (response.status === 404) {
        // Module not found or no links - this is normal
        setLinks([]);
        setCachedData([]);
      } else {
        setError('Hızlı erişim linkleri yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching quick access links:', error);
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [moduleType, moduleId, maxItems, getCachedData, setCachedData]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`quick-access-${cacheKey}`);
    if (element && element instanceof Node) {
      observer.observe(element);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [lazy, cacheKey]);

  useEffect(() => {
    if (moduleId && isVisible) {
      fetchLinks();
    }
  }, [moduleType, moduleId, isVisible, fetchLinks]);

  // Lazy loading placeholder
  if (lazy && !isVisible) {
    return (
      <div
        id={`quick-access-${cacheKey}`}
        className={`${className} min-h-[100px] bg-gray-50 rounded-lg flex items-center justify-center`}
      >
        <div className="text-gray-400 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  // Don't render anything if no links and not loading
  if (!loading && links.length === 0 && !error) {
    return null;
  }

  // Render loading state
  if (loading) {
    return (
      <Card className={`${className} ${variant === 'compact' ? 'border-0 shadow-none' : ''}`}>
        {showTitle && (
          <CardHeader className={variant === 'compact' ? 'pb-2' : ''}>
            <CardTitle className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={`${className} ${variant === 'compact' ? 'border-0 shadow-none' : ''}`}>
        {showTitle && (
          <CardHeader className={variant === 'compact' ? 'pb-2' : ''}>
            <CardTitle className="flex items-center gap-2 text-sm text-red-600">
              <LinkIcon className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Render variants
  switch (variant) {
    case 'inline':
      return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
          {showTitle && (
            <span className="text-sm font-medium text-gray-700">{title}:</span>
          )}
          {links.map((link, index) => (
            <span key={link.id}>
              <Link 
                href={link.url}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {link.title}
              </Link>
              {index < links.length - 1 && <span className="text-gray-400 mx-1">•</span>}
            </span>
          ))}
          {showCount && (
            <Badge variant="secondary" className="text-xs">
              {links.length}
            </Badge>
          )}
        </div>
      );

    case 'sidebar':
      return (
        <div className={`space-y-1 ${className}`}>
          {showTitle && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {title}
                {showCount && (
                  <Badge variant="secondary" className="text-xs">
                    {links.length}
                  </Badge>
                )}
              </h3>
              {links.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-6 w-6 p-0"
                >
                  {collapsed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              )}
            </div>
          )}
          <div className="space-y-1">
            {(collapsed ? links.slice(0, 3) : links).map((link) => (
              <Link 
                key={link.id}
                href={link.url}
                className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md group transition-colors"
              >
                <span className="truncate">{link.title}</span>
                <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
              </Link>
            ))}
            {collapsed && links.length > 3 && (
              <button
                onClick={() => setCollapsed(false)}
                className="w-full text-left p-2 text-xs text-gray-500 hover:text-gray-700"
              >
                +{links.length - 3} daha fazla...
              </button>
            )}
          </div>
        </div>
      );

    case 'compact':
      return (
        <Card className={`${className} border-0 shadow-none bg-gray-50`}>
          {showTitle && (
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  {title}
                </span>
                {showCount && (
                  <Badge variant="secondary" className="text-xs">
                    {links.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-1">
              {links.map((link) => (
                <Link 
                  key={link.id}
                  href={link.url}
                  className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-white rounded border hover:shadow-sm transition-all group"
                >
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    default: // 'default'
      return (
        <Card className={className}>
          {showTitle && (
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  {title}
                </span>
                {showCount && (
                  <Badge variant="secondary">
                    {links.length} link
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {links.map((link) => (
                <Link 
                  key={link.id}
                  href={link.url}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{link.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      );
  }
}
