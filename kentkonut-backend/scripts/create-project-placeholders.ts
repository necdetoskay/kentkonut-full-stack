#!/usr/bin/env tsx

/**
 * Create Project Placeholder Images
 * 
 * This script creates placeholder images for projects and copies existing images
 * to ensure all projects have proper images
 */

import { PrismaClient } from '@prisma/client';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function createProjectPlaceholders() {
  console.log('🖼️ Creating project placeholder images...\n');
  
  try {
    await prisma.$connect();
    
    // Ensure directories exist
    const projectsDir = path.join(process.cwd(), 'public', 'media', 'projeler');
    const bannersDir = path.join(process.cwd(), 'public', 'banners');
    
    if (!existsSync(projectsDir)) {
      await mkdir(projectsDir, { recursive: true });
      console.log('✅ Created projeler directory');
    }
    
    if (!existsSync(bannersDir)) {
      await mkdir(bannersDir, { recursive: true });
      console.log('✅ Created banners directory');
    }
    
    // Get projects without working images
    const projects = await prisma.project.findMany({
      where: { status: 'COMPLETED' },
      include: { media: true }
    });
    
    console.log(`Found ${projects.length} completed projects`);
    
    // Check which images exist and which need placeholders
    for (const project of projects) {
      if (project.media) {
        const imagePath = path.join(process.cwd(), 'public', project.media.url);
        const imageExists = existsSync(imagePath);
        
        console.log(`📋 ${project.title}:`);
        console.log(`   Media URL: ${project.media.url}`);
        console.log(`   File exists: ${imageExists ? '✅' : '❌'}`);
        
        if (!imageExists) {
          // Try to find a similar image to copy
          const sourceImages = [
            path.join(process.cwd(), 'public', 'images', 'projelerimiz.png'),
            path.join(process.cwd(), 'public', 'images', 'kent-konut-bina.jpg'),
            path.join(process.cwd(), 'public', 'images', 'proje_header_02032021191233.jpg')
          ];
          
          let sourceCopied = false;
          for (const sourceImage of sourceImages) {
            if (existsSync(sourceImage)) {
              try {
                await copyFile(sourceImage, imagePath);
                console.log(`   ✅ Copied placeholder from ${path.basename(sourceImage)}`);
                sourceCopied = true;
                break;
              } catch (error) {
                console.log(`   ⚠️ Failed to copy ${path.basename(sourceImage)}: ${error}`);
              }
            }
          }
          
          if (!sourceCopied) {
            console.log(`   ❌ No suitable placeholder found for ${project.title}`);
          }
        }
        console.log('');
      } else {
        console.log(`📋 ${project.title}: No media assigned`);
      }
    }
    
    // Create a simple HTML file to test all project images
    const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Project Images Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .project { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        img { max-width: 300px; height: 200px; object-fit: cover; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Project Images Test</h1>
    ${projects.map(project => `
    <div class="project">
        <h3>${project.title}</h3>
        <p>Status: ${project.status}</p>
        <p>Media URL: ${project.media?.url || 'No media'}</p>
        ${project.media ? `
        <img src="${project.media.url}" alt="${project.title}" 
             onload="this.nextElementSibling.textContent = '✅ Loaded'"
             onerror="this.nextElementSibling.textContent = '❌ Failed'">
        <p>Loading status...</p>
        ` : '<p>No image</p>'}
    </div>
    `).join('')}
</body>
</html>`;
    
    const testPath = path.join(process.cwd(), 'public', 'test-project-images.html');
    await require('fs/promises').writeFile(testPath, testHtml);
    console.log(`✅ Created test file: ${testPath}`);
    console.log('   Access at: http://localhost:3010/test-project-images.html');
    
  } catch (error) {
    console.error('❌ Error creating placeholders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  createProjectPlaceholders().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { createProjectPlaceholders };
