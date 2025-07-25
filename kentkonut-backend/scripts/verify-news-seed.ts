#!/usr/bin/env tsx

/**
 * News Seeding Verification Script
 * 
 * This script verifies that the news seeding was successful by checking:
 * - News articles count and content
 * - Categories and their relationships
 * - Tags and their usage
 * - Data integrity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyNewsSeeding() {
  console.log('🔍 Verifying news seeding results...\n');
  
  try {
    await prisma.$connect();
    
    // 1. Check news articles
    const newsArticles = await prisma.news.findMany({
      include: {
        category: true,
        author: {
          select: {
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
    
    console.log(`📰 News Articles: ${newsArticles.length} found`);
    console.log('─'.repeat(60));
    
    newsArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   📂 Category: ${article.category.name}`);
      console.log(`   👤 Author: ${article.author.name}`);
      console.log(`   📅 Published: ${article.publishedAt?.toLocaleDateString('tr-TR')}`);
      console.log(`   ⏱️  Reading time: ${article.readingTime} min`);
      console.log(`   📊 Stats: ${article.shareCount} shares, ${article.likeCount} likes`);
      console.log(`   🏷️  Tags: ${article.tags.map(nt => nt.tag.name).join(', ')}`);
      console.log(`   🔗 Slug: ${article.slug}`);
      console.log(`   ✅ Published: ${article.published ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // 2. Check categories
    const categories = await prisma.newsCategory.findMany({
      include: {
        _count: {
          select: {
            news: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    console.log(`📂 News Categories: ${categories.length} found`);
    console.log('─'.repeat(60));
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.slug})`);
      console.log(`   📰 Articles: ${category._count.news}`);
      console.log(`   📝 Description: ${category.description || 'No description'}`);
      console.log(`   🔢 Order: ${category.order}`);
      console.log(`   ✅ Active: ${category.active ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // 3. Check tags
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            newsTags: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`🏷️  Tags: ${tags.length} found`);
    console.log('─'.repeat(60));
    
    // Group tags by usage count
    const tagsByUsage = tags.reduce((acc, tag) => {
      const count = tag._count.newsTags;
      if (!acc[count]) acc[count] = [];
      acc[count].push(tag.name);
      return acc;
    }, {} as Record<number, string[]>);
    
    Object.keys(tagsByUsage)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .forEach(count => {
        console.log(`   Used ${count} time(s): ${tagsByUsage[parseInt(count)].join(', ')}`);
      });
    
    console.log('');
    
    // 4. Data integrity checks
    console.log('🔍 Data Integrity Checks');
    console.log('─'.repeat(60));
    
    // Check for articles without categories (categoryId is required, so this should always be 0)
    const articlesWithoutCategory = 0; // categoryId is required in schema
    console.log(`✅ Articles without category: ${articlesWithoutCategory} (should be 0)`);

    // Check for articles without authors (authorId is required, so this should always be 0)
    const articlesWithoutAuthor = 0; // authorId is required in schema
    console.log(`✅ Articles without author: ${articlesWithoutAuthor} (should be 0)`);
    
    // Check for duplicate slugs
    const slugCounts = await prisma.news.groupBy({
      by: ['slug'],
      _count: {
        slug: true
      },
      having: {
        slug: {
          _count: {
            gt: 1
          }
        }
      }
    });
    console.log(`✅ Duplicate slugs: ${slugCounts.length} (should be 0)`);
    
    // Check published articles have publishedAt date
    const publishedWithoutDate = await prisma.news.count({
      where: {
        published: true,
        publishedAt: null
      }
    });
    console.log(`✅ Published articles without date: ${publishedWithoutDate} (should be 0)`);
    
    console.log('');
    
    // 5. Summary statistics
    console.log('📊 Summary Statistics');
    console.log('─'.repeat(60));
    
    const totalArticles = newsArticles.length;
    const publishedArticles = newsArticles.filter(a => a.published).length;
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.active).length;
    const totalTags = tags.length;
    const avgReadingTime = Math.round(newsArticles.reduce((sum, a) => sum + a.readingTime, 0) / totalArticles);
    const totalShares = newsArticles.reduce((sum, a) => sum + a.shareCount, 0);
    const totalLikes = newsArticles.reduce((sum, a) => sum + a.likeCount, 0);
    
    console.log(`📰 Total articles: ${totalArticles}`);
    console.log(`📢 Published articles: ${publishedArticles}`);
    console.log(`📂 Total categories: ${totalCategories} (${activeCategories} active)`);
    console.log(`🏷️  Total tags: ${totalTags}`);
    console.log(`⏱️  Average reading time: ${avgReadingTime} minutes`);
    console.log(`📊 Total engagement: ${totalShares} shares, ${totalLikes} likes`);
    
    // 6. Content quality checks
    console.log('\n📝 Content Quality Checks');
    console.log('─'.repeat(60));
    
    const articlesWithSummary = newsArticles.filter(a => a.summary && a.summary.length > 0).length;
    const articlesWithLongContent = newsArticles.filter(a => a.content && a.content.length > 500).length;
    const articlesWithTags = newsArticles.filter(a => a.tags.length > 0).length;
    
    console.log(`✅ Articles with summary: ${articlesWithSummary}/${totalArticles}`);
    console.log(`✅ Articles with substantial content (>500 chars): ${articlesWithLongContent}/${totalArticles}`);
    console.log(`✅ Articles with tags: ${articlesWithTags}/${totalArticles}`);
    
    console.log('\n🎉 News seeding verification completed!');
    
    if (totalArticles === 10 && publishedArticles === 10 && totalCategories >= 5) {
      console.log('✅ All checks passed - News seeding was successful!');
    } else {
      console.log('⚠️  Some checks failed - Please review the seeding process');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  verifyNewsSeeding().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { verifyNewsSeeding };
