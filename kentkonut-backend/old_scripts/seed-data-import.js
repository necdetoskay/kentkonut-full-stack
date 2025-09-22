const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

async function seedDataFromFiles() {
  console.log('🌱 Starting seed-data import...');

  try {
    // Menu verilerini seed et
    const menuPath = path.join(__dirname, 'prisma', 'seed-data', 'menu.json');
    if (fs.existsSync(menuPath)) {
      const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
      
      for (const menuItem of menuData) {
        const existing = await prisma.menu.findUnique({
          where: { id: menuItem.id }
        });

        if (!existing) {
          await prisma.menu.create({ data: menuItem });
          console.log(`✅ Menu item oluşturuldu: ${menuItem.title}`);
        } else {
          console.log(`⏭️  Menu item zaten var: ${menuItem.title}`);
        }
      }
    }

    // News kategorilerini seed et
    const newsCategoriesPath = path.join(__dirname, 'prisma', 'seed-data', 'news-categories.json');
    if (fs.existsSync(newsCategoriesPath)) {
      const categoriesData = JSON.parse(fs.readFileSync(newsCategoriesPath, 'utf8'));
      
      for (const category of categoriesData) {
        const existing = await prisma.newsCategory.findUnique({
          where: { id: category.id }
        });

        if (!existing) {
          await prisma.newsCategory.create({ data: category });
          console.log(`✅ News category oluşturuldu: ${category.name}`);
        } else {
          console.log(`⏭️  News category zaten var: ${category.name}`);
        }
      }
    }

    // News verilerini seed et
    const newsPath = path.join(__dirname, 'prisma', 'seed-data', 'news.json');
    if (fs.existsSync(newsPath)) {
      const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
      
      for (const newsItem of newsData) {
        const existing = await prisma.news.findUnique({
          where: { slug: newsItem.slug }
        });

        if (!existing) {
          await prisma.news.create({ data: newsItem });
          console.log(`✅ News oluşturuldu: ${newsItem.title}`);
        } else {
          console.log(`⏭️  News zaten var: ${newsItem.title}`);
        }
      }
    }

    // Projects verilerini seed et
    const projectsPath = path.join(__dirname, 'prisma', 'seed-data', 'projects.json');
    if (fs.existsSync(projectsPath)) {
      const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
      
      for (const project of projectsData) {
        const existing = await prisma.project.findUnique({
          where: { slug: project.slug }
        });

        if (!existing) {
          await prisma.project.create({ data: project });
          console.log(`✅ Project oluşturuldu: ${project.title}`);
        } else {
          console.log(`⏭️  Project zaten var: ${project.title}`);
        }
      }
    }

    // Media kategorilerini seed et
    const mediaCategoriesPath = path.join(__dirname, 'prisma', 'seed-data', 'media-categories.json');
    if (fs.existsSync(mediaCategoriesPath)) {
      const mediaCategoriesData = JSON.parse(fs.readFileSync(mediaCategoriesPath, 'utf8'));
      
      for (const category of mediaCategoriesData) {
        const existing = await prisma.mediaCategory.findUnique({
          where: { id: category.id }
        });

        if (!existing) {
          await prisma.mediaCategory.create({ data: category });
          console.log(`✅ Media category oluşturuldu: ${category.name}`);
        } else {
          console.log(`⏭️  Media category zaten var: ${category.name}`);
        }
      }
    }

    // Media verilerini seed et
    const mediaPath = path.join(__dirname, 'prisma', 'seed-data', 'media.json');
    if (fs.existsSync(mediaPath)) {
      const mediaData = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
      
      for (const mediaItem of mediaData) {
        const existing = await prisma.media.findUnique({
          where: { id: mediaItem.id }
        });

        if (!existing) {
          await prisma.media.create({ data: mediaItem });
          console.log(`✅ Media oluşturuldu: ${mediaItem.title}`);
        } else {
          console.log(`⏭️  Media zaten var: ${mediaItem.title}`);
        }
      }
    }

    console.log('🎉 Seed-data import completed successfully!');

  } catch (error) {
    console.error('❌ Error during seed-data import:', error);
    throw error;
  }
}

seedDataFromFiles()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
