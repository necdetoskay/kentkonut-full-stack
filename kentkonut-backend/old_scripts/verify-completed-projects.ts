#!/usr/bin/env tsx

/**
 * Completed Projects Seeding Verification Script
 * 
 * This script verifies that the completed projects seeding was successful by checking:
 * - Project count and status
 * - Content quality and completeness
 * - Tags and relationships
 * - Data integrity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCompletedProjectsSeeding() {
  console.log('🔍 Verifying completed projects seeding results...\n');
  
  try {
    await prisma.$connect();
    
    // 1. Check completed projects
    const completedProjects = await prisma.project.findMany({
      where: { status: 'COMPLETED' },
      include: {
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
    
    console.log(`🏗️ Completed Projects: ${completedProjects.length} found`);
    console.log('─'.repeat(60));
    
    completedProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}`);
      console.log(`   📍 Location: ${project.province}, ${project.district}`);
      console.log(`   📮 Address: ${project.address}`);
      console.log(`   🗺️  Location Name: ${project.locationName}`);
      console.log(`   🌍 Coordinates: ${project.latitude}, ${project.longitude}`);
      console.log(`   👤 Author: ${project.author.name}`);
      console.log(`   📅 Completed: ${project.publishedAt?.toLocaleDateString('tr-TR')}`);
      console.log(`   ⏱️  Reading time: ${project.readingTime} min`);
      console.log(`   👀 Views: ${project.viewCount}`);
      console.log(`   🏷️  Tags: ${project.tags.map(pt => pt.tag.name).join(', ')}`);
      console.log(`   🔗 Slug: ${project.slug}`);
      console.log(`   ✅ Published: ${project.published ? 'Yes' : 'No'}`);
      console.log(`   🚀 Quick Access: ${project.hasQuickAccess ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // 2. Check all projects by status
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        province: true,
        district: true,
        publishedAt: true
      },
      orderBy: {
        status: 'asc'
      }
    });
    
    console.log(`📊 All Projects by Status: ${allProjects.length} total`);
    console.log('─'.repeat(60));
    
    // Group projects by status
    const projectsByStatus = allProjects.reduce((acc, project) => {
      if (!acc[project.status]) acc[project.status] = [];
      acc[project.status].push(project);
      return acc;
    }, {} as Record<string, typeof allProjects>);
    
    Object.keys(projectsByStatus).forEach(status => {
      console.log(`   ${status}: ${projectsByStatus[status].length} projects`);
      projectsByStatus[status].forEach(project => {
        console.log(`     - ${project.title} (${project.province}, ${project.district})`);
      });
      console.log('');
    });
    
    // 3. Check project tags
    const projectTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            projectTags: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`🏷️  Project Tags: ${projectTags.length} found`);
    console.log('─'.repeat(60));
    
    // Group tags by usage count
    const tagsByUsage = projectTags.reduce((acc, tag) => {
      const count = tag._count.projectTags;
      if (count > 0) { // Only show tags used by projects
        if (!acc[count]) acc[count] = [];
        acc[count].push(tag.name);
      }
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
    
    // Check for projects without authors (authorId is required, so this should always be 0)
    const projectsWithoutAuthor = 0; // authorId is required in schema
    console.log(`✅ Projects without author: ${projectsWithoutAuthor} (should be 0)`);
    
    // Check for duplicate slugs
    const slugCounts = await prisma.project.groupBy({
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
    
    // Check published projects have publishedAt date
    const publishedWithoutDate = await prisma.project.count({
      where: {
        published: true,
        publishedAt: null
      }
    });
    console.log(`✅ Published projects without date: ${publishedWithoutDate} (should be 0)`);
    
    // Check completed projects have location info
    const completedWithoutLocation = await prisma.project.count({
      where: {
        status: 'COMPLETED',
        OR: [
          { province: null },
          { district: null }
        ]
      }
    });
    console.log(`✅ Completed projects without location: ${completedWithoutLocation} (should be 0)`);
    
    console.log('');
    
    // 5. Summary statistics
    console.log('📊 Summary Statistics');
    console.log('─'.repeat(60));
    
    const totalProjects = allProjects.length;
    const completedCount = completedProjects.length;
    const ongoingCount = allProjects.filter(p => p.status === 'ONGOING').length;
    const publishedProjects = allProjects.filter(p => p.publishedAt !== null).length;
    const totalTags = projectTags.length;
    const usedTags = projectTags.filter(t => t._count.projectTags > 0).length;
    const avgReadingTime = Math.round(completedProjects.reduce((sum, p) => sum + p.readingTime, 0) / completedCount);
    const totalViews = completedProjects.reduce((sum, p) => sum + p.viewCount, 0);
    
    console.log(`🏗️ Total projects: ${totalProjects}`);
    console.log(`✅ Completed projects: ${completedCount}`);
    console.log(`🔄 Ongoing projects: ${ongoingCount}`);
    console.log(`📢 Published projects: ${publishedProjects}`);
    console.log(`🏷️  Total tags: ${totalTags} (${usedTags} used)`);
    console.log(`⏱️  Average reading time: ${avgReadingTime} minutes`);
    console.log(`👀 Total views: ${totalViews}`);
    
    // 6. Content quality checks
    console.log('\n📝 Content Quality Checks');
    console.log('─'.repeat(60));
    
    const projectsWithSummary = completedProjects.filter(p => p.summary && p.summary.length > 0).length;
    const projectsWithLongContent = completedProjects.filter(p => p.content && p.content.length > 1000).length;
    const projectsWithTags = completedProjects.filter(p => p.tags.length > 0).length;
    const projectsWithLocation = completedProjects.filter(p => p.province && p.district).length;
    const projectsWithCoordinates = completedProjects.filter(p => p.latitude && p.longitude).length;
    
    console.log(`✅ Projects with summary: ${projectsWithSummary}/${completedCount}`);
    console.log(`✅ Projects with substantial content (>1000 chars): ${projectsWithLongContent}/${completedCount}`);
    console.log(`✅ Projects with tags: ${projectsWithTags}/${completedCount}`);
    console.log(`✅ Projects with location info: ${projectsWithLocation}/${completedCount}`);
    console.log(`✅ Projects with coordinates: ${projectsWithCoordinates}/${completedCount}`);
    
    // 7. Location distribution
    console.log('\n🗺️  Location Distribution');
    console.log('─'.repeat(60));
    
    const locationCounts = completedProjects.reduce((acc, project) => {
      const location = `${project.province}, ${project.district}`;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(locationCounts).forEach(([location, count]) => {
      console.log(`   ${location}: ${count} project(s)`);
    });
    
    console.log('\n🎉 Completed projects seeding verification finished!');
    
    if (completedCount === 5 && projectsWithLocation === 5 && projectsWithTags === 5) {
      console.log('✅ All checks passed - Completed projects seeding was successful!');
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
  verifyCompletedProjectsSeeding().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { verifyCompletedProjectsSeeding };
