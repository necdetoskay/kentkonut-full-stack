#!/usr/bin/env tsx

/**
 * Corporate Cards Verification Script
 * 
 * This script verifies that the corporate cards seeding was successful by:
 * - Checking database connection
 * - Verifying corporate page exists
 * - Verifying all 5 corporate cards exist with correct order
 * - Testing the displayOrder uniqueness constraint
 * - Validating the data structure
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCorporateCards() {
  console.log('🔍 Verifying corporate cards seeding...\n');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Verify corporate page
    console.log('\n📄 Checking corporate page...');
    const corporatePage = await prisma.corporatePage.findUnique({
      where: { slug: 'kurumsal' }
    });

    if (corporatePage) {
      console.log('✅ Corporate page found:');
      console.log(`   Title: ${corporatePage.title}`);
      console.log(`   Meta Title: ${corporatePage.metaTitle}`);
      console.log(`   Active: ${corporatePage.isActive}`);
      console.log(`   Breadcrumb: ${corporatePage.showBreadcrumb}`);
    } else {
      console.log('❌ Corporate page not found');
      return false;
    }

    // Verify corporate cards
    console.log('\n🃏 Checking corporate cards...');
    const cards = await prisma.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    console.log(`✅ Found ${cards.length} corporate cards`);

    if (cards.length === 0) {
      console.log('❌ No corporate cards found');
      return false;
    }

    // Verify expected cards
    const expectedCards = [
      'BAŞKANIMIZ',
      'GENEL MÜDÜR', 
      'BİRİMLERİMİZ',
      'STRATEJİMİZ',
      'HEDEFİMİZ'
    ];

    console.log('\n📋 Card details:');
    let allCardsValid = true;

    cards.forEach((card, index) => {
      const isExpected = expectedCards.includes(card.title);
      const orderCorrect = card.displayOrder === index + 1;
      
      console.log(`   ${index + 1}. ${card.title}`);
      console.log(`      Subtitle: ${card.subtitle || 'None'}`);
      console.log(`      Display Order: ${card.displayOrder} ${orderCorrect ? '✅' : '❌'}`);
      console.log(`      Active: ${card.isActive ? '✅' : '❌'}`);
      console.log(`      Target URL: ${card.targetUrl || 'None'}`);
      console.log(`      Background: ${card.backgroundColor}`);
      console.log(`      Expected: ${isExpected ? '✅' : '❌'}`);
      
      if (card.customData) {
        console.log(`      Custom Data: ${JSON.stringify(card.customData)}`);
      }
      
      console.log('');

      if (!isExpected || !orderCorrect) {
        allCardsValid = false;
      }
    });

    // Test displayOrder uniqueness
    console.log('🔍 Testing displayOrder uniqueness...');
    const orderCounts = cards.reduce((acc, card) => {
      acc[card.displayOrder] = (acc[card.displayOrder] || 0) + 1;
      return acc;
    }, {});

    const duplicateOrders = Object.entries(orderCounts).filter(([order, count]) => count > 1);
    
    if (duplicateOrders.length > 0) {
      console.log('❌ Duplicate displayOrder values found:', duplicateOrders);
      allCardsValid = false;
    } else {
      console.log('✅ All displayOrder values are unique');
    }

    // Test sorting functionality
    console.log('\n🔄 Testing sorting functionality...');
    const sortedCards = await prisma.corporateCard.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });

    console.log('✅ Active cards in display order:');
    sortedCards.forEach((card, index) => {
      console.log(`   ${card.displayOrder}. ${card.title}`);
    });

    // Verify data structure
    console.log('\n🏗️ Verifying data structure...');
    const sampleCard = cards[0];
    const requiredFields = [
      'id', 'title', 'displayOrder', 'isActive', 'backgroundColor', 
      'textColor', 'accentColor', 'imagePosition', 'cardSize', 'borderRadius'
    ];

    const missingFields = requiredFields.filter(field => !(field in sampleCard));
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      allCardsValid = false;
    } else {
      console.log('✅ All required fields present');
    }

    // Summary
    console.log('\n📊 Verification Summary:');
    console.log(`   Corporate Page: ${corporatePage ? '✅' : '❌'}`);
    console.log(`   Corporate Cards: ${cards.length}/5 ${cards.length === 5 ? '✅' : '❌'}`);
    console.log(`   Data Structure: ${allCardsValid ? '✅' : '❌'}`);
    console.log(`   Sorting Ready: ${allCardsValid ? '✅' : '❌'}`);

    if (allCardsValid && corporatePage && cards.length === 5) {
      console.log('\n🎉 All verifications passed! Corporate cards are ready for use.');
      console.log('\n📋 Next steps:');
      console.log('   1. Implement admin interface at /dashboard/kurumsal');
      console.log('   2. Add drag & drop sorting functionality');
      console.log('   3. Create frontend display at /kurumsal');
      console.log('   4. Test CRUD operations');
      return true;
    } else {
      console.log('\n❌ Some verifications failed. Please check the issues above.');
      return false;
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyCorporateCards()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
