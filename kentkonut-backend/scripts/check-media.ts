#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMedia() {
  try {
    await prisma.$connect();
    
    // Check media files
    const mediaFiles = await prisma.media.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📁 Available Media Files:');
    console.log('─'.repeat(60));
    
    if (mediaFiles.length === 0) {
      console.log('No media files found in database');
    } else {
      mediaFiles.forEach((media, index) => {
        console.log(`${index + 1}. ${media.filename}`);
        console.log(`   ID: ${media.id}`);
        console.log(`   URL: ${media.url}`);
        console.log(`   Type: ${media.type}`);
        console.log(`   Size: ${media.size} bytes`);
        console.log('');
      });
    }
    
    // Check projects without media
    const projectsWithoutMedia = await prisma.project.findMany({
      where: {
        mediaId: null
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    console.log(`🏗️ Projects without media: ${projectsWithoutMedia.length}`);
    console.log('─'.repeat(60));
    
    projectsWithoutMedia.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} (${project.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMedia();
