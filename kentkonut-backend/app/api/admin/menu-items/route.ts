import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Menu item validation schema
const menuItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isExternal: z.boolean().default(false),
  target: z.string().default('_self'),
  cssClass: z.string().optional(),
  orderIndex: z.number().default(0),
  menuLocation: z.string().default('main'),
  parentId: z.string().nullable().optional(),
});

// GET /api/admin/menu-items - Admin endpoint for fetching all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    console.log(`🔍 Admin fetching menu items for location: ${location || 'all'}`);

    // Build where clause
    const whereClause: any = {};
    if (location) {
      whereClause.menuLocation = location;
    }
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    // Fetch all menu items with hierarchical structure
    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            children: true
          }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { orderIndex: 'asc' }
      ]
    });

    console.log(`✅ Found ${menuItems.length} menu items for admin`);

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });

  } catch (error) {
    console.error('❌ Error fetching menu items for admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Menu items could not be fetched',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// POST /api/admin/menu-items - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating new menu item:', body);

    // Validate input
    const validatedData = menuItemSchema.parse(body);

    // Generate slug if not provided
    if (!validatedData.slug || validatedData.slug.trim() === '') {
      // Generate slug from title
      validatedData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();

      // Add timestamp to ensure uniqueness
      const timestamp = Date.now();
      validatedData.slug = `${validatedData.slug}-${timestamp}`;
    }

    // Check if slug is unique
    const existingItem = await prisma.menuItem.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Slug already exists'
      }, { status: 400 });
    }

    // Check if parent exists (if provided)
    if (validatedData.parentId) {
      const parentItem = await prisma.menuItem.findUnique({
        where: { id: validatedData.parentId }
      });

      if (!parentItem) {
        return NextResponse.json({
          success: false,
          error: 'Parent menu item not found'
        }, { status: 400 });
      }
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        children: true
      }
    });

    console.log(`✅ Created menu item: ${menuItem.title}`);

    return NextResponse.json({
      success: true,
      data: menuItem
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Menu item could not be created',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
