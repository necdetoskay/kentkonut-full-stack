#!/usr/bin/env node

/**
 * Debug script for corporate cards database connection
 */

require('dotenv').config();

async function debugCorporateCards() {
  console.log('🔍 Debugging Corporate Cards Database Connection...\n');

  try {
    // Test 1: Import Prisma client directly
    console.log('1️⃣ Testing Prisma client import...');
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    console.log('✅ db imported successfully');
    console.log('   db type:', typeof db);
    console.log('   db constructor:', db.constructor.name);

    // Test 2: Check if db object has corporateCard
    console.log('\n2️⃣ Checking if db has corporateCard model...');
    console.log('   db.corporateCard exists:', !!db.corporateCard);
    console.log('   db.corporateCard type:', typeof db.corporateCard);
    
    if (!db.corporateCard) {
      console.log('❌ corporateCard model not found on db object');
      console.log('   Available models on db:');
      Object.keys(db).forEach(key => {
        if (typeof db[key] === 'object' && db[key] && typeof db[key].findMany === 'function') {
          console.log(`     - ${key}`);
        }
      });
      return;
    }

    // Test 3: Check if findMany method exists
    console.log('\n3️⃣ Checking corporateCard methods...');
    console.log('   findMany exists:', typeof db.corporateCard.findMany);
    console.log('   findUnique exists:', typeof db.corporateCard.findUnique);
    console.log('   create exists:', typeof db.corporateCard.create);
    console.log('   update exists:', typeof db.corporateCard.update);
    console.log('   delete exists:', typeof db.corporateCard.delete);

    // Test 4: Test database connection
    console.log('\n4️⃣ Testing database connection...');
    await db.$connect();
    console.log('✅ Database connection successful');

    // Test 5: Test corporateCard query
    console.log('\n5️⃣ Testing corporateCard.findMany()...');
    const cards = await db.corporateCard.findMany({
      take: 3,
      orderBy: { displayOrder: 'asc' }
    });
    console.log(`✅ Query successful - Found ${cards.length} cards`);
    
    if (cards.length > 0) {
      console.log('   Sample card:');
      console.log(`     ID: ${cards[0].id}`);
      console.log(`     Title: ${cards[0].title}`);
      console.log(`     Display Order: ${cards[0].displayOrder}`);
      console.log(`     Active: ${cards[0].isActive}`);
    }

    // Test 6: Test the exact query from the API
    console.log('\n6️⃣ Testing exact API query...');
    const apiQuery = await db.corporateCard.findMany({
      where: {},
      orderBy: { displayOrder: 'asc' }
    });
    console.log(`✅ API query successful - Found ${apiQuery.length} cards`);

    // Test 7: Check Prisma client version
    console.log('\n7️⃣ Checking Prisma client info...');
    console.log('   Prisma client version:', require('@prisma/client').Prisma.prismaVersion);

    await db.$disconnect();
    console.log('\n✅ All tests passed! Database connection is working.');

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    console.error('Error type:', error.constructor.name);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    console.error('Stack trace:', error.stack);
    
    // Specific error analysis
    if (error.message.includes('Cannot read properties of undefined')) {
      console.log('\n🔧 Analysis: The db object or corporateCard model is undefined');
      console.log('   Possible causes:');
      console.log('   1. Prisma client not generated properly');
      console.log('   2. Model name mismatch in schema vs. client');
      console.log('   3. Import path issue');
      console.log('   4. Environment variable issue');
    }
    
    process.exit(1);
  }
}

// Run the debug
debugCorporateCards();
