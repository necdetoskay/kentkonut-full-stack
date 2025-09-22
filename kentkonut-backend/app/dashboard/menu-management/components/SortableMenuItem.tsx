"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface SortableMenuItemProps {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  isReordering?: boolean
  isSubItem?: boolean
}

export function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete, 
  isReordering = false,
  isSubItem = false 
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm transition-all duration-200",
        isDragging && "opacity-50 shadow-lg scale-105 z-50",
        isReordering && "pointer-events-none",
        isSubItem && "bg-gray-50 border-l-4 border-l-blue-200"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors",
          isDragging && "cursor-grabbing",
          isReordering && "opacity-50"
        )}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Menu Icon */}
      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
        {item.isActive ? (
          <Eye className="h-5 w-5 text-blue-600" />
        ) : (
          <EyeOff className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Menu Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">
            {item.title}
          </h3>
          <Badge 
            variant={item.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {item.isActive ? "Aktif" : "Pasif"}
          </Badge>
          {isSubItem && (
            <Badge variant="outline" className="text-xs">
              Alt Menü
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{item.url}</span>
          <span>•</span>
          <span>Sıra: {item.orderIndex}</span>
          {item.children && item.children.length > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">
                {item.children.length} alt menü
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          disabled={isReordering}
          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          disabled={isReordering}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Reordering Overlay */}
      {isReordering && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Güncelleniyor...
          </div>
        </div>
      )}
    </div>
  )
}
