"use client"

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  url?: string
  children?: MenuItem[]
  _count?: {
    children: number
  }
}

interface DeleteMenuDialogProps {
  menuItem: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteMenuDialog({ 
  menuItem, 
  isOpen, 
  onClose, 
  onConfirm 
}: DeleteMenuDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!menuItem) return

    try {
      setIsDeleting(true)
      await onConfirm(menuItem.id)
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const hasChildren = menuItem?.children && menuItem.children.length > 0
  const childrenCount = menuItem?._count?.children || menuItem?.children?.length || 0

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Menu Öğesini Sil
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <strong>"{menuItem?.title}"</strong> menu öğesini silmek istediğinizden emin misiniz?
              </p>
              
              {menuItem?.url && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>URL:</strong> {menuItem.url}
                  </p>
                </div>
              )}

              {hasChildren && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Uyarı: Alt Menüler Mevcut
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Bu menu öğesinin <strong>{childrenCount} alt menüsü</strong> bulunmaktadır. 
                        Ana menüyü silmeden önce alt menüleri silmeniz veya başka bir ana menüye taşımanız gerekmektedir.
                      </p>
                      {menuItem.children && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 font-medium">Alt menüler:</p>
                          <ul className="text-xs text-red-600 mt-1 space-y-1">
                            {menuItem.children.map((child) => (
                              <li key={child.id} className="flex items-center gap-1">
                                <span>•</span>
                                <span>{child.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Bu işlem geri alınamaz.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || hasChildren}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Siliniyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Sil
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
