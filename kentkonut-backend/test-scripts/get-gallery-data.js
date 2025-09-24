// Simple script to verify database connection
const { Client } = require('pg');

async function main() {
  console.log('Attempting to connect to the database...');
  
  const client = new Client({
    host: '172.41.42.51',
    port: 5433,
    user: 'postgres',
    password: 'P@ssw0rd',
    database: 'kentkonutdb'
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    // Query project_galleries table
    const galleriesQuery = 'SELECT * FROM project_galleries ORDER BY id;';
    const galleriesResult = await client.query(galleriesQuery);
    console.log('\n--- project_galleries ---');
    console.table(galleriesResult.rows);

    // Query project_gallery_items table
    const itemsQuery = 'SELECT * FROM project_gallery_items ORDER BY id;';
    const itemsResult = await client.query(itemsQuery);
    console.log('\n--- project_gallery_items ---');
    console.table(itemsResult.rows);
    
    await client.end();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

main();
