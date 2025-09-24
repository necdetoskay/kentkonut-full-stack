const { saveSeedDataToFile } = require('./prisma/consolidated-seed');

async function backupSeedData() {
  try {
    console.log('🔄 Starting seed data backup...');
    const filePath = await saveSeedDataToFile();
    console.log(`✅ Seed data backup completed: ${filePath}`);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupSeedData();
