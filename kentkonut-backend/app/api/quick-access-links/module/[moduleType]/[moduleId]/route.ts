import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZodError } from 'zod';
import {
  handleQuickAccessError,
  createSuccessResponse,
  generateRequestId,
  sanitizeInput
} from '@/utils/quickAccessErrorHandler';
import { quickAccessCache, cacheMetrics } from '@/lib/quickAccessCache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleType: string; moduleId: string }> }
) {
  const requestId = generateRequestId();

  try {
    const { moduleType, moduleId } = await params;

    // Validate module type
    const validModuleTypes = ['page', 'news', 'project', 'department'];
    if (!validModuleTypes.includes(moduleType)) {
      return NextResponse.json({ error: "Invalid module type", requestId }, { status: 400 });
    }

    // Check cache first
    const cachedData = quickAccessCache.get(moduleType, moduleId);
    if (cachedData) {
      cacheMetrics.recordHit();
      return createSuccessResponse(cachedData);
    }

    cacheMetrics.recordMiss();
    
    const where: any = { moduleType };
    
    // Set the appropriate module ID field based on moduleType
    switch (moduleType) {
      case 'page':
        where.pageId = moduleId;
        break;
      case 'news':
        const newsId = parseInt(moduleId);
        if (isNaN(newsId)) {
          return NextResponse.json({ error: "Invalid news ID" }, { status: 400 });
        }
        where.newsId = newsId;
        break;
      case 'project':
        const projectId = parseInt(moduleId);
        if (isNaN(projectId)) {
          return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }
        where.projectId = projectId;
        break;
      case 'department':
        where.departmentId = moduleId;
        break;
    }
    
    // Check if the module exists
    let moduleExists = false;
    switch (moduleType) {
      case 'page':
        const page = await db.page.findUnique({ where: { id: moduleId } });
        moduleExists = !!page;
        break;
      case 'news':
        const news = await db.news.findUnique({ where: { id: parseInt(moduleId) } });
        moduleExists = !!news;
        break;
      case 'project':
        const project = await db.project.findUnique({ where: { id: parseInt(moduleId) } });
        moduleExists = !!project;
        break;
      case 'department':
        const department = await db.department.findUnique({ where: { id: moduleId } });
        moduleExists = !!department;
        break;
    }
    
    if (!moduleExists) {
      return NextResponse.json({ error: `${moduleType} not found` }, { status: 404 });
    }

    const quickAccessLinks = await db.quickAccessLink.findMany({
      where: {
        ...where,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        page: moduleType === 'page' ? { select: { id: true, title: true, slug: true } } : false,
        news: moduleType === 'news' ? { select: { id: true, title: true, slug: true } } : false,
        project: moduleType === 'project' ? { select: { id: true, title: true, slug: true } } : false,
        department: moduleType === 'department' ? { select: { id: true, name: true, slug: true } } : false
      }
    });
    
    // Cache the results
    quickAccessCache.set(moduleType, moduleId, quickAccessLinks, 5 * 60 * 1000); // 5 minutes TTL

    return createSuccessResponse(quickAccessLinks);
  } catch (error) {
    return handleQuickAccessError(error, 'Module quick access links fetch error', requestId);
  }
}
