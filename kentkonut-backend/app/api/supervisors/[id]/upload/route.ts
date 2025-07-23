import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import {
  DepartmentSupervisor,
  DepartmentSupervisorDocument,
  SUPERVISOR_FILE_CONFIG
} from '@/lib/types/department-supervisor'
import { createMediaUrl, generateUniqueFilename } from '@/lib/utils/path'
import {
  getSupervisorById,
  getSupervisorIndex,
  replaceSupervisorAtIndex,
  supervisorsDB
} from '@/lib/db/mock-supervisors'

/**
 * POST /api/supervisors/[id]/upload
 * Upload files for a specific supervisor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supervisorId = resolvedParams.id

    // Find supervisor
    console.log('Looking for supervisor with ID:', supervisorId)

    const supervisor = getSupervisorById(supervisorId)
    if (!supervisor) {
      console.error('Supervisor not found:', supervisorId)
      return NextResponse.json(
        {
          success: false,
          message: 'Birim amiri bulunamadı'
        },
        { status: 404 }
      )
    }

    console.log('Found supervisor:', supervisor.fullName)

    const supervisorIndex = getSupervisorIndex(supervisorId)
    console.log('Supervisor index:', supervisorIndex)

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const fileType = formData.get('type') as string || 'document'
    const description = formData.get('description') as string || ''
    const displayName = formData.get('displayName') as string || ''

    console.log('Upload request:', {
      supervisorId,
      fileCount: files.length,
      fileType,
      description,
      displayName
    })

    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dosya seçilmedi' 
        },
        { status: 400 }
      )
    }

    // Validate file count
    const currentDocuments = supervisorsDB[supervisorIndex].documents
    if (currentDocuments.length + files.length > SUPERVISOR_FILE_CONFIG.maxFiles) {
      return NextResponse.json(
        { 
          success: false, 
          message: `En fazla ${SUPERVISOR_FILE_CONFIG.maxFiles} dosya yükleyebilirsiniz` 
        },
        { status: 400 }
      )
    }

    const uploadedDocuments: DepartmentSupervisorDocument[] = []

    // Process each file
    for (const file of files) {
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        allowedTypes: SUPERVISOR_FILE_CONFIG.allowedTypes
      })

      // Validate file size
      if (file.size > SUPERVISOR_FILE_CONFIG.maxFileSize) {
        console.error('File too large:', file.name, file.size)
        return NextResponse.json(
          {
            success: false,
            message: `Dosya boyutu ${SUPERVISOR_FILE_CONFIG.maxFileSize / (1024 * 1024)}MB'dan büyük olamaz`
          },
          { status: 400 }
        )
      }

      // Validate file type
      if (!SUPERVISOR_FILE_CONFIG.allowedTypes.includes(file.type)) {
        console.error('Unsupported file type:', file.type, 'Allowed:', SUPERVISOR_FILE_CONFIG.allowedTypes)
        return NextResponse.json(
          {
            success: false,
            message: `Desteklenmeyen dosya türü: ${file.type}. Desteklenen türler: ${SUPERVISOR_FILE_CONFIG.allowedTypes.join(', ')}`
          },
          { status: 400 }
        )
      }

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(file.name, 'supervisor')
      
      // Create upload directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', SUPERVISOR_FILE_CONFIG.folder)
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }

      // Save file
      const filePath = join(uploadDir, uniqueFilename)
      console.log('Saving file to:', filePath)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      console.log('File saved successfully:', uniqueFilename)

      // Create document record
      const document: DepartmentSupervisorDocument = {
        id: uuidv4(),
        type: fileType as any,
        url: createMediaUrl(SUPERVISOR_FILE_CONFIG.folder, uniqueFilename),
        name: uniqueFilename,
        originalName: file.name,
        displayName: displayName || file.name, // Use custom display name or fallback to original
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        description: description || undefined
      }

      uploadedDocuments.push(document)
    }

    // Update supervisor with new documents
    const updatedSupervisor = {
      ...supervisor,
      documents: [...supervisor.documents, ...uploadedDocuments],
      updatedAt: new Date().toISOString()
    }

    replaceSupervisorAtIndex(supervisorIndex, updatedSupervisor)

    return NextResponse.json({
      success: true,
      data: {
        supervisor: updatedSupervisor,
        uploadedDocuments
      },
      message: `${uploadedDocuments.length} dosya başarıyla yüklendi`
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Dosya yüklenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/supervisors/[id]/upload
 * Delete a specific document from supervisor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supervisorId = resolvedParams.id
    const { documentId } = await request.json()

    // Find supervisor
    const supervisorIndex = supervisorsDB.findIndex(s => s.id === supervisorId)
    if (supervisorIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Birim amiri bulunamadı' 
        },
        { status: 404 }
      )
    }

    // Find and remove document
    const supervisor = supervisorsDB[supervisorIndex]
    const documentIndex = supervisor.documents.findIndex(doc => doc.id === documentId)
    
    if (documentIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dosya bulunamadı' 
        },
        { status: 404 }
      )
    }

    const deletedDocument = supervisor.documents[documentIndex]
    supervisor.documents.splice(documentIndex, 1)
    supervisor.updatedAt = new Date().toISOString()

    // TODO: Delete physical file from filesystem
    // const filePath = join(process.cwd(), 'public', deletedDocument.url)
    // await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi',
      data: {
        supervisor,
        deletedDocument
      }
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Dosya silinirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
