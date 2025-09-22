'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Users, Clock, TrendingUp, Share2, Heart, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PageStatisticsProps {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
}

interface StatisticsData {
  page: {
    id: string;
    title: string;
    slug: string;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  totals: {
    views: number;
    uniqueVisitors: number;
    avgBounceRate: number;
    avgTimeOnPage: number;
  };
  recent: {
    views: number;
    period: string;
  };
  dailyStats: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    bounceRate?: number;
    avgTimeOnPage?: number;
    organicTraffic: number;
    shares: number;
    likes: number;
    comments: number;
  }>;
}

export default function PageStatistics({ pageId, pageTitle, pageSlug }: PageStatisticsProps) {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageId}/statistics?days=${period}`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      } else {
        toast.error(data.error || 'İstatistikler yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [pageId, period]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sayfa İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sayfa İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">İstatistik verisi bulunamadı</p>
            <Button onClick={fetchStatistics} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sayfa İstatistikleri
              </CardTitle>
              <CardDescription>
                {pageTitle} sayfasının performans metrikleri
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Son 7 gün</SelectItem>
                  <SelectItem value="30">Son 30 gün</SelectItem>
                  <SelectItem value="90">Son 90 gün</SelectItem>
                  <SelectItem value="365">Son 1 yıl</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchStatistics} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold">{formatNumber(statistics.totals.views)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Benzersiz Ziyaretçi</p>
                <p className="text-2xl font-bold">{formatNumber(statistics.totals.uniqueVisitors)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ort. Sayfa Süresi</p>
                <p className="text-2xl font-bold">
                  {statistics.totals.avgTimeOnPage > 0 
                    ? formatTime(statistics.totals.avgTimeOnPage)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Çıkış Oranı</p>
                <p className="text-2xl font-bold">
                  {statistics.totals.avgBounceRate > 0 
                    ? `${statistics.totals.avgBounceRate}%`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son 7 Günlük Aktivite</CardTitle>
          <CardDescription>
            Son 7 günde {formatNumber(statistics.recent.views)} görüntülenme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statistics.dailyStats.slice(-7).map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Date(stat.date).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatNumber(stat.uniqueVisitors)} benzersiz ziyaretçi
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatNumber(stat.views)}</p>
                  <p className="text-sm text-gray-600">görüntülenme</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Sosyal Etkileşim</CardTitle>
          <CardDescription>
            Sayfa ile ilgili sosyal medya aktiviteleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Share2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {formatNumber(statistics.dailyStats.reduce((sum, stat) => sum + stat.shares, 0))}
              </p>
              <p className="text-sm text-gray-600">Paylaşım</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {formatNumber(statistics.dailyStats.reduce((sum, stat) => sum + stat.likes, 0))}
              </p>
              <p className="text-sm text-gray-600">Beğeni</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {formatNumber(statistics.dailyStats.reduce((sum, stat) => sum + stat.comments, 0))}
              </p>
              <p className="text-sm text-gray-600">Yorum</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
