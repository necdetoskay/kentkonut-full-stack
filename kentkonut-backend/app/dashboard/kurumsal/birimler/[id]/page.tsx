"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Building2, Save, Users, Trash2, ImageIcon, Hash } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { generateSlug, isValidSlug } from "@/lib/utils/slug"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"
import { Textarea } from "@/components/ui/textarea"
import { notFound } from "next/navigation"
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector"
import { QuickAccessLinksManager } from "@/components/quick-access/QuickAccessLinksManager"
import { toast } from "sonner"

interface Personnel {
  id: string
  name: string
  title: string
  content: string
  phone: string | null
  email: string | null
  imageUrl: string | null
  slug: string | null
  order: number
  isActive: boolean
  type: "DIRECTOR" | "CHIEF"
  createdAt: string
  updatedAt: string
}

interface QuickLink {
  id: string
  title: string
  url: string
  icon: string | null
  departmentId: string
  order: number
  createdAt: string
  updatedAt: string
}

interface Department {
  id: string
  name: string
  content: string
  slug: string | null
  imageUrl: string | null
  directorId: string | null
  services: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  order: number
  director: Personnel | null
  chiefs: Personnel[]
  quickLinks: QuickLink[]
}

interface DepartmentFormData {
  name: string
  content: string
  slug: string
  imageUrl: string
  services: string[]
  isActive: boolean
  order: number
  hasQuickAccess?: boolean // Hızlı erişim aktif mi?
}

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const resolvedParams = params
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [servicesText, setServicesText] = useState('')
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    content: '',
    slug: '',
    imageUrl: '',
    services: [],
    isActive: true,
    order: 0,
    hasQuickAccess: false // Hızlı erişim aktif mi?
  })
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  useEffect(() => {
    fetchDepartment()
  }, [])
  const fetchDepartment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/departments/${resolvedParams.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Birim bilgileri yüklenemedi')
      }
      
      const data = await response.json()
      setDepartment(data)
        // Initialize form data
      setFormData({
        name: data.name || '',
        content: data.content || '',
        slug: data.slug || '',
        imageUrl: data.imageUrl || '',
        services: data.services || [],
        isActive: data.isActive,
        order: data.order || 0,
        hasQuickAccess: data.hasQuickAccess || false
      })

      setServicesText((data.services || []).join('\n'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Birim bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

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
    setError(null) // Clear any previous errors
    try {
      const response = await fetch(`/api/departments/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Güncelleme başarısız')
      }

      // Instead of redirecting, show success message and refresh data
      const updatedDepartment = await response.json()
      setDepartment(updatedDepartment)
      router.refresh() // Refresh the page data
      toast.success('Birim başarıyla güncellendi')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePersonnelDelete = async (personnelId: string) => {
    if (!window.confirm('Bu personeli departmandan kaldırmak istediğinizden emin misiniz?')) {
      return
    }    try {
      // Bu kısım backend API'sine göre düzenlenmeli
      const response = await fetch(`/api/departments/${resolvedParams.id}/personnel/${personnelId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Personel kaldırılamadı')
      }

      // Başarılı olursa departman bilgisini yeniden yükle
      fetchDepartment()
    } catch (error) {
      setError('Personel kaldırılırken bir hata oluştu')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Birim bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Birim bulunamadı</p>
          <Button 
            onClick={() => router.push('/dashboard/kurumsal/birimler')}
            className="mt-2"
          >
            Birimler Sayfasına Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Birimler", href: "/dashboard/kurumsal/birimler" },
          { name: department.name, href: `/dashboard/kurumsal/birimler/${resolvedParams.id}` },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{department.name}</h1>
          <p className="text-gray-600 mt-2">Birim Düzenleme</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="personnel">Birim Personeli</TabsTrigger>
          <TabsTrigger value="quicklinks">Hızlı Bağlantılar</TabsTrigger>
          {formData.hasQuickAccess && (
            <TabsTrigger value="quickaccess">Hızlı Erişim</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
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
                    placeholder="Birim içeriğinizi yazın ve biçimlendirin..."
                    minHeight="200px"
                    mediaFolder="kurumsal"
                  />
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                      )}                        <GlobalMediaSelector
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
                </div><div className="space-y-2">
                  <Label htmlFor="services">Birim Hizmetleri</Label>
                  <p className="text-sm text-gray-500">Her satıra bir hizmet yazın</p>
                  <Textarea
                    id="services"
                    rows={5}
                    value={servicesText}
                    onChange={(e) => updateServices(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasQuickAccess"
                      checked={formData.hasQuickAccess || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasQuickAccess: checked }))}
                    />
                    <Label htmlFor="hasQuickAccess">Hızlı Erişim Aktif</Label>
                    <span className="text-sm text-gray-500">
                      (Aktif edildiğinde birim için hızlı erişim linkleri yönetilebilir)
                    </span>
                  </div>
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
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-semibold">Birim Personeli</h3>                <Button 
                  onClick={() => router.push(`/dashboard/kurumsal/birimler/new-personnel?departmentId=${resolvedParams.id}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Yeni Personel Ekle
                </Button>
              </div>

              {/* Birim Müdürü (Director) */}
              <div className="mb-8">
                <h4 className="font-medium text-lg mb-4">Birim Müdürü</h4>
                
                {department.director ? (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          {department.director.imageUrl && (
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                              <img 
                                src={department.director.imageUrl} 
                                alt={department.director.name}
                                className="h-full w-full object-cover" 
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{department.director.name}</p>
                            <p className="text-sm text-gray-500">{department.director.title}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/kurumsal/personel/${department.director?.id}/edit`)}
                          >
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Düzenle
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/kurumsal/personel/${department.director?.id}`)}
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handlePersonnelDelete(department.director!.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                    <p className="text-gray-500">Bu birime atanmış müdür bulunmamaktadır</p>                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(`/dashboard/kurumsal/birimler/new-personnel?departmentId=${resolvedParams.id}&type=DIRECTOR`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Müdür Ata
                    </Button>
                  </div>
                )}
              </div>

              {/* Birim Şefleri (Chiefs) */}
              <div>
                <h4 className="font-medium text-lg mb-4">Birim Şefleri</h4>
                
                {department.chiefs && department.chiefs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {department.chiefs.map(chief => (
                      <Card key={chief.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                              {chief.imageUrl && (
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                  <img 
                                    src={chief.imageUrl} 
                                    alt={chief.name}
                                    className="h-full w-full object-cover" 
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">{chief.name}</p>
                                <p className="text-sm text-gray-500">{chief.title}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/kurumsal/personel/${chief.id}/edit`)}
                              >
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Düzenle
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/kurumsal/personel/${chief.id}`)}
                              >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handlePersonnelDelete(chief.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                    <p className="text-gray-500">Bu birime atanmış şef bulunmamaktadır</p>                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(`/dashboard/kurumsal/birimler/new-personnel?departmentId=${resolvedParams.id}&type=CHIEF`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Şef Ekle
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quicklinks">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-semibold">Hızlı Bağlantılar</h3>
                <Button onClick={() => router.push(`/dashboard/kurumsal/birim-hizli-baglanti?departmentId=${resolvedParams.id}`)}>
                  Hızlı Bağlantıları Yönet
                </Button>
              </div>

              {department.quickLinks && department.quickLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {department.quickLinks.map((link) => (
                    <Card key={link.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {link.icon && (
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary bg-opacity-10 text-primary">
                                <i className={`fas fa-${link.icon}`}></i>
                              </span>
                            )}
                            <div>
                              <p className="font-medium">{link.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{link.url}</p>
                            </div>
                          </div>
                          <Badge variant="outline">#{link.order}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                  <p className="text-gray-500">Bu birime ait hızlı bağlantı bulunmamaktadır</p>
                </div>
              )}            </CardContent>
          </Card>        </TabsContent>

        {formData.hasQuickAccess && (
          <TabsContent value="quickaccess">
            <QuickAccessLinksManager
              moduleType="department"
              moduleId={department?.id || ''}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
