"use client"

import { useState, useEffect } from "react"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"

interface BannerStatisticsProps {
  groupId: string;
  banners: any[]; // Banner tipini gelen veri yapısına göre düzenle
}

export function BannerStatistics({ groupId, banners }: BannerStatisticsProps) {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week'); // day, week, month, year
  const [chartType, setChartType] = useState('line'); // line, bar, pie
  
  // İstatistikleri yükle
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/banner-groups/${groupId}/statistics?period=${period}`);
        
        if (!response.ok) {
          throw new Error('İstatistikler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error("İstatistik yükleme hatası:", error);
        toast.error("İstatistikler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, [groupId, period]);

  // Yükleme göstergesi
  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>;
  }
  
  // Veri yoksa
  if (!statistics || !statistics.data || statistics.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Bu banner grubu için henüz istatistik verisi bulunmamaktadır.</p>
      </div>
    );
  }

  // Statistics yapısını analiz ederek grafiklere dönüştür
  const { totalViews, totalClicks, dailyStats, bannerStats } = statistics;
  
  // COLORS dizisi, grafikler için renk paleti
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8'];
  
  return (
    <div className="space-y-6">
      {/* İstatistik Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tıklama Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews ? `${((totalClicks / totalViews) * 100).toFixed(2)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktif Bannerlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter(b => b.active).length}/{banners.length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtreleme ve Grafik Kontrolleri */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Periyot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Günlük</SelectItem>
              <SelectItem value="week">Haftalık</SelectItem>
              <SelectItem value="month">Aylık</SelectItem>
              <SelectItem value="year">Yıllık</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Grafik Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Çizgi Grafik</SelectItem>
              <SelectItem value="bar">Çubuk Grafik</SelectItem>
              <SelectItem value="pie">Pasta Grafik</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Zaman Serisi Grafiği */}
      <Card>
        <CardHeader>
          <CardTitle>Zaman İçinde Aktivite</CardTitle>
          <CardDescription>
            {period === 'day' && 'Son 24 saat içinde görüntüleme ve tıklama aktivitesi'}
            {period === 'week' && 'Son hafta içinde görüntüleme ve tıklama aktivitesi'}
            {period === 'month' && 'Son ay içinde görüntüleme ve tıklama aktivitesi'}
            {period === 'year' && 'Son yıl içinde görüntüleme ve tıklama aktivitesi'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    name="Görüntülenme"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#82ca9d"
                    name="Tıklama"
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#8884d8" name="Görüntülenme" />
                  <Bar dataKey="clicks" fill="#82ca9d" name="Tıklama" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Görüntülenme', value: totalViews - totalClicks },
                      { name: 'Tıklama', value: totalClicks }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Görüntülenme', value: totalViews - totalClicks },
                      { name: 'Tıklama', value: totalClicks }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Banner Bazında İstatistikler */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Bazında İstatistikler</CardTitle>
          <CardDescription>
            Her banner için görüntülenme ve tıklama verileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bannerStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="title" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Görüntülenme" />
                <Bar dataKey="clicks" fill="#82ca9d" name="Tıklama" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 