'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target, 
  Users,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

interface BannerSummary {
  id: number;
  title: string;
  groupName: string;
  isActive: boolean;
  impressions: number;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  revenue: number;
  lastActivity: string;
}

interface OverallMetrics {
  totalBanners: number;
  activeBanners: number;
  totalImpressions: number;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgCTR: number;
  avgConversionRate: number;
}

export default function AnalyticsDashboard() {
  const [banners, setBanners] = useState<BannerSummary[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('impressions');
  const [period, setPeriod] = useState('7d');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchAnalyticsOverview();
  }, [period, filterActive]);

  const fetchAnalyticsOverview = async () => {
    setLoading(true);
    try {
      // This would be a real API call in production
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in production this would come from the API
      const mockBanners: BannerSummary[] = [
        {
          id: 1,
          title: 'Ana Sayfa Hero Banner',
          groupName: 'Ana Sayfa',
          isActive: true,
          impressions: 15420,
          views: 12350,
          clicks: 890,
          conversions: 45,
          ctr: 7.21,
          conversionRate: 5.06,
          revenue: 4500.00,
          lastActivity: '2025-01-24T10:30:00Z'
        },
        {
          id: 2,
          title: 'Ürün Tanıtım Banner',
          groupName: 'Ürünler',
          isActive: true,
          impressions: 8750,
          views: 6200,
          clicks: 420,
          conversions: 28,
          ctr: 6.77,
          conversionRate: 6.67,
          revenue: 2800.00,
          lastActivity: '2025-01-24T09:15:00Z'
        },
        {
          id: 3,
          title: 'Kampanya Banner',
          groupName: 'Kampanyalar',
          isActive: false,
          impressions: 5200,
          views: 3800,
          clicks: 180,
          conversions: 8,
          ctr: 4.74,
          conversionRate: 4.44,
          revenue: 800.00,
          lastActivity: '2025-01-23T16:45:00Z'
        }
      ];

      const mockOverallMetrics: OverallMetrics = {
        totalBanners: mockBanners.length,
        activeBanners: mockBanners.filter(b => b.isActive).length,
        totalImpressions: mockBanners.reduce((sum, b) => sum + b.impressions, 0),
        totalViews: mockBanners.reduce((sum, b) => sum + b.views, 0),
        totalClicks: mockBanners.reduce((sum, b) => sum + b.clicks, 0),
        totalConversions: mockBanners.reduce((sum, b) => sum + b.conversions, 0),
        totalRevenue: mockBanners.reduce((sum, b) => sum + b.revenue, 0),
        avgCTR: mockBanners.reduce((sum, b) => sum + b.ctr, 0) / mockBanners.length,
        avgConversionRate: mockBanners.reduce((sum, b) => sum + b.conversionRate, 0) / mockBanners.length
      };

      setBanners(mockBanners);
      setOverallMetrics(mockOverallMetrics);
    } catch (error) {
      console.error('Analytics overview fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = banners
    .filter(banner => {
      const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           banner.groupName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterActive === 'all' || 
                           (filterActive === 'active' && banner.isActive) ||
                           (filterActive === 'inactive' && !banner.isActive);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'impressions':
          return b.impressions - a.impressions;
        case 'clicks':
          return b.clicks - a.clicks;
        case 'ctr':
          return b.ctr - a.ctr;
        case 'conversions':
          return b.conversions - a.conversions;
        case 'revenue':
          return b.revenue - a.revenue;
        default:
          return 0;
      }
    });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Banner Analytics</h1>
          <p className="text-muted-foreground">
            Banner performanslarını izleyin ve analiz edin
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Son 24 Saat</SelectItem>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="90d">Son 90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsOverview} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      {overallMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Banner</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.totalBanners}</div>
              <p className="text-xs text-muted-foreground">
                {overallMetrics.activeBanners} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overallMetrics.totalViews)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(overallMetrics.totalImpressions)} gösterim
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overallMetrics.totalClicks)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(overallMetrics.avgCTR)} ortalama CTR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overallMetrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {overallMetrics.totalConversions} dönüşüm
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Banner ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impressions">Gösterim</SelectItem>
                <SelectItem value="clicks">Tıklama</SelectItem>
                <SelectItem value="ctr">CTR</SelectItem>
                <SelectItem value="conversions">Dönüşüm</SelectItem>
                <SelectItem value="revenue">Gelir</SelectItem>
                <SelectItem value="title">İsim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Banner List */}
          <div className="space-y-4">
            {filteredBanners.map((banner) => (
              <div key={banner.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{banner.title}</h3>
                      <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                        {banner.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {banner.groupName}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Görüntülenme</span>
                        <div className="font-medium">{formatNumber(banner.views)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tıklama</span>
                        <div className="font-medium">{formatNumber(banner.clicks)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CTR</span>
                        <div className="font-medium">{formatPercentage(banner.ctr)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dönüşüm</span>
                        <div className="font-medium">{banner.conversions}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dönüşüm Oranı</span>
                        <div className="font-medium">{formatPercentage(banner.conversionRate)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gelir</span>
                        <div className="font-medium">{formatCurrency(banner.revenue)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/banner-groups/1/banners/${banner.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </Link>
                    <Link href={`/dashboard/banner-groups/1/banners/${banner.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBanners.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">Banner Bulunamadı</h3>
              <p className="text-sm text-gray-500">
                Arama kriterlerinize uygun banner bulunmuyor.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
