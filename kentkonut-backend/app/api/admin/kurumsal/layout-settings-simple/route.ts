import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LAYOUT_SETTINGS } from '@/types/layout-settings';
import { withCors } from '@/lib/cors';

/**
 * Simple layout settings endpoint that returns default values
 * Use this as fallback while debugging the main endpoint
 */
async function handleGET() {
  try {
    console.log('🔍 Simple layout settings endpoint called');

    // Return default settings without database
    const mockSettings = [
      {
        id: 'simple1',
        key: 'cards_per_row',
        value: '3',
        description: 'Bir satırda kaç kart gösterileceği (1-6 arası)',
        type: 'number',
        category: 'layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'simple2',
        key: 'max_cards_per_page',
        value: '12',
        description: 'Bir sayfada maksimum kaç kart gösterileceği',
        type: 'number',
        category: 'layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'simple3',
        key: 'card_spacing',
        value: 'medium',
        description: 'Kartlar arası boşluk (small, medium, large)',
        type: 'select',
        category: 'layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'simple4',
        key: 'responsive_breakpoints',
        value: JSON.stringify({ mobile: 1, tablet: 2, desktop: 3 }),
        description: 'Responsive breakpoint ayarları',
        type: 'json',
        category: 'layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'simple5',
        key: 'show_pagination',
        value: 'true',
        description: 'Sayfalama gösterilsin mi',
        type: 'boolean',
        category: 'layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'simple6',
        key: 'cards_animation',
        value: 'fade',
        description: 'Kart animasyon tipi (none, fade, slide)',
        type: 'select',
        category: 'layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    console.log('✅ Returning mock layout settings');

    return NextResponse.json({
      success: true,
      data: {
        raw: mockSettings,
        parsed: DEFAULT_LAYOUT_SETTINGS
      },
      message: 'Mock layout settings retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Simple layout settings error:', error);
    return NextResponse.json({
      success: false,
      error: 'Simple endpoint failed'
    }, { status: 500 });
  }
}

// Export CORS-wrapped handler
export const GET = withCors(handleGET);
