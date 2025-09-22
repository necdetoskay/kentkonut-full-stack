"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Edit, 
  Trash2, 
  FileText, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react'
import { 
  DepartmentSupervisor, 
  formatSupervisorPosition,
  getSupervisorDisplayName 
} from '@/lib/types/department-supervisor'

interface SupervisorCardProps {
  supervisor: DepartmentSupervisor
  onEdit: (supervisor: DepartmentSupervisor) => void
  onDelete: (supervisorId: string) => void
  onToggleActive: (supervisorId: string, isActive: boolean) => void
  isDragging?: boolean
  dragHandleProps?: any
}

export function SupervisorCard({
  supervisor,
  onEdit,
  onDelete,
  onToggleActive,
  isDragging = false,
  dragHandleProps
}: SupervisorCardProps) {
  const handleEdit = () => {
    onEdit(supervisor)
  }

  const handleDelete = () => {
    if (window.confirm(`${supervisor.fullName} isimli birim amirini silmek istediğinizden emin misiniz?`)) {
      onDelete(supervisor.id)
    }
  }

  const handleToggleActive = () => {
    onToggleActive(supervisor.id, !supervisor.isActive)
  }

  const documentCount = supervisor.documents.length
  const hasMainImage = !!supervisor.mainImageUrl

  return (
    <Card className={`transition-all duration-200 ${
      isDragging ? 'shadow-lg scale-105 rotate-2' : 'hover:shadow-md'
    } ${!supervisor.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div 
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          {/* Main Image */}
          <div className="flex-shrink-0">
            {hasMainImage ? (
              <img
                src={supervisor.mainImageUrl}
                alt={supervisor.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {supervisor.fullName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatSupervisorPosition(supervisor.position)}
                </p>
                
                {/* Status and Documents Info */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={supervisor.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {supervisor.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                  
                  {documentCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {documentCount} dosya
                    </Badge>
                  )}
                  
                  {hasMainImage && (
                    <Badge variant="outline" className="text-xs">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Resim
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleActive}
                  className="h-8 w-8 p-0"
                  title={supervisor.isActive ? 'Pasif yap' : 'Aktif yap'}
                >
                  {supervisor.isActive ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                  title="Düzenle"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Order Index (for debugging) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-1">
                Sıra: {supervisor.orderIndex}
              </div>
            )}
          </div>
        </div>

        {/* Documents Preview */}
        {documentCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="h-3 w-3" />
              <span>
                {documentCount} dosya: {supervisor.documents.map(doc => doc.originalName).join(', ')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SupervisorCard
