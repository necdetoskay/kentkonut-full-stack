"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import NextImage from 'next/image'

interface BannerGroup {
  id: number
  name: string
  description?: string
  slug: string
  isActive: boolean
  deletable: boolean
  width: number
  height: number
  mobileWidth?: number
  mobileHeight?: number
  tabletWidth?: number
  tabletHeight?: number
  displayDuration: number
  transitionDuration: number
  animationType: string
  createdAt: string
  updatedAt: string
}

interface Banner {
  id: number
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  order: number
  bannerGroupId: number
}

interface PageProps {
  params: { id: string }
}

function getAnimationLabel(animationType: string): string {
  const animationLabels: Record<string, string> = {
    'yok': 'Yok',
    'sol_kaydir': 'Sola Kaydır',
    'sag_kaydir': 'Sağa Kaydır',
    'yukari_kaydir': 'Yukarı Kaydır',
    'asagi_kaydir': 'Aşağı Kaydır',
    'sol_yasli': 'Sola Yaslı',
    'sag_yasli': 'Sağa Yaslı',
    'sol_alt': 'Sol Alt',
    'sag_alt': 'Sağ Alt',
    'sol_ust': 'Sol Üst',
    'sag_ust': 'Sağ Üst',
    'yakinlastir': 'Yakınlaştır',
    'uzaklastir': 'Uzaklaştır',
    'donusum': 'Dönüşüm',
  }
  
  return animationLabels[animationType] || animationType
}

export default function BannerGroupDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = params
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      // Banner grubunu getir
      const groupResponse = await fetch(`/api/banner-groups/${id}`)
      const groupData = await groupResponse.json()

      if (groupData.success) {
        setBannerGroup(groupData.bannerGroup)
      } else {
        toast.error('Banner grubu bulunamadı')
        router.push('/dashboard/banner-groups')
        return
      }

      // Bannerları getir
      const bannersResponse = await fetch(`/api/banners?bannerGroupId=${id}`)
      const bannersData = await bannersResponse.json()

      if (bannersData.success) {
        const sortedBanners = (bannersData.data || []).sort((a: Banner, b: Banner) => a.order - b.order)
        setBanners(sortedBanners)
      } else {
        console.error('Bannerlar yüklenirken hata:', bannersData.error)
        setBanners([])
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
      toast.error('Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!bannerGroup) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata! </strong>
          <span className="block sm:inline">Banner grubu bulunamadı</span>
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
          { name: bannerGroup.name, href: `/dashboard/banner-groups/${id}` }
        ]}
        className="mb-6"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/banner-groups">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">{bannerGroup.name}</h1>
            <p className="text-muted-foreground">Banner grubu detayları ve yönetimi</p>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/banner-groups/${bannerGroup.id}/banners/new`}>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Banner Ekle
              </Button>
            </Link>
            <Link href={`/dashboard/banner-groups/${bannerGroup.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Grubu Düzenle
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">URL Yolu</p>
                <p className="text-sm">{bannerGroup.slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Boyut</p>
                <p className="text-sm">{bannerGroup.width} × {bannerGroup.height} piksel</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</p>
                <p className="text-sm">
                  {new Date(bannerGroup.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Son Güncelleme</p>
                <p className="text-sm">
                  {new Date(bannerGroup.updatedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Animasyon Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Animasyon Türü</p>
                <p className="text-sm">{getAnimationLabel(bannerGroup.animationType)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gösterim Süresi</p>
                <p className="text-sm">{bannerGroup.displayDuration} saniye</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Geçiş Süresi</p>
                <p className="text-sm">{bannerGroup.transitionDuration} saniye</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Diğer Ayarlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Durum</p>
                  <p className="text-sm">
                    {bannerGroup.isActive ? 'Aktif' : 'Pasif'}
                  </p>
                </div>
                <Badge variant={bannerGroup.isActive ? 'default' : 'secondary'}>
                  {bannerGroup.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Silinebilirlik</p>
                  <p className="text-sm">
                    {bannerGroup.deletable ? 'Silinebilir' : 'Silinemez'}
                  </p>
                </div>
                <Badge variant={bannerGroup.deletable ? 'outline' : 'secondary'}>
                  {bannerGroup.deletable ? 'Standart' : 'Korumalı'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {bannerGroup.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {bannerGroup.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bannerlar</CardTitle>
                <CardDescription>
                  Bu gruptaki bannerları aşağıdan yönetebilirsiniz.
                </CardDescription>
              </div>
              <Link href={`/dashboard/banner-groups/${bannerGroup.id}/banners/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ekle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {banners.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Bu grupta henüz banner bulunmuyor.</p>
                <Link href={`/dashboard/banner-groups/${bannerGroup.id}/banners/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Banner'ı Ekle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                        <NextImage
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-sm text-muted-foreground">{banner.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={banner.isActive ? 'default' : 'secondary'} className="text-xs">
                            {banner.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Sıra: {banner.order}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/banner-groups/${bannerGroup.id}/banners/${banner.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
