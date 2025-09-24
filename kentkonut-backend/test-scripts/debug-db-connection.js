
const { Client } = require('pg');

const credentials = [
  { host: '172.41.42.51', port: 5433, password: 'KentKonut2025', user: 'postgres', database: 'kentkonutdb' },
  { host: '172.41.42.51', port: 5433, password: 'P@ssw0rd', user: 'postgres', database: 'kentkonutdb' },
  { host: '172.41.42.51', port: 5432, password: 'KentKonut2025', user: 'postgres', database: 'kentkonutdb' },
  { host: '172.41.42.51', port: 5432, password: 'P@ssw0rd', user: 'postgres', database: 'kentkonutdb' },
];

async function testConnection(config) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log(`\n--- SUCCESS ---\nHost: ${config.host}\nPort: ${config.port}\nPassword: ${config.password}\n`);
    
    // Query project_galleries table
    const galleriesQuery = 'SELECT * FROM project_galleries ORDER BY id;';
    const galleriesResult = await client.query(galleriesQuery);
    console.log('--- project_galleries ---');
    console.table(galleriesResult.rows);

    // Query project_gallery_media table
    const itemsQuery = 'SELECT * FROM project_gallery_media ORDER BY id;';
    const itemsResult = await client.query(itemsQuery);
    console.log('\n--- project_gallery_media ---');
    console.table(itemsResult.rows);

    await client.end();
    return true;
  } catch (error) {
    console.log(`\n--- FAILED ---\nHost: ${config.host}\nPort: ${config.port}\nPassword: ${config.password}\nError: ${error.message}\n`);
    return false;
  }
}

async function main() {
  for (const config of credentials) {
    const success = await testConnection(config);
    if (success) {
      break; // Stop after the first successful connection
    }
  }
}

main();
