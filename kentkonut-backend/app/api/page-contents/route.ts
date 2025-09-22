import { NextRequest, NextResponse } from 'next/server';

// This API is deprecated - the new schema doesn't use PageContent model
// Page content is now stored directly in the Page model's 'content' field
// Use /api/pages/[id]/content instead

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    data: [],
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON'
    }
  }, { status: 410 }); // 410 Gone - indicates this resource is no longer available
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON'
    }
  }, { status: 410 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON'
    }
  }, { status: 410 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'PageContent API is deprecated. Use /api/pages/[id]/content instead.',
    migration: {
      newEndpoint: '/api/pages/[id]/content',
      description: 'Content is now stored in the page.content field as JSON'
    }
  }, { status: 410 });
}
