"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Plus, Edit, Trash2, Mail, Phone, User } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { DeleteDepartmentDialog } from "../birimler/components/DeleteDepartmentDialog"
import Image from "next/image"

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
}

// Department icon mapping
const getDepartmentIcon = (departmentName: string): string => {
  const name = departmentName.toLowerCase()
  if (name.includes('insan') || name.includes('kaynakları')) return '🏢'
  if (name.includes('mali') || name.includes('muhasebe')) return '💰'
  if (name.includes('bilgi') || name.includes('işlem')) return '💻'
  if (name.includes('halkla') || name.includes('ilişkiler')) return '📢'
  if (name.includes('hukuk')) return '⚖️'
  if (name.includes('teknik')) return '🔧'
  if (name.includes('şantiye')) return '🏗️'
  return '🏢'
}

export default function CorporateStructurePage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)
  const router = useRouter()

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/departments?isActive=true')
      if (!response.ok) {
        throw new Error('Birimler yüklenirken hata oluştu')
      }
      const data = await response.json()
      setDepartments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return

    try {
      const response = await fetch(`/api/departments/${departmentToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Birim silinirken hata oluştu')
      }

      await fetchDepartments()
      setDeleteDialogOpen(false)
      setDepartmentToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Kurumsal yapı yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <Breadcrumb
        items={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Kurumsal Yapı", href: "/dashboard/kurumsal/kurumsal-yapi" },
        ]}
        className="mb-4"
      />

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏢</span>
              <h1 className="text-3xl font-bold text-gray-900">Kurumsal Yapı</h1>
            </div>
            <p className="text-gray-600">Organizasyon şeması ve birim yapısı</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/kurumsal/birimler/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Birim
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDepartments} className="mt-2" size="sm">
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Henüz birim eklenmemiş</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/dashboard/kurumsal/birimler/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Birimi Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {departments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-8">
                {/* Department Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getDepartmentIcon(department.name)}</span>
                    <h2 className="text-xl font-bold text-gray-900 uppercase">
                      {department.name}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/kurumsal/birimler/${department.id}`)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(department)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Sil
                    </Button>
                  </div>
                </div>

                {/* Director Section */}
                {department.director && (
                  <div className="bg-blue-50 rounded-lg p-5 mb-6 border-l-4 border-blue-600">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        {department.director.imageUrl ? (
                          <Image
                            src={department.director.imageUrl}
                            alt={department.director.name}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {department.director.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {department.director.title}
                        </p>
                        <div className="flex flex-col gap-1">
                          {department.director.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              {department.director.email}
                            </div>
                          )}
                          {department.director.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="h-3 w-3" />
                              {department.director.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chiefs Section */}
                {department.chiefs && department.chiefs.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-4 w-4 text-gray-600" />
                      <h4 className="text-base font-semibold text-gray-700">ŞEFLER</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {department.chiefs.map((chief) => (
                        <div 
                          key={chief.id} 
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {chief.imageUrl ? (
                                <Image
                                  src={chief.imageUrl}
                                  alt={chief.name}
                                  width={56}
                                  height={56}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm truncate">
                                {chief.name}
                              </h5>
                              <p className="text-xs text-gray-600 mb-1 truncate">
                                {chief.title}
                              </p>
                              {chief.email && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{chief.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Section */}
                {department.services && department.services.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      📋 Hizmetler
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {department.services.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDepartmentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        departmentName={departmentToDelete?.name || ''}
      />
    </div>
  )
}
