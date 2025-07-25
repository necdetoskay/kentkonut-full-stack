'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, Clock, Users, DollarSign, RefreshCw, BarChart3 } from 'lucide-react';

interface PerformanceMetrics {
  totalImpressions: number;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  totalBounces: number;
  uniqueUsers: number;
  clickThroughRate: number;
  conversionRate: number;
  bounceRate: number;
  viewRate: number;
  avgEngagementTime: number;
  totalRevenue: number;
  avgConversionValue: number;
  revenuePerImpression: number;
  revenuePerClick: number;
}

interface ComparisonData {
  current: number;
  previous: number;
  change: number;
}

interface AnalyticsData {
  banner: {
    id: number;
    title: string;
    createdAt: string;
  };
  summary: PerformanceMetrics;
  comparison: {
    impressions: ComparisonData;
    views: ComparisonData;
    clicks: ComparisonData;
    conversions: ComparisonData;
  };
  breakdowns: {
    devices: Record<string, number>;
    countries: Record<string, number>;
    browsers: Record<string, number>;
    referrers: Record<string, number>;
  };
  timeSeries: Array<{
    timestamp: string;
    impressions: number;
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }>;
  metadata: {
    dataQuality: number;
    sampleSize: number;
    lastUpdated: string;
  };
}

interface DashboardProps {
  bannerId: number;
  initialPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export function BannerPerformanceDashboard({ 
  bannerId, 
  initialPeriod = '7d',
  onPeriodChange 
}: DashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(initialPeriod);
  const [granularity, setGranularity] = useState('day');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [bannerId, period, granularity]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/analytics/banners/${bannerId}/performance?period=${period}&granularity=${granularity}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        setError(data.error || 'Analytics verileri yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('Analytics verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

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

  const formatTime = (milliseconds: number): string => {
    const seconds = milliseconds / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(2)}%`;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Analytics Hatası</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">Veri Bulunamadı</h3>
        <p className="text-sm text-gray-500">Bu banner için analytics verisi bulunmuyor.</p>
      </div>
    );
  }

  const MetricCard = ({ 
    title, 
    value, 
    comparison, 
    icon: Icon, 
    formatter = formatNumber,
    suffix = '' 
  }: {
    title: string;
    value: number;
    comparison?: ComparisonData;
    icon: React.ElementType;
    formatter?: (value: number) => string;
    suffix?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatter(value)}{suffix}
        </div>
        {comparison && (
          <div className={`flex items-center text-xs ${getChangeColor(comparison.change)}`}>
            {getChangeIcon(comparison.change)}
            <span className="ml-1">
              {Math.abs(comparison.change).toFixed(1)}% önceki döneme göre
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Banner Analytics</h2>
          <p className="text-muted-foreground">{analyticsData.banner.title}</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
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
          
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Saatlik</SelectItem>
              <SelectItem value="day">Günlük</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Görüntülenme"
          value={analyticsData.summary.totalViews}
          comparison={analyticsData.comparison.views}
          icon={Eye}
        />
        <MetricCard
          title="Tıklama"
          value={analyticsData.summary.totalClicks}
          comparison={analyticsData.comparison.clicks}
          icon={MousePointer}
        />
        <MetricCard
          title="Dönüşüm"
          value={analyticsData.summary.totalConversions}
          comparison={analyticsData.comparison.conversions}
          icon={Target}
        />
        <MetricCard
          title="Gelir"
          value={analyticsData.summary.totalRevenue}
          icon={DollarSign}
          formatter={formatCurrency}
        />
        <MetricCard
          title="Tıklama Oranı"
          value={analyticsData.summary.clickThroughRate}
          icon={TrendingUp}
          formatter={(v) => v.toFixed(2)}
          suffix="%"
        />
        <MetricCard
          title="Dönüşüm Oranı"
          value={analyticsData.summary.conversionRate}
          icon={Target}
          formatter={(v) => v.toFixed(2)}
          suffix="%"
        />
        <MetricCard
          title="Ortalama Etkileşim"
          value={analyticsData.summary.avgEngagementTime}
          icon={Clock}
          formatter={formatTime}
        />
        <MetricCard
          title="Benzersiz Kullanıcı"
          value={analyticsData.summary.uniqueUsers}
          icon={Users}
        />
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cihaz Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analyticsData.breakdowns.devices).map(([device, count]) => (
                <div key={device} className="flex justify-between items-center">
                  <span className="capitalize">{device}</span>
                  <Badge variant="secondary">{formatNumber(count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Country Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Ülke Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analyticsData.breakdowns.countries)
                .slice(0, 5)
                .map(([country, count]) => (
                <div key={country} className="flex justify-between items-center">
                  <span>{country || 'Bilinmeyen'}</span>
                  <Badge variant="secondary">{formatNumber(count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>En Çok Yönlendiren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analyticsData.breakdowns.referrers)
                .slice(0, 5)
                .map(([referrer, count]) => (
                <div key={referrer} className="flex justify-between items-center">
                  <span className="truncate text-sm" title={referrer}>
                    {referrer.length > 20 ? `${referrer.substring(0, 20)}...` : referrer}
                  </span>
                  <Badge variant="secondary">{formatNumber(count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Kalitesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Son güncelleme: {new Date(analyticsData.metadata.lastUpdated).toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-muted-foreground">
                Örnek boyutu: {formatNumber(analyticsData.metadata.sampleSize)} olay
              </p>
            </div>
            <Badge variant={analyticsData.metadata.dataQuality >= 0.9 ? 'default' : 'secondary'}>
              Kalite: {(analyticsData.metadata.dataQuality * 100).toFixed(0)}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
