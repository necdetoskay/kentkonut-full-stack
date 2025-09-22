/*
  Importer/Seeder Script: Reads prisma/seed-data.json and upserts records.
  - Non-destructive: does NOT delete existing data.
  - Upsert strategy per model:
      FooterSection: by key
      FooterItem: by (section.key + type + label) if found, else create
      Executive: by slug (fallback: email)
      Department: by slug
      Highlight: by id (fallback: titleOverride + redirectUrl)

  Run (from kentkonut-backend/):
    npx tsx scripts/seed-from-file.ts
*/

import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

interface SeedPayload {
  footerSections?: any[];
  executives?: any[];
  departments?: any[];
  highlights?: any[];
  personnel?: any[];
  projects?: any[];
  bannerGroups?: any[];
  banners?: any[];
  newsCategories?: any[];
  tags?: any[];
  news?: any[];
}

async function getOrCreateFallbackAuthor() {
  // Try to find any user first
  let user = await db.user.findFirst().catch(() => null);
  if (user) return user;
  // Create a minimal system user as fallback author
  // Use fixed id to avoid duplicates across runs
  const SYSTEM_ID = 'system-user';
  try {
    user = await db.user.upsert({
      where: { id: SYSTEM_ID },
      update: {},
      create: {
        id: SYSTEM_ID,
        email: 'system@kentkonut.local',
        name: 'System User',
        role: 'admin',
      },
    });
  } catch (e) {
    // Last resort: find again
    user = await db.user.findFirst().catch(() => null);
  }
  return user;
}

async function upsertPersonnel(payload: SeedPayload) {
  if (!db.personnel?.upsert) return;
  const list = payload.personnel || [];
  for (const p of list) {
    try {
      const slug = p.slug || (p.name?.toString?.().toLowerCase?.().replace(/\s+/g, '-'));
      const existing = slug
        ? await db.personnel.findUnique({ where: { slug } }).catch(() => null)
        : p.id
        ? await db.personnel.findUnique({ where: { id: p.id } }).catch(() => null)
        : null;

      const data: any = {
        name: p.name,
        title: p.title,
        content: p.content ?? '',
        phone: p.phone ?? null,
        email: p.email ?? null,
        imageUrl: p.imageUrl ?? null,
        slug: slug ?? existing?.slug,
        order: p.order ?? 0,
        isActive: p.isActive ?? true,
        type: p.type ?? 'CHIEF',
      };

      const person = existing
        ? await db.personnel.update({ where: { id: existing.id }, data })
        : await db.personnel.create({ data });

      // Gallery items (optional)
      const gallery = Array.isArray(p.galleryItems) ? p.galleryItems : [];
      for (const gi of gallery) {
        try {
          const mediaId = gi.mediaId || gi.media?.id;
          let finalMediaId = mediaId || null;
          if (!finalMediaId && gi.media?.url) {
            const url = gi.media.url;
            const m = await db.media.findFirst({ where: { OR: [{ url }, { path: url }] } }).catch(() => null);
            finalMediaId = m?.id ?? null;
          }
          if (!finalMediaId) continue;
          // create if not exists per (personnelId, mediaId)
          const exists = await db.personnelGallery.findFirst({ where: { personnelId: person.id, mediaId: finalMediaId } }).catch(() => null);
          if (!exists) {
            await db.personnelGallery.create({
              data: {
                personnelId: person.id,
                mediaId: finalMediaId,
                type: gi.type ?? 'IMAGE',
                order: gi.order ?? 0,
                title: gi.title ?? null,
                description: gi.description ?? null,
              },
            });
          }
        } catch {}
      }
    } catch (e) {
      console.warn('⚠️ Personnel upsert skipped:', p?.slug || p?.name, e instanceof Error ? e.message : e);
    }
  }
}

// Read prisma/seed-data/menu.json and upsert menu items
async function upsertMenuFromSeedData() {
  try {
    const filePath = path.resolve(process.cwd(), 'prisma', 'seed-data', 'menu.json');
    if (!fs.existsSync(filePath)) {
      console.warn('ℹ️ Menu seed file not found:', filePath);
      return;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    let items: any[] = [];
    try { items = JSON.parse(raw); } catch (e) {
      console.warn('⚠️ Menu seed JSON parse error:', e instanceof Error ? e.message : e);
      return;
    }

    const toSlug = (s: string) => s
      .toString()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    for (const m of items) {
      try {
        const id: string | undefined = m.id;
        const data: any = {
          title: m.title,
          url: m.url || null,
          slug: m.slug || undefined,
          icon: m.icon || null,
          description: m.description || null,
          isActive: m.isActive ?? true,
          isExternal: m.isExternal ?? false,
          target: m.target || '_self',
          orderIndex: m.orderIndex ?? 0,
          menuLocation: m.menuLocation || 'main',
          parentId: m.parentId || null,
        };
        if (!data.slug && data.title) {
          data.slug = toSlug(data.title);
        }

        if (id) {
          await db.menuItem.upsert({ where: { id }, update: data, create: { id, ...data } });
        } else {
          const existing = data.slug
            ? await db.menuItem.findFirst({ where: { slug: data.slug, menuLocation: data.menuLocation } }).catch(() => null)
            : await db.menuItem.findFirst({ where: { title: data.title, menuLocation: data.menuLocation } }).catch(() => null);
          if (existing) {
            await db.menuItem.update({ where: { id: existing.id }, data });
          } else {
            await db.menuItem.create({ data });
          }
        }
      } catch (e) {
        console.warn('⚠️ Menu item upsert skipped:', m?.title || m?.id, e instanceof Error ? e.message : e);
      }
    }
  } catch (e) {
    console.warn('⚠️ Menu seed failed:', e instanceof Error ? e.message : e);
  }
}

async function upsertFooter(payload: SeedPayload) {
  const sections = payload.footerSections || [];
  for (const section of sections) {
    // Upsert section by key
    const upserted = await db.footerSection.upsert({
      where: { key: section.key },
      update: {
        title: section.title ?? null,
        type: section.type,
        orientation: section.orientation ?? 'VERTICAL',
        order: section.order ?? 0,
        isActive: section.isActive ?? true,
        layoutConfig: section.layoutConfig ?? undefined,
      },
      create: {
        key: section.key,
        title: section.title ?? null,
        type: section.type,
        orientation: section.orientation ?? 'VERTICAL',
        order: section.order ?? 0,
        isActive: section.isActive ?? true,
        layoutConfig: section.layoutConfig ?? undefined,
      },
    });

    // Items: try to find existing by (sectionId + type + label)
    const items = Array.isArray(section.items) ? section.items : [];
    for (const item of items) {
      const existing = await db.footerItem.findFirst({
        where: {
          sectionId: upserted.id,
          type: item.type,
          label: item.label ?? null,
        },
      });

      if (existing) {
        await db.footerItem.update({
          where: { id: existing.id },
          data: {
            order: item.order ?? existing.order ?? 0,
            url: item.url ?? null,
            target: item.target ?? existing.target ?? '_self',
            isExternal: item.isExternal ?? existing.isExternal ?? false,
            icon: item.icon ?? null,
            imageUrl: item.imageUrl ?? null,
            text: item.text ?? null,
            metadata: item.metadata ?? undefined,
          },
        });
      } else {
        await db.footerItem.create({
          data: {
            sectionId: upserted.id,
            order: item.order ?? 0,
            type: item.type,
            label: item.label ?? null,
            url: item.url ?? null,
            target: item.target ?? '_self',
            isExternal: item.isExternal ?? false,
            icon: item.icon ?? null,
            imageUrl: item.imageUrl ?? null,
            text: item.text ?? null,
            metadata: item.metadata ?? undefined,
          },
        });
      }
    }
  }
}

async function upsertExecutives(payload: SeedPayload) {
  if (!db.executive?.upsert) return; // model may not exist in some branches
  const list = payload.executives || [];
  for (const e of list) {
    const where: any = e.slug ? { slug: e.slug } : e.email ? { email: e.email } : { id: e.id };
    const existing = await db.executive.findFirst({ where }).catch(() => null);
    if (existing) {
      await db.executive.update({
        where: { id: existing.id },
        data: {
          name: e.name,
          title: e.title,
          email: e.email ?? null,
          phone: e.phone ?? null,
          biography: e.biography ?? null,
          imageUrl: e.imageUrl ?? null,
          order: e.order ?? 0,
          isActive: e.isActive ?? true,
          slug: e.slug ?? existing.slug,
        },
      });
    } else {
      await db.executive.create({
        data: {
          name: e.name,
          title: e.title,
          email: e.email ?? null,
          phone: e.phone ?? null,
          biography: e.biography ?? null,
          imageUrl: e.imageUrl ?? null,
          order: e.order ?? 0,
          isActive: e.isActive ?? true,
          slug: e.slug ?? undefined,
        },
      });
    }
  }
}

async function upsertDepartments(payload: SeedPayload) {
  if (!db.department?.upsert) return;
  const list = payload.departments || [];
  for (const d of list) {
    try {
      const where: any = d.slug ? { slug: d.slug } : { id: d.id };
      const existing = await db.department.findFirst({ where }).catch(() => null);

      // Resolve director (Personnel)
      let directorId: string | null = d.directorId ?? null;
      if (!directorId && d.director) {
        if (d.director.slug) {
          directorId = (await db.personnel.findUnique({ where: { slug: d.director.slug } }).catch(() => null))?.id ?? null;
        } else if (d.director.name) {
          directorId = (await db.personnel.findFirst({ where: { name: d.director.name } }).catch(() => null))?.id ?? null;
        }
      }

      // Resolve manager (Executive)
      let managerId: string | null = d.managerId ?? null;
      if (!managerId && d.manager) {
        if (d.manager.slug) {
          managerId = (await db.executive.findFirst({ where: { slug: d.manager.slug } }).catch(() => null))?.id ?? null;
        } else if (d.manager.id) {
          managerId = d.manager.id;
        } else if (d.manager.name) {
          managerId = (await db.executive.findFirst({ where: { name: d.manager.name } }).catch(() => null))?.id ?? null;
        }
      }

      const data: any = {
        name: d.name,
        imageUrl: d.imageUrl ?? null,
        services: Array.isArray(d.services) ? d.services : [],
        order: d.order ?? 0,
        isActive: d.isActive ?? true,
        content: d.content ?? '',
        slug: d.slug ?? existing?.slug,
        hasQuickAccess: d.hasQuickAccess ?? false,
        directorId,
        managerId,
      };

      const dept = existing
        ? await db.department.update({ where: { id: existing.id }, data })
        : await db.department.create({ data });

      // Chiefs relation (Personnel[] via DepartmentChiefs)
      const chiefs = Array.isArray(d.chiefs) ? d.chiefs : [];
      for (const c of chiefs) {
        try {
          let chiefId: string | null = c.id ?? null;
          if (!chiefId) {
            if (c.slug) chiefId = (await db.personnel.findUnique({ where: { slug: c.slug } }).catch(() => null))?.id ?? null;
            else if (c.name) chiefId = (await db.personnel.findFirst({ where: { name: c.name } }).catch(() => null))?.id ?? null;
          }
          if (!chiefId) continue;
          // Connect if not already connected
          const exists = await db.department.findFirst({ where: { id: dept.id, chiefs: { some: { id: chiefId } } } }).catch(() => null);
          if (!exists) {
            await db.department.update({ where: { id: dept.id }, data: { chiefs: { connect: { id: chiefId } } } });
          }
        } catch {}
      }

      // QuickLinks (DepartmentQuickLink)
      const ql = Array.isArray(d.quickLinks) ? d.quickLinks : [];
      for (const q of ql) {
        try {
          const found = await db.departmentQuickLink.findFirst({ where: { departmentId: dept.id, title: q.title, url: q.url } }).catch(() => null);
          const linkData = { title: q.title, url: q.url, icon: q.icon ?? 'link', order: q.order ?? 0, departmentId: dept.id } as any;
          if (found) await db.departmentQuickLink.update({ where: { id: found.id }, data: linkData });
          else await db.departmentQuickLink.create({ data: linkData });
        } catch {}
      }

      // QuickAccessLinks
      const qal = Array.isArray(d.quickAccessLinks) ? d.quickAccessLinks : [];
      for (const qa of qal) {
        try {
          const found = await db.quickAccessLink.findFirst({ where: { departmentId: dept.id, title: qa.title, url: qa.url } }).catch(() => null);
          const linkData = {
            title: qa.title,
            url: qa.url,
            icon: qa.icon ?? 'link',
            sortOrder: qa.sortOrder ?? 0,
            isActive: qa.isActive ?? true,
            moduleType: 'department',
            departmentId: dept.id,
          } as any;
          if (found) await db.quickAccessLink.update({ where: { id: found.id }, data: linkData });
          else await db.quickAccessLink.create({ data: linkData });
        } catch {}
      }
    } catch (e) {
      console.warn('⚠️ Department upsert skipped due to schema mismatch or data issue:', d?.slug || d?.id || d?.name);
    }
  }
}

async function upsertProjects(payload: SeedPayload) {
  if (!db.project?.upsert) return;
  const list = payload.projects || [];
  const fallbackAuthor = await getOrCreateFallbackAuthor();
  for (const p of list) {
    try {
      const slug = p.slug || p.title?.toString?.().toLowerCase?.().replace(/\s+/g, '-');
      if (!slug) continue;
      const existing = await db.project.findUnique({ where: { slug } }).catch(() => null);
      let mediaId: string | null | undefined = p.mediaId ?? p.media?.id ?? null;
      if (mediaId) {
        const mExists = await db.media.findUnique({ where: { id: mediaId } }).catch(() => null);
        if (!mExists) mediaId = null;
      }
      if (!mediaId && (p.media?.url || p.mediaUrl)) {
        const url = p.media?.url || p.mediaUrl;
        const m = await db.media.findFirst({ where: { OR: [{ url }, { path: url }] } }).catch(() => null);
        mediaId = m?.id ?? null;
      }
      // Resolve authorId safely
      let resolvedAuthorId: string | undefined = p.authorId ?? p.author?.id ?? undefined;
      if (resolvedAuthorId) {
        const exists = await db.user.findUnique({ where: { id: resolvedAuthorId } }).catch(() => null);
        if (!exists) resolvedAuthorId = fallbackAuthor?.id;
      } else {
        resolvedAuthorId = fallbackAuthor?.id;
      }

      const data: any = {
        title: p.title,
        slug,
        summary: p.summary ?? null,
        content: p.content ?? '',
        status: p.status ?? 'ONGOING',
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        locationName: p.locationName ?? null,
        province: p.province ?? null,
        district: p.district ?? null,
        address: p.address ?? null,
        mediaId: mediaId ?? null,
        authorId: resolvedAuthorId,
        published: p.published ?? true,
        publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        readingTime: p.readingTime ?? 1,
        viewCount: p.viewCount ?? 0,
        hasQuickAccess: p.hasQuickAccess ?? false,
      };
      const createdOrUpdated = existing
        ? await db.project.update({ where: { id: existing.id }, data })
        : await db.project.create({ data });

      const tags = Array.isArray(p.tags) ? p.tags : [];
      for (const t of tags) {
        try {
          const tag = await db.tag.upsert({ where: { name: t.name }, update: {}, create: { name: t.name, slug: t.slug || t.name.toLowerCase().replace(/\s+/g, '-') } });
          await db.projectTag.upsert({ where: { projectId_tagId: { projectId: createdOrUpdated.id, tagId: tag.id } }, update: {}, create: { projectId: createdOrUpdated.id, tagId: tag.id } } as any);
        } catch {}
      }
    } catch (e) {
      console.warn('⚠️ Project upsert skipped:', p?.slug || p?.title, e instanceof Error ? e.message : e);
    }
  }
}

async function upsertBannerGroupsAndBanners(payload: SeedPayload) {
  const groups = payload.bannerGroups || [];
  for (const g of groups) {
    try {
      const where: any = g.usageType ? { usageType: g.usageType } : { name: g.name };
      const existing = await db.bannerGroup.findFirst({ where }).catch(() => null);
      const data: any = {
        name: g.name,
        description: g.description ?? null,
        deletable: g.deletable ?? true,
        transitionDuration: g.transitionDuration ?? 0.5,
        width: g.width ?? 1200,
        height: g.height ?? 400,
        displayDuration: g.displayDuration ?? 5000,
        isActive: g.isActive ?? true,
        mobileHeight: g.mobileHeight ?? 200,
        mobileWidth: g.mobileWidth ?? 400,
        tabletHeight: g.tabletHeight ?? 300,
        tabletWidth: g.tabletWidth ?? 800,
        animationType: g.animationType ?? 'SOLUKLESTIR',
        usageType: g.usageType ?? null,
      };
      const group = existing
        ? await db.bannerGroup.update({ where: { id: existing.id }, data })
        : await db.bannerGroup.create({ data });
      const banners = Array.isArray(g.banners) ? g.banners : [];
      for (const b of banners) {
        try {
          const found = await db.banner.findFirst({ where: { title: b.title, bannerGroupId: group.id } }).catch(() => null);
          const bData: any = {
            title: b.title,
            description: b.description ?? null,
            link: b.link ?? null,
            isActive: b.isActive ?? true,
            deletable: b.deletable ?? true,
            order: b.order ?? 0,
            imageUrl: b.imageUrl,
            altText: b.altText ?? null,
            bannerGroupId: group.id,
            startDate: b.startDate ? new Date(b.startDate) : null,
            endDate: b.endDate ? new Date(b.endDate) : null,
          };
          if (found) await db.banner.update({ where: { id: found.id }, data: bData });
          else await db.banner.create({ data: bData });
        } catch {}
      }
    } catch (e) {
      console.warn('⚠️ BannerGroup upsert skipped:', g?.name || g?.usageType, e instanceof Error ? e.message : e);
    }
  }
}

async function upsertNews(payload: SeedPayload) {
  const cats = payload.newsCategories || [];
  const tags = payload.tags || [];
  const news = payload.news || [];
  for (const c of cats) {
    try {
      await db.newsCategory.upsert({ where: { slug: c.slug }, update: { name: c.name, description: c.description ?? null, imageUrl: c.imageUrl ?? null, order: c.order ?? 0, active: c.active ?? true }, create: { name: c.name, slug: c.slug, description: c.description ?? null, imageUrl: c.imageUrl ?? null, order: c.order ?? 0, active: c.active ?? true } });
    } catch {}
  }
  for (const t of tags) {
    try {
      await db.tag.upsert({ where: { name: t.name }, update: { slug: t.slug ?? t.name }, create: { name: t.name, slug: t.slug ?? t.name } });
    } catch {}
  }
  const fallbackAuthor = await getOrCreateFallbackAuthor();
  for (const n of news) {
    try {
      const slug = n.slug || (n.title?.toString?.().toLowerCase?.().replace(/\s+/g, '-'));
      if (!slug) continue;
      const existing = await db.news.findUnique({ where: { slug } }).catch(() => null);
      const category = n.category?.slug ? await db.newsCategory.findUnique({ where: { slug: n.category.slug } }) : null;
      // Resolve authorId safely
      let resolvedAuthorId: string | undefined = n.authorId ?? n.author?.id ?? undefined;
      if (resolvedAuthorId) {
        const exists = await db.user.findUnique({ where: { id: resolvedAuthorId } }).catch(() => null);
        if (!exists) resolvedAuthorId = fallbackAuthor?.id;
      } else {
        resolvedAuthorId = fallbackAuthor?.id;
      }

      const data: any = {
        title: n.title,
        slug,
        summary: n.summary ?? null,
        content: n.content ?? '',
        categoryId: category?.id ?? n.categoryId ?? (await db.newsCategory.findFirst()?.then(c=>c?.id).catch(()=>undefined)),
        authorId: resolvedAuthorId,
        published: n.published ?? true,
        publishedAt: n.publishedAt ? new Date(n.publishedAt) : new Date(),
        readingTime: n.readingTime ?? 1,
        likeCount: n.likeCount ?? 0,
        viewCount: n.viewCount ?? 0,
        shareCount: n.shareCount ?? 0,
        downloadCount: n.downloadCount ?? 0,
        hasQuickAccess: n.hasQuickAccess ?? false,
      };
      const createdOrUpdated = existing
        ? await db.news.update({ where: { id: existing.id }, data })
        : await db.news.create({ data });
      const nTags = Array.isArray(n.tags) ? n.tags : [];
      for (const t of nTags) {
        try {
          const tag = await db.tag.upsert({ where: { name: t.name }, update: {}, create: { name: t.name, slug: t.slug ?? t.name } });
          await db.newsTag.upsert({ where: { newsId_tagId: { newsId: createdOrUpdated.id, tagId: tag.id } }, update: {}, create: { newsId: createdOrUpdated.id, tagId: tag.id } } as any);
        } catch {}
      }
    } catch (e) {
      console.warn('⚠️ News upsert skipped:', n?.slug || n?.title, e instanceof Error ? e.message : e);
    }
  }
}

async function upsertHighlights(payload: SeedPayload) {
  if (!db.highlight?.upsert) return;
  const list = payload.highlights || [];
  for (const h of list) {
    // Prefer deterministic id if present
    const existing = h.id ? await db.highlight.findUnique({ where: { id: h.id } }).catch(() => null)
      : await db.highlight.findFirst({ where: { titleOverride: h.titleOverride ?? null, redirectUrl: h.redirectUrl ?? null } }).catch(() => null);

    const data = {
      sourceType: h.sourceType,
      titleOverride: h.titleOverride ?? null,
      subtitleOverride: h.subtitleOverride ?? null,
      imageUrl: h.imageUrl ?? null,
      redirectUrl: h.redirectUrl ?? null,
      order: h.order ?? 0,
      isActive: h.isActive ?? true,
    } as any;

    if (existing) {
      await db.highlight.update({ where: { id: existing.id }, data });
    } else {
      await db.highlight.create({ data });
    }
  }
}

async function main() {
  const inPath = path.resolve(process.cwd(), 'prisma', 'seed-data.json');
  if (!fs.existsSync(inPath)) {
    console.error(`❌ Seed file not found: ${inPath}. Run export first: npx tsx scripts/export-data.ts`);
    process.exit(1);
  }
  const raw = fs.readFileSync(inPath, 'utf-8');
  const payload = JSON.parse(raw) as SeedPayload;
  console.log('🌱 Seeding from file...');

  await upsertFooter(payload);
  await upsertExecutives(payload);
  await upsertPersonnel(payload);
  await upsertDepartments(payload);
  await upsertHighlights(payload);
  await upsertProjects(payload);
  await upsertBannerGroupsAndBanners(payload);
  await upsertNews(payload);
  await upsertMenuFromSeedData();

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
