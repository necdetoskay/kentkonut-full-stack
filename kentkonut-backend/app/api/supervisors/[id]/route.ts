import { NextRequest, NextResponse } from 'next/server'
import {
  DepartmentSupervisor,
  UpdateDepartmentSupervisorRequest,
  validateSupervisor
} from '@/lib/types/department-supervisor'
import {
  getSupervisorById,
  updateSupervisor,
  deleteSupervisor
} from '@/lib/db/mock-supervisors'

/**
 * GET /api/supervisors/[id]
 * Get a specific supervisor by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supervisorId = resolvedParams.id

    const supervisor = getSupervisorById(supervisorId)

    if (!supervisor) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Birim amiri bulunamadı' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: supervisor
    })

  } catch (error) {
    console.error('Error fetching supervisor:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Birim amiri yüklenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/supervisors/[id]
 * Update a specific supervisor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supervisorId = resolvedParams.id
    console.log('PUT request for supervisor:', supervisorId)

    const body: UpdateDepartmentSupervisorRequest = await request.json()
    console.log('Update request body:', body)

    // Find supervisor using shared database
    const currentSupervisor = getSupervisorById(supervisorId)
    console.log('Current supervisor found:', currentSupervisor ? 'yes' : 'no')

    if (!currentSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: 'Birim amiri bulunamadı'
        },
        { status: 404 }
      )
    }

    // Validate update data
    const updateData = {
      departmentId: currentSupervisor.departmentId,
      fullName: body.fullName || currentSupervisor.fullName,
      position: body.position || currentSupervisor.position,
      mainImageUrl: body.mainImageUrl,
      documents: body.documents,
      orderIndex: body.orderIndex,
      isActive: body.isActive
    }

    const validation = validateSupervisor(updateData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Geçersiz veri',
          errors: validation.errors
        },
        { status: 400 }
      )
    }

    // Update supervisor using shared database
    const updates = {
      fullName: body.fullName?.trim() || currentSupervisor.fullName,
      position: body.position?.trim() || currentSupervisor.position,
      mainImageUrl: body.mainImageUrl !== undefined ? body.mainImageUrl : currentSupervisor.mainImageUrl,
      documents: body.documents || currentSupervisor.documents,
      orderIndex: body.orderIndex !== undefined ? body.orderIndex : currentSupervisor.orderIndex,
      isActive: body.isActive !== undefined ? body.isActive : currentSupervisor.isActive
    }

    console.log('Updating supervisor:', supervisorId, 'with updates:', updates)
    const updatedSupervisor = updateSupervisor(supervisorId, updates)
    console.log('Update result:', updatedSupervisor ? 'success' : 'failed')

    if (!updatedSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supervisor güncellenemedi'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedSupervisor,
      message: 'Birim amiri başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Error updating supervisor:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Birim amiri güncellenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/supervisors/[id]
 * Delete a specific supervisor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supervisorId = resolvedParams.id

    const supervisor = getSupervisorById(supervisorId)

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: 'Birim amiri bulunamadı'
        },
        { status: 404 }
      )
    }

    const deleted = deleteSupervisor(supervisorId)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supervisor silinemedi'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Birim amiri başarıyla silindi',
      data: supervisor
    })

  } catch (error) {
    console.error('Error deleting supervisor:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Birim amiri silinirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
