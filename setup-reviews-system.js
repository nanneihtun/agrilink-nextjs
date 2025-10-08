const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupReviewsSystem() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🚀 Setting up reviews system...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-reviews-system.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await sql.unsafe(sqlContent);
    
    console.log('✅ Reviews system setup completed successfully!');
    console.log('📋 Created:');
    console.log('   - offer_reviews table');
    console.log('   - Indexes for performance');
    console.log('   - Triggers for auto-updating timestamps');
    console.log('   - Constraints for data integrity');
    
  } catch (error) {
    console.error('❌ Error setting up reviews system:', error);
    process.exit(1);
  }
}

setupReviewsSystem();
