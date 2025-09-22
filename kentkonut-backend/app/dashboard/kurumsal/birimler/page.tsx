"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Plus, Edit, Trash2, Link2 } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"

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
  quickLinks: QuickLink[]
}

interface DepartmentFormData {
  name: string
  content: string
  slug: string
  imageUrl: string
  services: string[]
  isActive: boolean
  order: number
}

export default function DepartmentsPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDepartments()
  }, [])
  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/birimler')
      if (!response.ok) {
        throw new Error('Birimler yüklenemedi')
      }
      const data = await response.json()
      setDepartments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Birimler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }
  
  const navigateToCreateDepartment = () => {
    router.push('/dashboard/kurumsal/birimler/new')
  }
  
  const handleDelete = async (department: Department) => {
    if (!confirm(`"${department.name}" birimini silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      setDepartments(prev => prev.filter(dept => dept.id !== department.id))
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
          <p className="mt-4 text-sm text-gray-600">Birimler yükleniyor...</p>
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
        ]}
        className="mb-4"
      />      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Birimlerimiz</h1>
          <p className="text-gray-600 mt-2">Kurumsal birimler ve bölümler</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => router.push('/dashboard/kurumsal/birimler/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Birim
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDepartments} className="mt-2" size="sm">
            Tekrar Dene
          </Button>
        </div>
      )}

      {departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Henüz birim eklenmemiş</p>
            <Button className="mt-4" onClick={navigateToCreateDepartment}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Birimi Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <Card key={department.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{department.name}</CardTitle>
                      </div>
                      <div className="flex space-x-1">                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/kurumsal/birimler/${department.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(department)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={department.isActive ? "default" : "secondary"}>
                        {department.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                      {department.slug && (
                        <Badge variant="outline">
                          /{department.slug}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {department.content && (
                        <div className="text-gray-600 mb-4 text-sm line-clamp-2">
                          {department.content.replace(/<[^>]*>/g, ' ')}
                        </div>
                      )}
                        <div className="space-y-3">
                        {department.director && (
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">Direktör: {department.director.name}</span>
                          </div>
                        )}
                        
                        {department.chiefs && department.chiefs.length > 0 && (
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">Şef Sayısı: {department.chiefs.length}</span>
                          </div>
                        )}

                        {department.quickLinks && department.quickLinks.length > 0 && (
                          <div className="flex items-center text-sm">
                            <Link2 className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">Hızlı Linkler: {department.quickLinks.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  )
}
