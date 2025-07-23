import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  DepartmentSupervisor,
  CreateDepartmentSupervisorRequest,
  validateSupervisor
} from '@/lib/types/department-supervisor'
import {
  getSupervisorsByDepartment,
  addSupervisor,
  updateSupervisorsOrder,
  deleteSupervisorsByDepartment
} from '@/lib/db/mock-supervisors'

/**
 * GET /api/departments/[id]/supervisors
 * Get all supervisors for a specific department
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const departmentId = resolvedParams.id

    // Get supervisors by department ID
    const departmentSupervisors = getSupervisorsByDepartment(departmentId)

    return NextResponse.json({
      success: true,
      data: departmentSupervisors,
      total: departmentSupervisors.length
    })
  } catch (error) {
    console.error('Error fetching department supervisors:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Birim amirleri yüklenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/departments/[id]/supervisors
 * Create a new supervisor for a specific department
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const departmentId = resolvedParams.id
    const body: CreateDepartmentSupervisorRequest = await request.json()

    // Validate request data
    const validation = validateSupervisor(body)
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

    // Create new supervisor
    const existingSupervisors = getSupervisorsByDepartment(departmentId)
    const newSupervisor: DepartmentSupervisor = {
      id: uuidv4(),
      departmentId,
      fullName: body.fullName.trim(),
      position: body.position.trim(),
      mainImageUrl: body.mainImageUrl || undefined,
      documents: body.documents || [],
      orderIndex: body.orderIndex || existingSupervisors.length + 1,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to database
    addSupervisor(newSupervisor)

    console.log('Created supervisor:', newSupervisor.id, newSupervisor.fullName)

    return NextResponse.json({
      success: true,
      data: newSupervisor,
      message: 'Birim amiri başarıyla oluşturuldu'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating department supervisor:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Birim amiri oluşturulurken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/departments/[id]/supervisors
 * Bulk update supervisors order for a department
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const departmentId = resolvedParams.id
    const { supervisors }: { supervisors: { id: string; orderIndex: number }[] } = await request.json()

    // Update supervisors order
    const updatedSupervisors = updateSupervisorsOrder(departmentId, supervisors)

    return NextResponse.json({
      success: true,
      data: updatedSupervisors,
      message: 'Sıralama başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Error updating supervisors order:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sıralama güncellenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/departments/[id]/supervisors
 * Delete all supervisors for a department (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const departmentId = resolvedParams.id

    // Remove all supervisors for this department
    const deletedCount = deleteSupervisorsByDepartment(departmentId)

    return NextResponse.json({
      success: true,
      message: `${deletedCount} birim amiri silindi`,
      deletedCount
    })

  } catch (error) {
    console.error('Error deleting department supervisors:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Birim amirleri silinirken hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
