"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Building2, Link, Link2, Plus, Edit, Trash2, Save, ExternalLink } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"

interface Department {
  id: string
  name: string
  content: string
  slug: string | null
  imageUrl: string | null
  directorId: string | null
  services: string[]
  phone: string | null
  email: string | null
  location: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  order: number
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

interface QuickLinkFormData {
  title: string
  url: string
  icon: string
  departmentId: string
  order: number
}

export default function DepartmentQuickLinksPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [formData, setFormData] = useState<QuickLinkFormData>({
    title: '',
    url: '',
    icon: 'link',
    departmentId: '',
    order: 0
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchQuickLinks(selectedDepartmentId)
    } else {
      setQuickLinks([])
    }
  }, [selectedDepartmentId])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/departments')
      if (!response.ok) {
        throw new Error('Birimler yüklenemedi')
      }
      const data = await response.json()
      setDepartments(data)
      if (data.length > 0 && !selectedDepartmentId) {
        setSelectedDepartmentId(data[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Birimler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuickLinks = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/department-quick-links?departmentId=${departmentId}`)
      if (!response.ok) {
        throw new Error('Hızlı linkler yüklenemedi')
      }
      const data = await response.json()
      setQuickLinks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hızlı linkler yüklenemedi')
    }
  }

  const openCreateDialog = () => {
    setEditingQuickLink(null)
    setFormData({
      title: '',
      url: '',
      icon: 'link',
      departmentId: selectedDepartmentId || '',
      order: quickLinks.length
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (quickLink: QuickLink) => {
    setEditingQuickLink(quickLink)
    setFormData({
      title: quickLink.title,
      url: quickLink.url,
      icon: quickLink.icon || 'link',
      departmentId: quickLink.departmentId,
      order: quickLink.order
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const url = editingQuickLink 
        ? `/api/department-quick-links/${editingQuickLink.id}`
        : '/api/department-quick-links'
      
      const method = editingQuickLink ? 'PUT' : 'POST'
      
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
      
      if (editingQuickLink) {
        setQuickLinks(prev => 
          prev.map(link => link.id === editingQuickLink.id ? result : link)
        )
      } else {
        setQuickLinks(prev => [...prev, result])
      }
      
      setIsDialogOpen(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (quickLink: QuickLink) => {
    if (!confirm(`"${quickLink.title}" linkini silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/department-quick-links/${quickLink.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      setQuickLinks(prev => prev.filter(link => link.id !== quickLink.id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız')
    }
  }

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartmentId(e.target.value)
  }

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Birimler", href: "/dashboard/kurumsal/birimler" },
          { name: "Hızlı Linkler", href: "/dashboard/kurumsal/birim-hizli-baglanti" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Birim Hızlı Linkleri</h1>
          <p className="text-gray-600 mt-2">Birimler için hızlı erişim bağlantıları</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 items-end">
          <div className="w-1/3">
            <Label htmlFor="departmentSelect" className="mb-2 block">Birim Seçin</Label>
            <select
              id="departmentSelect"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedDepartmentId || ''}
              onChange={handleDepartmentChange}
            >
              <option value="">-- Birim Seçin --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={openCreateDialog} 
            disabled={!selectedDepartmentId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hızlı Link
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuickLink ? 'Hızlı Link Düzenle' : 'Yeni Hızlı Link Ekle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">İkon</Label>
                <Input
                  id="icon"
                  placeholder="link, file-text, download, vs."
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                />
                <p className="text-xs text-gray-500">İkon isimlerini Lucide Icons'dan bulabilirsiniz</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com veya /relative-path"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Birim</Label>
                <select
                  id="departmentId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  required
                >
                  <option value="">-- Birim Seçin --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
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
                    {editingQuickLink ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => selectedDepartmentId && fetchQuickLinks(selectedDepartmentId)} className="mt-2" size="sm">
            Tekrar Dene
          </Button>
        </div>
      )}

      {!selectedDepartmentId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Lütfen bir birim seçin</p>
          </CardContent>
        </Card>
      ) : quickLinks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Link2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Bu birim için henüz hızlı link eklenmemiş</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Hızlı Linki Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                      <Link className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    #{link.order}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-2 rounded text-sm mb-4 flex items-center">
                  <span className="text-gray-500 truncate flex-1">{link.url}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(link)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(link)}
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
    </div>
  )
}
