import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Test endpoint to verify API structure
export async function GET(req: NextRequest) {
  try {
    // Get a sample project
    const project = await db.project.findFirst({
      where: { published: true },
      select: { id: true, title: true, slug: true }
    });

    if (!project) {
      return NextResponse.json({ 
        success: false, 
        message: 'No published projects found' 
      });
    }

    // Test the new gallery API structure
    const galleryItems = await db.projectGalleryItem.findMany({
      where: { 
        projectId: project.id,
        isActive: true 
      },
      include: {
        media: true,
        parent: true,
        children: {
          include: {
            media: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Build tab structure (same logic as in the main API)
    const buildTabStructure = (items: any[]): any[] => {
      const itemMap = new Map<number, any>();
      const rootTabs: any[] = [];

      items.forEach(item => {
        itemMap.set(item.id, item);
      });

      const rootItems = items.filter(item => !item.parentId);
      
      rootItems.forEach(item => {
        const tab = buildTabFromItem(item, itemMap);
        rootTabs.push(tab);
      });

      return rootTabs.sort((a, b) => a.order - b.order);
    };

    const buildTabFromItem = (item: any, itemMap: Map<number, any>): any => {
      const children = item.children || [];
      const subTabs: any[] = [];

      children.forEach((child: any) => {
        const subTab = buildTabFromItem(child, itemMap);
        subTabs.push(subTab);
      });

      const hasOwnMedia = !item.isFolder && item.media !== null;
      
      const countMediaInTab = (item: any): number => {
        let count = 0;
        
        if (!item.isFolder && item.media) {
          count += 1;
        }
        
        if (item.children) {
          item.children.forEach((child: any) => {
            count += countMediaInTab(child);
          });
        }
        
        return count;
      };

      const mediaCount = countMediaInTab(item);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        hasOwnMedia,
        subTabs: subTabs.sort((a, b) => a.order - b.order),
        mediaCount,
        order: item.order,
        parentId: item.parentId
      };
    };

    const tabs = buildTabStructure(galleryItems);

    return NextResponse.json({
      success: true,
      message: 'API structure test successful',
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug
      },
      data: {
        tabs,
        breadcrumb: [],
        rawItems: galleryItems.length,
        processedTabs: tabs.length
      }
    });

  } catch (error) {
    console.error('[API_TEST] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
