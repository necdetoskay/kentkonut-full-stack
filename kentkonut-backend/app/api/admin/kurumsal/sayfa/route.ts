import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { corporatePageSchema } from '@/types/corporate-cards';
import { 
  handleServerError, 
  checkAdminAuth, 
  createSuccessResponse,
  createErrorResponse,
  logApiActivity,
  sanitizeUrl
} from '@/utils/corporate-cards-utils';

/**
 * GET /api/admin/kurumsal/sayfa
 * 
 * Admin endpoint for fetching corporate page configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return authResult.response!;
    }

    const { user } = authResult;

    // Fetch corporate page
    const corporatePage = await db.corporatePage.findUnique({
      where: { slug: 'kurumsal' }
    });

    if (!corporatePage) {
      return createErrorResponse(
        'Kurumsal sayfa bulunamadı',
        { slug: 'kurumsal' },
        404
      );
    }

    logApiActivity('GET_ADMIN_PAGE', user.id, { 
      pageId: corporatePage.id,
      isActive: corporatePage.isActive
    });

    return createSuccessResponse(
      corporatePage,
      'Kurumsal sayfa başarıyla alındı'
    );

  } catch (error) {
    return handleServerError(error, 'Admin page fetch error');
  }
}

/**
 * PUT /api/admin/kurumsal/sayfa
 * 
 * Update corporate page configuration
 */
export async function PUT(request: NextRequest) {
  try {
    // Admin authentication check
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return authResult.response!;
    }

    const { user } = authResult;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = corporatePageSchema.parse(body);

    // Sanitize URLs
    const sanitizedData = {
      ...validatedData,
      headerImage: sanitizeUrl(validatedData.headerImage)
    };

    // Check if page exists
    const existingPage = await db.corporatePage.findUnique({
      where: { slug: 'kurumsal' }
    });

    let updatedPage;

    if (existingPage) {
      // Update existing page
      updatedPage = await db.corporatePage.update({
        where: { slug: 'kurumsal' },
        data: {
          ...sanitizedData,
          updatedAt: new Date()
        }
      });

      logApiActivity('UPDATE_PAGE', user.id, { 
        pageId: updatedPage.id,
        changes: Object.keys(sanitizedData)
      });

    } else {
      // Create new page if it doesn't exist
      updatedPage = await db.corporatePage.create({
        data: sanitizedData
      });

      logApiActivity('CREATE_PAGE', user.id, { 
        pageId: updatedPage.id
      });
    }

    return createSuccessResponse(
      updatedPage,
      existingPage ? 'Kurumsal sayfa başarıyla güncellendi' : 'Kurumsal sayfa başarıyla oluşturuldu'
    );

  } catch (error) {
    return handleServerError(error, 'Page update error');
  }
}

/**
 * PATCH /api/admin/kurumsal/sayfa
 * 
 * Partially update corporate page configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    // Admin authentication check
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return authResult.response!;
    }

    const { user } = authResult;
    
    // Parse and validate request body
    const body = await request.json();
    const partialSchema = corporatePageSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    // Sanitize URLs if they exist
    if (updateData.headerImage !== undefined) {
      updateData.headerImage = sanitizeUrl(updateData.headerImage);
    }

    // Check if page exists
    const existingPage = await db.corporatePage.findUnique({
      where: { slug: 'kurumsal' }
    });

    if (!existingPage) {
      return createErrorResponse(
        'Kurumsal sayfa bulunamadı',
        { slug: 'kurumsal' },
        404
      );
    }

    // Update the page
    const updatedPage = await db.corporatePage.update({
      where: { slug: 'kurumsal' },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    logApiActivity('PATCH_PAGE', user.id, { 
      pageId: updatedPage.id,
      updatedFields: Object.keys(updateData)
    });

    return createSuccessResponse(
      updatedPage,
      'Kurumsal sayfa başarıyla güncellendi'
    );

  } catch (error) {
    return handleServerError(error, 'Page patch error');
  }
}
