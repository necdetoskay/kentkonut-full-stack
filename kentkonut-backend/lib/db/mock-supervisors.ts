/**
 * Mock database for department supervisors
 * This provides a shared data store across different API endpoints
 */

import { DepartmentSupervisor } from '@/lib/types/department-supervisor'

// Shared mock database - Replace with actual database implementation
export let supervisorsDB: DepartmentSupervisor[] = []

/**
 * Get all supervisors
 */
export function getAllSupervisors(): DepartmentSupervisor[] {
  return supervisorsDB
}

/**
 * Get supervisors by department ID
 */
export function getSupervisorsByDepartment(departmentId: string): DepartmentSupervisor[] {
  return supervisorsDB
    .filter(supervisor => supervisor.departmentId === departmentId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
}

/**
 * Get supervisor by ID
 */
export function getSupervisorById(supervisorId: string): DepartmentSupervisor | undefined {
  return supervisorsDB.find(s => s.id === supervisorId)
}

/**
 * Add supervisor to database
 */
export function addSupervisor(supervisor: DepartmentSupervisor): void {
  supervisorsDB.push(supervisor)
}

/**
 * Update supervisor in database
 */
export function updateSupervisor(supervisorId: string, updates: Partial<DepartmentSupervisor>): DepartmentSupervisor | null {
  const index = supervisorsDB.findIndex(s => s.id === supervisorId)
  if (index === -1) {
    return null
  }
  
  supervisorsDB[index] = {
    ...supervisorsDB[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  return supervisorsDB[index]
}

/**
 * Delete supervisor from database
 */
export function deleteSupervisor(supervisorId: string): boolean {
  const index = supervisorsDB.findIndex(s => s.id === supervisorId)
  if (index === -1) {
    return false
  }

  supervisorsDB.splice(index, 1)
  return true
}

/**
 * Delete all supervisors for a department
 */
export function deleteSupervisorsByDepartment(departmentId: string): number {
  const initialCount = supervisorsDB.length
  const indicesToRemove: number[] = []

  // Find all indices to remove
  supervisorsDB.forEach((supervisor, index) => {
    if (supervisor.departmentId === departmentId) {
      indicesToRemove.push(index)
    }
  })

  // Remove in reverse order to maintain indices
  indicesToRemove.reverse().forEach(index => {
    supervisorsDB.splice(index, 1)
  })

  return indicesToRemove.length
}

/**
 * Update supervisors order for a department
 */
export function updateSupervisorsOrder(departmentId: string, supervisorUpdates: { id: string; orderIndex: number }[]): DepartmentSupervisor[] {
  supervisorUpdates.forEach(update => {
    const supervisor = supervisorsDB.find(s => s.id === update.id && s.departmentId === departmentId)
    if (supervisor) {
      supervisor.orderIndex = update.orderIndex
      supervisor.updatedAt = new Date().toISOString()
    }
  })
  
  return getSupervisorsByDepartment(departmentId)
}

/**
 * Get supervisor index in database
 */
export function getSupervisorIndex(supervisorId: string): number {
  return supervisorsDB.findIndex(s => s.id === supervisorId)
}

/**
 * Replace supervisor at index
 */
export function replaceSupervisorAtIndex(index: number, supervisor: DepartmentSupervisor): void {
  if (index >= 0 && index < supervisorsDB.length) {
    supervisorsDB[index] = supervisor
  }
}
