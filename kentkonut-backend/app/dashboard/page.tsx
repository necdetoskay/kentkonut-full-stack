"use client"

import { useUsers } from "@/app/context/UserContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoadingSkeleton } from "@/components/ui/loading"
import {
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Shield,
  Building2,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  Star
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { users, isLoading, error } = useUsers()

  // Authentication check
  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="container mx-auto py-10">
        <LoadingSkeleton rows={8} />
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (status === "unauthenticated") {
    return null
  }

  // Show loading state while fetching users
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Breadcrumb
          segments={[
            { name: 'Dashboard', href: '/dashboard' }
          ]}
          className="mb-6"
        />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Sistem genel bakış ve istatistikleri
            </p>
          </div>
        </div>
        <LoadingSkeleton rows={6} />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Breadcrumb
          segments={[
            { name: 'Dashboard', href: '/dashboard' }
          ]}
          className="mb-6"
        />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Sistem genel bakış ve istatistikleri
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate statistics with safe division
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.emailVerified !== null).length
  const inactiveUsers = users.filter((user) => user.emailVerified === null).length
  const adminUsers = users.filter((user) => user.role === "ADMIN").length

  // Safe percentage calculations
  const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0.0"
  const inactivePercentage = totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : "0.0"
  const adminPercentage = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : "0.0"

  const recentUsers = users.slice(0, 5)

  // Get current time for greeting
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Günaydın" : currentHour < 18 ? "İyi günler" : "İyi akşamlar"
  const userName = session?.user?.name || "Kullanıcı"

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        segments={[
          { name: 'Dashboard', href: '/dashboard' }
        ]}
      />

      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {greeting}, {userName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Kent Konut Yönetim Paneline hoş geldiniz
              </p>
              <p className="text-blue-200 text-sm mt-2">
                Sistem durumu ve istatistiklerinizi buradan takip edebilirsiniz
              </p>
            </div>
            <div className="hidden md:block">
              <Building2 className="h-24 w-24 text-blue-300 opacity-50" />
            </div>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Aktif Kullanıcılar
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-1">
              {activeUsers}
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">{activePercentage}%</span>
              <span className="text-green-700 ml-1">toplam kullanıcı</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Pasif Kullanıcılar
            </CardTitle>
            <div className="rounded-full bg-orange-100 p-2">
              <UserX className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-1">
              {inactiveUsers}
            </div>
            <div className="flex items-center text-sm">
              <Activity className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-orange-600 font-medium">{inactivePercentage}%</span>
              <span className="text-orange-700 ml-1">toplam kullanıcı</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Yönetici Sayısı
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">
              {adminUsers}
            </div>
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-blue-600 font-medium">{adminPercentage}%</span>
              <span className="text-blue-700 ml-1">toplam kullanıcı</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Toplam Kullanıcı
            </CardTitle>
            <div className="rounded-full bg-purple-100 p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">
              {totalUsers}
            </div>
            <div className="flex items-center text-sm">
              <BarChart3 className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-purple-600 font-medium">100%</span>
              <span className="text-purple-700 ml-1">sistem kullanıcısı</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analitik
          </TabsTrigger>
          <TabsTrigger value="reports" disabled className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Raporlar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Users Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    Son Eklenen Kullanıcılar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {totalUsers === 0 ? (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kullanıcı yok</h3>
                      <p className="text-gray-500 mb-4">
                        İlk kullanıcıyı eklemek için Kullanıcılar sayfasını ziyaret edin.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="font-semibold">Ad Soyad</TableHead>
                            <TableHead className="font-semibold">E-posta</TableHead>
                            <TableHead className="font-semibold">Rol</TableHead>
                            <TableHead className="font-semibold">Durum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentUsers.map((user, index) => (
                            <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                    {(user.name || "U").charAt(0).toUpperCase()}
                                  </div>
                                  {user.name || "İsimsiz Kullanıcı"}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">{user.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.role === "ADMIN" ? "default" : "secondary"}
                                  className={user.role === "ADMIN" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
                                >
                                  {user.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.emailVerified !== null ? "default" : "secondary"}
                                  className={
                                    user.emailVerified !== null
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                  }
                                >
                                  {user.emailVerified !== null ? "Aktif" : "Pasif"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* System Status */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="rounded-full bg-green-100 p-2">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    Sistem Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sistem Sağlığı</span>
                      <Badge className="bg-green-100 text-green-800">Çevrimiçi</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Son Güncelleme</span>
                      <span className="text-sm font-medium">Bugün</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    Hızlı İşlemler
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Kullanıcı Ekle</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">İçerik Oluştur</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Birim Ekle</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}