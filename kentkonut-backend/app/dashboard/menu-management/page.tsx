"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { DeleteMenuDialog } from './components/DeleteMenuDialog'
import { EditMenuDialog } from './components/EditMenuDialog'
import { CreateMenuDialog } from './components/CreateMenuDialog'
import { DraggableMenuList } from './components/DraggableMenuList'

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
  _count?: {
    children: number
  }
  createdAt: string
  updatedAt: string
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    menuItem: MenuItem | null
  }>({
    isOpen: false,
    menuItem: null
  })

  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean
    menuItem: MenuItem | null
  }>({
    isOpen: false,
    menuItem: null
  })

  const [createDialog, setCreateDialog] = useState({
    isOpen: false
  })

  const { toast } = useToast()
  const isMountedRef = useRef(true)

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/menu-items?includeInactive=true')
      const data = await response.json()
      
      if (data.success) {
        setMenuItems(data.data)
      } else {
        setError(data.error || 'Failed to fetch menu items')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching menu items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Delete menu item
  const handleDeleteClick = (menuItem: MenuItem) => {
    setDeleteDialog({
      isOpen: true,
      menuItem
    })
  }

  const handleDeleteConfirm = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setMenuItems(prev => prev.filter(item => item.id !== id))

        // Only show toast if component is still mounted
        if (isMountedRef.current) {
          toast({
            title: "Başarılı",
            description: "Menu öğesi başarıyla silindi.",
          })
        }
      } else {
        throw new Error(data.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Hata",
          description: error instanceof Error ? error.message : "Menu öğesi silinemedi.",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      menuItem: null
    })
  }

  // Edit menu item
  const handleEditClick = (menuItem: MenuItem) => {
    setEditDialog({
      isOpen: true,
      menuItem
    })
  }

  const handleEditSave = async (id: string, data: Partial<MenuItem>) => {
    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setMenuItems(prev => prev.map(item =>
          item.id === id ? { ...item, ...result.data } : item
        ))

        // Only show toast if component is still mounted
        if (isMountedRef.current) {
          toast({
            title: "Başarılı",
            description: "Menu öğesi başarıyla güncellendi.",
          })
        }
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Hata",
          description: error instanceof Error ? error.message : "Menu öğesi güncellenemedi.",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  const handleEditCancel = () => {
    setEditDialog({
      isOpen: false,
      menuItem: null
    })
  }

  // Create menu item
  const handleCreateClick = () => {
    setCreateDialog({
      isOpen: true
    })
  }

  const handleCreateSave = async (data: Partial<MenuItem>) => {
    try {
      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // Add to local state
        setMenuItems(prev => [...prev, result.data])

        // Only show toast if component is still mounted
        if (isMountedRef.current) {
          toast({
            title: "Başarılı",
            description: "Menu öğesi başarıyla oluşturuldu.",
          })
        }
      } else {
        throw new Error(result.error || 'Create failed')
      }
    } catch (error) {
      console.error('Error creating menu item:', error)
      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Hata",
          description: error instanceof Error ? error.message : "Menu öğesi oluşturulamadı.",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  const handleCreateCancel = () => {
    setCreateDialog({
      isOpen: false
    })
  }

  // Reorder menu items
  const handleReorder = (reorderedItems: MenuItem[]) => {
    setMenuItems(reorderedItems)
  }

  // Organize menu items into hierarchy
  const organizeMenuItems = (items: MenuItem[]) => {
    const parentItems = items.filter(item => !item.parentId)
    const childItems = items.filter(item => item.parentId)
    
    return parentItems.map(parent => ({
      ...parent,
      children: childItems.filter(child => child.parentId === parent.id)
    })).sort((a, b) => a.orderIndex - b.orderIndex)
  }

  const organizedMenuItems = organizeMenuItems(menuItems)

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Menu öğeleri yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Hata</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchMenuItems} variant="outline">
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Website navigation menülerini yönetin
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={handleCreateClick}
        >
          <Plus className="h-4 w-4" />
          Yeni Menu Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
            <div className="text-sm text-gray-600">Toplam Menu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Aktif Menu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {menuItems.filter(item => !item.parentId).length}
            </div>
            <div className="text-sm text-gray-600">Ana Menu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {menuItems.filter(item => item.parentId).length}
            </div>
            <div className="text-sm text-gray-600">Alt Menu</div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Öğeleri</CardTitle>
          <CardDescription>
            Mevcut menu öğelerini görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DraggableMenuList
            menuItems={menuItems}
            onReorder={handleReorder}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />

          {menuItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Henüz menu öğesi bulunmuyor.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                İlk Menu Öğesini Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteMenuDialog
        menuItem={deleteDialog.menuItem}
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {/* Edit Dialog */}
      <EditMenuDialog
        menuItem={editDialog.menuItem}
        isOpen={editDialog.isOpen}
        onClose={handleEditCancel}
        onSave={handleEditSave}
        parentMenuItems={menuItems.filter(item => !item.parentId)}
      />

      {/* Create Dialog */}
      <CreateMenuDialog
        isOpen={createDialog.isOpen}
        onClose={handleCreateCancel}
        onCreate={handleCreateSave}
        parentMenuItems={menuItems.filter(item => !item.parentId)}
      />
    </div>
  )
}
