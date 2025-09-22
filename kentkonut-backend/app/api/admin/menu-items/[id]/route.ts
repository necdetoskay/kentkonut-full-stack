import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Menu item update validation schema
const updateMenuItemSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isExternal: z.boolean().optional(),
  target: z.string().optional(),
  cssClass: z.string().optional(),
  orderIndex: z.number().optional(),
  menuLocation: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

// GET /api/admin/menu-items/[id] - Get single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 Fetching menu item: ${id}`);

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        children: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json({
        success: false,
        error: 'Menu item not found'
      }, { status: 404 });
    }

    console.log(`✅ Found menu item: ${menuItem.title}`);

    return NextResponse.json({
      success: true,
      data: menuItem
    });

  } catch (error) {
    console.error('❌ Error fetching menu item:', error);
    return NextResponse.json({
      success: false,
      error: 'Menu item could not be fetched',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// PUT /api/admin/menu-items/[id] - Update menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`📝 Updating menu item: ${id}`, body);

    // Validate input
    const validatedData = updateMenuItemSchema.parse(body);

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Menu item not found'
      }, { status: 404 });
    }

    // Check if slug is unique (if provided and different from current)
    if (validatedData.slug && validatedData.slug !== existingItem.slug) {
      const slugExists = await prisma.menuItem.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugExists) {
        return NextResponse.json({
          success: false,
          error: 'Slug already exists'
        }, { status: 400 });
      }
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

      // Prevent circular reference
      if (validatedData.parentId === id) {
        return NextResponse.json({
          success: false,
          error: 'Menu item cannot be its own parent'
        }, { status: 400 });
      }
    }

    // Update menu item
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        children: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    console.log(`✅ Updated menu item: ${updatedMenuItem.title}`);

    return NextResponse.json({
      success: true,
      data: updatedMenuItem
    });

  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Menu item could not be updated',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// DELETE /api/admin/menu-items/[id] - Delete menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ Deleting menu item: ${id}`);

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        children: true
      }
    });

    if (!existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Menu item not found'
      }, { status: 404 });
    }

    // Check if item has children
    if (existingItem.children.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete menu item with children. Please delete or move children first.'
      }, { status: 400 });
    }

    // Delete menu item
    await prisma.menuItem.delete({
      where: { id }
    });

    console.log(`✅ Deleted menu item: ${existingItem.title}`);

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    return NextResponse.json({
      success: false,
      error: 'Menu item could not be deleted',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
