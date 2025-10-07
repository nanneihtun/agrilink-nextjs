const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateConversations() {
  try {
    console.log('🔄 Starting conversation and message migration from Supabase to Neon...');
    
    // Read the Supabase export
    const exportData = JSON.parse(fs.readFileSync('../agrilink-marketplace/supabase-export.json', 'utf8'));
    const conversations = exportData.conversations;
    const messages = exportData.messages;
    
    console.log(`📊 Found ${conversations.length} conversations and ${messages.length} messages in Supabase export`);
    
    // Clear existing data
    console.log('🧹 Clearing existing conversations and messages...');
    await sql`DELETE FROM messages`;
    await sql`DELETE FROM conversations`;
    
    let conversationSuccessCount = 0;
    let conversationErrorCount = 0;
    
    // Migrate conversations
    for (const conv of conversations) {
      try {
        await sql`
          INSERT INTO conversations (
            id, "productId", "buyerId", "sellerId", "lastMessage", 
            "lastMessageTime", "unreadCount", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${conv.id},
            ${conv.product_id},
            ${conv.buyer_id},
            ${conv.seller_id},
            ${conv.last_message},
            ${conv.last_message_time},
            ${conv.unread_count || 0},
            true,
            ${conv.created_at || new Date().toISOString()},
            ${conv.updated_at || new Date().toISOString()}
          )
        `;
        conversationSuccessCount++;
      } catch (error) {
        console.error(`❌ Error migrating conversation ${conv.id}:`, error.message);
        conversationErrorCount++;
      }
    }
    
    console.log(`✅ Migrated ${conversationSuccessCount} conversations, ${conversationErrorCount} errors`);
    
    let messageSuccessCount = 0;
    let messageErrorCount = 0;
    
    // Migrate messages
    for (const msg of messages) {
      try {
        // Skip messages with null sender_id as they might be system messages
        if (!msg.sender_id) {
          console.log(`⚠️  Skipping message ${msg.id} - no sender_id`);
          continue;
        }
        
        await sql`
          INSERT INTO messages (
            id, "conversationId", "senderId", content, "messageType", 
            "isRead", "createdAt"
          ) VALUES (
            ${msg.id},
            ${msg.conversation_id},
            ${msg.sender_id},
            ${msg.content},
            ${msg.message_type || 'text'},
            ${msg.is_read || false},
            ${msg.created_at || new Date().toISOString()}
          )
        `;
        messageSuccessCount++;
      } catch (error) {
        console.error(`❌ Error migrating message ${msg.id}:`, error.message);
        messageErrorCount++;
      }
    }
    
    console.log(`✅ Migrated ${messageSuccessCount} messages, ${messageErrorCount} errors`);
    
    // Verify the migration
    const finalConversationCount = await sql`SELECT COUNT(*) as count FROM conversations`;
    const finalMessageCount = await sql`SELECT COUNT(*) as count FROM messages`;
    
    console.log(`\n📊 Final counts:`);
    console.log(`  Conversations: ${finalConversationCount[0].count}`);
    console.log(`  Messages: ${finalMessageCount[0].count}`);
    
    console.log('\n🎉 Conversation and message migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateConversations();
