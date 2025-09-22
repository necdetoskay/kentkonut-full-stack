import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  layoutSettingSchema,
  parseLayoutSettings,
  validateSettingValue,
  DEFAULT_LAYOUT_SETTINGS
} from '@/types/layout-settings';
import { withCors } from '@/lib/cors';

/**
 * GET /api/admin/kurumsal/layout-settings
 * 
 * Get all layout settings
 */
async function handleGET() {
  try {
    console.log('🔍 Fetching layout settings...');
    console.log('🔍 Database connection test...');

    // Test database connection first
    try {
      await db.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw new Error('Database connection failed');
    }

    console.log('🔍 Querying CorporateLayoutSettings table...');
    let settings;
    try {
      settings = await db.corporateLayoutSettings.findMany({
        orderBy: { key: 'asc' }
      });
      console.log('✅ Query successful, found', settings.length, 'settings');
    } catch (queryError) {
      console.error('❌ Query failed:', queryError);
      console.log('🔧 Table might not exist, trying to create default settings...');

      // If table doesn't exist or query fails, try to create default settings
      try {
        await createDefaultSettings();
        settings = await db.corporateLayoutSettings.findMany({
          orderBy: { key: 'asc' }
        });
        console.log('✅ Default settings created, found', settings.length, 'settings');
      } catch (createError) {
        console.error('❌ Failed to create default settings:', createError);
        throw new Error('Could not initialize layout settings');
      }
    }

    console.log('✅ Found', settings.length, 'layout settings');

    // If no settings exist, create defaults
    if (settings.length === 0) {
      console.log('📝 Creating default layout settings...');
      await createDefaultSettings();
      
      // Fetch again after creating defaults
      const newSettings = await db.corporateLayoutSettings.findMany({
        orderBy: { key: 'asc' }
      });

      const parsedSettings = parseLayoutSettings(newSettings);

      return NextResponse.json({
        success: true,
        data: {
          raw: newSettings,
          parsed: parsedSettings
        },
        message: 'Default layout settings created and retrieved'
      });
    }

    const parsedSettings = parseLayoutSettings(settings);

    return NextResponse.json({
      success: true,
      data: {
        raw: settings,
        parsed: parsedSettings
      },
      message: 'Layout settings retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Layout settings fetch error:', error);
    const err = error as unknown;
    const isError = err instanceof Error;
    console.error('❌ Error details:', {
      name: isError ? err.name : undefined,
      message: isError ? err.message : undefined,
      stack: isError ? err.stack : undefined,
      cause: isError ? (err as any).cause : undefined
    });

    // Return detailed error for debugging
    const errorResponse = {
      success: false,
      error: isError ? err.message : 'Layout settings could not be retrieved',
      details: {
        name: isError ? err.name : undefined,
        message: isError ? err.message : undefined,
        type: typeof err
      }
    };

    console.error('❌ Sending error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/admin/kurumsal/layout-settings
 * 
 * Create a new layout setting
 */
async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating layout setting:', body);

    // Validate request body
    const validatedData = layoutSettingSchema.parse(body);

    // Validate setting value
    const validation = validateSettingValue(validatedData.key, validatedData.value);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    // Check if setting already exists
    const existingSetting = await db.corporateLayoutSettings.findUnique({
      where: { key: validatedData.key }
    });

    if (existingSetting) {
      return NextResponse.json({
        success: false,
        error: 'Bu ayar anahtarı zaten mevcut'
      }, { status: 400 });
    }

    // Create new setting
    const newSetting = await db.corporateLayoutSettings.create({
      data: validatedData
    });

    console.log('✅ Layout setting created:', newSetting.key);

    return NextResponse.json({
      success: true,
      data: newSetting,
      message: 'Layout setting created successfully'
    });

  } catch (error) {
    console.error('❌ Layout setting creation error:', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Layout setting could not be created')
    }, { status: 500 });
  }
}

// Helper function to create default settings
async function createDefaultSettings() {
  const defaultSettings = [
    {
      key: 'cards_per_row',
      value: '3',
      description: 'Bir satırda kaç kart gösterileceği (1-6 arası)',
      type: 'number',
      category: 'layout'
    },
    {
      key: 'max_cards_per_page',
      value: '12',
      description: 'Bir sayfada maksimum kaç kart gösterileceği',
      type: 'number',
      category: 'layout'
    },
    {
      key: 'card_spacing',
      value: 'medium',
      description: 'Kartlar arası boşluk (small, medium, large)',
      type: 'select',
      category: 'layout'
    },
    {
      key: 'responsive_breakpoints',
      value: JSON.stringify({ mobile: 1, tablet: 2, desktop: 3 }),
      description: 'Responsive breakpoint ayarları',
      type: 'json',
      category: 'layout'
    },
    {
      key: 'show_pagination',
      value: 'true',
      description: 'Sayfalama gösterilsin mi',
      type: 'boolean',
      category: 'layout'
    },
    {
      key: 'cards_animation',
      value: 'fade',
      description: 'Kart animasyon tipi (none, fade, slide)',
      type: 'select',
      category: 'layout'
    }
  ];

  await db.corporateLayoutSettings.createMany({
    data: defaultSettings
  });

  console.log('✅ Default layout settings created');
}

// Export CORS-wrapped handlers
export const GET = withCors(handleGET);
export const POST = withCors(handlePOST);
