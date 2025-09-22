/*
  Exporter Script: Exports selected public admin-managed data into a single JSON file
  Models covered: FooterSection + FooterItem, Executive, Department, Highlight
  Output: prisma/seed-data.json (relative to backend project root)

  Run (from kentkonut-backend/):
    npx tsx scripts/export-data.ts
*/

import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

async function main() {
  const outPath = path.resolve(process.cwd(), 'prisma', 'seed-data.json');

  // Fetch data (keep stable ordering)
  const footerSections = await db.footerSection.findMany({
    orderBy: { order: 'asc' },
    include: { items: { orderBy: { order: 'asc' } } },
  }).catch(() => [] as any[]);

  const executives = await db.executive?.findMany?.({ orderBy: { order: 'asc' } }).catch(() => [] as any[]);
  // Departments with related personnel and links
  const departments = await db.department?.findMany?.({
    orderBy: { order: 'asc' },
    include: {
      director: true, // Personnel
      manager: { select: { id: true, name: true, title: true, slug: true } }, // Executive
      chiefs: true, // Personnel[]
      quickLinks: true,
      quickAccessLinks: true,
    },
  }).catch(() => [] as any[]);
  const highlights = await db.highlight?.findMany?.({ order: 'asc' } as any).catch(() => [] as any[]);

  // Projects with media and tags
  const projects = await db.project?.findMany?.({
    orderBy: { createdAt: 'desc' },
    include: {
      media: true,
      tags: {
        include: { tag: true },
      },
    },
  }).then((rows: any[]) =>
    (rows || []).map((p: any) => ({
      ...p,
      // flatten tags
      tags: (p.tags || []).map((pt: any) => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
    }))
  ).catch(() => [] as any[]);

  // Banner groups with nested banners
  const bannerGroups = await db.bannerGroup?.findMany?.({
    orderBy: { createdAt: 'desc' },
    include: {
      banners: { orderBy: { order: 'asc' } },
    },
  }).catch(() => [] as any[]);

  // Flat banners list
  const banners = await db.banner?.findMany?.({
    orderBy: [{ bannerGroupId: 'asc' }, { order: 'asc' }],
  }).catch(() => [] as any[]);

  // Flat personnel list (directors/chiefs) for completeness
  const personnel = await db.personnel?.findMany?.({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      galleryItems: { include: { media: true } },
    },
  }).catch(() => [] as any[]);

  // News categories and tags
  const newsCategories = await db.newsCategory?.findMany?.({ orderBy: { order: 'asc' } }).catch(() => [] as any[]);
  const tags = await db.tag?.findMany?.({ orderBy: { name: 'asc' } }).catch(() => [] as any[]);

  // News with category, media, author, and flattened tags
  const news = await db.news?.findMany?.({
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      media: true,
      author: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
    },
  }).then((rows: any[]) =>
    (rows || []).map((n: any) => ({
      ...n,
      tags: (n.tags || []).map((nt: any) => ({ id: nt.tag.id, name: nt.tag.name, slug: nt.tag.slug })),
    }))
  ).catch(() => [] as any[]);

  const payload = {
    generatedAt: new Date().toISOString(),
    footerSections,
    executives,
    departments,
    highlights,
    projects,
    bannerGroups,
    banners,
    personnel,
    newsCategories,
    tags,
    news,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`✅ Export completed -> ${outPath}`);
}

main()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
