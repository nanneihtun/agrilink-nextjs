#!/usr/bin/env node

/**
 * Database Migration Script: Neon to Supabase
 * 
 * This script will:
 * 1. Export data from your Neon database
 * 2. Create schema in Supabase
 * 3. Import data to Supabase
 * 
 * Prerequisites:
 * - Set NEON_DATABASE_URL and SUPABASE_DATABASE_URL environment variables
 * - Install pg: npm install pg
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables from .env.supabase
config({ path: '.env.supabase' });

// Database connections
let neonClient, supabaseClient;

// Table names in order (to respect foreign key constraints)
const TABLES_ORDER = [
  'users',
  'user_profiles',
  'business_details', 
  'user_social',
  'user_verification',
  'user_ratings',
  'products',
  'product_pricing',
  'product_inventory',
  'product_images',
  'product_delivery',
  'conversations',
  'messages',
  'offers',
  'saved_products'
];

// Reverse order for deletion (to respect foreign key constraints)
const TABLES_REVERSE_ORDER = [...TABLES_ORDER].reverse();

async function connectToDatabases() {
  console.log('🔗 Connecting to databases...');
  
  // Connect to Neon
  neonClient = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await neonClient.connect();
  console.log('✅ Connected to Neon database');

  // Connect to Supabase
  supabaseClient = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await supabaseClient.connect();
  console.log('✅ Connected to Supabase database');
}

async function disconnectFromDatabases() {
  console.log('🔌 Disconnecting from databases...');
  if (neonClient) await neonClient.end();
  if (supabaseClient) await supabaseClient.end();
  console.log('✅ Disconnected from databases');
}

async function exportSchemaFromNeon() {
  console.log('📋 Exporting schema from Neon...');
  
  const schemaQuery = `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = ANY($1)
    ORDER BY table_name, ordinal_position;
  `;

  const result = await neonClient.query(schemaQuery, [TABLES_ORDER]);
  
  // Group columns by table
  const schema = {};
  result.rows.forEach(row => {
    if (!schema[row.table_name]) {
      schema[row.table_name] = [];
    }
    schema[row.table_name].push(row);
  });

  // Save schema to file
  fs.writeFileSync('schema-export.json', JSON.stringify(schema, null, 2));
  console.log('✅ Schema exported to schema-export.json');
  
  return schema;
}

async function exportDataFromNeon() {
  console.log('📊 Exporting data from Neon...');
  
  const dataExport = {};
  
  for (const tableName of TABLES_ORDER) {
    try {
      console.log(`  Exporting ${tableName}...`);
      const result = await neonClient.query(`SELECT * FROM ${tableName}`);
      dataExport[tableName] = result.rows;
      console.log(`  ✅ Exported ${result.rows.length} rows from ${tableName}`);
    } catch (error) {
      console.log(`  ⚠️  Table ${tableName} not found or empty: ${error.message}`);
      dataExport[tableName] = [];
    }
  }

  // Save data to file
  fs.writeFileSync('data-export.json', JSON.stringify(dataExport, null, 2));
  console.log('✅ Data exported to data-export.json');
  
  return dataExport;
}

async function createSchemaInSupabase(schema) {
  console.log('🏗️  Creating schema in Supabase...');
  
  // Enable UUID extension
  await supabaseClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  for (const [tableName, columns] of Object.entries(schema)) {
    console.log(`  Creating table ${tableName}...`);
    
    // Build CREATE TABLE statement
    const columnDefs = columns.map(col => {
      let def = `"${col.column_name}"`;
      
      // Map data types
      switch (col.data_type) {
        case 'character varying':
          def += col.character_maximum_length ? ` VARCHAR(${col.character_maximum_length})` : ' TEXT';
          break;
        case 'character':
          def += col.character_maximum_length ? ` CHAR(${col.character_maximum_length})` : ' CHAR';
          break;
        case 'timestamp with time zone':
          def += ' TIMESTAMPTZ';
          break;
        case 'timestamp without time zone':
          def += ' TIMESTAMP';
          break;
        case 'numeric':
          def += ' DECIMAL';
          break;
        case 'boolean':
          def += ' BOOLEAN';
          break;
        case 'integer':
          def += ' INTEGER';
          break;
        case 'jsonb':
          def += ' JSONB';
          break;
        case 'text':
          def += ' TEXT';
          break;
        case 'uuid':
          def += ' UUID';
          break;
        default:
          def += ` ${col.data_type.toUpperCase()}`;
      }
      
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL';
      }
      
      if (col.column_default) {
        def += ` DEFAULT ${col.column_default}`;
      }
      
      return def;
    }).join(',\n    ');
    
    const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (
    ${columnDefs}
  );`;
    
    try {
      await supabaseClient.query(createTableSQL);
      console.log(`  ✅ Table ${tableName} created`);
    } catch (error) {
      console.log(`  ⚠️  Error creating table ${tableName}: ${error.message}`);
    }
  }
}

async function createConstraintsInSupabase(schema) {
  console.log('🔗 Creating constraints and indexes in Supabase...');
  
  // Add primary keys and foreign keys based on your schema
  const constraints = [
    // Primary keys
    { sql: 'ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);', table: 'users' },
    { sql: 'ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);', table: 'user_profiles' },
    { sql: 'ALTER TABLE business_details ADD CONSTRAINT business_details_pkey PRIMARY KEY (id);', table: 'business_details' },
    { sql: 'ALTER TABLE user_social ADD CONSTRAINT user_social_pkey PRIMARY KEY (id);', table: 'user_social' },
    { sql: 'ALTER TABLE user_verification ADD CONSTRAINT user_verification_pkey PRIMARY KEY (id);', table: 'user_verification' },
    { sql: 'ALTER TABLE user_ratings ADD CONSTRAINT user_ratings_pkey PRIMARY KEY (id);', table: 'user_ratings' },
    { sql: 'ALTER TABLE products ADD CONSTRAINT products_pkey PRIMARY KEY (id);', table: 'products' },
    { sql: 'ALTER TABLE product_pricing ADD CONSTRAINT product_pricing_pkey PRIMARY KEY (id);', table: 'product_pricing' },
    { sql: 'ALTER TABLE product_inventory ADD CONSTRAINT product_inventory_pkey PRIMARY KEY (id);', table: 'product_inventory' },
    { sql: 'ALTER TABLE product_images ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);', table: 'product_images' },
    { sql: 'ALTER TABLE product_delivery ADD CONSTRAINT product_delivery_pkey PRIMARY KEY (id);', table: 'product_delivery' },
    { sql: 'ALTER TABLE conversations ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);', table: 'conversations' },
    { sql: 'ALTER TABLE messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);', table: 'messages' },
    { sql: 'ALTER TABLE offers ADD CONSTRAINT offers_pkey PRIMARY KEY (id);', table: 'offers' },
    { sql: 'ALTER TABLE saved_products ADD CONSTRAINT saved_products_pkey PRIMARY KEY (id);', table: 'saved_products' },

    // Foreign keys
    { sql: 'ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;', table: 'user_profiles' },
    { sql: 'ALTER TABLE business_details ADD CONSTRAINT business_details_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;', table: 'business_details' },
    { sql: 'ALTER TABLE user_social ADD CONSTRAINT user_social_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;', table: 'user_social' },
    { sql: 'ALTER TABLE user_verification ADD CONSTRAINT user_verification_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;', table: 'user_verification' },
    { sql: 'ALTER TABLE user_ratings ADD CONSTRAINT user_ratings_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;', table: 'user_ratings' },
    { sql: 'ALTER TABLE products ADD CONSTRAINT products_sellerId_fkey FOREIGN KEY ("sellerId") REFERENCES users(id) ON DELETE CASCADE;', table: 'products' },
    { sql: 'ALTER TABLE product_pricing ADD CONSTRAINT product_pricing_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'product_pricing' },
    { sql: 'ALTER TABLE product_inventory ADD CONSTRAINT product_inventory_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'product_inventory' },
    { sql: 'ALTER TABLE product_images ADD CONSTRAINT product_images_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'product_images' },
    { sql: 'ALTER TABLE product_delivery ADD CONSTRAINT product_delivery_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'product_delivery' },
    { sql: 'ALTER TABLE conversations ADD CONSTRAINT conversations_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'conversations' },
    { sql: 'ALTER TABLE conversations ADD CONSTRAINT conversations_buyerId_fkey FOREIGN KEY ("buyerId") REFERENCES users(id) ON DELETE CASCADE;', table: 'conversations' },
    { sql: 'ALTER TABLE conversations ADD CONSTRAINT conversations_sellerId_fkey FOREIGN KEY ("sellerId") REFERENCES users(id) ON DELETE CASCADE;', table: 'conversations' },
    { sql: 'ALTER TABLE messages ADD CONSTRAINT messages_conversationId_fkey FOREIGN KEY ("conversationId") REFERENCES conversations(id) ON DELETE CASCADE;', table: 'messages' },
    { sql: 'ALTER TABLE messages ADD CONSTRAINT messages_senderId_fkey FOREIGN KEY ("senderId") REFERENCES users(id) ON DELETE CASCADE;', table: 'messages' },
    { sql: 'ALTER TABLE offers ADD CONSTRAINT offers_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'offers' },
    { sql: 'ALTER TABLE offers ADD CONSTRAINT offers_buyerId_fkey FOREIGN KEY ("buyerId") REFERENCES users(id) ON DELETE CASCADE;', table: 'offers' },
    { sql: 'ALTER TABLE offers ADD CONSTRAINT offers_sellerId_fkey FOREIGN KEY ("sellerId") REFERENCES users(id) ON DELETE CASCADE;', table: 'offers' },
    { sql: 'ALTER TABLE offers ADD CONSTRAINT offers_conversationId_fkey FOREIGN KEY ("conversationId") REFERENCES conversations(id) ON DELETE CASCADE;', table: 'offers' },
    { sql: 'ALTER TABLE offers ADD CONSTRAINT offers_cancelledBy_fkey FOREIGN KEY ("cancelledBy") REFERENCES users(id);', table: 'offers' },
    { sql: 'ALTER TABLE saved_products ADD CONSTRAINT saved_products_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;', table: 'saved_products' },
    { sql: 'ALTER TABLE saved_products ADD CONSTRAINT saved_products_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE;', table: 'saved_products' },

    // Unique constraints
    { sql: 'ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);', table: 'users' },
  ];

  for (const constraint of constraints) {
    try {
      await supabaseClient.query(constraint.sql);
      console.log(`  ✅ Constraint created for ${constraint.table}`);
    } catch (error) {
      console.log(`  ⚠️  Constraint may already exist for ${constraint.table}: ${error.message}`);
    }
  }
}

async function importDataToSupabase(dataExport) {
  console.log('📥 Importing data to Supabase...');
  
  for (const tableName of TABLES_ORDER) {
    const rows = dataExport[tableName] || [];
    
    if (rows.length === 0) {
      console.log(`  ⚠️  No data to import for ${tableName}`);
      continue;
    }

    console.log(`  Importing ${rows.length} rows to ${tableName}...`);
    
    try {
      // Get column names from first row
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const insertSQL = `INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${placeholders})`;
      
      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        for (const row of batch) {
          const values = columns.map(col => row[col]);
          await supabaseClient.query(insertSQL, values);
        }
        
        console.log(`    ✅ Imported batch ${Math.floor(i / batchSize) + 1} (${Math.min(batchSize, rows.length - i)} rows)`);
      }
      
      console.log(`  ✅ Successfully imported ${rows.length} rows to ${tableName}`);
    } catch (error) {
      console.log(`  ❌ Error importing data to ${tableName}: ${error.message}`);
    }
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  for (const tableName of TABLES_ORDER) {
    try {
      const neonResult = await neonClient.query(`SELECT COUNT(*) FROM ${tableName}`);
      const supabaseResult = await supabaseClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
      
      const neonCount = parseInt(neonResult.rows[0].count);
      const supabaseCount = parseInt(supabaseResult.rows[0].count);
      
      if (neonCount === supabaseCount) {
        console.log(`  ✅ ${tableName}: ${supabaseCount} rows (matches Neon)`);
      } else {
        console.log(`  ⚠️  ${tableName}: ${supabaseCount} rows (Neon had ${neonCount})`);
      }
    } catch (error) {
      console.log(`  ❌ Error verifying ${tableName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Neon to Supabase migration...\n');
  
  try {
    // Check environment variables
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error('NEON_DATABASE_URL environment variable is required');
    }
    if (!process.env.SUPABASE_DATABASE_URL) {
      throw new Error('SUPABASE_DATABASE_URL environment variable is required');
    }

    await connectToDatabases();
    
    const schema = await exportSchemaFromNeon();
    const data = await exportDataFromNeon();
    
    await createSchemaInSupabase(schema);
    await createConstraintsInSupabase(schema);
    await importDataToSupabase(data);
    
    await verifyMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env file with SUPABASE_DATABASE_URL');
    console.log('2. Test your application with the new database');
    console.log('3. Update your drizzle.config.json if needed');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectFromDatabases();
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  connectToDatabases,
  disconnectFromDatabases,
  exportSchemaFromNeon,
  exportDataFromNeon,
  createSchemaInSupabase,
  createConstraintsInSupabase,
  importDataToSupabase,
  verifyMigration
};
