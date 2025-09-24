const { loadSeedDataFromFile } = require('./prisma/consolidated-seed');

async function restoreSeedData() {
  try {
    const filename = process.argv[2];
    
    if (!filename) {
      console.log('❌ Please provide backup filename');
      console.log('Usage: node restore-seed.js <backup-filename>');
      console.log('Available backups:');
      
      const fs = require('fs');
      const path = require('path');
      const backupsDir = path.join(__dirname, 'backups');
      
      if (fs.existsSync(backupsDir)) {
        const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));
        files.forEach(file => console.log(`  - ${file}`));
      }
      
      process.exit(1);
    }

    console.log(`🔄 Restoring seed data from: ${filename}`);
    await loadSeedDataFromFile(filename);
    console.log('✅ Seed data restore completed!');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  }
}

restoreSeedData();
