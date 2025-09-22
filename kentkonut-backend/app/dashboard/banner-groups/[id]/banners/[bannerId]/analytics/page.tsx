'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, Eye, MousePointer, Target, Users, Clock, Loader2, BarChart3 } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'

interface BannerAnalyticsPageProps {
  params: Promise<{
    id: string
    bannerId: string
  }>
}

interface AnalyticsData {
  banner: {
    id: number
    title: string
    createdAt: string
  }
  period: {
    start: string
    end: string
    granularity: string
  }
  metrics: {
    totalImpressions: number
    totalViews: number
    totalClicks: number
    totalConversions: number
    totalBounces: number
    uniqueUsers: number
    clickThroughRate: number
    conversionRate: number
    bounceRate: number
    avgEngagementTime: number
  }
  breakdowns: {
    devices: Record<string, number>
    countries: Record<string, number>
    referrers: Record<string, number>
  }
  timeSeries: Array<{
    date: string
    hour?: number
    impressions: number
    views: number
    clicks: number
    conversions: number
    ctr: number
    conversionRate: number
    bounceRate: number
    avgEngagementTime: number
  }>
}

export default function BannerAnalyticsPage({ params }: BannerAnalyticsPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('7d')
  const [granularity, setGranularity] = useState('daily')

  // Unwrap params Promise for Next.js 15 compatibility
  const unwrappedParams = use(params) as { id: string; bannerId: string }

  useEffect(() => {
    fetchAnalytics()
  }, [unwrappedParams.bannerId, period, granularity])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/analytics/banners/${unwrappedParams.bannerId}?period=${period}&granularity=${granularity}`
      )
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        alert('Analytics verileri yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      alert('Analytics verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Analytics yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Analytics Bulunamadı</h1>
          <p className="text-gray-600 mt-2">Banner analytics verileri bulunamadı.</p>
          <Link href={`/dashboard/banner-groups/${unwrappedParams.id}/banners/${unwrappedParams.bannerId}`}>
            <Button className="mt-4">
              Banner Detayına Dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        segments={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Banner Grupları', href: '/dashboard/banner-groups' },
          { name: 'Banner Grubu', href: `/dashboard/banner-groups/${unwrappedParams.id}` },
          { name: 'Bannerlar', href: `/dashboard/banner-groups/${unwrappedParams.id}` },
          { name: analyticsData.banner.title, href: `/dashboard/banner-groups/${unwrappedParams.id}/banners/${unwrappedParams.bannerId}` },
          { name: 'Analytics', href: '#' }
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/banner-groups/${unwrappedParams.id}/banners/${unwrappedParams.bannerId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Banner Analytics
          </h1>
          <p className="text-muted-foreground">{analyticsData.banner.title}</p>
        </div>
        
        {/* Period and Granularity Selectors */}
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
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
              <SelectItem value="hourly">Saatlik</SelectItem>
              <SelectItem value="daily">Günlük</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.metrics.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.metrics.uniqueUsers)} benzersiz kullanıcı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.metrics.totalClicks)}</div>
            <p className="text-xs text-muted-foreground">
              CTR: {formatPercentage(analyticsData.metrics.clickThroughRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşümler</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.metrics.totalConversions)}</div>
            <p className="text-xs text-muted-foreground">
              Oran: {formatPercentage(analyticsData.metrics.conversionRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Etkileşim</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analyticsData.metrics.avgEngagementTime)}</div>
            <p className="text-xs text-muted-foreground">
              Çıkma oranı: {formatPercentage(analyticsData.metrics.bounceRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                .sort(([,a], [,b]) => b - a)
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

      {/* Time Series Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performans Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Grafik görünümü yakında eklenecek</p>
              <p className="text-sm text-gray-500 mt-1">
                {analyticsData.timeSeries.length} veri noktası mevcut
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
