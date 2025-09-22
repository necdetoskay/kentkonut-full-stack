'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Trash2, Loader2, ExternalLink, BarChart3, Eye, MousePointer } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { BannerPerformanceDashboard } from '@/components/analytics/BannerPerformanceDashboard'

interface BannerViewPageProps {
  params: Promise<{
    id: string
    bannerId: string
  }>
}

interface Banner {
  id: number
  title: string
  description: string | null
  link: string | null
  isActive: boolean
  deletable: boolean
  order: number
  viewCount: number
  clickCount: number
  imageUrl: string
  altText: string | null
  bannerGroupId: number
  bannerGroup: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface BannerGroup {
  id: number
  name: string
  description: string | null
  width?: number
  height?: number
}

export default function BannerViewPage({ params }: BannerViewPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)

  // Unwrap params Promise for Next.js 15 compatibility
  const unwrappedParams = use(params)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch banner data
        const bannerResponse = await fetch(`/api/banners/${unwrappedParams.bannerId}`)
        const bannerData = await bannerResponse.json()

        if (!bannerData.success) {
          throw new Error(bannerData.error || 'Banner bulunamadı')
        }

        // Fetch banner group data
        const groupResponse = await fetch(`/api/banner-groups/${unwrappedParams.id}`)
        const groupData = await groupResponse.json()
        
        if (!groupData.success) {
          throw new Error(groupData.error || 'Banner grubu bulunamadı')
        }
        
        setBanner(bannerData.banner || bannerData.data)
        setBannerGroup(groupData.bannerGroup || groupData.data)
        
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        alert('Veri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [unwrappedParams.bannerId, unwrappedParams.id])

  const handleDelete = async () => {
    if (!banner || !banner.deletable) return
    
    if (!confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/banners/${unwrappedParams.bannerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/banner-groups/${unwrappedParams.id}`)
      } else {
        alert(data.error || 'Banner silinirken hata oluştu')
      }
    } catch (error) {
      console.error('❌ Delete error:', error)
      alert('Banner silinirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (!banner || !bannerGroup) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Banner Bulunamadı</h1>
          <p className="text-gray-600 mt-2">İstenen banner veya banner grubu bulunamadı.</p>
          <Link href="/dashboard/banner-groups">
            <Button className="mt-4">
              Banner Gruplarına Dön
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
          { name: bannerGroup.name, href: `/dashboard/banner-groups/${bannerGroup.id}` },
          { name: 'Bannerlar', href: `/dashboard/banner-groups/${bannerGroup.id}` },
          { name: banner.title, href: '#' }
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/banner-groups/${unwrappedParams.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{banner.title}</h1>
          <p className="text-muted-foreground">{bannerGroup.name}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/banner-groups/${unwrappedParams.id}/banners/${unwrappedParams.bannerId}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </Link>
          {banner.deletable && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Banner Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Banner Önizleme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.altText || banner.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-banner.jpg'
                      }}
                    />
                  </div>
                  {banner.link && (
                    <div className="mt-4">
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Bağlantıyı Aç
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Banner Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Banner Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Durum</label>
                    <div className="mt-1">
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Sıra</label>
                    <p className="mt-1 text-sm">{banner.order}</p>
                  </div>

                  {banner.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Açıklama</label>
                      <p className="mt-1 text-sm">{banner.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Silinebilir</label>
                    <p className="mt-1 text-sm">{banner.deletable ? "Evet" : "Hayır"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Alt Metin</label>
                    <p className="mt-1 text-sm">{banner.altText || "Belirtilmemiş"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Görüntülenme</label>
                    <p className="mt-1 text-2xl font-bold">{banner.viewCount.toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Tıklanma</label>
                    <p className="mt-1 text-2xl font-bold">{banner.clickCount.toLocaleString()}</p>
                  </div>

                  {banner.viewCount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tıklama Oranı</label>
                      <p className="mt-1 text-lg font-semibold">
                        {((banner.clickCount / banner.viewCount) * 100).toFixed(2)}%
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Link href={`/dashboard/banner-groups/${unwrappedParams.id}/banners/${unwrappedParams.bannerId}/analytics`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Detaylı Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tarihler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Oluşturulma</label>
                    <p className="mt-1 text-sm">
                      {new Date(banner.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Son Güncelleme</label>
                    <p className="mt-1 text-sm">
                      {new Date(banner.updatedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Banner Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BannerPerformanceDashboard bannerId={banner.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
