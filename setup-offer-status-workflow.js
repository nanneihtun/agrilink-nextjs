const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupOfferStatusWorkflow() {
  try {
    console.log('🚀 Setting up comprehensive offer status workflow...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'update-offer-status-workflow.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL using unsafe for multi-statement execution
    await sql.unsafe(sqlContent);
    
    console.log('✅ Offer status workflow setup completed successfully!');
    console.log('');
    console.log('📋 Available offer statuses:');
    console.log('   • pending - Initial offer submitted');
    console.log('   • accepted - Seller accepts the offer');
    console.log('   • rejected - Seller rejects the offer');
    console.log('   • to_ship - Ready to ship');
    console.log('   • shipped - Package shipped');
    console.log('   • to_receive - Buyer to confirm receipt');
    console.log('   • completed - Transaction completed');
    console.log('   • cancelled - Offer cancelled');
    console.log('   • expired - Offer expired');
    console.log('');
    console.log('🔧 Features added:');
    console.log('   • Automatic timestamp updates');
    console.log('   • Status transition tracking');
    console.log('   • Cancellation tracking');
    console.log('   • Performance indexes');
    console.log('   • Status summary view');
    
  } catch (error) {
    console.error('❌ Error setting up offer status workflow:', error);
    process.exit(1);
  }
}

setupOfferStatusWorkflow();
