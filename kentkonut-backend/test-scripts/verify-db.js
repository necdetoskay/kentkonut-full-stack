// Simple script to verify database connection
const { Client } = require('pg');

async function main() {
  console.log('Attempting to connect to the database...');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'P@ssw0rd',
    database: 'kentkonutdb'
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    // Check if the database has tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    if (tablesResult.rows.length > 0) {
      console.log('Database tables:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('No tables found in the database.');
    }
    
    await client.end();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

main();
