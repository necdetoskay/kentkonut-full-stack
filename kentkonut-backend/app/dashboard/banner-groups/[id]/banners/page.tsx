"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye, EyeOff, Lock, Unlock, ArrowLeft, ExternalLink, Image as ImageIcon, GripVertical, Move, FileText, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { BannerGroup, Banner } from '@/types'
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import NextImage from 'next/image'

interface PageProps {
  params: {
    id: string
  }
}

export default function BannerGroupDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = params
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null)
  const [reorderLoading, setReorderLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState<number | null>(null)

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
        alert('Banner grubu bulunamadı')
        router.push('/dashboard/banner-groups')
        return
      }

      // Bannerları getir
      const bannersResponse = await fetch(`/api/banners?bannerGroupId=${id}`)
      const bannersData = await bannersResponse.json()

      if (bannersData.success) {
        // Sıralama numarasına göre sırala
        const sortedBanners = (bannersData.data || []).sort((a: Banner, b: Banner) => a.order - b.order)
        setBanners(sortedBanners)
      } else {
        console.error('Bannerlar yüklenirken hata:', bannersData.error)
        setBanners([])
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
      alert('Veri yüklenirken hata oluştu')
      router.push('/dashboard/banner-groups')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/banners/${bannerToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Listeyi güncelle
        setBanners(prev => prev.filter(banner => banner.id !== bannerToDelete.id))
        setDeleteDialogOpen(false)
        setBannerToDelete(null)
      } else {
        alert(data.error || 'Banner silinirken hata oluştu')
      }
    } catch (error) {
      alert('Banner silinirken hata oluştu')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setBannerToDelete(null)
  }

  const handleToggleActive = async (banner: Banner) => {
    setToggleLoading(banner.id)
    
    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !banner.isActive
        })
      })

      const data = await response.json()

      if (data.success) {
        // Listeyi güncelle
        setBanners(prev => prev.map(b => 
          b.id === banner.id 
            ? { ...b, isActive: !b.isActive }
            : b
        ))
      } else {
        alert(data.error || 'Durum güncellenirken hata oluştu')
      }
    } catch (error) {
      alert('Durum güncellenirken hata oluştu')
    } finally {
      setToggleLoading(null)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(banners)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Yeni sıralama numaralarını hesapla
    const updatedBanners = items.map((banner, index) => ({
      ...banner,
      order: index + 1
    }))

    setBanners(updatedBanners)
    setReorderLoading(true)

    try {
      // Sıralama güncellemesini API'ye gönder
      const response = await fetch('/api/banners/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bannerGroupId: parseInt(id),
          bannerOrders: updatedBanners.map(banner => ({
            id: banner.id,
            order: banner.order
          }))
        })
      })

      const data = await response.json()

      if (!data.success) {
        // Hata durumunda orijinal sıralamayı geri yükle
        fetchData()
        alert(data.error || 'Sıralama güncellenirken hata oluştu')
      }
    } catch (error) {
      // Hata durumunda orijinal sıralamayı geri yükle
      fetchData()
      alert('Sıralama güncellenirken hata oluştu')
    } finally {
      setReorderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!bannerGroup) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500">Banner grubu bulunamadı</p>
          <Link href="/dashboard/banner-groups">
            <Button className="mt-4">Geri Dön</Button>
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
          { name: bannerGroup?.name || 'Banner Grubu', href: `/dashboard/banner-groups/${id}` },
          { name: 'Bannerlar', href: `/dashboard/banner-groups/${id}/banners` }
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/banner-groups">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{bannerGroup.name}</h1>
          <p className="text-gray-600">{bannerGroup.description}</p>
        </div>
      </div>

      {/* Banner Grubu Bilgileri */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grup Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Durum</p>
              <div className="flex items-center gap-2 mt-1">
                {bannerGroup.isActive ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    Pasif
                  </Badge>
                )}
                {bannerGroup.deletable ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Unlock className="h-3 w-3" />
                    Silinebilir
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Silinemez
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-600">Boyutlar</p>
              <p className="text-gray-900">
                Desktop: {bannerGroup.width}×{bannerGroup.height}px<br />
                Tablet: {bannerGroup.tabletWidth}×{bannerGroup.tabletHeight}px<br />
                Mobil: {bannerGroup.mobileWidth}×{bannerGroup.mobileHeight}px
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Animasyon</p>
              <p className="text-gray-900">
                Tip: {bannerGroup.animationType}<br />
                Gösterim: {bannerGroup.displayDuration}ms<br />
                Geçiş: {bannerGroup.transitionDuration}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bannerlar Başlığı */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Bannerlar</h2>
          <p className="text-gray-600">{banners.length} banner bulundu</p>
          {reorderLoading && (
            <p className="text-sm text-blue-600 flex items-center gap-1">
              <Move className="h-3 w-3 animate-pulse" />
              Sıralama güncelleniyor...
            </p>
          )}
        </div>
        <Link href={`/dashboard/banner-groups/${id}/banners/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Banner
          </Button>
        </Link>
      </div>

      {/* Bannerlar Listesi */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Bu grupta henüz banner bulunmuyor</p>
              <Link href={`/dashboard/banner-groups/${id}/banners/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Bannerı Ekle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="banners">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {banners.map((banner, index) => (
                  <Draggable key={banner.id} draggableId={banner.id.toString()} index={index}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'shadow-lg scale-105' : ''
                        }`}
                      >
                        <Card className={`${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Sürükle Tutamacı */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>

                              {/* Banner Görseli */}
                              <div className="flex-shrink-0">
                                {banner.imageUrl ? (
                                  <div className="relative w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                    <NextImage 
                                      src={banner.imageUrl} 
                                      alt={banner.altText || banner.title}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Banner Bilgileri */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      #{banner.order}
                                    </span>
                                    <h3 className="font-semibold text-lg truncate">{banner.title}</h3>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {banner.isActive ? (
                                      <Badge variant="default" className="flex items-center gap-1 text-xs">
                                        <Eye className="h-3 w-3" />
                                        Aktif
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                        <EyeOff className="h-3 w-3" />
                                        Pasif
                                      </Badge>
                                    )}
                                    {banner.deletable ? (
                                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                        <Unlock className="h-3 w-3" />
                                        Silinebilir
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                        <Lock className="h-3 w-3" />
                                        Silinemez
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500 text-xs">Açıklama</p>
                                    <p className="truncate">{banner.description || 'Açıklama yok'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">Link</p>
                                    <p className="truncate">{banner.link || 'Link yok'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">İstatistikler</p>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3 text-blue-600" />
                                        {banner.viewCount.toLocaleString()}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3 text-green-600" />
                                        {banner.clickCount.toLocaleString()}
                                      </span>
                                      {banner.viewCount > 0 && (
                                        <span className="text-purple-600 font-medium">
                                          CTR: {((banner.clickCount / banner.viewCount) * 100).toFixed(1)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">Oluşturulma</p>
                                    <p className="text-xs">
                                      {new Date(banner.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Aksiyon Butonları */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {/* Aktif/Pasif Toggle */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Aktif</span>
                                  <Switch
                                    checked={banner.isActive}
                                    onCheckedChange={() => handleToggleActive(banner)}
                                    disabled={toggleLoading === banner.id}
                                    className="data-[state=checked]:bg-green-600"
                                  />
                                  {toggleLoading === banner.id && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                  )}
                                </div>

                                {/* Diğer Aksiyonlar */}
                                <div className="flex items-center gap-2">
                                  {banner.link && (
                                    <a
                                      href={banner.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="Linki Aç"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  )}
                                  <Link href={`/dashboard/banner-groups/${id}/banners/${banner.id}`}>
                                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                                      <FileText className="h-4 w-4 mr-1" />
                                      Detaylar
                                    </Button>
                                  </Link>
                                  <Link href={`/dashboard/banner-groups/${id}/banners/${banner.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Düzenle
                                    </Button>
                                  </Link>
                                  {banner.deletable && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteClick(banner)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Sil
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Silme Onay Modalı */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bannerı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{bannerToDelete?.title}"</strong> bannerını silmek istediğinizden emin misiniz?
              <br /><br />
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleteLoading}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
