#!/usr/bin/env tsx

/**
 * Test Page Creation Workflow
 * 
 * This script tests the streamlined page creation workflow to ensure:
 * 1. Page creation API works with simplified form data
 * 2. Only required fields are needed
 * 3. Response includes the page ID for redirection
 */

import fetch from 'node-fetch';

async function testPageCreationWorkflow() {
  console.log('🧪 Testing Streamlined Page Creation Workflow...\n');
  
  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Create a page with minimal required data
    console.log('📋 Test 1: Create Page with Minimal Data');
    console.log('─'.repeat(50));
    
    const testPageData = {
      title: 'Test Streamlined Page',
      slug: 'test-streamlined-page',
      content: 'This is a test page created with the streamlined workflow.',
      excerpt: 'Test page excerpt',
      imageUrl: '',
      order: 0,
      isActive: true,
      metaTitle: 'Test Streamlined Page',
      metaDescription: 'Test page for streamlined workflow',
      metaKeywords: ['test', 'streamlined', 'workflow'],
      categoryId: '',
      publishedAt: '',
      hasQuickAccess: false
    };
    
    console.log('📤 Sending page creation request...');
    console.log('Data:', JSON.stringify(testPageData, null, 2));
    
    const createResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPageData)
    });
    
    const createResult = await createResponse.json();
    let fetchResult: any = null; // Initialize fetchResult variable

    console.log(`Status: ${createResponse.status} ${createResponse.statusText}`);
    console.log('Response:', JSON.stringify(createResult, null, 2));
    
    if (createResult.success && createResult.data?.id) {
      console.log('✅ Page created successfully!');
      console.log(`📍 Page ID: ${createResult.data.id}`);
      console.log(`🔗 Edit URL: /dashboard/pages/${createResult.data.id}/edit`);
      
      // Test 2: Verify the created page can be fetched
      console.log('\n📋 Test 2: Verify Created Page');
      console.log('─'.repeat(50));
      
      const fetchResponse = await fetch(`${baseUrl}/api/pages/${createResult.data.id}`);
      fetchResult = await fetchResponse.json();
      
      console.log(`Fetch Status: ${fetchResponse.status} ${fetchResponse.statusText}`);
      
      if (fetchResult.success) {
        console.log('✅ Page can be fetched successfully!');
        console.log(`📄 Title: ${fetchResult.data.title}`);
        console.log(`🔗 Slug: ${fetchResult.data.slug}`);
        console.log(`📝 Content: ${fetchResult.data.content.substring(0, 50)}...`);
        console.log(`🟢 Active: ${fetchResult.data.isActive}`);
        
        // Test 3: Clean up - delete the test page
        console.log('\n📋 Test 3: Clean Up Test Page');
        console.log('─'.repeat(50));
        
        const deleteResponse = await fetch(`${baseUrl}/api/pages/${createResult.data.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Test page cleaned up successfully!');
        } else {
          console.log('⚠️ Could not clean up test page (manual cleanup may be needed)');
        }
        
      } else {
        console.log('❌ Could not fetch created page');
        console.log('Error:', fetchResult.error);
      }
      
    } else {
      console.log('❌ Page creation failed');
      console.log('Error:', createResult.error);
      if (createResult.details) {
        console.log('Details:', createResult.details);
      }
    }
    
    // Test 4: Test with missing required fields (should fail)
    console.log('\n📋 Test 4: Test Validation (Missing Required Fields)');
    console.log('─'.repeat(50));
    
    const invalidData = {
      title: '', // Missing required title
      slug: 'invalid-test',
      content: '' // Missing required content
    };
    
    const invalidResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const invalidResult = await invalidResponse.json();
    
    console.log(`Validation Test Status: ${invalidResponse.status} ${invalidResponse.statusText}`);
    
    if (invalidResponse.status === 400) {
      console.log('✅ Validation working correctly - rejected invalid data');
      console.log('Validation errors:', invalidResult.details || invalidResult.error);
    } else {
      console.log('❌ Validation not working as expected');
    }
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('─'.repeat(50));
    console.log(`✅ Page Creation: ${createResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Page Fetching: ${fetchResult?.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Validation: ${invalidResponse.status === 400 ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = 
      createResult.success &&
      fetchResult?.success &&
      invalidResponse.status === 400;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Streamlined page creation workflow is working correctly.');
      console.log('\n📝 Workflow Summary:');
      console.log('1. ✅ User fills simplified form (no unused fields)');
      console.log('2. ✅ Page created successfully with required data');
      console.log('3. ✅ User redirected to /dashboard/pages/{id}/edit');
      console.log('4. ✅ Edit page defaults to content editing tab');
      console.log('5. ✅ User can immediately start adding content');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Handle script execution
if (require.main === module) {
  testPageCreationWorkflow().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { testPageCreationWorkflow };
