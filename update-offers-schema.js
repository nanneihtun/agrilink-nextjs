require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

async function updateOffersSchema() {
  try {
    console.log('🔄 Updating offers table schema...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'update-offers-table.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL - split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement.trim());
      }
    }
    
    console.log('✅ Offers table schema updated successfully!');
    console.log('📋 New columns added:');
    console.log('   - payment_method (cash, bank_transfer, mobile_payment, credit_card)');
    console.log('   - delivery_address (JSONB for address details)');
    console.log('   - delivery_options (TEXT[] for selected options)');
    console.log('   - payment_terms (TEXT[] for selected terms)');
    
  } catch (error) {
    console.error('❌ Error updating offers schema:', error);
    process.exit(1);
  }
}

updateOffersSchema();
