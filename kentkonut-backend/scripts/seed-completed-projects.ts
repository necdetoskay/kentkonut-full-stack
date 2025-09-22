#!/usr/bin/env tsx

/**
 * Standalone Completed Projects Seeding Script
 * 
 * This script seeds the database with 5 sample completed projects including:
 * - Realistic Turkish project names and content
 * - Proper completion dates and metadata
 * - Location information (Turkish cities/districts)
 * - Tags and relationships
 * 
 * Usage:
 *   npm run seed:completed-projects
 *   or
 *   npx tsx scripts/seed-completed-projects.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedCompletedProjects } from '../prisma/seeds/completed-projects';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting completed projects seeding...\n');
  
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Run completed projects seeding
    await seedCompletedProjects();
    
    console.log('\n🎉 Completed projects seeding finished successfully!');
    console.log('\n📊 Summary:');
    
    // Show summary statistics
    const totalProjects = await prisma.project.count();
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' }
    });
    const ongoingProjects = await prisma.project.count({
      where: { status: 'ONGOING' }
    });
    const tagsCount = await prisma.tag.count();
    
    console.log(`   🏗️ Total projects: ${totalProjects}`);
    console.log(`   ✅ Completed projects: ${completedProjects}`);
    console.log(`   🔄 Ongoing projects: ${ongoingProjects}`);
    console.log(`   🏷️  Tags: ${tagsCount}`);
    
    // Show sample completed projects
    const sampleProjects = await prisma.project.findMany({
      where: { status: 'COMPLETED' },
      take: 5,
      include: {
        author: {
          select: {
            name: true
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
    
    console.log('\n📋 Completed projects:');
    sampleProjects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.title}`);
      console.log(`      📍 Location: ${project.province}, ${project.district}`);
      console.log(`      👤 Author: ${project.author.name}`);
      console.log(`      📅 Completed: ${project.publishedAt?.toLocaleDateString('tr-TR')}`);
      console.log(`      ⏱️  Reading time: ${project.readingTime} min`);
      console.log(`      👀 Views: ${project.viewCount}`);
      console.log(`      🏷️  Tags: ${project.tags.map(pt => pt.tag.name).join(', ')}`);
      console.log(`      🔗 Slug: ${project.slug}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error during completed projects seeding:', error);
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

export { main as seedCompletedProjectsStandalone };
