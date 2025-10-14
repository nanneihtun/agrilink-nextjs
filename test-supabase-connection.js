const { Client } = require('pg');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.supabase' });

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('Connection string:', process.env.SUPABASE_DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Test a simple query
    const result = await client.query('SELECT version();');
    console.log('✅ Database version:', result.rows[0].version);
    
    // List tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Existing tables:', tables.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

testConnection();
