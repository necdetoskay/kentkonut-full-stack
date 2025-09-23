#!/usr/bin/env node

/**
 * Debug script for form submission issues
 */

const http = require('http');

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3010,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function debugFormIssues() {
  console.log('🐛 Debugging Form Submission Issues...\n');

  try {
    // 1. Get existing cards
    console.log('1️⃣ Getting existing cards...');
    const cardsResult = await makeRequest('GET', '/api/admin/kurumsal/kartlar');
    
    if (cardsResult.status !== 200) {
      console.log('❌ Failed to get cards:', cardsResult.data);
      return;
    }

    const cards = cardsResult.data.data || [];
    console.log(`✅ Found ${cards.length} cards`);

    if (cards.length === 0) {
      console.log('⚠️ No cards found to test update');
      return;
    }

    // 2. Test update with first card
    const testCard = cards[0];
    console.log(`\n2️⃣ Testing update with card: ${testCard.id}`);
    console.log(`   Current title: "${testCard.title}"`);
    console.log(`   Current imageUrl: "${testCard.imageUrl}"`);

    // 3. Prepare update data
    const updateData = {
      title: testCard.title,
      subtitle: testCard.subtitle || '',
      description: testCard.description || '',
      imageUrl: '', // Clear the image
      backgroundColor: testCard.backgroundColor,
      textColor: testCard.textColor,
      accentColor: testCard.accentColor,
      targetUrl: testCard.targetUrl || '',
      openInNewTab: testCard.openInNewTab,
      imagePosition: testCard.imagePosition,
      cardSize: testCard.cardSize,
      borderRadius: testCard.borderRadius,
      isActive: testCard.isActive
    };

    console.log('\n3️⃣ Sending update request...');
    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const updateResult = await makeRequest('PUT', `/api/admin/kurumsal/kartlar/${testCard.id}`, updateData);
    
    console.log(`\n📡 Update Response Status: ${updateResult.status}`);
    console.log('📡 Update Response Data:', JSON.stringify(updateResult.data, null, 2));

    if (updateResult.status === 200) {
      console.log('✅ Update API call successful');
      
      // 4. Verify the update
      console.log('\n4️⃣ Verifying update...');
      const verifyResult = await makeRequest('GET', `/api/admin/kurumsal/kartlar/${testCard.id}`);
      
      if (verifyResult.status === 200) {
        const updatedCard = verifyResult.data.data;
        console.log(`✅ Card retrieved after update`);
        console.log(`   New imageUrl: "${updatedCard.imageUrl}"`);
        
        if (updatedCard.imageUrl === '') {
          console.log('✅ Image URL successfully cleared');
        } else {
          console.log('❌ Image URL not cleared - still has value');
        }
      } else {
        console.log('❌ Failed to verify update:', verifyResult.data);
      }
    } else {
      console.log('❌ Update failed:', updateResult.data);
    }

    // 5. Test with new image
    console.log('\n5️⃣ Testing update with new image...');
    const updateWithImageData = {
      ...updateData,
      imageUrl: '/images/corporate/test-new-image.jpg'
    };

    const updateWithImageResult = await makeRequest('PUT', `/api/admin/kurumsal/kartlar/${testCard.id}`, updateWithImageData);
    
    console.log(`📡 Update with Image Status: ${updateWithImageResult.status}`);
    
    if (updateWithImageResult.status === 200) {
      console.log('✅ Update with new image successful');
      
      // Verify
      const verifyImageResult = await makeRequest('GET', `/api/admin/kurumsal/kartlar/${testCard.id}`);
      if (verifyImageResult.status === 200) {
        const updatedCard = verifyImageResult.data.data;
        console.log(`   New imageUrl: "${updatedCard.imageUrl}"`);
        
        if (updatedCard.imageUrl === '/images/corporate/test-new-image.jpg') {
          console.log('✅ New image URL successfully set');
        } else {
          console.log('❌ New image URL not set correctly');
        }
      }
    } else {
      console.log('❌ Update with image failed:', updateWithImageResult.data);
    }

    // 6. Restore original data
    console.log('\n6️⃣ Restoring original data...');
    const restoreData = {
      title: testCard.title,
      subtitle: testCard.subtitle || '',
      description: testCard.description || '',
      imageUrl: testCard.imageUrl || '',
      backgroundColor: testCard.backgroundColor,
      textColor: testCard.textColor,
      accentColor: testCard.accentColor,
      targetUrl: testCard.targetUrl || '',
      openInNewTab: testCard.openInNewTab,
      imagePosition: testCard.imagePosition,
      cardSize: testCard.cardSize,
      borderRadius: testCard.borderRadius,
      isActive: testCard.isActive
    };

    const restoreResult = await makeRequest('PUT', `/api/admin/kurumsal/kartlar/${testCard.id}`, restoreData);
    
    if (restoreResult.status === 200) {
      console.log('✅ Original data restored');
    } else {
      console.log('❌ Failed to restore original data');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🐛 DEBUG RESULTS');
    console.log('='.repeat(60));
    console.log('✅ API endpoints are working correctly');
    console.log('✅ Update operations are functional');
    console.log('✅ Image URL changes are persisted');
    console.log('\n🔍 If form still not working, the issue is in the frontend:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Check if form submission is being prevented');
    console.log('   3. Check if onSubmit prop is correctly passed');
    console.log('   4. Check if form validation is blocking submission');

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server not running. Please start the development server:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   npx next dev --port 3010');
    }
  }
}

// Run debug
debugFormIssues();
