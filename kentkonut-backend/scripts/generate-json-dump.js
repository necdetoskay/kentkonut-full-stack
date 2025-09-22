const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const OUTPUT_PATH = path.join(__dirname, '../prisma/seed-data.json');

const modelNames = [
    'user', 'hafriyatBolge', 'hafriyatSaha', 'hafriyatBelgeKategori',
    'newsCategory', 'news', 'project', 'department', 'executive', 'personnel', 'menuItem', 'highlight'
];

async function dumpDataToJson() {
    console.log('🚀 Starting database dump to JSON...');
    const allData = {};

    for (const modelName of modelNames) {
        console.log(`🔍 Fetching data for ${modelName}...`);
        const records = await prisma[modelName].findMany();
        allData[modelName] = records;
        console.log(`- Found ${records.length} records for ${modelName}.`);
    }

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allData, null, 2));
    console.log(`\n✅ Successfully dumped database state to: ${OUTPUT_PATH}`);
}

dumpDataToJson()
    .catch((e) => {
        console.error('❌ Fatal error during JSON dump:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
