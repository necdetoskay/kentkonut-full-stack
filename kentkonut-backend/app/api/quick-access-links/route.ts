import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  QuickAccessLinkValidationSchema,
  QuickAccessLinkQuerySchema,
  ModuleValidationSchemas
} from '@/utils/quickAccessValidation';
import {
  handleQuickAccessError,
  createSuccessResponse,
  generateRequestId,
  validateModuleExists,
  sanitizeInput
} from '@/utils/quickAccessErrorHandler';
import { invalidateQuickAccessCache } from '@/lib/quickAccessCache';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryParams = QuickAccessLinkQuerySchema.parse({
      moduleType: searchParams.get('moduleType'),
      moduleId: searchParams.get('moduleId'),
      isActive: searchParams.get('isActive'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder')
    });

    const where: any = {};

    if (queryParams.moduleType) {
      where.moduleType = queryParams.moduleType;
    }

    if (queryParams.moduleId && queryParams.moduleType) {
      // Set the appropriate module ID field based on moduleType
      switch (queryParams.moduleType) {
        case 'page':
          where.pageId = queryParams.moduleId;
          break;
        case 'news':
          where.newsId = parseInt(queryParams.moduleId);
          break;
        case 'project':
          where.projectId = parseInt(queryParams.moduleId);
          break;
        case 'department':
          where.departmentId = queryParams.moduleId;
          break;
      }
    }

    if (queryParams.isActive !== undefined) {
      where.isActive = queryParams.isActive === 'true';
    }

    const quickAccessLinks = await db.quickAccessLink.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        page: queryParams.moduleType === 'page' ? { select: { id: true, title: true, slug: true } } : false,
        news: queryParams.moduleType === 'news' ? { select: { id: true, title: true, slug: true } } : false,
        project: queryParams.moduleType === 'project' ? { select: { id: true, title: true, slug: true } } : false,
        department: queryParams.moduleType === 'department' ? { select: { id: true, name: true, slug: true } } : false
      }
    });
    
    return createSuccessResponse(quickAccessLinks);
  } catch (error) {
    return handleQuickAccessError(error, 'Quick access links fetch error', requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);

    // Validate input
    const validatedData = QuickAccessLinkValidationSchema.parse(sanitizedBody);
    
    // Check if the referenced module exists
    const { moduleType, pageId, newsId, projectId, departmentId } = validatedData;
    const moduleId = pageId || newsId || projectId || departmentId;

    const moduleExists = await validateModuleExists(db, moduleType, moduleId!);
    if (!moduleExists) {
      return NextResponse.json({
        error: `${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} not found`,
        requestId
      }, { status: 404 });
    }
    
    const quickAccessLink = await db.quickAccessLink.create({
      data: validatedData,
      include: {
        page: moduleType === 'page' ? { select: { id: true, title: true, slug: true } } : false,
        news: moduleType === 'news' ? { select: { id: true, title: true, slug: true } } : false,
        project: moduleType === 'project' ? { select: { id: true, title: true, slug: true } } : false,
        department: moduleType === 'department' ? { select: { id: true, name: true, slug: true } } : false
      }
    });

    // Invalidate cache for this module
    invalidateQuickAccessCache.onLinkChange(validatedData.moduleType, moduleId!);

    return createSuccessResponse(quickAccessLink, "Quick access link created successfully", 201);
  } catch (error) {
    return handleQuickAccessError(error, 'Quick access link creation error', requestId);
  }
}
