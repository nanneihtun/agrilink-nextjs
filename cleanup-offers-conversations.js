const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function cleanupData() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🧹 Starting cleanup of offers and conversations data...');
    
    // Delete all offer reviews first (due to foreign key constraints)
    console.log('📝 Deleting offer reviews...');
    const reviewsResult = await sql`DELETE FROM offer_reviews`;
    console.log(`✅ Deleted ${reviewsResult.count || 0} offer reviews`);
    
    // Delete all offers
    console.log('📦 Deleting offers...');
    const offersResult = await sql`DELETE FROM offers`;
    console.log(`✅ Deleted ${offersResult.count || 0} offers`);
    
    // Delete all conversations
    console.log('💬 Deleting conversations...');
    const conversationsResult = await sql`DELETE FROM conversations`;
    console.log(`✅ Deleted ${conversationsResult.count || 0} conversations`);
    
    // Delete all messages
    console.log('📨 Deleting messages...');
    const messagesResult = await sql`DELETE FROM messages`;
    console.log(`✅ Deleted ${messagesResult.count || 0} messages`);
    
    console.log('🎉 Cleanup completed successfully!');
    console.log('📋 Summary:');
    console.log('   - All offer reviews deleted');
    console.log('   - All offers deleted');
    console.log('   - All conversations deleted');
    console.log('   - All messages deleted');
    console.log('   - Table structures preserved');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupData();
