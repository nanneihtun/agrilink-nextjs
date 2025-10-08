require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

async function setupOfferSystem() {
  try {
    console.log('🚀 Setting up complete offer system...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-offer-system.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL - split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement.trim());
      }
    }
    
    console.log('✅ Offer system database schema created successfully!');
    console.log('📋 Tables created:');
    console.log('   - offers (with complete status workflow)');
    console.log('   - offer_reviews (for post-transaction reviews)');
    console.log('🔧 Functions created:');
    console.log('   - auto_complete_offers() (auto-complete after 7 days)');
    console.log('   - update_offers_updated_at() (timestamp trigger)');
    console.log('   - set_auto_complete_at() (auto-complete trigger)');
    console.log('📊 Indexes created for performance');
    
    // Test the setup
    const testQuery = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('offers', 'offer_reviews')
      ORDER BY table_name
    `;
    
    console.log('🧪 Test query results:', testQuery);
    
  } catch (error) {
    console.error('❌ Error setting up offer system:', error);
    process.exit(1);
  }
}

setupOfferSystem();
