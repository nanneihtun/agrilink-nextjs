const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupReadyToPickupStatus() {
  try {
    console.log('🔄 Adding ready_to_pickup status to offers table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-ready-to-pickup-status.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await sql.unsafe(sqlContent);
    
    console.log('✅ Successfully added ready_to_pickup status to offers table');
    
  } catch (error) {
    console.error('❌ Error setting up ready_to_pickup status:', error);
    process.exit(1);
  }
}

setupReadyToPickupStatus();
