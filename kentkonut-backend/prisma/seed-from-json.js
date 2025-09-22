const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const INPUT_PATH = path.join(__dirname, './seed-data.json');

// Define unique keys for upsert. This is crucial for avoiding duplicate entries.
const uniqueKeys = {
    user: 'id',
    hafriyatBolge: 'id',
    hafriyatSaha: 'id',
    hafriyatBelgeKategori: 'ad',
    newsCategory: 'slug',
    news: 'slug',
    project: 'slug',
    department: 'slug',
    executive: 'slug',
    personnel: 'slug',
    menuItem: 'id',
    highlight: 'id',
};

// Define the order to prevent foreign key constraint errors during seeding.
// Example: 'user' must exist before 'project' if projects have an author.
const seedOrder = [
    'user', 
    'hafriyatBolge',
    'hafriyatBelgeKategori',
    'newsCategory',
    'department',
    'executive',
        'personnel', 
        'menuItem', 
        'highlight', 
        'project',     'news',
    'hafriyatSaha'
];

// JSON.parse reviver function to convert ISO date strings back to Date objects.
function reviveDates(key, value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
        return new Date(value);
    }
    return value;
}

async function loadDataFromJson() {
    console.log(`🌱 Reading data from ${INPUT_PATH}...`);
    try {
        const fileContent = await fs.readFile(INPUT_PATH, 'utf-8');
        const allData = JSON.parse(fileContent, reviveDates);
        console.log('🌱 Data parsed successfully. Starting to seed database...');

        for (const modelName of seedOrder) {
            const records = allData[modelName];
            const uniqueKey = uniqueKeys[modelName];

            if (!records || records.length === 0) {
                console.log(`- No data for ${modelName}, skipping.`);
                continue;
            }

            if (!uniqueKey) {
                console.warn(`⚠️ No unique key defined for ${modelName}. Skipping upsert to prevent errors.`);
                continue;
            }

            console.log(`🔄 Seeding ${records.length} records for ${modelName}...`);

            for (const record of records) {
                await prisma[modelName].upsert({
                    where: { [uniqueKey]: record[uniqueKey] },
                    update: record,
                    create: record,
                });
            }
            console.log(`✅ ${modelName} seeding completed.`);
        }

        console.log('\n🎉 Database seeding from JSON completed successfully!');

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`❌ Error: The data file was not found at ${INPUT_PATH}`);
            console.error('Please run "node scripts/generate-json-dump.js" first to create the data file.');
        } else {
            console.error('❌ An error occurred during the seeding process:', error);
        }
        process.exit(1);
    }
}

loadDataFromJson()
    .finally(async () => {
        await prisma.$disconnect();
    });
