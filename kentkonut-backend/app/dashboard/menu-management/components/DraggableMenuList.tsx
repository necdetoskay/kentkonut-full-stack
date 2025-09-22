"use client"

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { SortableMenuItem } from './SortableMenuItem'
import { useToast } from '@/hooks/use-toast'

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

interface DraggableMenuListProps {
  menuItems: MenuItem[]
  onReorder: (items: MenuItem[]) => void
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}

export function DraggableMenuList({
  menuItems,
  onReorder,
  onEdit,
  onDelete
}: DraggableMenuListProps) {
  const [items, setItems] = useState(menuItems)
  const [isReordering, setIsReordering] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update items when menuItems prop changes
  useEffect(() => {
    setItems(menuItems)
  }, [menuItems])

  // Get all sortable items (both main and sub items)
  const allSortableItems = items.map(item => item.id)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const activeItem = items.find(item => item.id === active.id)
    const overItem = items.find(item => item.id === over.id)

    if (!activeItem || !overItem) {
      return
    }

    // Only allow reordering within the same level
    if (activeItem.parentId !== overItem.parentId) {
      toast({
        title: "Uyarı",
        description: "Menü öğeleri sadece aynı seviyede yeniden sıralanabilir.",
        variant: "destructive",
      })
      return
    }

    // Get items at the same level
    const sameLevel = items.filter(item => item.parentId === activeItem.parentId)
    const otherLevels = items.filter(item => item.parentId !== activeItem.parentId)

    const oldIndex = sameLevel.findIndex(item => item.id === active.id)
    const newIndex = sameLevel.findIndex(item => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder items at the same level
    const reorderedSameLevel = arrayMove(sameLevel, oldIndex, newIndex)

    // Update order indices
    const updatedSameLevel = reorderedSameLevel.map((item, index) => ({
      ...item,
      orderIndex: index + 1
    }))

    // Combine with other levels
    const newItems = [...otherLevels, ...updatedSameLevel].sort((a, b) => {
      if (a.parentId !== b.parentId) {
        if (!a.parentId) return -1
        if (!b.parentId) return 1
        return a.parentId.localeCompare(b.parentId)
      }
      return a.orderIndex - b.orderIndex
    })

    setItems(newItems)

    // Send reorder request to API
    try {
      setIsReordering(true)

      const reorderData = updatedSameLevel.map(item => ({
        id: item.id,
        orderIndex: item.orderIndex,
        parentId: item.parentId
      }))

      const response = await fetch('/api/admin/menu-items/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: reorderData }),
      })

      const result = await response.json()

      if (result.success) {
        onReorder(newItems)
        toast({
          title: "Başarılı",
          description: "Menu sıralaması güncellendi.",
        })
      } else {
        throw new Error(result.error || 'Reorder failed')
      }
    } catch (error) {
      console.error('Error reordering menu items:', error)

      // Revert changes on error
      setItems(menuItems)

      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Menu sıralaması güncellenemedi.",
        variant: "destructive",
      })
    } finally {
      setIsReordering(false)
    }
  }

  // Group items by parent
  const mainMenuItems = items.filter(item => !item.parentId).sort((a, b) => a.orderIndex - b.orderIndex)
  const subMenuItems = items.filter(item => item.parentId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        {/* Main Menu Items */}
        <SortableContext
          items={allSortableItems}
          strategy={verticalListSortingStrategy}
        >
          {mainMenuItems.map((item) => (
            <div key={item.id}>
              <SortableMenuItem
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                isReordering={isReordering}
              />

              {/* Sub Menu Items */}
              {subMenuItems.filter(subItem => subItem.parentId === item.id).length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {subMenuItems
                    .filter(subItem => subItem.parentId === item.id)
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((subItem) => (
                      <SortableMenuItem
                        key={subItem.id}
                        item={subItem}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isReordering={isReordering}
                        isSubItem={true}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  )
}
