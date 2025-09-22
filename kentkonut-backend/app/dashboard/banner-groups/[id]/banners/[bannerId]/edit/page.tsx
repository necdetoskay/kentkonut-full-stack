'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Loader2, X, Calendar } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector'
import NextImage from 'next/image'
import { getMediaUrl } from '@/lib/media-utils'

// Route params will be read via useParams in this client component

interface Banner {
  id: number
  title: string
  description: string | null
  link: string | null
  isActive: boolean
  deletable: boolean
  order: number
  imageUrl: string
  altText: string | null
  bannerGroupId: number
  bannerGroup: {
    id: number
    name: string
  }
}

interface BannerGroup {
  id: number
  name: string
  description: string | null
  width?: number
  height?: number
}

export default function BannerEditPage() {
  const router = useRouter()
  const routeParams = useParams<{ id: string; bannerId: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    isActive: true,
    deletable: true,
    order: 1,
    startDate: '',
    endDate: '',
    imageUrl: '',
    altText: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch banner data
        const bannerResponse = await fetch(`/api/banners/${routeParams.bannerId}`)
        const bannerData = await bannerResponse.json()

        if (!bannerData.success) {
          throw new Error(bannerData.error || 'Banner bulunamadı')
        }

        // Fetch banner group data
        const groupResponse = await fetch(`/api/banner-groups/${routeParams.id}`)
        const groupData = await groupResponse.json()
        
        if (!groupData.success) {
          throw new Error(groupData.error || 'Banner grubu bulunamadı')
        }
        
        setBanner(bannerData.banner || bannerData.data)
        setBannerGroup(groupData.bannerGroup || groupData.data)

        // Set form data
        const banner = bannerData.banner || bannerData.data
        setFormData({
          title: banner.title || '',
          description: banner.description || '',
          link: banner.link || '',
          isActive: banner.isActive,
          deletable: banner.deletable,
          order: banner.order,
          startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
          endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
          imageUrl: banner.imageUrl || '',
          altText: banner.altText || ''
        })

        // Set selected media if image exists
        if (banner.imageUrl) {
          setSelectedMedia({
            id: banner.id,
            filename: banner.altText || 'Banner Image',
            originalName: banner.altText || 'Banner Image',
            mimeType: 'image/jpeg',
            size: 0,
            url: banner.imageUrl,
            alt: banner.altText || '',
            createdAt: banner.createdAt || new Date().toISOString()
          })
        }
        
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        alert('Veri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [routeParams.bannerId, routeParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate date range
    if (!validateDateRange()) {
      return
    }

    setSaving(true)

    // Declare here so it's accessible in catch block as well
    let submitData: any

    try {
      // Prepare form data with proper date formatting
      submitData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate : null,
        endDate: formData.endDate ? formData.endDate : null
      }

      const response = await fetch(`/api/banners/${routeParams.bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/banner-groups/${routeParams.id}/banners`)
      } else {
        console.error('❌ API Error:', data)
        alert(data.error || 'Banner güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      console.error('❌ Form data:', submitData)
      alert('Banner güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMediaSelect = (media: GlobalMediaFile) => {
    setSelectedMedia(media)
    setFormData(prev => ({
      ...prev,
      imageUrl: media.url,
      altText: media.alt || media.originalName
    }))
  }

  const clearSelectedMedia = () => {
    setSelectedMedia(null)
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      altText: ''
    }))
  }

  const validateDateRange = () => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate <= startDate) {
        alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır')
        return false
      }
    }
    return true
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
          { name: 'Bannerlar', href: `/dashboard/banner-groups/${bannerGroup.id}/banners` },
          { name: banner.title, href: '#' },
          { name: 'Düzenle', href: '#' }
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/banner-groups/${routeParams.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Banner Düzenle</h1>
          <p className="text-muted-foreground">{bannerGroup.name} - {banner.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banner Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Banner Başlığı *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Banner başlığını giriniz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Sıra</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Banner açıklaması (opsiyonel)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Bağlantı URL</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://example.com (opsiyonel)"
              />
            </div>

            {/* Date Range Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Gösterim Başlangıç Tarihi
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Banner bu tarihten itibaren gösterilmeye başlar (opsiyonel)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Gösterim Bitiş Tarihi
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || undefined}
                />
                <p className="text-xs text-gray-500">
                  Banner bu tarihte gösterilmeyi durdurur (opsiyonel)
                </p>
              </div>
            </div>

            {/* Date Range Validation Message */}
            {formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">
                  ⚠️ Bitiş tarihi başlangıç tarihinden sonra olmalıdır
                </p>
              </div>
            )}

            {/* Banner Görseli */}
            <div className="space-y-4">
              <div>
                <Label>Banner Görseli *</Label>
                <div className="mt-2">
                  <GlobalMediaSelector
                    onSelect={handleMediaSelect}
                    selectedMedia={selectedMedia}
                    defaultCategory="banner-images"
                    targetWidth={bannerGroup?.width || 1200}
                    targetHeight={bannerGroup?.height || 400}
                    width={bannerGroup?.width || 1200}
                    height={bannerGroup?.height || 400}
                    buttonText="Banner Görseli Seç"
                    title="Banner Görseli Seç"
                    description={`${bannerGroup?.name || 'Banner'} grubu için banner görseli seçin veya yükleyin`}
                    acceptedTypes={['image/*']}
                    restrictToCategory={true}
                    customFolder="banners"
                  />
                </div>
                {bannerGroup && (
                  <p className="text-xs text-gray-500 mt-1">
                    Önerilen boyut: {bannerGroup.width}×{bannerGroup.height}px
                  </p>
                )}
              </div>

              {/* Seçili Görsel Önizleme */}
              {selectedMedia && (
                <div>
                  <Label>Seçili Görsel</Label>
                  <div className="mt-2 relative">
                    <div className="relative w-full max-w-md h-32 bg-gray-100 rounded-lg overflow-hidden border">
                      <NextImage
                      src={getMediaUrl(selectedMedia.url, 'banners')}
                      alt={selectedMedia.alt || selectedMedia.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
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
                      {selectedMedia.size > 0 && <p><strong>Boyut:</strong> {selectedMedia.size} bytes</p>}
                      {selectedMedia.alt && <p><strong>Alt Text:</strong> {selectedMedia.alt}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="altText">Alt Metin</Label>
                <Input
                  id="altText"
                  value={formData.altText}
                  onChange={(e) => handleInputChange('altText', e.target.value)}
                  placeholder="Görsel açıklaması (erişilebilirlik için)"
                />
                <p className="text-xs text-gray-500">SEO ve erişilebilirlik için önemli</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
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
            </div>

            <div className="flex justify-end space-x-4">
              <Link href={`/dashboard/banner-groups/${routeParams.id}`}>
                <Button variant="outline" type="button">
                  İptal
                </Button>
              </Link>
              <Button type="submit" disabled={saving || !selectedMedia}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
              {!selectedMedia && (
                <p className="text-sm text-red-600">
                  Banner görseli seçilmelidir
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
