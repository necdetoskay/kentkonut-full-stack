// Database verification script
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  console.log('Verifying database connection and schema...');
  
  // Get connection string from environment or use default
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:P@ssw0rd@localhost:5432/kentkonutdb';
  console.log('Using connection string:', connectionString.replace(/:[^:]*@/, ':****@')); // Hide password in logs
  
  const client = new Client({ connectionString });
  
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
      
      // Check users table structure
      const usersStructureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `;
      
      const usersStructureResult = await client.query(usersStructureQuery);
      
      if (usersStructureResult.rows.length > 0) {
        console.log('\nUsers table structure:');
        usersStructureResult.rows.forEach(row => {
          console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
        });
      } else {
        console.log('No structure found for users table.');
      }
    } else {
      console.log('No tables found in the database.');
    }
    
    await client.end();
    console.log('Database verification completed.');
  } catch (error) {
    console.error('Error during database verification:', error);
    if (client) {
      await client.end().catch(err => console.error('Error closing client:', err));
    }
    process.exit(1);
  }
}

main();
