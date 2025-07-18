"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Save, X } from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  slug?: string
  url?: string
  icon?: string
  description?: string
  isActive: boolean
  isExternal: boolean
  target: string
  cssClass?: string
  orderIndex: number
  menuLocation: string
  parentId?: string
  parent?: {
    id: string
    title: string
  }
  children?: MenuItem[]
}

interface CreateMenuDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: Partial<MenuItem>) => Promise<void>
  parentMenuItems: MenuItem[]
}

export function CreateMenuDialog({ 
  isOpen, 
  onClose, 
  onCreate,
  parentMenuItems 
}: CreateMenuDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    url: '',
    icon: '',
    description: '',
    isActive: true,
    isExternal: false,
    target: '_self',
    cssClass: '',
    orderIndex: 0,
    menuLocation: 'main',
    parentId: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gereklidir'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL gereklidir'
    } else if (!formData.url.startsWith('/')) {
      newErrors.url = 'URL "/" ile başlamalıdır'
    }

    if (formData.orderIndex < 0) {
      newErrors.orderIndex = 'Sıra numarası 0 veya pozitif olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) return

    try {
      setIsCreating(true)
      
      // Calculate next order index if not specified
      let nextOrderIndex = formData.orderIndex
      if (nextOrderIndex === 0) {
        const maxOrder = Math.max(
          ...parentMenuItems
            .filter(item => formData.parentId ? item.parentId === formData.parentId : !item.parentId)
            .map(item => item.orderIndex),
          0
        )
        nextOrderIndex = maxOrder + 1
      }
      
      // Prepare data for API
      const createData = {
        ...formData,
        orderIndex: nextOrderIndex,
        parentId: formData.parentId || null
      }

      await onCreate(createData)
      
      // Reset form
      setFormData({
        title: '',
        slug: '',
        url: '',
        icon: '',
        description: '',
        isActive: true,
        isExternal: false,
        target: '_self',
        cssClass: '',
        orderIndex: 0,
        menuLocation: 'main',
        parentId: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Create failed:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    setFormData({
      title: '',
      slug: '',
      url: '',
      icon: '',
      description: '',
      isActive: true,
      isExternal: false,
      target: '_self',
      cssClass: '',
      orderIndex: 0,
      menuLocation: 'main',
      parentId: ''
    })
    onClose()
  }

  // Filter parent options (only show main menu items)
  const availableParents = parentMenuItems.filter(item => !item.parentId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Yeni Menu Öğesi Ekle
          </DialogTitle>
          <DialogDescription>
            Yeni bir menu öğesi oluşturun
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Temel Bilgiler</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Başlık *</Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Menu başlığı"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-slug">Slug</Label>
                <Input
                  id="create-slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="menu-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-url">URL *</Label>
              <Input
                id="create-url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="/sayfa-url"
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && (
                <p className="text-sm text-red-600">{errors.url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Açıklama</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Menu öğesi açıklaması"
                rows={3}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ayarlar</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-orderIndex">Sıra Numarası</Label>
                <Input
                  id="create-orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0 (otomatik)"
                  className={errors.orderIndex ? 'border-red-500' : ''}
                />
                {errors.orderIndex && (
                  <p className="text-sm text-red-600">{errors.orderIndex}</p>
                )}
                <p className="text-xs text-gray-600">0 bırakırsanız otomatik sıralanır</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-parent">Üst Menü</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) => handleInputChange('parentId', value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Üst menü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ana Menü</SelectItem>
                    {availableParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-target">Hedef</Label>
                <Select
                  value={formData.target || "_self"}
                  onValueChange={(value) => handleInputChange('target', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Aynı Pencere</SelectItem>
                    <SelectItem value="_blank">Yeni Pencere</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-icon">İkon</Label>
                <Input
                  id="create-icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="icon-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-cssClass">CSS Sınıfı</Label>
              <Input
                id="create-cssClass"
                value={formData.cssClass}
                onChange={(e) => handleInputChange('cssClass', e.target.value)}
                placeholder="custom-class"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Durum</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="create-isActive">Aktif</Label>
                  <p className="text-sm text-gray-600">Menu öğesi görünür olsun</p>
                </div>
                <Switch
                  id="create-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="create-isExternal">Harici Link</Label>
                  <p className="text-sm text-gray-600">Dış bağlantı olarak işaretle</p>
                </div>
                <Switch
                  id="create-isExternal"
                  checked={formData.isExternal}
                  onCheckedChange={(checked) => handleInputChange('isExternal', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Oluşturuluyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Oluştur
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
