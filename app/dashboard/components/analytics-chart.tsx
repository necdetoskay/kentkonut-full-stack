"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { format, subDays, subMonths, subYears } from "date-fns";
import { tr } from "date-fns/locale";

interface DailyStats {
  date: string;
  views: number;
  clicks: number;
}

export function AnalyticsChart() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<DailyStats[]>([]);
  const [viewsTrend, setViewsTrend] = useState(0);
  const [clicksTrend, setClicksTrend] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [conversionTrend, setConversionTrend] = useState(0);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Gerçek API endpoint'i ile değiştirilmeli
        const response = await fetch(`/api/statistics?period=${period}`);
        
        if (!response.ok) {
          throw new Error("Veri alınamadı");
        }
        
        const data = await response.json();
        setChartData(data);
        
        // Trend hesaplamaları
        calculateTrends(data);
      } catch (error) {
        console.error("Veri alınırken hata oluştu:", error);
        // Hata durumunda örnek veri göster
        const defaultData = generateDefaultData();
        setChartData(defaultData);
        calculateTrends(defaultData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, [period]);

  // Trend hesaplamaları
  const calculateTrends = (data: DailyStats[]) => {
    if (data.length < 2) return;
    
    // Son 3 günün ortalaması
    const recentDays = data.slice(-3);
    const earlierDays = data.slice(-6, -3);
    
    const recentViewsAvg = recentDays.reduce((sum, day) => sum + day.views, 0) / recentDays.length;
    const earlierViewsAvg = earlierDays.reduce((sum, day) => sum + day.views, 0) / earlierDays.length;
    
    const recentClicksAvg = recentDays.reduce((sum, day) => sum + day.clicks, 0) / recentDays.length;
    const earlierClicksAvg = earlierDays.reduce((sum, day) => sum + day.clicks, 0) / earlierDays.length;
    
    // Toplam veriler
    const totalViews = data.reduce((sum, day) => sum + day.views, 0);
    const totalClicks = data.reduce((sum, day) => sum + day.clicks, 0);
    const currentConversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    // Önceki dönem toplam veriler
    const prevPeriodData = generatePreviousPeriodData(period);
    const prevTotalViews = prevPeriodData.reduce((sum, day) => sum + day.views, 0);
    const prevTotalClicks = prevPeriodData.reduce((sum, day) => sum + day.clicks, 0);
    const prevConversionRate = prevTotalViews > 0 ? (prevTotalClicks / prevTotalViews) * 100 : 0;
    
    // Trendleri hesapla
    const viewsTrendPercentage = earlierViewsAvg === 0 ? 0 : ((recentViewsAvg - earlierViewsAvg) / earlierViewsAvg) * 100;
    const clicksTrendPercentage = earlierClicksAvg === 0 ? 0 : ((recentClicksAvg - earlierClicksAvg) / earlierClicksAvg) * 100;
    const conversionTrendPercentage = prevConversionRate === 0 ? 0 : ((currentConversionRate - prevConversionRate) / prevConversionRate) * 100;
    
    setViewsTrend(viewsTrendPercentage);
    setClicksTrend(clicksTrendPercentage);
    setConversionRate(currentConversionRate);
    setConversionTrend(conversionTrendPercentage);
  };

  // Örnek veri oluşturma
  const generateDefaultData = (): DailyStats[] => {
    const data: DailyStats[] = [];
    const count = period === "week" ? 7 : period === "month" ? 30 : 12;
    
    for (let i = count - 1; i >= 0; i--) {
      const date = period === "week" || period === "month" 
        ? subDays(new Date(), i)
        : subMonths(new Date(), i);
      
      const views = Math.floor(Math.random() * 1000) + 500;
      const clicks = Math.floor(views * (Math.random() * 0.3 + 0.1));
      
      data.push({
        date: period === "year" 
          ? format(date, "MMMM", { locale: tr })
          : format(date, "d MMM", { locale: tr }),
        views,
        clicks
      });
    }
    
    return data;
  };
  
  // Önceki dönem verisi oluşturma
  const generatePreviousPeriodData = (currentPeriod: string): DailyStats[] => {
    const data: DailyStats[] = [];
    const count = currentPeriod === "week" ? 7 : currentPeriod === "month" ? 30 : 12;
    const offset = currentPeriod === "week" ? 7 : currentPeriod === "month" ? 30 : 12;
    
    for (let i = count + offset - 1; i >= offset; i--) {
      const date = currentPeriod === "week" || currentPeriod === "month" 
        ? subDays(new Date(), i)
        : subMonths(new Date(), i);
      
      const views = Math.floor(Math.random() * 800) + 300;
      const clicks = Math.floor(views * (Math.random() * 0.2 + 0.05));
      
      data.push({
        date: currentPeriod === "year" 
          ? format(date, "MMMM", { locale: tr })
          : format(date, "d MMM", { locale: tr }),
        views,
        clicks
      });
    }
    
    return data;
  };

  // İstatistik kartı bileşeni
  const StatCard = ({ 
    title, 
    value, 
    trend, 
    unit = "",
    className 
  }: { 
    title: string; 
    value: number; 
    trend: number; 
    unit?: string;
    className?: string;
  }) => (
    <div className={cn("px-6 py-4 rounded-lg min-w-[220px] flex-shrink-0", className)}>
      <div className="font-medium text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold mt-1">
        {value.toFixed(unit === "%" ? 1 : 0)}{unit}
      </div>
      <div className="flex items-center gap-1 mt-1">
        {trend > 0 ? (
          <div className="text-emerald-500 flex items-center gap-1">
            <ArrowUp size={14} />
            <span className="text-xs font-medium">%{Math.abs(trend).toFixed(1)}</span>
          </div>
        ) : trend < 0 ? (
          <div className="text-red-500 flex items-center gap-1">
            <ArrowDown size={14} />
            <span className="text-xs font-medium">%{Math.abs(trend).toFixed(1)}</span>
          </div>
        ) : (
          <div className="text-muted-foreground flex items-center gap-1">
            <Activity size={14} />
            <span className="text-xs font-medium">Değişim Yok</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Banner İstatistikleri</CardTitle>
          <CardDescription>Görüntülenme ve tıklama istatistikleri</CardDescription>
        </div>
        <Tabs defaultValue="week" value={period} onValueChange={(v) => setPeriod(v as "week" | "month" | "year")}>
          <TabsList>
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="month">Aylık</TabsTrigger>
            <TabsTrigger value="year">Yıllık</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="h-80 w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mt-1 px-6 pt-4">
              <Marquee className="pb-4 -mx-2" pauseOnHover speed={25}>
                <StatCard 
                  title="Görüntülenme" 
                  value={chartData.reduce((sum, day) => sum + day.views, 0)}
                  trend={viewsTrend}
                  className="bg-blue-50 border border-blue-100"
                />
                <StatCard 
                  title="Tıklama" 
                  value={chartData.reduce((sum, day) => sum + day.clicks, 0)}
                  trend={clicksTrend}
                  className="bg-violet-50 border border-violet-100" 
                />
                <StatCard 
                  title="Dönüşüm Oranı" 
                  value={conversionRate}
                  trend={conversionTrend}
                  unit="%" 
                  className="bg-amber-50 border border-amber-100"
                />
                {/* Marque'nin daha doğal görünmesi için aynı kartları tekrarla */}
                <StatCard 
                  title="Görüntülenme" 
                  value={chartData.reduce((sum, day) => sum + day.views, 0)}
                  trend={viewsTrend}
                  className="bg-blue-50 border border-blue-100"
                />
                <StatCard 
                  title="Tıklama" 
                  value={chartData.reduce((sum, day) => sum + day.clicks, 0)}
                  trend={clicksTrend}
                  className="bg-violet-50 border border-violet-100" 
                />
                <StatCard 
                  title="Dönüşüm Oranı" 
                  value={conversionRate}
                  trend={conversionTrend}
                  unit="%" 
                  className="bg-amber-50 border border-amber-100"
                />
              </Marquee>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value, 
                      name === "views" ? "Görüntülenme" : "Tıklama"
                    ]}
                    labelFormatter={(label) => `Tarih: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Görüntülenme"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Tıklama"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="text-xs text-muted-foreground">
          Son güncellenme: {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: tr })}
        </div>
      </CardFooter>
    </Card>
  );
} 