#!/usr/bin/env tsx

/**
 * Test Projects API Response
 * 
 * This script tests the projects API to verify media data is included
 */

import fetch from 'node-fetch';

async function testProjectsAPI() {
  console.log('🧪 Testing Projects API...\n');
  
  try {
    const response = await fetch('http://localhost:3010/api/projects?status=COMPLETED&limit=5');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📊 API Response Structure:');
    console.log('─'.repeat(60));
    console.log(`Status: ${response.status}`);
    console.log(`Projects count: ${data.projects?.length || 0}`);
    console.log('');
    
    if (data.projects && data.projects.length > 0) {
      console.log('📋 Sample Project Data:');
      console.log('─'.repeat(60));
      
      const sampleProject = data.projects[0];
      console.log(`Title: ${sampleProject.title}`);
      console.log(`ID: ${sampleProject.id}`);
      console.log(`Status: ${sampleProject.status}`);
      console.log(`Province: ${sampleProject.province}`);
      console.log(`District: ${sampleProject.district}`);
      console.log(`Media ID: ${sampleProject.mediaId}`);
      console.log(`Media Object:`, sampleProject.media ? {
        id: sampleProject.media.id,
        filename: sampleProject.media.filename,
        url: sampleProject.media.url,
        type: sampleProject.media.type
      } : 'null');
      console.log('');
      
      console.log('🖼️ All Projects Media Status:');
      console.log('─'.repeat(60));
      
      data.projects.forEach((project: any, index: number) => {
        const hasMedia = !!project.media;
        const mediaUrl = project.media?.url || 'No URL';
        console.log(`${index + 1}. ${project.title}`);
        console.log(`   Media: ${hasMedia ? '✅' : '❌'} ${hasMedia ? mediaUrl : 'No media'}`);
      });
      
    } else {
      console.log('⚠️ No projects found in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Handle script execution
if (require.main === module) {
  testProjectsAPI().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { testProjectsAPI };
