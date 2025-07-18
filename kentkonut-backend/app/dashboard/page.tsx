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
import { useEffect } from "react"
import { LoadingSkeleton } from "@/components/ui/loading"
import { AlertCircle, Users, UserCheck, UserX, Shield } from "lucide-react"
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

  return (
    <div className="container mx-auto py-10">
      {/* Breadcrumb */}
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
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  Aktif Kullanıcılar
                </CardTitle>
                <Badge variant="default">{activeUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activePercentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam {totalUsers} kullanıcının yüzdesi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserX className="h-4 w-4 text-orange-600" />
                  Pasif Kullanıcılar
                </CardTitle>
                <Badge variant="secondary">{inactiveUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inactivePercentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam {totalUsers} kullanıcının yüzdesi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Yönetici Sayısı
                </CardTitle>
                <Badge>{adminUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {adminPercentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam {totalUsers} kullanıcının yüzdesi
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Son Eklenen Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalUsers === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz hiç kullanıcı bulunmuyor.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      İlk kullanıcıyı eklemek için Kullanıcılar sayfasını ziyaret edin.
                    </p>
                  </div>
                ) : (
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
                          <TableCell>{user.name || "İsimsiz Kullanıcı"}</TableCell>
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
                                user.emailVerified !== null
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.emailVerified !== null
                                ? "Aktif"
                                : "Pasif"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}