import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { QuickAccessLinkUpdateSchema } from '@/utils/quickAccessValidation';
import {
  handleQuickAccessError,
  createSuccessResponse,
  generateRequestId,
  sanitizeInput
} from '@/utils/quickAccessErrorHandler';
import { invalidateQuickAccessCache } from '@/lib/quickAccessCache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();

  try {
    const { id } = await params;

    const quickAccessLink = await db.quickAccessLink.findUnique({
      where: { id },
      include: {
        page: { select: { id: true, title: true, slug: true } },
        news: { select: { id: true, title: true, slug: true } },
        project: { select: { id: true, title: true, slug: true } },
        department: { select: { id: true, name: true, slug: true } }
      }
    });

    if (!quickAccessLink) {
      return NextResponse.json({
        error: "Quick access link not found",
        requestId
      }, { status: 404 });
    }

    return createSuccessResponse(quickAccessLink);
  } catch (error) {
    return handleQuickAccessError(error, 'Quick access link fetch error', requestId);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();

  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if quick access link exists
    const existingLink = await db.quickAccessLink.findUnique({
      where: { id }
    });
    
    if (!existingLink) {
      return NextResponse.json({ error: "Quick access link not found" }, { status: 404 });
    }
    
    // Validate input
    const validatedData = QuickAccessLinkUpdateSchema.parse(body);
    
    const updatedQuickAccessLink = await db.quickAccessLink.update({
      where: { id },
      data: validatedData,
      include: {
        page: existingLink.moduleType === 'page' ? { select: { id: true, title: true, slug: true } } : false,
        news: existingLink.moduleType === 'news' ? { select: { id: true, title: true, slug: true } } : false,
        project: existingLink.moduleType === 'project' ? { select: { id: true, title: true, slug: true } } : false,
        department: existingLink.moduleType === 'department' ? { select: { id: true, name: true, slug: true } } : false
      }
    });

    // Invalidate cache for this module
    const moduleId = existingLink.pageId || existingLink.newsId || existingLink.projectId || existingLink.departmentId;
    invalidateQuickAccessCache.onLinkChange(existingLink.moduleType, moduleId!);

    return createSuccessResponse(updatedQuickAccessLink, "Quick access link updated successfully");
  } catch (error) {
    return handleQuickAccessError(error, 'Quick access link update error', requestId);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();

  try {
    const { id } = await params;
    
    // Check if quick access link exists
    const existingLink = await db.quickAccessLink.findUnique({
      where: { id }
    });
    
    if (!existingLink) {
      return NextResponse.json({ error: "Quick access link not found" }, { status: 404 });
    }
    
    // Get module info before deletion for cache invalidation
    const moduleId = existingLink.pageId || existingLink.newsId || existingLink.projectId || existingLink.departmentId;

    await db.quickAccessLink.delete({
      where: { id }
    });

    // Invalidate cache for this module
    invalidateQuickAccessCache.onLinkChange(existingLink.moduleType, moduleId!);

    return createSuccessResponse({ deleted: true }, "Quick access link deleted successfully");
  } catch (error) {
    return handleQuickAccessError(error, 'Quick access link deletion error', requestId);
  }
}
