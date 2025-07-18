"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Edit, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import Link from 'next/link'
import { BannerGroup } from '@/types'

export default function BannerGroupsPage() {
  const [bannerGroups, setBannerGroups] = useState<BannerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerGroupToDelete, setBannerGroupToDelete] = useState<BannerGroup | null>(null)

  useEffect(() => {
    fetchBannerGroups()
  }, [])

  const fetchBannerGroups = async () => {
    try {
      const response = await fetch('/api/banner-groups')
      const data = await response.json()

      if (data.success) {
        setBannerGroups(data.data || [])
      } else {
        console.error('Banner grupları yüklenirken hata:', data.error)
        setBannerGroups([])
      }
    } catch (error) {
      console.error('Banner grupları yüklenirken hata:', error)
      setBannerGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (bannerGroup: BannerGroup) => {
    setBannerGroupToDelete(bannerGroup)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bannerGroupToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/banner-groups/${bannerGroupToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Listeyi güncelle
        setBannerGroups(prev => prev.filter(group => group.id !== bannerGroupToDelete.id))
        setDeleteDialogOpen(false)
        setBannerGroupToDelete(null)
      } else {
        alert(data.error || 'Banner grubu silinirken hata oluştu')
      }
    } catch (error) {
      alert('Banner grubu silinirken hata oluştu')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setBannerGroupToDelete(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Banner grupları yükleniyor...</p>
          </div>
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
          { name: 'Banner Grupları', href: '/dashboard/banner-groups' }
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Banner Grupları</h1>
        <Link href="/dashboard/banner-groups/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Banner Grubu
          </Button>
        </Link>
      </div>

      {bannerGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Henüz banner grubu oluşturulmamış</p>
              <Link href="/dashboard/banner-groups/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Banner Grubunu Oluştur
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bannerGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {group.isActive ? (
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
                      {group.deletable ? (
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
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/banner-groups/${group.id}/banners`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Bannerlar
                      </Button>
                    </Link>
                    <Link href={`/dashboard/banner-groups/${group.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                    </Link>
                    {group.deletable && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(group)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Açıklama</p>
                    <p className="text-gray-900">{group.description || 'Açıklama yok'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Boyutlar</p>
                    <p className="text-gray-900">
                      Desktop: {group.width}×{group.height}px<br />
                      Tablet: {group.tabletWidth}×{group.tabletHeight}px<br />
                      Mobil: {group.mobileWidth}×{group.mobileHeight}px
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Animasyon</p>
                    <p className="text-gray-900">
                      Tip: {group.animationType}<br />
                      Gösterim: {group.displayDuration}ms<br />
                      Geçiş: {group.transitionDuration}s
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Oluşturulma</p>
                    <p className="text-gray-900">
                      {new Date(group.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Silme Onay Modalı */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banner Grubunu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{bannerGroupToDelete?.name}"</strong> banner grubunu silmek istediğinizden emin misiniz?
              <br /><br />
              Bu işlem geri alınamaz ve gruptaki tüm bannerlar da silinecektir.
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