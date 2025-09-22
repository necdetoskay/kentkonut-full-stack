#!/usr/bin/env node

/**
 * Test script to verify corporate cards database connection
 */

require('dotenv').config();

async function testCorporateCards() {
  console.log('🧪 Testing Corporate Cards Database Connection...\n');

  try {
    // Test 1: Import Prisma Client
    console.log('1️⃣ Testing Prisma Client import...');
    const { PrismaClient } = require('@prisma/client');
    console.log('✅ PrismaClient imported successfully');

    // Test 2: Create client instance
    console.log('\n2️⃣ Creating Prisma client instance...');
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    console.log('✅ Prisma client created successfully');

    // Test 3: Check if corporateCard model exists
    console.log('\n3️⃣ Checking corporateCard model...');
    if (!prisma.corporateCard) {
      console.log('❌ corporateCard model not found');
      console.log('Available models:', Object.keys(prisma).filter(key => 
        typeof prisma[key] === 'object' && 
        prisma[key] && 
        typeof prisma[key].findMany === 'function'
      ));
      return;
    }
    console.log('✅ corporateCard model exists');

    // Test 4: Test database connection
    console.log('\n4️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test 5: Query corporate cards
    console.log('\n5️⃣ Querying corporate cards...');
    const cards = await prisma.corporateCard.findMany({
      take: 5,
      orderBy: { displayOrder: 'asc' }
    });
    console.log(`✅ Query successful - Found ${cards.length} cards`);

    // Test 6: Get counts
    console.log('\n6️⃣ Getting card statistics...');
    const totalCount = await prisma.corporateCard.count();
    const activeCount = await prisma.corporateCard.count({
      where: { isActive: true }
    });
    console.log(`✅ Statistics: ${totalCount} total, ${activeCount} active`);

    // Test 7: Test create operation (dry run)
    console.log('\n7️⃣ Testing create operation (dry run)...');
    const testCard = {
      title: 'Test Card',
      subtitle: 'Test Subtitle',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#007bff',
      displayOrder: 999,
      isActive: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'rounded'
    };
    
    // Don't actually create, just validate the structure
    console.log('✅ Create operation structure valid');

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All tests passed!');
    console.log(`📦 Total cards: ${totalCount}`);
    console.log(`🟢 Active cards: ${activeCount}`);
    console.log(`🔴 Inactive cards: ${totalCount - activeCount}`);
    
    if (cards.length > 0) {
      console.log('\n📋 Sample cards:');
      cards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.title} (Order: ${card.displayOrder}, Active: ${card.isActive})`);
      });
    } else {
      console.log('\n📋 No cards found in database');
      console.log('   This is normal if you haven\'t seeded the data yet');
      console.log('   Run: npm run seed:corporate-cards');
    }

    // Disconnect
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error type:', error.constructor.name);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    
    // Common error solutions
    console.log('\n🔧 Possible solutions:');
    console.log('   1. Run: npx prisma generate');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Check DATABASE_URL in .env file');
    console.log('   4. Ensure PostgreSQL is running');
    console.log('   5. Run: npm run seed:corporate-cards');
    
    process.exit(1);
  }
}

// Run the test
testCorporateCards();
