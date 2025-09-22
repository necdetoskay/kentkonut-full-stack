#!/usr/bin/env tsx

/**
 * Standalone Corporate Cards Seeding Script
 * 
 * This script seeds the corporate module with dynamic card management including:
 * - Corporate page configuration
 * - 5 initial corporate cards (BAŞKANIMIZ, GENEL MÜDÜR, BİRİMLERİMİZ, STRATEJİMİZ, HEDEFİMİZ)
 * - Proper display order for drag & drop functionality
 * - Flexible customData structure for future enhancements
 * 
 * Usage:
 *   npm run seed:corporate-cards
 *   or
 *   npx tsx scripts/seed-corporate-cards.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedCorporateModule } from '../prisma/seeds/corporate-cards';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting corporate cards module seeding...\n');

  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Check if tables exist
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('corporate_cards', 'corporate_pages')
    `;
    
    console.log('📊 Database tables check:', tableCheck);

    // Run the seeding
    const result = await seedCorporateModule();

    console.log('\n🎉 Corporate cards seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   📄 Corporate page: ${result.page.title}`);
    console.log(`   🃏 Corporate cards: ${result.cards.length} cards created`);
    console.log('\n📋 Created cards:');
    
    result.cards.forEach((card, index) => {
      console.log(`   ${index + 1}. ${card.title}${card.subtitle ? ` - ${card.subtitle}` : ''}`);
      console.log(`      Order: ${card.displayOrder}, Active: ${card.isActive}`);
      console.log(`      Target: ${card.targetUrl || 'No URL'}`);
    });

    console.log('\n✅ You can now:');
    console.log('   1. Access admin panel at /dashboard/kurumsal');
    console.log('   2. Test drag & drop sorting functionality');
    console.log('   3. Add new cards or modify existing ones');
    console.log('   4. View the corporate page at /kurumsal');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    
    if (error.code === 'P2002') {
      console.error('💡 Hint: This might be a unique constraint violation.');
      console.error('   Try clearing existing data first or check for duplicate displayOrder values.');
    } else if (error.code === 'P2021') {
      console.error('💡 Hint: The table does not exist.');
      console.error('   Run: npx prisma db push');
    } else {
      console.error('💡 Full error details:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the main function
main().catch(async (error) => {
  console.error('❌ Unexpected error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
