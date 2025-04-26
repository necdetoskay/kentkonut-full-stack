"use client"

import { useState, useEffect, createContext } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Plus, GripVertical, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import { Breadcrumb } from "@/components/ui/breadcrumb"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DragEndEvent } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import { ImageModal } from "@/components/ui/image-modal"
import { BannerPreview, AnimationType } from "@/components/banner-preview"
import { BannerStatistics } from "@/components/banner-statistics"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Banner = {
  id: number
  title: string
  description?: string
  imageUrl: string
  targetUrl?: string
  active: boolean
  order: number
}

type BannerGroup = {
  id: string
  name: string
  active: boolean
  playMode: "MANUAL" | "AUTO"
  animation: "FADE" | "SLIDE" | "ZOOM"
  duration: number
  width: number
  height: number
  banners: Banner[]
  createdAt: string
  updatedAt: string
}

interface SortableTableRowProps {
  banner: Banner
  groupWidth?: number
  groupHeight?: number
}

function SortableTableRow({ banner, groupWidth, groupHeight, ...props }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? 'relative' : 'static',
    backgroundColor: isDragging ? 'var(--background)' : undefined,
  }

  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

  useEffect(() => {
    if (banner.imageUrl && typeof window !== 'undefined') {
      const img = document.createElement('img');
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = banner.imageUrl;
    }
  }, [banner.imageUrl]);

  return (
    <TableRow ref={setNodeRef} style={style} {...props}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:text-foreground/70 touch-none"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex flex-col">
            <ImageModal
              src={banner.imageUrl}
              alt={banner.title}
              width={groupWidth}
              height={groupHeight}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{banner.title}</p>
          {banner.description && (
            <p className="text-sm text-muted-foreground">{banner.description}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {banner.targetUrl ? (
          <a 
            href={banner.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {banner.targetUrl}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>{banner.order}</TableCell>
      <TableCell>
        <Badge variant={banner.active ? "default" : "secondary"}>
          {banner.active ? "Aktif" : "Pasif"}
        </Badge>
      </TableCell>
      <TableCell>
        {imageDimensions ? (
          <div className="text-sm">
            {imageDimensions.width} × {imageDimensions.height} px
            {groupWidth && groupHeight && (
              <div className="text-xs text-muted-foreground mt-1">
                İdeal: {groupWidth} × {groupHeight} px
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Yükleniyor...</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" className="h-8">
          Düzenle
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700">
          Sil
        </Button>
      </TableCell>
    </TableRow>
  )
}

// Dialog açık olup olmadığını takip etmek için bir context oluşturuyoruz
export const DetailDialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: (value: boolean) => {}
});

export default function BannerGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isResizingBanners, setIsResizingBanners] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("banners")
  const [showResizeAlert, setShowResizeAlert] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchBannerGroup = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/banner-groups/${resolvedParams.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Banner grubu bulunamadı")
          setBannerGroup(null)
          return
        }
        throw new Error("Banner grubu yüklenirken bir hata oluştu")
      }

      const data = await response.json()
      setBannerGroup(data)
      
      if (data.banners && data.banners.some((b: Banner) => !b.active)) {
        setShowResizeAlert(true)
      } else {
        setShowResizeAlert(false)
      }
      
      setError(null)
    } catch (error) {
      console.error("Banner grubu yüklenirken hata:", error)
      setError(error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu")
      toast.error("Banner grubu yüklenemedi")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBannerGroup()
  }, [resolvedParams.id])

  // Dialog açılıp kapandığında global state'i güncelliyoruz
  useEffect(() => {
    setIsDialogOpen(isAddBannerOpen);
  }, [isAddBannerOpen]);

  const handleBannerSuccess = () => {
    setIsAddBannerOpen(false)
    setIsFormDirty(false)
    fetchBannerGroup() // Banner ekledikten sonra grubu yeniden yükle
    toast.success("Banner başarıyla eklendi")
  }

  // Banner ekleme dialogu yönetimi
  const handleAddBannerOpenChange = (openState: boolean) => {
    // Eğer kapanmak isteniyorsa (openState = false)
    if (!openState) {
      // Form değiştiyse onay dialogunu göster, değişmediyse doğrudan kapat
      if (isFormDirty) {
        setIsConfirmDialogOpen(true);
        // Dialog'u kapatmayız, açık tutuyoruz
      } else {
        setIsAddBannerOpen(false);
      }
    } else {
      setIsAddBannerOpen(openState);
      setIsFormDirty(false); // Yeni form açıldığında değişiklik durumunu sıfırla
    }
  };

  // Form değişiklik durumunu izlemek için
  const handleFormChange = (isDirty: boolean) => {
    setIsFormDirty(isDirty);
  };

  const handleConfirmClose = () => {
    setIsConfirmDialogOpen(false);
    setIsAddBannerOpen(false); // Banner ekleme dialogunu kapat
    setIsFormDirty(false); // Form değişiklik durumunu sıfırla
  };

  const handleCancelClose = () => {
    setIsConfirmDialogOpen(false);
    // Banner ekleme dialogu açık kalır
  };

  const handleResizeBanners = async () => {
    if (!bannerGroup || bannerGroup.banners.length === 0) {
      toast.warning("Yeniden boyutlandırılacak banner yok")
      return
    }

    try {
      setIsResizingBanners(true)
      const response = await fetch(`/api/banner-groups/${resolvedParams.id}/resizeBanners`, {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Bannerlar yeniden boyutlandırılırken bir hata oluştu")
      }
      
      const data = await response.json()
      toast.success(`${data.results.filter((r: any) => r.success).length} banner yeniden boyutlandırıldı`)
      fetchBannerGroup() // Banner'ları güncelledikten sonra grubu yeniden yükle
    } catch (error) {
      console.error("Banner yeniden boyutlandırma hatası:", error)
      toast.error("Bannerlar yeniden boyutlandırılamadı")
    } finally {
      setIsResizingBanners(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/banner-groups/${resolvedParams.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Banner grubu silinirken bir hata oluştu")
      }

      toast.success("Banner grubu başarıyla silindi")
      router.push("/dashboard/banners")
    } catch (error) {
      console.error("Banner grubu silinirken hata:", error)
      toast.error("Banner grubu silinemedi")
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over?.id && bannerGroup) {
      const oldIndex = bannerGroup.banners.findIndex((b) => b.id === active.id)
      const newIndex = bannerGroup.banners.findIndex((b) => b.id === over?.id)
      
      const newBanners = arrayMove(bannerGroup.banners, oldIndex, newIndex)
      const updatedBanners = newBanners.map((banner, index) => ({
        ...banner,
        order: index + 1
      }))

      setBannerGroup({
        ...bannerGroup,
        banners: updatedBanners
      })

      try {
        const response = await fetch(`/api/banner-groups/${resolvedParams.id}/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bannerIds: updatedBanners.map(b => ({
              id: b.id,
              order: b.order
            }))
          }),
        })

        if (!response.ok) {
          throw new Error('Sıralama güncellenirken bir hata oluştu')
        }

        toast.success('Sıralama güncellendi')
      } catch (error) {
        console.error('Sıralama güncellenirken hata:', error)
        toast.error('Sıralama güncellenemedi')
        // Hata durumunda orijinal sıralamaya geri dön
        fetchBannerGroup()
      }
    }
  }

  const handleAnimationChange = (animation: AnimationType) => {
    // Önizlemede animasyon değiştirildiğinde çağrılır
    // Burada bir şey yapmanıza gerek yok, BannerPreview kaydetme işlemini kendisi yapacak
    console.log("Animation changed to:", animation)
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!bannerGroup) {
    return <div>Banner grubu bulunamadı</div>
  }

  const breadcrumbItems = [
    { title: "Bannerlar", href: "/dashboard/banners" },
    { title: bannerGroup.name },
  ]

  return (
    <DetailDialogContext.Provider value={{ isDialogOpen, setIsDialogOpen }}>
      <div className="container mx-auto py-10">
        <Breadcrumb items={breadcrumbItems} />
        <div className="space-y-6">
          {showResizeAlert && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Banner Boyutları Değiştirildi</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Banner grubunun boyutları değiştirildiği için bazı banner görselleri pasif duruma getirildi. 
                Bannerların doğru görüntülenmesi için &quot;Görselleri Yeniden Boyutlandır&quot; butonunu kullanınız.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{bannerGroup.name}</h2>
              <p className="text-muted-foreground">
                Banner grubundaki içerikleri yönetin
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddBannerOpen} onOpenChange={handleAddBannerOpenChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Banner Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="max-w-2xl"
                >
                  <DialogHeader>
                    <DialogTitle>Yeni Banner</DialogTitle>
                    <DialogDescription>
                      Banner grubuna yeni bir banner ekleyin.
                    </DialogDescription>
                  </DialogHeader>
                  <BannerForm
                    groupId={resolvedParams.id}
                    onSuccess={handleBannerSuccess}
                    groupWidth={bannerGroup?.width || 1920}
                    groupHeight={bannerGroup?.height || 1080}
                    onFormChange={handleFormChange}
                  />
                </DialogContent>
              </Dialog>
              
              {/* Onay dialogu */}
              <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Değişiklikleri Kaydetmediniz</DialogTitle>
                    <DialogDescription>
                      Banner formunda değişiklik yaptınız ancak kaydetmediniz. 
                      Bu değişiklikleri kaydetmeden formu kapatmak istediğinize emin misiniz?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelClose}
                    >
                      Forma Geri Dön
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmClose}
                    >
                      Değişiklikleri İptal Et
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                onClick={handleResizeBanners} 
                disabled={isResizingBanners || bannerGroup.banners.length === 0}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isResizingBanners ? 'animate-spin' : ''}`} />
                {isResizingBanners ? "İşleniyor..." : "Görselleri Yeniden Boyutlandır"}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Grubu Sil
              </Button>
            </div>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Grup Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block">Durum</span>
                  <Badge variant={bannerGroup.active ? "default" : "secondary"}>
                    {bannerGroup.active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Oynatma Modu</span>
                  <span>{bannerGroup.playMode === "MANUAL" ? "Manuel" : "Otomatik"}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Animasyon</span>
                  <span>{getAnimationText(bannerGroup.animation)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Görüntülenme Süresi</span>
                  <span>{bannerGroup.duration / 1000} saniye</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Boyut</span>
                  <span>{bannerGroup.width}x{bannerGroup.height} px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-[600px]">
              <TabsTrigger value="banners">Bannerlar</TabsTrigger>
              <TabsTrigger value="preview">Önizleme</TabsTrigger>
              <TabsTrigger value="statistics">İstatistikler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="banners" className="mt-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Bannerlar</CardTitle>
                  <CardDescription>
                    Bu gruptaki bannerların listesi. Sıralamayı değiştirmek için bannerları sürükleyebilirsiniz.
                    {bannerGroup.banners.some(b => !b.active) && (
                      <p className="text-yellow-600 mt-2">
                        Pasif banner'lar mevcut. Bunları yeniden boyutlandırıp aktifleştirmek için 
                        &quot;Görselleri Yeniden Boyutlandır&quot; butonunu kullanabilirsiniz.
                      </p>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bannerGroup?.banners.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Henüz banner eklenmemiş</p>
                  ) : (
                    <div className="rounded-md border">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[140px]">Görsel</TableHead>
                              <TableHead>Başlık</TableHead>
                              <TableHead>Hedef URL</TableHead>
                              <TableHead>Sıra</TableHead>
                              <TableHead>Durum</TableHead>
                              <TableHead>Boyutlar</TableHead>
                              <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <SortableContext
                              items={bannerGroup?.banners || []}
                              strategy={verticalListSortingStrategy}
                            >
                              {bannerGroup?.banners.map((banner) => (
                                <SortableTableRow 
                                  key={banner.id} 
                                  banner={banner}
                                  groupWidth={bannerGroup.width}
                                  groupHeight={bannerGroup.height}
                                />
                              ))}
                            </SortableContext>
                          </TableBody>
                        </Table>
                      </DndContext>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Önizleme</CardTitle>
                  <CardDescription>
                    Bu banner grubunun web sitesinde nasıl görüneceğini önizleyin. Farklı bir animasyon seçip kaydedebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BannerPreview
                    banners={bannerGroup.banners}
                    animation={bannerGroup.animation as AnimationType}
                    duration={bannerGroup.duration}
                    playMode={bannerGroup.playMode}
                    width={bannerGroup.width}
                    height={bannerGroup.height}
                    groupId={resolvedParams.id}
                    onAnimationChange={handleAnimationChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="statistics" className="mt-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>İstatistikler</CardTitle>
                  <CardDescription>
                    Bu banner grubuna ait görüntülenme ve tıklama istatistikleri.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BannerStatistics 
                    groupId={resolvedParams.id}
                    banners={bannerGroup.banners}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DetailDialogContext.Provider>
  )
}

function getAnimationText(animation: string) {
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