"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Building2, Save, Image as ImageIcon, Hash } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { generateSlug, isValidSlug } from "@/lib/utils/slug"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"
import { Textarea } from "@/components/ui/textarea"
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector"
import DepartmentSupervisorsManager from "../components/DepartmentSupervisorsManager"

interface DepartmentFormData {
  name: string
  content: string
  slug: string
  imageUrl: string
  services: string[]
  isActive: boolean
  order: number
}

export default function NewDepartmentPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [servicesText, setServicesText] = useState('')

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    content: '',
    slug: '',
    imageUrl: '',
    services: [],
    isActive: true,
    order: 0
  })
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [createdDepartmentId, setCreatedDepartmentId] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdDepartment, setCreatedDepartment] = useState<any>(null)

  useEffect(() => {
    setServicesText(formData.services.join('\n'))
  }, [])

  const updateServices = (text: string) => {
    setServicesText(text)
    const serviceList = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    setFormData(prev => ({ ...prev, services: serviceList }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('İşlem başarısız')
      }

      const result = await response.json()
      console.log('Department creation result:', result) // Debug log

      // Try different possible response formats
      const departmentId = result.id || result.data?.id || result.department?.id
      const departmentData = result.data || result.department || result

      if (departmentId) {
        setCreatedDepartmentId(departmentId)
        setCreatedDepartment(departmentData)
        setIsSuccess(true)
        setError(null)

        // Show success message
        console.log('Department created successfully with ID:', departmentId)
      } else {
        console.error('Could not extract department ID from response:', result)
        // Still show success but without supervisor management
        setIsSuccess(true)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  // Success view - show after department is created
  if (isSuccess) {
    return (
      <div className="p-6">
        <Breadcrumb
          segments={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Kurumsal", href: "/dashboard/kurumsal" },
            { name: "Birimler", href: "/dashboard/kurumsal/birimler" },
            { name: "Yeni Birim", href: "/dashboard/kurumsal/birimler/new" },
          ]}
          className="mb-4"
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-600">✅ Birim Başarıyla Oluşturuldu!</h1>
            <p className="text-gray-600 mt-2">
              {createdDepartment?.name || 'Yeni birim'} başarıyla oluşturuldu.
              Şimdi birim amirlerini ekleyebilirsiniz.
            </p>
          </div>
          <Button
            onClick={() => {
              router.push('/dashboard/kurumsal/birimler')
              router.refresh()
            }}
            variant="outline"
          >
            Birimler Sayfasına Dön
          </Button>
        </div>

        {/* Show supervisors manager if we have department ID */}
        {createdDepartmentId ? (
          <div className="space-y-6">
            <DepartmentSupervisorsManager
              departmentId={createdDepartmentId}
              isEditMode={true}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Birim oluşturuldu ancak birim amiri ekleme özelliği şu anda kullanılamıyor.
              </p>
              <Button
                onClick={() => {
                  router.push('/dashboard/kurumsal/birimler')
                  router.refresh()
                }}
              >
                Birimler Sayfasına Dön
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Normal form view
  return (
    <div className="p-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Birimler", href: "/dashboard/kurumsal/birimler" },
          { name: "Yeni Birim", href: "/dashboard/kurumsal/birimler/new" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Yeni Birim Oluştur</h1>
          <p className="text-gray-600 mt-2">Kurumsal yapıya yeni bir birim ekleyin</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Birim Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData(prev => ({ ...prev, name: newName }));

                    // Auto-generate slug if not manually edited
                    if (!isSlugManuallyEdited) {
                      const newSlug = generateSlug(newName);
                      setFormData(prev => ({ ...prev, slug: newSlug }));
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">SEO URL</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="slug"
                    placeholder="birim-url-adresi"
                    value={formData.slug}
                    onChange={(e) => {
                      const newSlug = e.target.value;
                      setFormData(prev => ({ ...prev, slug: newSlug }));
                      setIsSlugManuallyEdited(true);
                    }}
                    className="pl-10"
                  />
                </div>
                {formData.slug && !isValidSlug(formData.slug) && (
                  <p className="text-sm text-red-500">
                    Slug sadece küçük harf, rakam ve tire içermelidir
                  </p>
                )}
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="content">İçerik</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                minHeight="200px"
                mediaFolder="kurumsal"
              />
            </div>            <div className="space-y-2">
              <Label>Görsel</Label>
              <div className="space-y-3">
                {formData.imageUrl && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                      <img
                        src={formData.imageUrl}
                        alt="Birim görseli"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Birim görseli seçildi</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      Kaldır
                    </Button>
                  </div>
                )}
                  <GlobalMediaSelector
                  onSelect={(media: GlobalMediaFile) => {
                    setFormData(prev => ({ ...prev, imageUrl: media.url }))
                  }}
                  defaultCategory="corporate-images"
                  restrictToCategory={true}
                  trigger={
                    <Button type="button" variant="outline" className="w-full">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {formData.imageUrl ? "Görseli Değiştir" : "Görsel Seç"}
                    </Button>
                  }
                  title="Birim Görseli Seçin"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order">Sıralama</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order.toString()}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  order: parseInt(e.target.value) || 0
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Birim Hizmetleri</Label>
              <p className="text-sm text-gray-500">Her satıra bir hizmet yazın</p>
              <Textarea
                id="services"
                rows={5}
                value={servicesText}
                onChange={(e) => updateServices(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/kurumsal/birimler')}
                disabled={submitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>            </div>          </form>
        </CardContent>
      </Card>
    </div>
  )
}
