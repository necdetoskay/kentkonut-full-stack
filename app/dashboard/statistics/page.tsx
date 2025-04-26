"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Calendar, Eye, MousePointerClick, Percent } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";

interface StatisticsData {
  overview: {
    totalViews: number;
    totalClicks: number;
    clickRate: string;
  };
  banners: {
    id: number;
    title: string;
    groupName: string;
    views: number;
    clicks: number;
    clickRate: string;
  }[];
  groups: {
    id: number;
    name: string;
    views: number;
    clicks: number;
    clickRate: string;
  }[];
  daily: {
    date: string;
    views: number;
    clicks: number;
    clickRate: string;
  }[];
}

export default function StatisticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [period, setPeriod] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const breadcrumbItems = [{ title: "İstatistikler" }];

  useEffect(() => {
    fetchStatistics();
  }, [period, dateRange]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      
      let url = `/api/statistics?period=${period}`;
      
      if (period === "custom" && dateRange.from && dateRange.to) {
        url += `&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("İstatistikler yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
      toast.error("İstatistikler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  // İstatistikler henüz yüklenmemişse varsayılan değerler göster
  const defaultData: StatisticsData = {
    overview: {
      totalViews: 0,
      totalClicks: 0,
      clickRate: "0.00%",
    },
    banners: [],
    groups: [],
    daily: [],
  };

  const data = statistics || defaultData;

  return (
    <div className="container mx-auto py-10">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banner İstatistikleri</h2>
          <p className="text-muted-foreground">
            Banner görüntülenme ve tıklanma istatistiklerini inceleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Periyot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="week">Son 7 Gün</SelectItem>
              <SelectItem value="month">Son 30 Gün</SelectItem>
              <SelectItem value="custom">Özel Aralık</SelectItem>
            </SelectContent>
          </Select>
          
          {period === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-auto flex gap-2">
                  <Calendar className="h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    `${format(dateRange.from, "d MMM", { locale: tr })} - ${format(dateRange.to, "d MMM", { locale: tr })}`
                  ) : (
                    "Tarih Seçin"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="banners">Bannerlar</TabsTrigger>
          <TabsTrigger value="groups">Gruplar</TabsTrigger>
          {(period === "week" || period === "month" || period === "custom") && (
            <TabsTrigger value="daily">Günlük</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Görüntülenme
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  Toplam banner görüntülenme sayısı
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tıklanma
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  Toplam banner tıklanma sayısı
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tıklanma Oranı
                </CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.clickRate}</div>
                <p className="text-xs text-muted-foreground">
                  Ortalama tıklanma oranı
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Banner İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Grup</TableHead>
                    <TableHead>Görüntülenme</TableHead>
                    <TableHead>Tıklanma</TableHead>
                    <TableHead>Oran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.banners.length > 0 ? (
                    data.banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>{banner.title}</TableCell>
                        <TableCell>{banner.groupName}</TableCell>
                        <TableCell>{banner.views}</TableCell>
                        <TableCell>{banner.clicks}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{banner.clickRate}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Henüz banner verisi bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Grup İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grup</TableHead>
                    <TableHead>Görüntülenme</TableHead>
                    <TableHead>Tıklanma</TableHead>
                    <TableHead>Oran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.groups.length > 0 ? (
                    data.groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell>{group.views}</TableCell>
                        <TableCell>{group.clicks}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{group.clickRate}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Henüz grup verisi bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {(period === "week" || period === "month" || period === "custom") && (
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Günlük İstatistikler</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Görüntülenme</TableHead>
                      <TableHead>Tıklanma</TableHead>
                      <TableHead>Oran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.daily.length > 0 ? (
                      data.daily.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>
                            {format(new Date(day.date), "d MMMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell>{day.views}</TableCell>
                          <TableCell>{day.clicks}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{day.clickRate}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Henüz günlük veri bulunmuyor
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 