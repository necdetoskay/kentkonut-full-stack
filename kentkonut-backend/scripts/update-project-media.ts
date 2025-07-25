#!/usr/bin/env tsx

/**
 * Update Existing Projects with Media IDs
 * 
 * This script assigns media IDs to existing projects that don't have images
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProjectMedia() {
  console.log('🖼️ Updating projects with media IDs...\n');
  
  try {
    await prisma.$connect();
    
    // Get projects without media
    const projectsWithoutMedia = await prisma.project.findMany({
      where: {
        mediaId: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${projectsWithoutMedia.length} projects without media`);
    
    if (projectsWithoutMedia.length === 0) {
      console.log('✅ All projects already have media assigned');
      return;
    }
    
    // Get available media files for projects
    const availableMedia = await prisma.media.findMany({
      where: {
        type: 'IMAGE',
        OR: [
          { url: { contains: '/media/projeler/' } },
          { url: { contains: '/banners/' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${availableMedia.length} available media files`);
    
    // Create placeholder media if not enough available
    const neededMedia = Math.max(0, projectsWithoutMedia.length - availableMedia.length);
    if (neededMedia > 0) {
      console.log(`📷 Creating ${neededMedia} placeholder media files...`);
      
      for (let i = 0; i < neededMedia; i++) {
        const placeholderMedia = await prisma.media.create({
          data: {
            filename: `project-placeholder-${Date.now()}-${i + 1}.jpg`,
            originalName: `Project Placeholder ${i + 1}`,
            url: `/media/projeler/project-placeholder-${Date.now()}-${i + 1}.jpg`,
            type: 'IMAGE',
            size: 150000,
            mimeType: 'image/jpeg'
          }
        });
        availableMedia.push(placeholderMedia);
        console.log(`   ✅ Created placeholder: ${placeholderMedia.filename}`);
      }
    }
    
    // Update projects with media IDs
    console.log('\n🔄 Updating projects...');
    for (let i = 0; i < projectsWithoutMedia.length; i++) {
      const project = projectsWithoutMedia[i];
      const mediaId = availableMedia[i % availableMedia.length]?.id;
      
      if (mediaId) {
        await prisma.project.update({
          where: { id: project.id },
          data: { mediaId }
        });
        
        console.log(`   ✅ Updated "${project.title}" with media ID: ${mediaId}`);
      }
    }
    
    // Verify updates
    console.log('\n📊 Verification:');
    const updatedProjectsWithoutMedia = await prisma.project.count({
      where: { mediaId: null }
    });
    
    const totalProjects = await prisma.project.count();
    const projectsWithMedia = totalProjects - updatedProjectsWithoutMedia;
    
    console.log(`   📈 Projects with media: ${projectsWithMedia}/${totalProjects}`);
    console.log(`   📉 Projects without media: ${updatedProjectsWithoutMedia}`);
    
    if (updatedProjectsWithoutMedia === 0) {
      console.log('\n🎉 All projects now have media assigned!');
    } else {
      console.log('\n⚠️ Some projects still need media assignment');
    }
    
  } catch (error) {
    console.error('❌ Error updating project media:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  updateProjectMedia().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { updateProjectMedia };
