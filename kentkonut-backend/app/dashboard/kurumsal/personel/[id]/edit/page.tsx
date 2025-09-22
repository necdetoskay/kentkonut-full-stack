"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Users, Save, Image as ImageIcon, FileText } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector"
import { EnhancedCVUploader } from "@/components/media/EnhancedCVUploader"
import { toast } from "sonner"
import { notFound } from "next/navigation"

interface Department {
  id: string
  name: string
}

interface PersonnelFormData {
  name: string
  title: string
  content: string
  phone: string
  email: string
  imageUrl: string
  slug: string
  type: "DIRECTOR" | "CHIEF"
  isActive: boolean
  order: number
  departmentId?: string
}

interface GalleryItem {
  id?: string
  mediaId: string
  type: "IMAGE" | "DOCUMENT" | "PDF" | "WORD"
  title: string
  description: string
  order: number
}

export default function EditPersonnelPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const resolvedParams = params
  const [departments, setDepartments] = useState<Department[]>([])
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<PersonnelFormData>({
    name: '',
    title: '',
    content: '',
    phone: '',
    email: '',
    imageUrl: '',
    slug: '',
    type: 'CHIEF',
    isActive: true,
    order: 0,
    departmentId: undefined
  })
  useEffect(() => {
    const loadData = async () => {
      const depts = await fetchDepartments()
      await fetchPersonnel(depts)
    }
    loadData()
  }, [])
  
  const fetchPersonnel = async (depts: Department[]) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/personnel/${resolvedParams.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Personel bilgileri yüklenemedi')
      }
      
      const data = await response.json()
      
      // Department bilgisini relation'lardan al
      let departmentId: string | undefined = undefined
      let currentDept: Department | null = null
      
      // Önce director olup olmadığını kontrol et
      if (data.directedDept) {
        departmentId = data.directedDept.id
        currentDept = data.directedDept
      }
      // Eğer director değilse, chief olduğu departmanları kontrol et
      else if (data.chiefInDepts && data.chiefInDepts.length > 0) {
        // İlk departmanı al (genellikle bir personel tek departmanda chief olur)
        departmentId = data.chiefInDepts[0].id
        currentDept = data.chiefInDepts[0]
      }
      
      setFormData({
        name: data.name || '',
        title: data.title || '',
        content: data.content || '',
        phone: data.phone || '',
        email: data.email || '',
        imageUrl: data.imageUrl || '',
        slug: data.slug || '',
        type: data.type || 'CHIEF',
        isActive: data.isActive,
        order: data.order || 0,
        departmentId: departmentId
      })
      
      // Current department'ı set et
      if (currentDept) {
        setCurrentDepartment(currentDept)
      }

      if (data.galleryItems && data.galleryItems.length > 0) {
        const cv = data.galleryItems.find((item: any) => item.type === 'PDF' || item.type === 'WORD')
        if (cv) {
          setCvUrl(cv.media.url)
        }
        setGalleryItems(data.galleryItems)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Personel bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async (): Promise<Department[]> => {
    try {
      const response = await fetch('/api/departments')
      if (!response.ok) {
        throw new Error('Birimler yüklenemedi')
      }
      const data = await response.json()
      setDepartments(data)
      return data
    } catch (err) {
      setError('Birimler yüklenemedi')
      console.error(err)
      return []
    }
  }
  const handleEnhancedCVSelect = (cvUrl: string, mediaId?: number) => {
    if (!cvUrl) {
      // Remove CV
      setCvUrl('')
      // Remove CV from gallery items
      const updatedItems = galleryItems.filter(item =>
        item.type !== 'PDF' && item.type !== 'WORD'
      )
      setGalleryItems(updatedItems)
      return
    }

    // Set CV URL
    setCvUrl(cvUrl)

    // If mediaId is provided, create gallery item
    if (mediaId) {
      // Determine file type from URL or assume PDF
      const fileType = cvUrl.toLowerCase().includes('.doc') ? 'WORD' : 'PDF'

      // Create gallery item
      const newGalleryItem: GalleryItem = {
        mediaId: mediaId,
        type: fileType,
        title: 'CV',
        description: 'Personel özgeçmiş dosyası',
        order: 0
      }

      // Update gallery items (replace existing CV if any)
      const existingCvIndex = galleryItems.findIndex(item =>
        item.type === 'PDF' || item.type === 'WORD'
      )

      if (existingCvIndex > -1) {
        const updatedItems = [...galleryItems];
        updatedItems[existingCvIndex] = newGalleryItem;
        setGalleryItems(updatedItems);
      } else {
        setGalleryItems(prev => [...prev, newGalleryItem]);
      }
    }
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCvFile(file)
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError('Yalnızca PDF veya Word dosyaları yüklenebilir')
      return
    }

    try {
      setUploadingCv(true)

      const formData = new FormData()
      formData.append('file', file) // Use 'file' (singular) like working implementation
      formData.append('category', 'kurumsal/birimler') // Use 'category' like working implementation

      const response = await fetch('/api/media/upload', { // Use working API endpoint
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('CV yükleme başarısız')
      }

      const media = await response.json() // Direct media object like working implementation

      console.log('CV uploaded successfully:', media)
      
      // Use the enhanced CV select handler
      handleEnhancedCVSelect(media.url || media.path, media.id)
      toast.success("CV başarıyla yüklendi.")
    } catch (err) {
      setError('CV yükleme sırasında bir hata oluştu')
      console.error('CV upload error:', err)
      toast.error('CV yükleme başarısız')
    } finally {
      setUploadingCv(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/personnel/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, galleryItems })
      })

      if (!response.ok) {
        throw new Error('Personel güncelleme başarısız')
      }

      const result = await response.json();
      
      toast.success("Personel başarıyla güncellendi.")
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  const generateSlug = () => {
    if (!formData.name) return
    
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    setFormData(prev => ({ ...prev, slug }))
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (    <div className="p-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Birimler", href: "/dashboard/kurumsal/birimler" },
          ...(currentDepartment ? [{
            name: currentDepartment.name,
            href: `/dashboard/kurumsal/birimler/${currentDepartment.id}`
          }] : []),
          { name: "Personel Düzenle", href: `/dashboard/kurumsal/personel/${resolvedParams.id}/edit` },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Personel Düzenle</h1>
          <p className="text-gray-600 mt-2">{formData.name}</p>
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
                <Label htmlFor="name">Adı Soyadı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  onBlur={generateSlug}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Ünvan *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Personel Tipi *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "DIRECTOR" | "CHIEF") => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Personel tipini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRECTOR">Müdür</SelectItem>
                    <SelectItem value="CHIEF">Şef</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Bağlı Olduğu Birim *</Label>
                <Select
                  value={formData.departmentId || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
                >
                  <SelectTrigger id="departmentId">
                    <SelectValue placeholder="Birim seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">SEO URL</Label>
                <Input
                  id="slug"
                  placeholder="personel-url-adresi"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
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
            </div>

            <div className="space-y-2">
              <Label>Profil Resmi</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Görsel URL'si"
                  className="flex-grow"
                />
                <GlobalMediaSelector
                  onSelect={(file: GlobalMediaFile) => setFormData(prev => ({ ...prev, imageUrl: file.url }))}
                  trigger={
                    <Button type="button" variant="outline">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Galeriden Seç
                    </Button>
                  }
                  defaultCategory="corporate-images"
                  title="Profil Resmi Seç"
                />
              </div>
              {formData.imageUrl && (
                <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden border">
                  <img
                    src={formData.imageUrl}
                    alt="Profil Resmi Önizleme"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>

            <EnhancedCVUploader
              onCVSelect={handleEnhancedCVSelect}
              currentCVUrl={cvUrl}
              isUploading={uploadingCv}
              onUploadStart={() => setUploadingCv(true)}
              onUploadEnd={() => setUploadingCv(false)}
              onError={(error) => setError(error)}
              label="Özgeçmiş (CV) Dosyası"
              description="Galeriden mevcut CV dosyalarını seçebilir veya yeni dosya yükleyebilirsiniz"
            />
            
            <div className="space-y-2">
              <Label htmlFor="content">Özgeçmiş İçeriği</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Özgeçmiş içeriğinizi yazın ve biçimlendirin..."
                minHeight="200px"
                mediaFolder="kurumsal-images"
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
                onClick={() => router.back()}
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
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
