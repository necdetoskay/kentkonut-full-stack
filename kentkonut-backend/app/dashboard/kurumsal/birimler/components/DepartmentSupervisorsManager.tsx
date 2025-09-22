"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import SupervisorCard from './SupervisorCard'
import SupervisorForm from './SupervisorForm'
import { 
  DepartmentSupervisor, 
  CreateDepartmentSupervisorRequest,
  UpdateDepartmentSupervisorRequest,
  sortSupervisorsByOrder,
  getActiveSupervisors
} from '@/lib/types/department-supervisor'

interface DepartmentSupervisorsManagerProps {
  departmentId: string
  isEditMode?: boolean
}

export function DepartmentSupervisorsManager({
  departmentId,
  isEditMode = true
}: DepartmentSupervisorsManagerProps) {
  const [supervisors, setSupervisors] = useState<DepartmentSupervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<DepartmentSupervisor | undefined>()

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/departments/${departmentId}/supervisors`)
      
      if (!response.ok) {
        throw new Error('Birim amirleri yüklenemedi')
      }
      
      const data = await response.json()
      setSupervisors(data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Birim amirleri yüklenirken hata oluştu'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Load supervisors on mount
  useEffect(() => {
    if (departmentId) {
      fetchSupervisors()
    }
  }, [departmentId])

  // Handle create supervisor
  const handleCreateSupervisor = async (data: CreateDepartmentSupervisorRequest): Promise<DepartmentSupervisor> => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/supervisors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Birim amiri oluşturulamadı')
      }

      const result = await response.json()
      setSupervisors(prev => sortSupervisorsByOrder([...prev, result.data]))
      toast.success('Birim amiri başarıyla oluşturuldu')
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Birim amiri oluşturulurken hata oluştu'
      toast.error(errorMessage)
      throw err
    }
  }

  // Handle update supervisor
  const handleUpdateSupervisor = async (data: UpdateDepartmentSupervisorRequest): Promise<DepartmentSupervisor> => {
    if (!editingSupervisor) throw new Error('No supervisor selected for editing')

    try {
      const response = await fetch(`/api/supervisors/${editingSupervisor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Birim amiri güncellenemedi')
      }

      const result = await response.json()
      setSupervisors(prev =>
        sortSupervisorsByOrder(
          prev.map(s => s.id === editingSupervisor.id ? result.data : s)
        )
      )
      toast.success('Birim amiri başarıyla güncellendi')
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Birim amiri güncellenirken hata oluştu'
      toast.error(errorMessage)
      throw err
    }
  }

  // Handle delete supervisor
  const handleDeleteSupervisor = async (supervisorId: string) => {
    try {
      const response = await fetch(`/api/supervisors/${supervisorId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Birim amiri silinemedi')
      }

      setSupervisors(prev => prev.filter(s => s.id !== supervisorId))
      toast.success('Birim amiri başarıyla silindi')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Birim amiri silinirken hata oluştu'
      toast.error(errorMessage)
    }
  }

  // Handle toggle active status
  const handleToggleActive = async (supervisorId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/supervisors/${supervisorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Durum güncellenemedi')
      }

      const result = await response.json()
      setSupervisors(prev => 
        prev.map(s => s.id === supervisorId ? result.data : s)
      )
      toast.success(`Birim amiri ${isActive ? 'aktif' : 'pasif'} yapıldı`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Durum güncellenirken hata oluştu'
      toast.error(errorMessage)
    }
  }

  // Handle edit supervisor
  const handleEditSupervisor = (supervisor: DepartmentSupervisor) => {
    setEditingSupervisor(supervisor)
    setShowForm(true)
  }

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false)
    setEditingSupervisor(undefined)
  }

  // Handle form save
  const handleFormSave = async (data: CreateDepartmentSupervisorRequest | UpdateDepartmentSupervisorRequest): Promise<DepartmentSupervisor> => {
    if (editingSupervisor) {
      return await handleUpdateSupervisor(data as UpdateDepartmentSupervisorRequest)
    } else {
      return await handleCreateSupervisor(data as CreateDepartmentSupervisorRequest)
    }
  }

  const activeSupervisors = getActiveSupervisors(supervisors)
  const totalSupervisors = supervisors.length

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Birim amirleri yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={fetchSupervisors} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Birim Amirleri</CardTitle>
              <Badge variant="outline">
                {activeSupervisors.length}/{totalSupervisors}
              </Badge>
            </div>
            
            {isEditMode && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Amiri
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {supervisors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz birim amiri eklenmemiş
              </h3>
              <p className="text-gray-600 mb-4">
                Bu birime ait müdür, şef ve diğer amirleri ekleyebilirsiniz.
              </p>
              {isEditMode && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Amiri Ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortSupervisorsByOrder(supervisors).map((supervisor) => (
                <SupervisorCard
                  key={supervisor.id}
                  supervisor={supervisor}
                  onEdit={handleEditSupervisor}
                  onDelete={handleDeleteSupervisor}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supervisor Form Modal */}
      {showForm && (
        <SupervisorForm
          departmentId={departmentId}
          supervisor={editingSupervisor}
          isOpen={showForm}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </>
  )
}

export default DepartmentSupervisorsManager
