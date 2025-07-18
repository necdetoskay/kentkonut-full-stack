import { NextRequest, NextResponse } from 'next/server';

// This API is deprecated - the new schema doesn't use PageContent model
// Page content is now stored directly in the Page model's 'content' field
// Use /api/pages/[id]/content instead

// GET /api/page-contents/[id] - DEPRECATED
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON',
      contentId: id
    }
  }, { status: 410 });
}

// PUT /api/page-contents/[id] - DEPRECATED
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON',
      contentId: id
    }
  }, { status: 410 });
}

// DELETE /api/page-contents/[id] - DEPRECATED
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON',
      contentId: id
    }
  }, { status: 410 });
}
