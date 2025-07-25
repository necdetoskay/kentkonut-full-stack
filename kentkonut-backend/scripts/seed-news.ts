#!/usr/bin/env tsx

/**
 * Standalone News Seeding Script
 * 
 * This script seeds the news module with sample data including:
 * - News categories
 * - 10 sample news articles with realistic Turkish content
 * - Tags and relationships
 * 
 * Usage:
 *   npm run seed:news
 *   or
 *   npx tsx scripts/seed-news.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedNews } from '../prisma/seeds/news';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting news module seeding...\n');
  
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Run news seeding
    await seedNews();
    
    console.log('\n🎉 News seeding completed successfully!');
    console.log('\n📊 Summary:');
    
    // Show summary statistics
    const newsCount = await prisma.news.count();
    const categoriesCount = await prisma.newsCategory.count();
    const tagsCount = await prisma.tag.count();
    
    console.log(`   📰 News articles: ${newsCount}`);
    console.log(`   📂 News categories: ${categoriesCount}`);
    console.log(`   🏷️  Tags: ${tagsCount}`);
    
    // Show sample news
    const sampleNews = await prisma.news.findMany({
      take: 3,
      include: {
        category: true,
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
    
    console.log('\n📋 Sample news articles:');
    sampleNews.forEach((news, index) => {
      console.log(`   ${index + 1}. ${news.title}`);
      console.log(`      Category: ${news.category.name}`);
      console.log(`      Author: ${news.author.name}`);
      console.log(`      Published: ${news.publishedAt?.toLocaleDateString('tr-TR')}`);
      console.log(`      Reading time: ${news.readingTime} min`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error during news seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { main as seedNewsStandalone };
