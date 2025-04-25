"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BannerForm } from "@/app/dashboard/banners/banner-form"
import { Separator } from "@/components/ui/separator"

type BannerGroup = {
  id: string
  name: string
  active: boolean
  playMode: "MANUAL" | "AUTO"
  animation: "FADE" | "SLIDE" | "ZOOM"
  duration: number
  width: number
  height: number
  banners: any[]
  createdAt: string
  updatedAt: string
}

export default function BannerGroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false)

  useEffect(() => {
    fetchBannerGroup()
  }, [params.id])

  const fetchBannerGroup = async () => {
    try {
      const response = await fetch(`/api/banner-groups/${params.id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) {
        throw new Error("Banner grubu yüklenirken bir hata oluştu")
      }
      const data = await response.json()
      setBannerGroup(data)
      console.log("Banner grubu yüklendi:", data)
    } catch (error) {
      console.error("Banner grubu yüklenirken hata:", error)
      toast.error("Banner grubu yüklenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBannerSuccess = () => {
    setIsAddBannerOpen(false)
    setTimeout(() => {
      fetchBannerGroup()
    }, 500)
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  if (!bannerGroup) {
    return <div>Banner grubu bulunamadı</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAnimationText = (animation: string) => {
    switch (animation) {
      case "FADE":
        return "Solma"
      case "SLIDE":
        return "Kayma"
      case "ZOOM":
        return "Yakınlaştırma"
      default:
        return animation
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{bannerGroup.name}</h2>
            <p className="text-muted-foreground">
              Banner grubundaki içerikleri yönetin
            </p>
          </div>
          <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Banner Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Banner</DialogTitle>
                <DialogDescription>
                  Banner grubuna yeni bir banner ekleyin.
                </DialogDescription>
              </DialogHeader>
              <BannerForm
                groupId={params.id}
                onSuccess={handleBannerSuccess}
                groupWidth={bannerGroup?.width || 1920}
                groupHeight={bannerGroup?.height || 1080}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Durum Bilgisi</CardTitle>
              <CardDescription>Banner grubunun temel özellikleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum</span>
                <Badge variant={bannerGroup.active ? "default" : "secondary"}>
                  {bannerGroup.active ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oynatma Modu</span>
                <span>{bannerGroup.playMode === "MANUAL" ? "Manuel" : "Otomatik"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banner Sayısı</span>
                <span>{bannerGroup.banners.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Görüntüleme Ayarları</CardTitle>
              <CardDescription>Görüntüleme ve animasyon özellikleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Animasyon Tipi</span>
                <span>{getAnimationText(bannerGroup.animation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Görüntülenme Süresi</span>
                <span>{bannerGroup.duration / 1000} saniye</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Boyutlar</span>
                <span>{bannerGroup.width}x{bannerGroup.height}px</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zaman Bilgisi</CardTitle>
              <CardDescription>Oluşturma ve güncelleme bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oluşturulma</span>
                <span>{formatDate(bannerGroup.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Son Güncelleme</span>
                <span>{formatDate(bannerGroup.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bannerGroup.banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader>
                <CardTitle>{banner.title}</CardTitle>
                {banner.description && (
                  <CardDescription>{banner.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={banner.active ? "default" : "secondary"}>
                    {banner.active ? "Aktif" : "Pasif"}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/banners/${bannerGroup.id}/banners/${banner.id}/edit`)}
                    >
                      Düzenle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 