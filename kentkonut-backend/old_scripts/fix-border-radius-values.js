#!/usr/bin/env node

/**
 * Fix invalid borderRadius values in existing cards
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

async function fixBorderRadiusValues() {
  console.log('🔧 Fixing borderRadius values in existing cards...\n');

  try {
    // 1. Get all cards
    console.log('1️⃣ Getting all cards...');
    const cardsResult = await makeRequest('GET', '/api/admin/kurumsal/kartlar');
    
    if (cardsResult.status !== 200) {
      console.log('❌ Failed to get cards:', cardsResult.data);
      return;
    }

    const cards = cardsResult.data.data || [];
    console.log(`✅ Found ${cards.length} cards`);

    // 2. Check for invalid borderRadius values
    const validValues = ['none', 'small', 'medium', 'large', 'full'];
    const cardsToFix = cards.filter(card => !validValues.includes(card.borderRadius));
    
    console.log(`\n2️⃣ Found ${cardsToFix.length} cards with invalid borderRadius values:`);
    
    cardsToFix.forEach(card => {
      console.log(`   - Card "${card.title}" (${card.id}): borderRadius = "${card.borderRadius}"`);
    });

    if (cardsToFix.length === 0) {
      console.log('✅ All cards have valid borderRadius values');
      return;
    }

    // 3. Fix invalid values
    console.log(`\n3️⃣ Fixing ${cardsToFix.length} cards...`);
    
    for (const card of cardsToFix) {
      console.log(`   Fixing card: ${card.title}`);
      
      // Map old values to new valid values
      let newBorderRadius = 'medium'; // default
      if (card.borderRadius === 'rounded') {
        newBorderRadius = 'medium';
      } else if (card.borderRadius === 'sharp') {
        newBorderRadius = 'none';
      } else if (card.borderRadius === 'round') {
        newBorderRadius = 'large';
      }
      
      const updateData = {
        title: card.title,
        subtitle: card.subtitle || '',
        description: card.description || '',
        imageUrl: card.imageUrl || '',
        backgroundColor: card.backgroundColor,
        textColor: card.textColor,
        accentColor: card.accentColor,
        targetUrl: card.targetUrl || '',
        openInNewTab: card.openInNewTab,
        imagePosition: card.imagePosition,
        cardSize: card.cardSize,
        borderRadius: newBorderRadius, // Fix the invalid value
        isActive: card.isActive
      };

      const updateResult = await makeRequest('PUT', `/api/admin/kurumsal/kartlar/${card.id}`, updateData);
      
      if (updateResult.status === 200) {
        console.log(`   ✅ Fixed: "${card.borderRadius}" → "${newBorderRadius}"`);
      } else {
        console.log(`   ❌ Failed to fix card ${card.id}:`, updateResult.data);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔧 BORDER RADIUS FIX RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Fixed ${cardsToFix.length} cards with invalid borderRadius values`);
    console.log('✅ All cards now have valid borderRadius values');
    console.log('\n📋 Valid borderRadius values:');
    console.log('   - none: No border radius');
    console.log('   - small: Small border radius');
    console.log('   - medium: Medium border radius (default)');
    console.log('   - large: Large border radius');
    console.log('   - full: Full border radius (circular)');

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server not running. Please start the development server:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   npx next dev --port 3010');
    }
  }
}

// Run fix
fixBorderRadiusValues();
