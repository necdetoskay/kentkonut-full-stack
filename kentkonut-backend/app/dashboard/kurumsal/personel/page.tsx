"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Users, Mail, Phone, Plus, Edit, Trash2, Save, X, Image, FileText, File, Upload, Eye } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"

interface GalleryItem {
  id: string
  personnelId: string
  mediaId: string
  type: 'IMAGE' | 'DOCUMENT' | 'PDF' | 'WORD'
  order: number
  title: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  media: {
    id: string
    filename: string
    originalName: string | null
    mimeType: string
    size: number
    path: string
    url: string | null
  }
}

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
  galleryItems?: GalleryItem[]
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
}

export default function PersonnelPage() {
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("directors")
  const [formData, setFormData] = useState<PersonnelFormData>({
    name: '',
    title: '',
    content: '',
    phone: '',
    email: '',
    imageUrl: '',
    slug: '',
    type: "DIRECTOR",
    isActive: true,
    order: 0
  })

  useEffect(() => {
    fetchPersonnel()
  }, [])

  const fetchPersonnel = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/personnel')
      if (!response.ok) {
        throw new Error('Personel yüklenemedi')
      }
      const data = await response.json()
      setPersonnel(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Personel yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingPersonnel(null)
    setFormData({
      name: '',
      title: '',
      content: '',
      phone: '',
      email: '',
      imageUrl: '',
      slug: '',
      type: activeTab === 'directors' ? 'DIRECTOR' : 'CHIEF',
      isActive: true,
      order: 0
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (person: Personnel) => {
    setEditingPersonnel(person)
    setFormData({
      name: person.name,
      title: person.title,
      content: person.content || '',
      phone: person.phone || '',
      email: person.email || '',
      imageUrl: person.imageUrl || '',
      slug: person.slug || '',
      type: person.type,
      isActive: person.isActive,
      order: person.order
    })
    setIsDialogOpen(true)
  }

  const openGalleryDialog = (person: Personnel) => {
    setSelectedPersonnel(person)
    setIsGalleryDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const url = editingPersonnel 
        ? `/api/personnel/${editingPersonnel.id}`
        : '/api/personnel'
      
      const method = editingPersonnel ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('İşlem başarısız')
      }

      const result = await response.json()
      
      if (editingPersonnel) {
        setPersonnel(prev => 
          prev.map(p => p.id === editingPersonnel.id ? result : p)
        )
      } else {
        setPersonnel(prev => [...prev, result])
      }
      
      setIsDialogOpen(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (person: Personnel) => {
    if (!confirm(`"${person.name}" personelini silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/personnel/${person.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      setPersonnel(prev => prev.filter(p => p.id !== person.id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Personel yükleniyor...</p>
        </div>
      </div>
    )
  }

  const directors = personnel.filter(p => p.type === 'DIRECTOR')
  const chiefs = personnel.filter(p => p.type === 'CHIEF')
  const displayPersonnel = activeTab === 'directors' ? directors : chiefs

  return (
    <div className="p-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Personel", href: "/dashboard/kurumsal/personel" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Personel Yönetimi</h1>
          <p className="text-gray-600 mt-2">Birim direktörleri ve şefleri</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="directors">Direktörler</TabsTrigger>
          <TabsTrigger value="chiefs">Şefler</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  {activeTab === 'directors' ? 'Yeni Direktör' : 'Yeni Şef'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPersonnel 
                      ? 'Personel Düzenle' 
                      : `Yeni ${activeTab === 'directors' ? 'Direktör' : 'Şef'} Ekle`}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                      <Label htmlFor="slug">SEO URL</Label>
                      <Input
                        id="slug"
                        placeholder="personel-url-adresi"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Personel Tipi</Label>
                      <select
                        id="type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          type: e.target.value as "DIRECTOR" | "CHIEF" 
                        }))}
                      >
                        <option value="DIRECTOR">Direktör</option>
                        <option value="CHIEF">Şef</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Özgeçmiş</Label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      minHeight="200px"
                    />
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
                      <Label htmlFor="imageUrl">Profil Görsel URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
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
                      onClick={() => setIsDialogOpen(false)}
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
                          {editingPersonnel ? 'Güncelle' : 'Kaydet'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    Galeri Yönetimi: {selectedPersonnel?.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Dosya ve Görsel Galerisi</h3>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Image className="h-4 w-4 mr-2" />
                        Görsel Ekle
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Döküman Ekle
                      </Button>
                    </div>
                  </div>
                  
                  {selectedPersonnel?.galleryItems?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedPersonnel.galleryItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          {item.type === 'IMAGE' ? (
                            <div className="aspect-video bg-gray-100 relative">
                              <img 
                                src={item.media.url || item.media.path} 
                                alt={item.title || 'Galeri Görseli'} 
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 flex items-center justify-center p-4">
                              <File className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-sm truncate">
                                {item.title || item.media.originalName || item.media.filename}
                              </p>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Henüz galeri öğesi eklenmemiş</p>
                      <p className="text-gray-500 text-sm mt-1">Görsel veya döküman ekleyin</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchPersonnel} className="mt-2" size="sm">
                Tekrar Dene
              </Button>
            </div>
          )}

          {displayPersonnel.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Henüz {activeTab === 'directors' ? 'direktör' : 'şef'} eklenmemiş</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk {activeTab === 'directors' ? 'Direktörü' : 'Şefi'} Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPersonnel.map((person) => (
                <Card key={person.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{person.name}</CardTitle>
                        <p className="text-sm text-gray-500">{person.title}</p>
                      </div>
                      <Badge variant={person.isActive ? "default" : "secondary"}>
                        {person.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {person.content && (
                      <div className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {person.content.replace(/<[^>]*>/g, ' ')}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {person.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">{person.email}</span>
                        </div>
                      )}
                      
                      {person.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">{person.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/kurumsal/personel/${person.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openGalleryDialog(person)}
                      >
                        <Image className="h-4 w-4 mr-1" />
                        Galeri
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(person)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
