const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixOffersStatusConstraint() {
  try {
    console.log('🔄 Fixing offers status check constraint...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-offers-status-constraint.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await sql.unsafe(sqlContent);
    
    console.log('✅ Successfully updated offers status check constraint');
    
  } catch (error) {
    console.error('❌ Error fixing offers status constraint:', error);
    process.exit(1);
  }
}

fixOffersStatusConstraint();
