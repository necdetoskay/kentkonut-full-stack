"use client"

import { useUsers } from "@/app/context/UserContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
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
  Star,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  Bell,
  Zap,
  Globe,
  Target,
  Award,
  Briefcase,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for charts
const userActivityData = [
  { name: 'Ocak', users: 65, active: 45 },
  { name: 'Şubat', users: 78, active: 52 },
  { name: 'Mart', users: 90, active: 68 },
  { name: 'Nisan', users: 81, active: 61 },
  { name: 'Mayıs', users: 95, active: 75 },
  { name: 'Haziran', users: 102, active: 82 },
]

const projectStatusData = [
  { name: 'Tamamlanan', value: 45, color: '#10b981' },
  { name: 'Devam Eden', value: 30, color: '#3b82f6' },
  { name: 'Planlanan', value: 25, color: '#f59e0b' },
]

const recentActivities = [
  { id: 1, user: 'Ahmet Yılmaz', action: 'Yeni proje ekledi', time: '2 dakika önce', type: 'project' },
  { id: 2, user: 'Fatma Demir', action: 'Kullanıcı güncelledi', time: '5 dakika önce', type: 'user' },
  { id: 3, user: 'Mehmet Kaya', action: 'Banner yayınladı', time: '10 dakika önce', type: 'content' },
  { id: 4, user: 'Ayşe Öz', action: 'Haber ekledi', time: '15 dakika önce', type: 'news' },
]

const quickActions = [
  { title: 'Yeni Proje', icon: Building2, color: 'bg-blue-500', href: '/dashboard/projects/new' },
  { title: 'Kullanıcı Ekle', icon: Users, color: 'bg-green-500', href: '/dashboard/users/new' },
  { title: 'Haber Yaz', icon: FileText, color: 'bg-purple-500', href: '/dashboard/news/new' },
  { title: 'Banner Ekle', icon: Upload, color: 'bg-orange-500', href: '/dashboard/banner-groups/new' },
]

// Loading skeleton component
const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </CardHeader>
    <CardContent>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { users, isLoading, error } = useUsers()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isLoading2, setIsLoading2] = useState(true)

  // Authentication check
  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
  }, [status, router])

  // Simulate loading for demo
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading2(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Show loading state while checking authentication or initial load
  if (status === "loading" || isLoading2) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        
        {/* Hero skeleton */}
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
        
        {/* Stats skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (status === "unauthenticated") {
    return null
  }

  // Show error state with modern design
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Breadcrumb
          segments={[
            { name: 'Dashboard', href: '/dashboard' }
          ]}
        />
        
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center animate-bounce">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            <Activity className="w-4 h-4 mr-2" />
            Yeniden Dene
          </Button>
        </div>
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

  // Filter recent activities based on search
  const filteredActivities = recentActivities.filter(activity =>
    activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.action.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb
          segments={[
            { name: 'Dashboard', href: '/dashboard' }
          ]}
        />
      </div>

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 text-white shadow-2xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {greeting}, {userName}! 👋
              </h1>
              
              <p className="text-blue-100 text-xl mb-2">
                Kent Konut Yönetim Paneline hoş geldiniz
              </p>
              
              <p className="text-blue-200 text-sm mb-6">
                Sistem durumu ve istatistiklerinizi buradan takip edebilirsiniz
              </p>
              
              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-3">
                {quickActions.slice(0, 2).map((action, index) => (
                  <Button
                    key={action.title}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.title}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center animate-spin">
                  <Building2 className="h-16 w-16 text-white/80" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
