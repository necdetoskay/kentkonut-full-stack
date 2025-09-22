import { db } from "@/lib/db";
import { CorporateContentType } from "@prisma/client";

export class CorporateService {
  // Yöneticiler
  static async getExecutives() {
    return await db.executive.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  static async getExecutiveById(id: string) {
    return await db.executive.findUnique({
      where: { id }
    });
  }

  static async getExecutiveByName(name: string) {
    return await db.executive.findFirst({
      where: { name: { contains: name, mode: 'insensitive' }, isActive: true }
    });
  }

  static async createExecutive(data: any) {
    return await db.executive.create({
      data
    });
  }

  static async updateExecutive(id: string, data: any) {
    return await db.executive.update({
      where: { id },
      data
    });
  }

  static async deleteExecutive(id: string) {
    return await db.executive.delete({
      where: { id }
    });
  }

  // Birimler
  static async getDepartments() {
    return await db.department.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  static async getDepartmentById(id: string) {
    return await db.department.findUnique({
      where: { id }
    });
  }

  static async createDepartment(data: any) {
    return await db.department.create({
      data
    });
  }

  static async updateDepartment(id: string, data: any) {
    return await db.department.update({
      where: { id },
      data
    });
  }

  static async deleteDepartment(id: string) {
    return await db.department.delete({
      where: { id }
    });
  }

  // Kurumsal İçerik
  static async getCorporateContent(type: CorporateContentType) {
    return await db.corporateContent.findFirst({
      where: { type, isActive: true }
    });
  }

  static async getAllCorporateContent() {
    return await db.corporateContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  static async getVision() {
    return await this.getCorporateContent('VISION');
  }

  static async getMission() {
    return await this.getCorporateContent('MISSION');
  }

  static async getStrategy() {
    return await this.getCorporateContent('STRATEGY');
  }

  static async getGoals() {
    return await this.getCorporateContent('GOALS');
  }

  static async upsertCorporateContent(type: CorporateContentType, data: any) {
    return await db.corporateContent.upsert({
      where: { type },
      update: data,
      create: {
        ...data,
        type
      }
    });
  }
}
