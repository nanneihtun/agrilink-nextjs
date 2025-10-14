#!/usr/bin/env node

/**
 * Phase 1: Apply Critical Database Indexes
 * 
 * This script safely applies database indexes to improve query performance
 * Expected improvement: 30-50% faster queries
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

async function applyIndexes() {
  console.log('🚀 Starting Phase 1: Database Index Optimization');
  console.log('Expected improvement: 30-50% faster queries\n');

  // Connect to database
  const sql = neon(process.env.DATABASE_URL, {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
  });

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'phase1-add-indexes.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📋 Applying database indexes...\n');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      try {
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        
        if (statement.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX.*?IF NOT EXISTS\s+(\w+)/)?.[1] || 
                           statement.match(/CREATE INDEX\s+(\w+)/)?.[1];
          
          if (indexName) {
            // Check if index already exists
            const exists = await sql`
              SELECT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE indexname = ${indexName}
              ) as exists
            `;
            
            if (exists[0].exists) {
              console.log(`  ⏭️  Index ${indexName} already exists - skipping`);
              skipCount++;
              continue;
            }
          }
        }

        // Execute the statement
        await sql.unsafe(statement);
        
        if (statement.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX.*?IF NOT EXISTS\s+(\w+)/)?.[1] || 
                           statement.match(/CREATE INDEX\s+(\w+)/)?.[1];
          console.log(`  ✅ Created index: ${indexName}`);
        } else if (statement.includes('ANALYZE')) {
          const tableName = statement.match(/ANALYZE\s+(\w+)/)?.[1];
          console.log(`  📊 Updated statistics for: ${tableName}`);
        }
        
        successCount++;
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ⏭️  Index already exists - skipping`);
          skipCount++;
        } else {
          console.error(`  ❌ Error: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n📊 Index Application Summary:');
    console.log(`✅ Successfully created: ${successCount} indexes`);
    console.log(`⏭️  Skipped (already exists): ${skipCount} indexes`);
    console.log(`❌ Errors: ${errorCount} indexes`);

    if (errorCount === 0) {
      console.log('\n🎉 Phase 1 completed successfully!');
      console.log('\n📈 Expected Performance Improvements:');
      console.log('• Product listings: 30-50% faster');
      console.log('• User queries: 40-60% faster');
      console.log('• Conversation queries: 50-70% faster');
      console.log('• Offer queries: 40-60% faster');
      
      console.log('\n🔍 Verification:');
      console.log('Run the following query to verify indexes:');
      console.log('SELECT indexname FROM pg_indexes WHERE indexname LIKE \'idx_%\' ORDER BY indexname;');
      
      console.log('\n📋 Next Steps:');
      console.log('1. Monitor query performance over the next few days');
      console.log('2. Check index usage with: SELECT * FROM pg_stat_user_indexes WHERE indexrelname LIKE \'idx_%\';');
      console.log('3. Consider Phase 2 (Materialized Views) if more performance is needed');
      
    } else {
      console.log('\n⚠️  Some indexes failed to create. Check the errors above.');
    }

  } catch (error) {
    console.error('\n❌ Failed to apply indexes:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  applyIndexes().catch(console.error);
}

module.exports = { applyIndexes };
