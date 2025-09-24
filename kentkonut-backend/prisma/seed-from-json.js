const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedFromJson() {
  console.log('🌱 Starting JSON data seed...');
  
  try {
    const jsonPath = path.join(__dirname, 'seed-data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Seed users
    if (jsonData.users?.length > 0) {
      console.log('👤 Seeding users...');
      for (const user of jsonData.users) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          await prisma.user.create({ data: user });
          console.log(`✅ User created: ${user.name}`);
        }
      }
    }

    // Seed media categories
    if (jsonData.mediaCategories?.length > 0) {
      console.log('📁 Seeding media categories...');
      for (const category of jsonData.mediaCategories) {
        const existing = await prisma.mediaCategory.findUnique({ where: { id: category.id } });
        if (!existing) {
          await prisma.mediaCategory.create({ data: category });
          console.log(`✅ Media category created: ${category.name}`);
        }
      }
    }

    // Seed media
    if (jsonData.media?.length > 0) {
      console.log('🖼️ Seeding media...');
      for (const media of jsonData.media) {
        const existing = await prisma.media.findUnique({ where: { id: media.id } });
        if (!existing) {
          await prisma.media.create({ data: media });
          console.log(`✅ Media created: ${media.originalName}`);
        }
      }
    }

    // Seed pages
    if (jsonData.pages?.length > 0) {
      console.log('📄 Seeding pages...');
      for (const page of jsonData.pages) {
        const existing = await prisma.page.findUnique({ where: { slug: page.slug } });
        if (!existing) {
          await prisma.page.create({ data: page });
          console.log(`✅ Page created: ${page.title}`);
        }
      }
    }

    // Seed news categories
    if (jsonData.newsCategories?.length > 0) {
      console.log('📂 Seeding news categories...');
      for (const category of jsonData.newsCategories) {
        const existing = await prisma.newsCategory.findUnique({ where: { id: category.id } });
        if (!existing) {
          await prisma.newsCategory.create({ data: category });
          console.log(`✅ News category created: ${category.name}`);
        }
      }
    }

    // Seed news
    if (jsonData.news?.length > 0) {
      console.log('📰 Seeding news...');
      for (const article of jsonData.news) {
        const existing = await prisma.news.findUnique({ where: { slug: article.slug } });
        if (!existing) {
          await prisma.news.create({ data: article });
          console.log(`✅ News created: ${article.title}`);
        }
      }
    }

    // Seed tags
    if (jsonData.tags?.length > 0) {
      console.log('🏷️ Seeding tags...');
      for (const tag of jsonData.tags) {
        const existing = await prisma.tag.findUnique({ where: { id: tag.id } });
        if (!existing) {
          await prisma.tag.create({ data: tag });
          console.log(`✅ Tag created: ${tag.name}`);
        }
      }
    }

    // Seed projects
    if (jsonData.projects?.length > 0) {
      console.log('🏗️ Seeding projects...');
      for (const project of jsonData.projects) {
        const existing = await prisma.project.findUnique({ where: { slug: project.slug } });
        if (!existing) {
          await prisma.project.create({ data: project });
          console.log(`✅ Project created: ${project.title}`);
        }
      }
    }

    // Seed banner groups
    if (jsonData.bannerGroups?.length > 0) {
      console.log('🎯 Seeding banner groups...');
      for (const group of jsonData.bannerGroups) {
        const existing = await prisma.bannerGroup.findUnique({ where: { id: group.id } });
        if (!existing) {
          await prisma.bannerGroup.create({ data: group });
          console.log(`✅ Banner group created: ${group.name}`);
        }
      }
    }

    // Seed banners
    if (jsonData.banners?.length > 0) {
      console.log('🖼️ Seeding banners...');
      for (const banner of jsonData.banners) {
        const existing = await prisma.banner.findUnique({ where: { id: banner.id } });
        if (!existing) {
          await prisma.banner.create({ data: banner });
          console.log(`✅ Banner created: ${banner.title}`);
        }
      }
    }

    // Seed banner positions
    if (jsonData.bannerPositions?.length > 0) {
      console.log('📍 Seeding banner positions...');
      for (const position of jsonData.bannerPositions) {
        const existing = await prisma.bannerPosition.findUnique({ where: { id: position.id } });
        if (!existing) {
          await prisma.bannerPosition.create({ data: position });
          console.log(`✅ Banner position created: ${position.name}`);
        }
      }
    }

    // Seed menu items
    if (jsonData.menuItems?.length > 0) {
      console.log('📑 Seeding menu items...');
      for (const item of jsonData.menuItems) {
        const existing = await prisma.menuItem.findUnique({ where: { id: item.id } });
        if (!existing) {
          await prisma.menuItem.create({ data: item });
          console.log(`✅ Menu item created: ${item.title}`);
        }
      }
    }

    // Seed executives
    if (jsonData.executives?.length > 0) {
      console.log('👔 Seeding executives...');
      for (const executive of jsonData.executives) {
        const existing = await prisma.executive.findUnique({ where: { id: executive.id } });
        if (!existing) {
          await prisma.executive.create({ data: executive });
          console.log(`✅ Executive created: ${executive.name}`);
        }
      }
    }

    // Seed departments
    if (jsonData.departments?.length > 0) {
      console.log('🏢 Seeding departments...');
      for (const department of jsonData.departments) {
        const existing = await prisma.department.findUnique({ where: { id: department.id } });
        if (!existing) {
          await prisma.department.create({ data: department });
          console.log(`✅ Department created: ${department.name}`);
        }
      }
    }

    // Seed personnel
    if (jsonData.personnel?.length > 0) {
      console.log('👥 Seeding personnel...');
      for (const person of jsonData.personnel) {
        const existing = await prisma.personnel.findUnique({ where: { id: person.id } });
        if (!existing) {
          await prisma.personnel.create({ data: person });
          console.log(`✅ Personnel created: ${person.name}`);
        }
      }
    }

    // Seed highlights
    if (jsonData.highlights?.length > 0) {
      console.log('⭐ Seeding highlights...');
      for (const highlight of jsonData.highlights) {
        const existing = await prisma.highlight.findUnique({ where: { id: highlight.id } });
        if (!existing) {
          await prisma.highlight.create({ data: highlight });
          console.log(`✅ Highlight created: ${highlight.titleOverride}`);
        }
      }
    }

    // Seed news tags
    if (jsonData.newsTags?.length > 0) {
      console.log('🔗 Seeding news tags...');
      for (const newsTag of jsonData.newsTags) {
        const existing = await prisma.newsTag.findFirst({
          where: { newsId: newsTag.newsId, tagId: newsTag.tagId }
        });
        if (!existing) {
          await prisma.newsTag.create({ data: newsTag });
          console.log(`✅ News tag created: News ${newsTag.newsId} - Tag ${newsTag.tagId}`);
        }
      }
    }

    console.log('\n🎉 JSON data seed completed successfully!');

  } catch (error) {
    console.error('❌ Error during JSON seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  seedFromJson()
    .catch((e) => {
      console.error('❌ Fatal error:', e);
      process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
}

module.exports = { seedFromJson };