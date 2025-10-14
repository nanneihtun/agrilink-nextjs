const { Client } = require('pg');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.supabase' });

async function tryAllConnections() {
  console.log('🔍 Trying all possible Supabase connection formats...');
  
  const connectionStrings = [
    // Direct connection formats
    'postgresql://postgres:Wsxedcrfv!23@db.ljyifqgoocsqlrsjfzrm.supabase.co:5432/postgres',
    'postgresql://postgres:Wsxedcrfv!23@ljyifqgoocsqlrsjfzrm.supabase.co:5432/postgres',
    
    // Pooler connection formats
    'postgresql://postgres.ljyifqgoocsqlrsjfzrm:Wsxedcrfv!23@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.ljyifqgoocsqlrsjfzrm:Wsxedcrfv!23@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.ljyifqgoocsqlrsjfzrm:Wsxedcrfv!23@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
    
    // Alternative formats
    'postgresql://postgres:Wsxedcrfv!23@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres:Wsxedcrfv!23@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const connString = connectionStrings[i];
    console.log(`\n🔗 Trying connection ${i + 1}/${connectionStrings.length}:`);
    console.log(`   ${connString.replace(/:[^:@]*@/, ':****@')}`);
    
    const client = new Client({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    
    try {
      await client.connect();
      console.log('   ✅ SUCCESS! Connected to Supabase!');
      
      // Test a simple query
      const result = await client.query('SELECT version();');
      console.log('   📊 Database version:', result.rows[0].version.split(' ')[0]);
      
      // List tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      console.log('   📋 Existing tables:', tables.rows.map(r => r.table_name));
      
      await client.end();
      
      console.log('\n🎉 Found working connection!');
      console.log('Use this connection string:');
      console.log(connString);
      
      return connString;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
  
  console.log('\n❌ No working connection found.');
  console.log('\nPossible issues:');
  console.log('1. Supabase project might not be fully initialized');
  console.log('2. Database password might be incorrect');
  console.log('3. Project might be paused or deleted');
  console.log('4. Network/DNS issues');
  
  return null;
}

tryAllConnections();
