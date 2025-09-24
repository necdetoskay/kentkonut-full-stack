import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withCors } from '@/lib/cors';

// Types for PRD-compliant filters API
interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterCategory {
  name: string;
  label: string;
  options: FilterOption[];
}

interface FiltersResponse {
  success: boolean;
  data: {
    categories: FilterCategory[];
    mediaTypes: FilterOption[];
    dateRanges: FilterOption[];
  };
}

// GET - Get available filter options for gallery
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    // Get project by id
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Get all gallery items for this project
    const galleryItems = await db.projectGalleryItem.findMany({
      where: { 
        projectId,
        isActive: true,
        isFolder: false,
        media: {
          isNot: null
        }
      },
      include: {
        media: true,
        parent: true
      }
    });

    // Build filter categories
    const categories = buildCategoryFilters(galleryItems);
    const mediaTypes = buildMediaTypeFilters(galleryItems);
    const dateRanges = buildDateRangeFilters(galleryItems);

    const response: FiltersResponse = {
      success: true,
      data: {
        categories,
        mediaTypes,
        dateRanges
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GALLERY_FILTERS_GET] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Build category filters
function buildCategoryFilters(items: any[]): FilterCategory[] {
  const categoryMap = new Map<string, number>();
  
  items.forEach(item => {
    const category = item.category || 'DIS_MEKAN';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const categories: FilterCategory[] = [];
  
  // Add main categories
  const mainCategories = ['DIS_MEKAN', 'IC_MEKAN', 'VIDEO'];
  mainCategories.forEach(category => {
    const count = categoryMap.get(category) || 0;
    if (count > 0) {
      categories.push({
        name: 'category',
        label: getCategoryLabel(category),
        options: [{
          value: category,
          label: getCategoryLabel(category),
          count
        }]
      });
    }
  });

  return categories;
}

// Build media type filters
function buildMediaTypeFilters(items: any[]): FilterOption[] {
  const typeMap = new Map<string, number>();
  
  items.forEach(item => {
    if (item.media?.type) {
      const type = item.media.type;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    }
  });

  const mediaTypes: FilterOption[] = [];
  
  // Add common media types
  const commonTypes = ['IMAGE', 'VIDEO', 'PDF', 'EMBED'];
  commonTypes.forEach(type => {
    const count = typeMap.get(type) || 0;
    if (count > 0) {
      mediaTypes.push({
        value: type,
        label: getMediaTypeLabel(type),
        count
      });
    }
  });

  return mediaTypes;
}

// Build date range filters
function buildDateRangeFilters(items: any[]): FilterOption[] {
  const now = new Date();
  const ranges = [
    { label: 'Son 1 Hafta', days: 7 },
    { label: 'Son 1 Ay', days: 30 },
    { label: 'Son 3 Ay', days: 90 },
    { label: 'Son 1 Yıl', days: 365 }
  ];

  const dateRanges: FilterOption[] = [];
  
  ranges.forEach(range => {
    const cutoffDate = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);
    const count = items.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= cutoffDate;
    }).length;

    if (count > 0) {
      dateRanges.push({
        value: range.days.toString(),
        label: range.label,
        count
      });
    }
  });

  return dateRanges;
}

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'DIS_MEKAN': 'Dış Mekan',
    'IC_MEKAN': 'İç Mekan',
    'VIDEO': 'Video'
  };
  return labels[category] || category;
}

// Helper function to get media type label
function getMediaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'IMAGE': 'Görsel',
    'VIDEO': 'Video',
    'PDF': 'PDF',
    'EMBED': 'Embed',
    'WORD': 'Word'
  };
  return labels[type] || type;
}

export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }));
