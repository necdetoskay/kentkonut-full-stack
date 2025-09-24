/*
  Updated Exporter Script: Exports all relevant data from our current database structure
  Models covered: All major models from our schema
  Output: prisma/exported-data.json (relative to backend project root)

  Run (from kentkonut-backend/):
    npx tsx scripts/export-data-updated.ts
*/

import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

async function main() {
  const outPath = path.resolve(process.cwd(), 'prisma', 'exported-data.json');
  
  console.log('🚀 Starting data export...');

  try {
    // Users
    console.log('📊 Exporting users...');
    const users = await db.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    }).catch(() => []);

    // Media Categories
    console.log('📊 Exporting media categories...');
    const mediaCategories = await db.mediaCategory.findMany({
      orderBy: { name: 'asc' }
    }).catch(() => []);

    // Media
    console.log('📊 Exporting media...');
    const media = await db.media.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true } }
      }
    }).catch(() => []);

    // Pages
    console.log('📊 Exporting pages...');
    const pages = await db.page.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        seoMetrics: true
      }
    }).catch(() => []);

    // Executives
    console.log('📊 Exporting executives...');
    const executives = await db.executive.findMany({
      orderBy: { order: 'asc' },
      include: {
        quickLinks: true
      }
    }).catch(() => []);

    // Departments
    console.log('📊 Exporting departments...');
    const departments = await db.department.findMany({
      orderBy: { order: 'asc' },
      include: {
        director: true,
        manager: { select: { id: true, name: true, title: true, slug: true } },
        quickLinks: true
      }
    }).catch(() => []);

    // Personnel
    console.log('📊 Exporting personnel...');
    const personnel = await db.personnel.findMany({
      orderBy: { order: 'asc' },
      include: {
        galleryItems: { include: { media: true } }
      }
    }).catch(() => []);

    // News Categories
    console.log('📊 Exporting news categories...');
    const newsCategories = await db.newsCategory.findMany({
      orderBy: { order: 'asc' }
    }).catch(() => []);

    // Tags
    console.log('📊 Exporting tags...');
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' }
    }).catch(() => []);

    // News
    console.log('📊 Exporting news...');
    const news = await db.news.findMany({
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        media: true,
        author: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
        galleryItems: { include: { media: true } }
      }
    }).then((rows: any[]) =>
      (rows || []).map((n: any) => ({
        ...n,
        tags: (n.tags || []).map((nt: any) => ({ 
          id: nt.tag.id, 
          name: nt.tag.name, 
          slug: nt.tag.slug 
        }))
      }))
    ).catch(() => []);

    // Projects
    console.log('📊 Exporting projects...');
    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        media: true,
        tags: { include: { tag: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        relatedProjects: {
          include: {
            relatedProject: {
              include: {
                media: true,
                author: { select: { id: true, name: true, email: true } }
              }
            }
          }
        },
        quickAccessLinks: true
      }
    }).then((rows: any[]) =>
      (rows || []).map((p: any) => ({
        ...p,
        tags: (p.tags || []).map((pt: any) => ({ 
          id: pt.tag.id, 
          name: pt.tag.name, 
          slug: pt.tag.slug 
        }))
      }))
    ).catch(() => []);

    // Banner Groups
    console.log('📊 Exporting banner groups...');
    const bannerGroups = await db.bannerGroup.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        banners: { orderBy: { order: 'asc' } }
      }
    }).catch(() => []);

    // Banners
    console.log('📊 Exporting banners...');
    const banners = await db.banner.findMany({
      orderBy: [{ bannerGroupId: 'asc' }, { order: 'asc' }]
    }).catch(() => []);

    // Banner Positions
    console.log('📊 Exporting banner positions...');
    const bannerPositions = await db.bannerPosition.findMany({
      orderBy: { name: 'asc' }
    }).catch(() => []);

    // Menu Items
    console.log('📊 Exporting menu items...');
    const menuItems = await db.menuItem.findMany({
      orderBy: [{ parentId: 'asc' }, { orderIndex: 'asc' }],
      include: {
        parent: { select: { id: true, title: true } },
        children: { orderBy: { orderIndex: 'asc' } }
      }
    }).catch(() => []);

    // Quick Access Links
    console.log('📊 Exporting quick access links...');
    const quickAccessLinks = await db.quickAccessLink.findMany({
      orderBy: { sortOrder: 'asc' }
    }).catch(() => []);

    // Service Cards
    console.log('📊 Exporting service cards...');
    const serviceCards = await db.serviceCard.findMany({
      orderBy: { order: 'asc' }
    }).catch(() => []);

    // Highlights
    console.log('📊 Exporting highlights...');
    const highlights = await db.highlight.findMany({
      orderBy: { order: 'asc' }
    }).catch(() => []);

    // Footer Sections
    console.log('📊 Exporting footer sections...');
    const footerSections = await db.footerSection.findMany({
      orderBy: { order: 'asc' },
      include: { 
        items: { orderBy: { order: 'asc' } } 
      }
    }).catch(() => []);

    // Footer Columns
    console.log('📊 Exporting footer columns...');
    const footerColumns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' },
      include: {
        links: { orderBy: { order: 'asc' } }
      }
    }).catch(() => []);

    // Site Settings
    console.log('📊 Exporting site settings...');
    const siteSettings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' }
    }).catch(() => []);

    // Corporate Layout Settings
    console.log('📊 Exporting corporate layout settings...');
    const corporateLayoutSettings = await db.corporateLayoutSettings.findMany({
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // Hafriyat Data
    console.log('📊 Exporting hafriyat data...');
    const hafriyatBolgeler = await db.hafriyatBolge.findMany({
      orderBy: { ad: 'asc' }
    }).catch(() => []);

    const hafriyatSahalar = await db.hafriyatSaha.findMany({
      orderBy: { ad: 'asc' }
    }).catch(() => []);

    const hafriyatBelgeKategoriler = await db.hafriyatBelgeKategori.findMany({
      orderBy: { ad: 'asc' }
    }).catch(() => []);

    const hafriyatBelgeler = await db.hafriyatBelge.findMany({
      orderBy: { ad: 'asc' }
    }).catch(() => []);

    const hafriyatResimler = await db.hafriyatResim.findMany({
      orderBy: { ad: 'asc' }
    }).catch(() => []);

    // Comments
    console.log('📊 Exporting comments...');
    const comments = await db.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    }).catch(() => []);

    const payload = {
      generatedAt: new Date().toISOString(),
      exportVersion: '2.0',
      summary: {
        users: users.length,
        mediaCategories: mediaCategories.length,
        media: media.length,
        pages: pages.length,
        executives: executives.length,
        departments: departments.length,
        personnel: personnel.length,
        newsCategories: newsCategories.length,
        tags: tags.length,
        news: news.length,
        projects: projects.length,
        bannerGroups: bannerGroups.length,
        banners: banners.length,
        bannerPositions: bannerPositions.length,
        menuItems: menuItems.length,
        quickAccessLinks: quickAccessLinks.length,
        serviceCards: serviceCards.length,
        highlights: highlights.length,
        footerSections: footerSections.length,
        footerColumns: footerColumns.length,
        siteSettings: siteSettings.length,
        corporateLayoutSettings: corporateLayoutSettings.length,
        hafriyatBolgeler: hafriyatBolgeler.length,
        hafriyatSahalar: hafriyatSahalar.length,
        hafriyatBelgeKategoriler: hafriyatBelgeKategoriler.length,
        hafriyatBelgeler: hafriyatBelgeler.length,
        hafriyatResimler: hafriyatResimler.length,
        comments: comments.length
      },
      data: {
        users,
        mediaCategories,
        media,
        pages,
        executives,
        departments,
        personnel,
        newsCategories,
        tags,
        news,
        projects,
        bannerGroups,
        banners,
        bannerPositions,
        menuItems,
        quickAccessLinks,
        serviceCards,
        highlights,
        footerSections,
        footerColumns,
        siteSettings,
        corporateLayoutSettings,
        hafriyatBolgeler,
        hafriyatSahalar,
        hafriyatBelgeKategoriler,
        hafriyatBelgeler,
        hafriyatResimler,
        comments
      }
    };

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    
    // Write file
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
    
    console.log(`✅ Export completed successfully!`);
    console.log(`📁 Output file: ${outPath}`);
    console.log(`📊 Total records exported: ${Object.values(payload.summary).reduce((sum, count) => sum + count, 0)}`);
    console.log(`📋 Summary:`);
    Object.entries(payload.summary).forEach(([key, count]) => {
      console.log(`   ${key}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Export script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
