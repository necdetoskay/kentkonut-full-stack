import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/menu-items - Public endpoint for fetching menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'main';
    const includeChildren = searchParams.get('includeChildren') === 'true';

    console.log(`🔍 Fetching menu items for location: ${location}`);

    // Base query for main menu items (no parent)
    const whereClause: any = {
      menuLocation: location,
      isActive: true,
      parentId: null
    };

    // Fetch menu items with optional children
    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: includeChildren ? {
        children: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' }
        }
      } : undefined,
      orderBy: {
        orderIndex: 'asc'
      }
    });

    console.log(`✅ Found ${menuItems.length} menu items`);

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });

  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    return NextResponse.json({
      success: false,
      error: 'Menu items could not be fetched',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}
