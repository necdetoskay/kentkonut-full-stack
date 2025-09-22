"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Building2 } from "lucide-react"

interface Department {
  id: string
  name: string
  isActive: boolean
  slug?: string
  content?: string
  services?: string[]
  _count?: {
    personnel?: number
    chiefs?: number
  }
}

interface DeleteDepartmentDialogProps {
  department: Department | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (departmentId: string) => Promise<void>
}

export function DeleteDepartmentDialog({ 
  department, 
  isOpen, 
  onClose, 
  onConfirm 
}: DeleteDepartmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!department) return

    try {
      setIsDeleting(true)
      await onConfirm(department.id)
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const hasPersonnel = department?._count?.personnel && department._count.personnel > 0
  const hasChiefs = department?._count?.chiefs && department._count.chiefs > 0
  const hasStaff = hasPersonnel || hasChiefs
  const totalStaff = (department?._count?.personnel || 0) + (department?._count?.chiefs || 0)

  if (!department) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Birim Silme Onayı
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800 mb-1">
                      Silinecek Birim
                    </h4>
                    <p className="text-red-700 font-semibold">
                      {department.name}
                    </p>
                    {department.slug && (
                      <p className="text-sm text-red-600 mt-1">
                        URL: /{department.slug}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {hasStaff && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800 mb-2">
                        ⚠️ Dikkat: Bu birimde personel bulunuyor
                      </h4>
                      <div className="space-y-1 text-sm text-amber-700">
                        <p>Toplam {totalStaff} personel:</p>
                        {hasPersonnel && (
                          <p>• {department._count?.personnel} genel personel</p>
                        )}
                        {hasChiefs && (
                          <p>• {department._count?.chiefs} şef/yönetici</p>
                        )}
                      </div>
                      <p className="text-sm text-amber-800 mt-2 font-medium">
                        Birim silindiğinde tüm personel bilgileri de silinecektir.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {department.services && department.services.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Birim Hizmetleri ({department.services.length})
                      </h4>
                      <div className="max-h-20 overflow-y-auto">
                        <ul className="text-sm text-blue-700 space-y-1">
                          {department.services.slice(0, 3).map((service, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span>•</span>
                              <span>{service}</span>
                            </li>
                          ))}
                          {department.services.length > 3 && (
                            <li className="text-blue-600 font-medium">
                              ... ve {department.services.length - 3} hizmet daha
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-medium">
                  ⚠️ Bu işlem geri alınamaz.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Birim ve tüm ilişkili veriler kalıcı olarak silinecektir.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
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
                Birimi Sil
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
