"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { BannerFormData, BannerGroup } from '@/types'
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector'
// Note: Use native <img> for admin preview to avoid Next/Image optimizer issues in Docker
import { getMediaUrl } from '@/lib/media-utils'

interface PageProps {
  params: {
    id: string
  }
}

export default function NewBannerPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = params
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null)
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    link: '',
    isActive: true,
    deletable: true,
    order: 0,
    imageUrl: '',
    altText: '',
    bannerGroupId: parseInt(id)
  })

  useEffect(() => {
    fetchBannerGroup()
  }, [id])

  // Seçili medya değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (selectedMedia) {
      setFormData(prev => ({
        ...prev,
        imageUrl: selectedMedia.url,
        altText: selectedMedia.alt || selectedMedia.originalName
      }))
    }
  }, [selectedMedia])

  const fetchBannerGroup = async () => {
    try {
      const response = await fetch(`/api/banner-groups/${id}`)
      const data = await response.json()

      if (data.success) {
        setBannerGroup(data.bannerGroup)
      } else {
        alert('Banner grubu bulunamadı')
        router.push('/dashboard/banner-groups')
        return
      }
    } catch (error) {
      alert('Banner grubu yüklenirken hata oluştu')
      router.push('/dashboard/banner-groups')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/banner-groups/${id}/banners`)
      } else {
        alert(data.error || 'Banner oluşturulurken hata oluştu')
      }
    } catch (error) {
      alert('Banner oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BannerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMediaSelect = (media: GlobalMediaFile) => {
    setSelectedMedia(media)
  }

  const clearSelectedMedia = () => {
    setSelectedMedia(null)
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      altText: ''
    }))
  }

  if (fetching) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Banner grubu yükleniyor...</p>
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
          { name: 'Bannerlar', href: `/dashboard/banner-groups/${id}/banners` },
          { name: 'Yeni Banner', href: `/dashboard/banner-groups/${id}/banners/new` }
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/banner-groups/${id}/banners`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yeni Banner</h1>
          <p className="text-gray-600">{bannerGroup.name} grubuna banner ekle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Banner Başlığı *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Örn: Yeni Proje Lansmanı"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Banner hakkında açıklama..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Banner tıklandığında yönlendirilecek URL</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="deletable"
                  checked={formData.deletable}
                  onCheckedChange={(checked) => handleInputChange('deletable', checked)}
                />
                <Label htmlFor="deletable">Silinebilir</Label>
              </div>
            </CardContent>
          </Card>

          {/* Görsel */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Görseli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Görsel Seç *</Label>
                <div className="mt-2">
                  <GlobalMediaSelector
                    onSelect={handleMediaSelect}
                    selectedMedia={selectedMedia}
                    defaultCategory="banner-images"
                    targetWidth={bannerGroup.width}
                    targetHeight={bannerGroup.height}
                    width={bannerGroup.width}
                    height={bannerGroup.height}
                    buttonText="Banner Görseli Seç"
                    title="Banner Görseli Seç"
                    description={`${bannerGroup.name} grubu için banner görseli seçin veya yükleyin`}
                    acceptedTypes={['image/*']}
                    restrictToCategory={true}
                    customFolder="banners"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Önerilen boyut: {bannerGroup.width}×{bannerGroup.height}px
                </p>
              </div>

              {/* Seçili Görsel Önizleme */}
              {selectedMedia && (
                <div>
                  <Label>Seçili Görsel</Label>
                  <div className="mt-2 relative">
                    <div className="relative w-full max-w-md h-32 bg-gray-100 rounded-lg overflow-hidden border">
                      <img 
                        src={getMediaUrl(selectedMedia.url, 'banners')}
                        alt={selectedMedia.alt || selectedMedia.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Preview image load error:', (e.currentTarget as HTMLImageElement).src)
                        }}
                      />
                      <button
                        type="button"
                        onClick={clearSelectedMedia}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Dosya:</strong> {selectedMedia.originalName}</p>
                      <p><strong>Boyut:</strong> {selectedMedia.size} bytes</p>
                      {selectedMedia.alt && <p><strong>Alt Text:</strong> {selectedMedia.alt}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={formData.altText}
                  onChange={(e) => handleInputChange('altText', e.target.value)}
                  placeholder="Banner görselinin açıklaması"
                />
                <p className="text-xs text-gray-500 mt-1">SEO ve erişilebilirlik için önemli</p>
              </div>
            </CardContent>
          </Card>

          {/* Sıralama */}
          <Card>
            <CardHeader>
              <CardTitle>Sıralama</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="order">Sıra Numarası</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Düşük numaralar önce gösterilir. 0 = otomatik sıralama
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banner Grubu Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Grup Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Grup Adı</p>
                  <p className="text-gray-900">{bannerGroup.name}</p>
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

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/banner-groups/${id}/banners`}>
              <Button variant="outline" type="button">
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !selectedMedia}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
