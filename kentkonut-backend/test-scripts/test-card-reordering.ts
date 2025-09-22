/**
 * Test script for corporate card reordering functionality
 * Run this to verify the unique constraint fix is working
 */

import { reorderCorporateCards, validateAndFixCardOrdering } from '../utils/card-reordering';
import { db } from '../lib/db';

async function testCardReordering() {
  console.log('🧪 Testing Corporate Card Reordering...\n');

  try {
    // Step 1: Get current cards
    console.log('📋 Step 1: Getting current cards...');
    const cards = await db.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, title: true, displayOrder: true }
    });

    if (cards.length === 0) {
      console.log('❌ No cards found. Please create some cards first.');
      return;
    }

    console.log(`✅ Found ${cards.length} cards:`);
    cards.forEach(card => {
      console.log(`   - ${card.title} (Order: ${card.displayOrder})`);
    });

    // Step 2: Test validation
    console.log('\n🔍 Step 2: Validating current ordering...');
    const validation = await validateAndFixCardOrdering();
    console.log(`✅ Validation result:`, validation);

    // Step 3: Test reordering with reversed order
    console.log('\n🔄 Step 3: Testing reordering (reversing current order)...');
    const cardIds = cards.map(card => card.id);
    const reversedIds = [...cardIds].reverse();

    console.log('Original order:', cardIds);
    console.log('New order:', reversedIds);

    const reorderResult = await reorderCorporateCards(reversedIds);
    
    if (reorderResult.success) {
      console.log('✅ Reordering successful!');
      console.log(`✅ Updated ${reorderResult.updatedCards.length} cards`);
      
      // Show new order
      console.log('\n📋 New card order:');
      reorderResult.updatedCards.forEach(card => {
        console.log(`   - ${card.title} (Order: ${card.displayOrder})`);
      });
    } else {
      console.log('❌ Reordering failed:', reorderResult.error);
      if (reorderResult.details) {
        console.log('Details:', reorderResult.details);
      }
    }

    // Step 4: Test with invalid data
    console.log('\n🚫 Step 4: Testing with invalid data...');
    
    // Test with non-existent ID
    const invalidResult = await reorderCorporateCards([...cardIds, 'invalid-id']);
    if (!invalidResult.success) {
      console.log('✅ Correctly rejected invalid card ID');
    } else {
      console.log('❌ Should have rejected invalid card ID');
    }

    // Test with duplicate IDs
    const duplicateResult = await reorderCorporateCards([cardIds[0], cardIds[0]]);
    if (!duplicateResult.success) {
      console.log('✅ Correctly rejected duplicate card IDs');
    } else {
      console.log('❌ Should have rejected duplicate card IDs');
    }

    // Step 5: Restore original order
    console.log('\n🔄 Step 5: Restoring original order...');
    const restoreResult = await reorderCorporateCards(cardIds);
    
    if (restoreResult.success) {
      console.log('✅ Original order restored successfully!');
    } else {
      console.log('❌ Failed to restore original order:', restoreResult.error);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await db.$disconnect();
  }
}

// Test API endpoint directly
async function testAPIEndpoint() {
  console.log('\n🌐 Testing API Endpoint...\n');

  try {
    // Get cards first
    const cards = await db.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, title: true, displayOrder: true }
    });

    if (cards.length === 0) {
      console.log('❌ No cards found for API test.');
      return;
    }

    const cardIds = cards.map(card => card.id);
    const reversedIds = [...cardIds].reverse();

    // Simulate API call
    const apiUrl = 'http://localhost:3010/api/admin/kurumsal/kartlar/siralama';
    
    console.log(`📡 Making PATCH request to: ${apiUrl}`);
    console.log('📦 Payload:', { cardIds: reversedIds });

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardIds: reversedIds })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ API call successful!');
      console.log('📊 Response:', {
        message: result.message,
        total: result.meta?.total,
        reorderedCount: result.meta?.reorderedCount
      });
    } else {
      console.log('❌ API call failed:');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Corporate Card Reordering Tests\n');
  console.log('=' .repeat(50));
  
  await testCardReordering();
  
  console.log('\n' + '=' .repeat(50));
  
  // Uncomment to test API endpoint (requires server to be running)
  // await testAPIEndpoint();
  
  console.log('\n✨ Test suite completed!');
}

// Export for use in other files
export { testCardReordering, testAPIEndpoint };

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
