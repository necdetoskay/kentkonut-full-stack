"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartData {
  date: string;
  views: number;
  clicks: number;
}

interface BannerTotalStats {
  totalViews: number;
  totalClicks: number;
  averageCtr: number;
}

export function AnalyticsChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalStats, setTotalStats] = useState<BannerTotalStats>({
    totalViews: 0,
    totalClicks: 0,
    averageCtr: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [chartType, setChartType] = useState("line");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Placeholder for API call - to be replaced with actual API
        const response = await fetch(`/api/statistics/chart?period=${timeRange}`);
        
        if (!response.ok) {
          throw new Error("İstatistikler alınamadı");
        }
        
        const data = await response.json();
        setChartData(data.chartData);
        setTotalStats(data.totalStats);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        toast.error("İstatistik verileri yüklenemedi");
        // Use sample data for demonstration
        const { sampleData, sampleTotals } = generateSampleData(timeRange);
        setChartData(sampleData);
        setTotalStats(sampleTotals);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Generate sample data for demonstration
  const generateSampleData = (period: string) => {
    let sampleData: ChartData[] = [];
    let totalViews = 0;
    let totalClicks = 0;
    
    const daysToGenerate = period === "week" ? 7 : period === "month" ? 30 : 12;
    const dateFormat = period === "year" ? "MMM YYYY" : "DD MMM";
    
    // Generate data points
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      if (period === "year") {
        date.setMonth(date.getMonth() - (daysToGenerate - i - 1));
        date.setDate(1);
      } else {
        date.setDate(date.getDate() - (daysToGenerate - i - 1));
      }
      
      // Format date string
      const formattedDate = period === "year" 
        ? new Intl.DateTimeFormat('tr-TR', { month: 'short', year: 'numeric' }).format(date)
        : new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(date);
        
      // Generate random data with some trend
      const dayFactor = Math.sin(i / (daysToGenerate / 2) * Math.PI) * 0.5 + 0.8;
      const views = Math.round((500 + Math.random() * 1000) * dayFactor);
      const clicks = Math.round(views * (0.02 + Math.random() * 0.04));
      
      totalViews += views;
      totalClicks += clicks;
      
      sampleData.push({
        date: formattedDate,
        views,
        clicks,
      });
    }
    
    const averageCtr = (totalClicks / totalViews) * 100;
    
    return {
      sampleData,
      sampleTotals: {
        totalViews,
        totalClicks,
        averageCtr,
      },
    };
  };

  // Format numbers with thousand separators
  const formatNumber = (num: number) => {
    return num.toLocaleString("tr-TR");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 border rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Görüntülenme: {formatNumber(payload[0].value)}
          </p>
          <p className="text-secondary">
            Tıklama: {formatNumber(payload[1].value)}
          </p>
          <p className="text-muted-foreground">
            CTR: {((payload[1].value / payload[0].value) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle>Banner İstatistikleri</CardTitle>
            <CardDescription>
              Bannerlarınızın görüntülenme ve tıklama performansı
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zaman Aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Son 7 Gün</SelectItem>
                <SelectItem value="month">Son 30 Gün</SelectItem>
                <SelectItem value="year">Son 12 Ay</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={chartType}
              onValueChange={(value) => setChartType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Grafik Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Çizgi Grafik</SelectItem>
                <SelectItem value="bar">Çubuk Grafik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Toplam Görüntülenme</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold">
                {isLoading ? "..." : formatNumber(totalStats.totalViews)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Toplam Tıklama</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold">
                {isLoading ? "..." : formatNumber(totalStats.totalClicks)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Ortalama CTR</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-3xl font-bold">
                {isLoading ? "..." : totalStats.averageCtr.toFixed(2) + "%"}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <p>Yükleniyor...</p>
            </div>
          ) : chartType === "line" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Görüntülenme"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  name="Tıklama"
                  stroke="#d946ef"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="views" name="Görüntülenme" fill="#0ea5e9" />
                <Bar dataKey="clicks" name="Tıklama" fill="#d946ef" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 