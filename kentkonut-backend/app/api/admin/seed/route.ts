import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/admin/seed
 * 
 * Admin endpoint for running consolidated seed operations
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kimlik doğrulama gerekli',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true, name: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bu işlem için admin yetkisi gerekli',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`🔐 Admin seed operation initiated by: ${user.email}`);

    // Import and run application data seed (not admin user)
    const { seedApplicationData, getDatabaseStatus } = require('@/prisma/consolidated-seed');

    // Get initial status
    const initialStatus = await getDatabaseStatus();

    // Run application data seed operation (excludes admin user)
    const result = await seedApplicationData();
    
    // Log the operation
    console.log(`✅ Seed operation completed successfully by admin: ${user.email}`);
    console.log(`📊 Operation result:`, result);

    return NextResponse.json({
      success: true,
      message: 'Seed işlemi başarıyla tamamlandı',
      data: {
        initialStatus: result.initialStatus,
        finalStatus: result.finalStatus,
        timestamp: result.timestamp,
        executedBy: {
          email: user.email,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin seed operation failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Seed işlemi sırasında hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        code: 'SEED_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed/status
 * 
 * Get current database status for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kimlik doğrulama gerekli',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bu işlem için admin yetkisi gerekli',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Get database status
    const { getDatabaseStatus } = require('@/prisma/consolidated-seed');
    const status = await getDatabaseStatus();

    return NextResponse.json({
      success: true,
      data: {
        status,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to get database status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Veritabanı durumu alınırken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        code: 'STATUS_ERROR'
      },
      { status: 500 }
    );
  }
}
