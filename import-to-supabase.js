const { Client } = require('pg');
const fs = require('fs');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.supabase' });

async function importDatabase() {
  console.log('🚀 Starting database import to Supabase...');
  
  // Read the dump file
  if (!fs.existsSync('dump.sql')) {
    console.error('❌ dump.sql file not found. Please run the export first.');
    process.exit(1);
  }
  
  const dumpContent = fs.readFileSync('dump.sql', 'utf8');
  console.log('✅ Dump file loaded, size:', dumpContent.length, 'characters');
  
  // Try different connection formats
  const connectionStrings = [
    // Direct connection
    `postgresql://postgres:Wsxedcrfv!23@ljyifqgoocsqlrsjfzrm.supabase.co:5432/postgres?sslmode=require`,
    // Pooler connection
    `postgresql://postgres.ljyifqgoocsqlrsjfzrm:Wsxedcrfv!23@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    // Alternative pooler
    `postgresql://postgres.ljyifqgoocsqlrsjfzrm:Wsxedcrfv!23@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  ];
  
  let client;
  let connected = false;
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const connString = connectionStrings[i];
    console.log(`\n🔗 Trying connection ${i + 1}/${connectionStrings.length}...`);
    console.log(`Connection: ${connString.replace(/:[^:@]*@/, ':****@')}`);
    
    try {
      client = new Client({
        connectionString: connString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      
      await client.connect();
      console.log('✅ Connected successfully!');
      connected = true;
      break;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      if (client) {
        try {
          await client.end();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }
  
  if (!connected) {
    console.error('\n❌ Could not connect to Supabase with any connection format.');
    console.error('Please check your Supabase project settings and connection details.');
    process.exit(1);
  }
  
  try {
    // Execute the dump content
    console.log('\n📥 Importing database...');
    await client.query(dumpContent);
    
    console.log('✅ Database imported successfully!');
    
    // Verify the import
    console.log('\n🔍 Verifying import...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables created:', result.rows.map(r => r.table_name));
    
    // Count rows in key tables
    const keyTables = ['users', 'products', 'conversations', 'offers'];
    for (const table of keyTables) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`📊 ${table}: ${count.rows[0].count} rows`);
      } catch (e) {
        console.log(`⚠️  ${table}: table not found or empty`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env.local DATABASE_URL to point to Supabase');
    console.log('2. Test your application with the new database');
    console.log('3. Update your deployment configuration');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

importDatabase();
