"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ArrowLeft, Save, Calculator, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { BannerGroup, BannerGroupFormData, BANNER_POSITION_OPTIONS } from '@/types'
import { BANNER_ANIMASYON_TIPLERI } from '@/shared/types'

interface PageProps {
  params: {
    id: string
  }
}

export default function EditBannerGroupPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = params
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [formData, setFormData] = useState<BannerGroupFormData>({
    name: '',
    description: '',
    isActive: true,
    deletable: true,
    width: 1200,
    height: 400,
    mobileWidth: 400,
    mobileHeight: 200,
    tabletWidth: 800,
    tabletHeight: 300,
    displayDuration: 5000,
    transitionDuration: 0.5,
    animationType: 'SOLUKLESTIR',
    positionUUID: 'none',
    fallbackGroupId: undefined
  })

  // Oranları hesapla
  const calculateProportionalSizes = (newWidth: number, newHeight: number) => {
    const originalRatio = 1200 / 400 // 3:1 oranı
    const newRatio = newWidth / newHeight

    // Mobil boyutlar (varsayılan 400x200 - 2:1 oranı)
    const mobileRatio = 2
    const mobileWidth = Math.round(newWidth * 0.33) // Desktop'un 1/3'ü
    const mobileHeight = Math.round(mobileWidth / mobileRatio)

    // Tablet boyutlar (varsayılan 800x300 - 2.67:1 oranı)
    const tabletRatio = 2.67
    const tabletWidth = Math.round(newWidth * 0.67) // Desktop'un 2/3'ü
    const tabletHeight = Math.round(tabletWidth / tabletRatio)

    return {
      mobileWidth,
      mobileHeight,
      tabletWidth,
      tabletHeight
    }
  }

  useEffect(() => {
    const fetchBannerGroup = async () => {
      try {
        const response = await fetch(`/api/banner-groups/${id}`)
        const data = await response.json()

        if (data.success) {
          console.log('📥 Fetched banner group:', data.bannerGroup)
          setFormData(data.bannerGroup)
        } else {
          alert('Banner grubu bulunamadı')
          router.push('/dashboard/banner-groups')
        }
      } catch (error) {
        alert('Banner grubu yüklenirken hata oluştu')
        router.push('/dashboard/banner-groups')
      } finally {
        setFetching(false)
      }
    }

    fetchBannerGroup()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('📤 Submitting form data:', formData)
      
      const response = await fetch(`/api/banner-groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('📥 Response:', data)

      if (data.success) {
        router.push('/dashboard/banner-groups')
      } else {
        alert(data.error || 'Banner grubu güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      alert('Banner grubu güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BannerGroupFormData, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // Boyut değişikliklerinde orantılı güncelleme (sadece otomatik hesaplama aktifse)
      if (autoCalculate && (field === 'width' || field === 'height')) {
        const newWidth = field === 'width' ? value : prev.width
        const newHeight = field === 'height' ? value : prev.height

        if (newWidth > 0 && newHeight > 0) {
          const proportionalSizes = calculateProportionalSizes(newWidth, newHeight)
          return {
            ...newData,
            ...proportionalSizes
          }
        }
      }

      return newData
    })
  }

  const handleAutoCalculate = () => {
    if (formData.width > 0 && formData.height > 0) {
      const proportionalSizes = calculateProportionalSizes(formData.width, formData.height)
      setFormData(prev => ({
        ...prev,
        ...proportionalSizes
      }))
    }
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

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        segments={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Banner Grupları', href: '/dashboard/banner-groups' },
          { name: formData.name || 'Banner Grubu', href: `/dashboard/banner-groups/${id}` },
          { name: 'Düzenle', href: `/dashboard/banner-groups/${id}/edit` }
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
        <h1 className="text-3xl font-bold">Banner Grubu Düzenle</h1>
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
                <Label htmlFor="name">Grup Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Örn: Ana Sayfa Carousel"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Banner grubu hakkında açıklama..."
                  rows={3}
                />
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

          {/* UUID Pozisyon Sistemi */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Pozisyon Sistemi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="positionUUID">Banner Pozisyonu</Label>
                <Select
                  value={formData.positionUUID || 'none'}
                  onValueChange={(value) => handleInputChange('positionUUID', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pozisyon seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BANNER_POSITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Bu banner grubunun hangi pozisyonda gösterileceğini belirler
                </p>
              </div>

              <div>
                <Label htmlFor="fallbackGroupId">Yedek Banner Grubu ID</Label>
                <Input
                  id="fallbackGroupId"
                  type="number"
                  value={formData.fallbackGroupId || ''}
                  onChange={(e) => handleInputChange('fallbackGroupId', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Yedek grup ID'si (opsiyonel)"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu grup aktif değilse gösterilecek yedek banner grubu ID'si
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Boyutlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Boyutlar
                <div className="flex items-center gap-2">
                  <Switch
                    id="autoCalculate"
                    checked={autoCalculate}
                    onCheckedChange={setAutoCalculate}
                  />
                  <Label htmlFor="autoCalculate" className="text-sm">
                    {autoCalculate ? 'Otomatik Hesaplama' : 'Manuel'}
                  </Label>
                  {!autoCalculate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoCalculate}
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      Hesapla
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Genişlik (px) *</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', parseInt(e.target.value))}
                    min="1"
                  />
                  {autoCalculate && (
                    <p className="text-xs text-gray-500 mt-1">Mobil ve tablet boyutları otomatik hesaplanır</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="height">Yükseklik (px) *</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                    min="1"
                  />
                  {autoCalculate && (
                    <p className="text-xs text-gray-500 mt-1">Mobil ve tablet boyutları otomatik hesaplanır</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                  {autoCalculate ? (
                    <>
                      <Calculator className="h-4 w-4" />
                      Otomatik Hesaplanan Boyutlar
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Manuel Boyutlar
                    </>
                  )}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Mobil Boyutlar</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        type="number"
                        value={formData.mobileWidth}
                        onChange={(e) => handleInputChange('mobileWidth', parseInt(e.target.value))}
                        min="1"
                        className="text-sm"
                        disabled={autoCalculate}
                      />
                      <Input
                        type="number"
                        value={formData.mobileHeight}
                        onChange={(e) => handleInputChange('mobileHeight', parseInt(e.target.value))}
                        min="1"
                        className="text-sm"
                        disabled={autoCalculate}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.mobileWidth} x {formData.mobileHeight} px
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Tablet Boyutlar</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        type="number"
                        value={formData.tabletWidth}
                        onChange={(e) => handleInputChange('tabletWidth', parseInt(e.target.value))}
                        min="1"
                        className="text-sm"
                        disabled={autoCalculate}
                      />
                      <Input
                        type="number"
                        value={formData.tabletHeight}
                        onChange={(e) => handleInputChange('tabletHeight', parseInt(e.target.value))}
                        min="1"
                        className="text-sm"
                        disabled={autoCalculate}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.tabletWidth} x {formData.tabletHeight} px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animasyon Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle>Animasyon Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="animationType">Animasyon Tipi</Label>
                <Select
                  value={formData.animationType}
                  onValueChange={(value) => handleInputChange('animationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BANNER_ANIMASYON_TIPLERI).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="displayDuration">Gösterim Süresi (ms)</Label>
                <Input
                  id="displayDuration"
                  type="number"
                  value={formData.displayDuration}
                  onChange={(e) => handleInputChange('displayDuration', parseInt(e.target.value))}
                  min="100"
                  step="100"
                />
              </div>

              <div>
                <Label htmlFor="transitionDuration">Geçiş Süresi (saniye)</Label>
                <Input
                  id="transitionDuration"
                  type="number"
                  value={formData.transitionDuration}
                  onChange={(e) => handleInputChange('transitionDuration', parseFloat(e.target.value))}
                  min="0.1"
                  max="5"
                  step="0.1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/banner-groups">
              <Button variant="outline" type="button">
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 