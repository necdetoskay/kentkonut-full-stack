"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Save,
  Loader2
} from 'lucide-react'
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector'
import { toast } from 'sonner'
import {
  DepartmentSupervisor,
  CreateDepartmentSupervisorRequest,
  UpdateDepartmentSupervisorRequest,
  SUPERVISOR_POSITIONS,
  DepartmentSupervisorDocument,
  SUPERVISOR_FILE_CONFIG,
  validateSupervisor
} from '@/lib/types/department-supervisor'

interface SupervisorFormProps {
  departmentId: string
  supervisor?: DepartmentSupervisor
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateDepartmentSupervisorRequest | UpdateDepartmentSupervisorRequest) => Promise<DepartmentSupervisor>
}

export function SupervisorForm({
  departmentId,
  supervisor,
  isOpen,
  onClose,
  onSave
}: SupervisorFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    mainImageUrl: '',
    documents: [] as DepartmentSupervisorDocument[],
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)


  const isEditMode = !!supervisor

  // Initialize form data
  useEffect(() => {
    if (supervisor) {
      setFormData({
        fullName: supervisor.fullName,
        position: supervisor.position,
        mainImageUrl: supervisor.mainImageUrl || '',
        documents: supervisor.documents,
        isActive: supervisor.isActive
      })
    } else {
      setFormData({
        fullName: '',
        position: '',
        mainImageUrl: '',
        documents: [],
        isActive: true
      })
    }
    setErrors({})
  }, [supervisor, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageSelect = (media: GlobalMediaFile) => {
    setFormData(prev => ({ ...prev, mainImageUrl: media.url }))
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, mainImageUrl: '' }))
  }

  const handleDocumentUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    try {
      const fileArray = Array.from(files)
      const newDocuments: DepartmentSupervisorDocument[] = []

      for (const file of fileArray) {
        // Validate file size
        if (file.size > SUPERVISOR_FILE_CONFIG.maxFileSize) {
          toast.error(`${file.name} dosyası çok büyük. Maksimum ${SUPERVISOR_FILE_CONFIG.maxFileSize / (1024 * 1024)}MB olabilir.`)
          continue
        }

        // Validate file type
        if (!SUPERVISOR_FILE_CONFIG.allowedTypes.includes(file.type)) {
          toast.error(`${file.name} desteklenmeyen dosya türü.`)
          continue
        }

        // Create document object for immediate display
        const document: DepartmentSupervisorDocument = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          type: file.type.startsWith('image/') ? 'image' :
                file.type === 'application/pdf' ? 'cv' : 'document',
          url: URL.createObjectURL(file), // Temporary URL for preview
          name: `${Date.now()}-${file.name}`,
          originalName: file.name,
          displayName: file.name, // Default to original name, user can edit
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          description: '',
          _file: file // Store original file for later upload
        } as DepartmentSupervisorDocument & { _file: File }

        newDocuments.push(document)
      }

      // Add documents to form data for immediate display
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments]
      }))

      toast.success(`${newDocuments.length} dosya eklendi`)

    } catch (error) {
      console.error('Error handling document upload:', error)
      toast.error('Dosya yüklenirken hata oluştu')
    }
  }

  const handleRemoveDocument = (documentId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }))
  }

  const handleUpdateDisplayName = (documentId: string, displayName: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc =>
        doc.id === documentId
          ? { ...doc, displayName }
          : doc
      )
    }))
  }

  const uploadDocumentsToServer = async (supervisorId: string, documents: (DepartmentSupervisorDocument & { _file?: File })[]): Promise<DepartmentSupervisorDocument[]> => {
    const uploadedDocuments: DepartmentSupervisorDocument[] = []

    for (const doc of documents) {
      if (doc._file) {
        try {
          const formData = new FormData()
          formData.append('files', doc._file)
          formData.append('type', doc.type)
          formData.append('description', doc.description || '')
          formData.append('displayName', doc.displayName || doc.originalName)

          console.log('Uploading document:', {
            name: doc.originalName,
            type: doc.type,
            mimeType: doc.mimeType,
            size: doc.size
          })

          console.log('Making upload request to:', `/api/supervisors/${supervisorId}/upload`)
          console.log('FormData contents:', {
            files: doc._file.name,
            type: doc.type,
            description: doc.description || '',
            displayName: doc.displayName || doc.originalName
          })

          const response = await fetch(`/api/supervisors/${supervisorId}/upload`, {
            method: 'POST',
            body: formData
          })

          console.log('Upload response status:', response.status, response.statusText)
          console.log('Upload response ok:', response.ok)

          if (response.ok) {
            const result = await response.json()
            console.log('Upload result:', result)
            if (result.success && result.data.uploadedDocuments) {
              uploadedDocuments.push(...result.data.uploadedDocuments)
            }
          } else {
            let errorMessage = 'Bilinmeyen hata'
            try {
              const errorData = await response.json()
              console.error('Upload error:', errorData)
              errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`
            } catch (jsonError) {
              console.error('Failed to parse error response:', jsonError)
              errorMessage = `HTTP ${response.status}: ${response.statusText}`
            }
            toast.error(`${doc.originalName} yüklenemedi: ${errorMessage}`)
          }
        } catch (error) {
          console.error('Error uploading document:', error)
          toast.error(`${doc.originalName} yüklenirken hata oluştu`)
        }
      } else {
        // Existing document, keep as is
        uploadedDocuments.push(doc)
      }
    }

    return uploadedDocuments
  }

  const validateForm = () => {
    const validation = validateSupervisor({
      departmentId,
      fullName: formData.fullName,
      position: formData.position,
      mainImageUrl: formData.mainImageUrl,
      documents: formData.documents,
      isActive: formData.isActive
    })

    setErrors(validation.errors)
    return validation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare submit data without temporary documents
      const documentsWithoutFiles = formData.documents.filter(doc => !doc.id.startsWith('temp-'))

      const submitData = isEditMode
        ? {
            fullName: formData.fullName,
            position: formData.position,
            mainImageUrl: formData.mainImageUrl || undefined,
            documents: documentsWithoutFiles,
            isActive: formData.isActive
          } as UpdateDepartmentSupervisorRequest
        : {
            departmentId,
            fullName: formData.fullName,
            position: formData.position,
            mainImageUrl: formData.mainImageUrl || undefined,
            documents: documentsWithoutFiles,
            isActive: formData.isActive
          } as CreateDepartmentSupervisorRequest

      // Save supervisor first
      console.log('Saving supervisor with data:', submitData)
      const savedSupervisor = await onSave(submitData)
      console.log('Saved supervisor result:', savedSupervisor)

      // Upload new documents if any
      const newDocuments = formData.documents.filter(doc => doc.id.startsWith('temp-')) as (DepartmentSupervisorDocument & { _file?: File })[]
      console.log('New documents to upload:', newDocuments.length)

      if (newDocuments.length > 0) {
        if (savedSupervisor?.id) {
          console.log('Uploading documents to supervisor:', savedSupervisor.id)
          await uploadDocumentsToServer(savedSupervisor.id, newDocuments)
          toast.success('Dosyalar başarıyla yüklendi')
        } else {
          console.error('No supervisor ID available for document upload:', savedSupervisor)
          toast.error('Supervisor kaydedildi ancak dosyalar yüklenemedi')
        }
      }

      toast.success('Birim amiri başarıyla kaydedildi')
      onClose()
    } catch (error) {
      console.error('Error saving supervisor:', error)
      toast.error('Birim amiri kaydedilirken hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Birim Amiri Düzenle' : 'Yeni Birim Amiri'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  required
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Görev *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => handleInputChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Görev seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPERVISOR_POSITIONS.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position}</p>
                )}
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label>Ana Resim</Label>
              <div className="flex items-center gap-4">
                {formData.mainImageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.mainImageUrl}
                      alt="Ana resim"
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <GlobalMediaSelector
                  onSelect={handleImageSelect}
                  acceptedTypes={['image/*']}
                  customFolder="media/kurumsal/birimler"
                  defaultCategory="department-images"
                  restrictToCategory={true}
                  trigger={
                    <Button type="button" variant="outline">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Resim Seç
                    </Button>
                  }
                  title="Birim Amiri Resmi Seç"
                  description="Birim amiri için profil resmi seçin"
                />
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <Label>Dosyalar (CV, Sertifika vb.)</Label>
              
              {/* Existing Documents */}
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  {formData.documents.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg space-y-2">
                      {/* File Info Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs text-gray-500">
                            Dosya: {doc.originalName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="h-6 w-6 p-0 text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Display Name Input Row */}
                      <div className="space-y-1">
                        <Label htmlFor={`displayName-${doc.id}`} className="text-xs text-gray-600">
                          Görünme Adı
                        </Label>
                        <Input
                          id={`displayName-${doc.id}`}
                          type="text"
                          value={doc.displayName || doc.originalName}
                          onChange={(e) => handleUpdateDisplayName(doc.id, e.target.value)}
                          placeholder="Dosya için özel görünme adı girin"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New Documents */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Dosyaları sürükleyip bırakın veya seçin
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                  className="hidden"
                  id="document-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  Dosya Seç
                </Button>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Güncelle' : 'Oluştur'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </>
  )
}

export default SupervisorForm
