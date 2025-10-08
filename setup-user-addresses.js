require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

async function setupUserAddresses() {
  try {
    console.log('🏠 Setting up user addresses system...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-user-addresses.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL - split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement.trim());
      }
    }
    
    console.log('✅ User addresses system created successfully!');
    console.log('📋 Tables created:');
    console.log('   - user_addresses (with multiple addresses per user)');
    console.log('🔧 Functions created:');
    console.log('   - ensure_single_default_address() (only one default per user)');
    console.log('   - update_user_addresses_updated_at() (timestamp trigger)');
    console.log('📊 Indexes created for performance');
    
    // Test the setup
    const testQuery = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_addresses'
    `;
    
    console.log('🧪 Test query results:', testQuery);
    
  } catch (error) {
    console.error('❌ Error setting up user addresses:', error);
    process.exit(1);
  }
}

setupUserAddresses();
