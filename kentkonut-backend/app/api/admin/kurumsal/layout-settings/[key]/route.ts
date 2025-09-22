import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateLayoutSettingSchema, validateSettingValue } from '@/types/layout-settings';

/**
 * GET /api/admin/kurumsal/layout-settings/[key]
 * 
 * Get a specific layout setting by key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    console.log('🔍 Fetching layout setting:', key);

    if (!key || typeof key !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz ayar anahtarı'
      }, { status: 400 });
    }

    const setting = await db.corporateLayoutSettings.findUnique({
      where: { key }
    });

    if (!setting) {
      return NextResponse.json({
        success: false,
        error: 'Ayar bulunamadı'
      }, { status: 404 });
    }

    console.log('✅ Layout setting found:', setting.key);

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Layout setting retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Layout setting fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Layout setting could not be retrieved'
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/kurumsal/layout-settings/[key]
 * 
 * Update a specific layout setting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    console.log('🔄 Updating layout setting:', key);

    if (!key || typeof key !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz ayar anahtarı'
      }, { status: 400 });
    }

    // Check if setting exists
    const existingSetting = await db.corporateLayoutSettings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return NextResponse.json({
        success: false,
        error: 'Ayar bulunamadı'
      }, { status: 404 });
    }

    const body = await request.json();
    console.log('📥 Update data:', body);

    // Validate request body
    const validatedData = updateLayoutSettingSchema.parse(body);

    // Validate setting value
    const validation = validateSettingValue(key, validatedData.value);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    // Update setting
    const updatedSetting = await db.corporateLayoutSettings.update({
      where: { key },
      data: {
        value: validatedData.value,
        description: validatedData.description || existingSetting.description,
        updatedAt: new Date()
      }
    });

    console.log('✅ Layout setting updated:', updatedSetting.key);

    return NextResponse.json({
      success: true,
      data: updatedSetting,
      message: 'Layout setting updated successfully'
    });

  } catch (error) {
    console.error('❌ Layout setting update error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Layout setting could not be updated'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/kurumsal/layout-settings/[key]
 * 
 * Delete a specific layout setting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    console.log('🗑️ Deleting layout setting:', key);

    if (!key || typeof key !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz ayar anahtarı'
      }, { status: 400 });
    }

    // Check if setting exists
    const existingSetting = await db.corporateLayoutSettings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return NextResponse.json({
        success: false,
        error: 'Ayar bulunamadı'
      }, { status: 404 });
    }

    // Prevent deletion of core settings
    const coreSettings = [
      'cards_per_row',
      'max_cards_per_page',
      'card_spacing',
      'responsive_breakpoints',
      'show_pagination',
      'cards_animation'
    ];

    if (coreSettings.includes(key)) {
      return NextResponse.json({
        success: false,
        error: 'Temel ayarlar silinemez'
      }, { status: 400 });
    }

    // Delete setting
    await db.corporateLayoutSettings.delete({
      where: { key }
    });

    console.log('✅ Layout setting deleted:', key);

    return NextResponse.json({
      success: true,
      message: 'Layout setting deleted successfully'
    });

  } catch (error) {
    console.error('❌ Layout setting deletion error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Layout setting could not be deleted'
    }, { status: 500 });
  }
}
