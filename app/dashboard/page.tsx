"use client"

import { useUsers } from "@/app/context/UserContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { Eye, MousePointerClick, Percent, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AnalyticsChart } from "./components/analytics-chart"

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
}

export default function DashboardPage() {
  const { users } = useUsers()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)

  const activeUsers = users.filter((user) => user.status === "ACTIVE").length
  const inactiveUsers = users.filter((user) => user.status === "INACTIVE").length
  const adminUsers = users.filter((user) => user.role === "ADMIN").length

  const recentUsers = users.slice(0, 5)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/statistics?period=week")
      
      if (!response.ok) {
        throw new Error("İstatistikler yüklenirken bir hata oluştu")
      }
      
      const data = await response.json()
      setStatistics(data)
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error)
      toast.error("İstatistikler yüklenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  // İstatistikler henüz yüklenmemişse varsayılan değerler göster
  const defaultData: StatisticsData = {
    overview: {
      totalViews: 0,
      totalClicks: 0,
      clickRate: "0.00%",
    },
    banners: [],
  }

  const data = statistics || defaultData

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="analytics">
            Analitik
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Raporlar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktif Kullanıcılar
                </CardTitle>
                <Badge variant="default">{activeUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((activeUsers / users.length) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam kullanıcıların yüzdesi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pasif Kullanıcılar
                </CardTitle>
                <Badge variant="secondary">{inactiveUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((inactiveUsers / users.length) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam kullanıcıların yüzdesi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Yönetici Sayısı
                </CardTitle>
                <Badge>{adminUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((adminUsers / users.length) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam kullanıcıların yüzdesi
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Son Eklenen Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                          >
                            {user.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "ACTIVE"
                                ? "default"
                                : user.status === "INACTIVE"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {user.status === "ACTIVE"
                              ? "Aktif"
                              : user.status === "INACTIVE"
                              ? "Pasif"
                              : "Silinmiş"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
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
                  Son 7 gündeki toplam görüntülenme
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
                  Son 7 gündeki toplam tıklanma
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

          <AnalyticsChart />

          <Card>
            <CardHeader>
              <CardTitle>En Çok Görüntülenen Bannerlar</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">Yükleniyor...</div>
              ) : (
                <>
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
                        data.banners
                          .sort((a, b) => b.views - a.views)
                          .slice(0, 5)
                          .map((banner) => (
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
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => router.push('/dashboard/statistics')}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Tüm İstatistikleri Görüntüle
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 