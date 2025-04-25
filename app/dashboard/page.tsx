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

export default function DashboardPage() {
  const { users } = useUsers()

  const activeUsers = users.filter((user) => user.status === "ACTIVE").length
  const inactiveUsers = users.filter((user) => user.status === "INACTIVE").length
  const adminUsers = users.filter((user) => user.role === "ADMIN").length

  const recentUsers = users.slice(0, 5)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
      </Tabs>
    </div>
  )
} 