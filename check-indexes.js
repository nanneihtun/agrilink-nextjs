#!/usr/bin/env node

/**
 * Check Database Index Status
 * 
 * This script checks the current state of database indexes
 */

const { neon } = require('@neondatabase/serverless');
const { config } = require('dotenv');

// Load environment variables (support both dev and prod)
const envFile = process.argv.includes('--env') ? 
  process.argv[process.argv.indexOf('--env') + 1] : '.env.local';
config({ path: envFile });

async function checkIndexes() {
  console.log('🔍 Checking Database Index Status\n');

  // Connect to database
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check existing indexes
    console.log('📋 Current Indexes:');
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN (
        'products', 'users', 'conversations', 'offers', 
        'messages', 'product_pricing', 'user_profiles',
        'user_verification', 'user_ratings'
      )
      ORDER BY tablename, indexname
    `;

    if (indexes.length === 0) {
      console.log('❌ No custom indexes found');
      console.log('💡 Run: node apply-indexes.js to add performance indexes');
      return;
    }

    // Group by table
    const indexesByTable = {};
    indexes.forEach(idx => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx);
    });

    Object.keys(indexesByTable).forEach(tableName => {
      console.log(`\n📊 ${tableName.toUpperCase()}:`);
      indexesByTable[tableName].forEach(idx => {
        const isCustom = idx.indexname.startsWith('idx_');
        const icon = isCustom ? '✅' : '🔧';
        console.log(`  ${icon} ${idx.indexname}`);
      });
    });

    // Check for our specific performance indexes
    console.log('\n🎯 Performance Index Status:');
    const performanceIndexes = [
      'idx_products_seller_active',
      'idx_products_category_active',
      'idx_product_pricing_product_id',
      'idx_conversations_user_time',
      'idx_offers_user_created',
      'idx_user_profiles_user_id',
      'idx_user_verification_user_id',
      'idx_user_ratings_user_id'
    ];

    const existingIndexes = indexes.map(idx => idx.indexname);
    
    performanceIndexes.forEach(indexName => {
      const exists = existingIndexes.includes(indexName);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${indexName}`);
    });

    const missingCount = performanceIndexes.filter(name => !existingIndexes.includes(name)).length;
    
    if (missingCount === 0) {
      console.log('\n🎉 All performance indexes are present!');
      console.log('💡 Your database is optimized for performance.');
    } else {
      console.log(`\n⚠️  ${missingCount} performance indexes are missing.`);
      console.log('💡 Run: node apply-indexes.js to add missing indexes');
    }

    // Check index usage (if any data exists)
    console.log('\n📈 Index Usage Statistics:');
    const indexUsage = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan as times_used,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes 
      WHERE indexrelname LIKE 'idx_%'
      ORDER BY idx_scan DESC
      LIMIT 10
    `;

    if (indexUsage.length === 0) {
      console.log('ℹ️  No usage statistics available yet (indexes may be new or no queries run)');
    } else {
      indexUsage.forEach(usage => {
        console.log(`  📊 ${usage.indexname}: ${usage.times_used} scans, ${usage.tuples_read} tuples read`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking indexes:', error.message);
  }
}

// Run the script
if (require.main === module) {
  checkIndexes().catch(console.error);
}

module.exports = { checkIndexes };
