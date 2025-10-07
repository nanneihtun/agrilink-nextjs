const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function removeOfferTables() {
  try {
    console.log('🗑️ Removing offer-related tables from database...');
    
    // Drop offer-related tables if they exist
    const tablesToDrop = [
      'offers',
      'deals', 
      'transactions'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE`;
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️ Table ${table} may not exist:`, error.message);
      }
    }
    
    // Check what tables remain
    const remainingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('\n📋 Remaining tables in database:');
    remainingTables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log('\n✅ Offer tables removal completed!');
    
  } catch (error) {
    console.error('❌ Error removing offer tables:', error);
  }
}

removeOfferTables();
