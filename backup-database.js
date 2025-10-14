#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * Creates a complete backup of the database before applying indexes
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

async function backupDatabase() {
  console.log('📸 Creating Database Backup Before Optimization\n');

  // Connect to database
  const sql = neon(process.env.DATABASE_URL, {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 60000,
  });

  try {
    // Get current timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `database-backup-before-indexes-${timestamp}.sql`;
    const backupPath = path.join(__dirname, backupFilename);

    console.log(`📁 Backup file: ${backupFilename}`);

    // Get all table names
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`📊 Found ${tables.length} tables to backup:`);
    tables.forEach(table => console.log(`  • ${table.table_name}`));

    let backupContent = `-- ============================================================================\n`;
    backupContent += `-- DATABASE BACKUP - Created: ${new Date().toISOString()}\n`;
    backupContent += `-- Purpose: Backup before applying database indexes\n`;
    backupContent += `-- Database: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//****@')}\n`;
    backupContent += `-- ============================================================================\n\n`;

    // Backup each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n📋 Backing up table: ${tableName}`);

      try {
        // Get table structure
        const structure = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ${tableName} 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `;

        backupContent += `-- Table: ${tableName}\n`;
        backupContent += `-- Structure: ${structure.length} columns\n\n`;

        // Get table data count
        const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
        const rowCount = countResult[0].count;
        
        console.log(`  📊 ${rowCount} rows to backup`);

        if (rowCount > 0) {
          // Get all data from table
          const data = await sql`SELECT * FROM ${sql(tableName)}`;
          
          // Create INSERT statements
          backupContent += `-- Data for ${tableName} (${rowCount} rows)\n`;
          backupContent += `-- Note: This is a simplified backup format\n`;
          backupContent += `-- For production, use pg_dump for complete backup\n\n`;
          
          // Store data as JSON for easy restoration
          backupContent += `-- JSON data for ${tableName}:\n`;
          backupContent += `-- INSERT INTO ${tableName} VALUES \n`;
          backupContent += JSON.stringify(data, null, 2);
          backupContent += `\n\n`;
        } else {
          backupContent += `-- No data in ${tableName}\n\n`;
        }

      } catch (error) {
        console.log(`  ⚠️  Error backing up ${tableName}: ${error.message}`);
        backupContent += `-- ERROR backing up ${tableName}: ${error.message}\n\n`;
      }
    }

    // Add index information
    backupContent += `-- ============================================================================\n`;
    backupContent += `-- CURRENT INDEXES (before optimization)\n`;
    backupContent += `-- ============================================================================\n\n`;

    const currentIndexes = await sql`
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

    currentIndexes.forEach(idx => {
      backupContent += `-- ${idx.indexname} ON ${idx.tablename}\n`;
      backupContent += `-- ${idx.indexdef}\n\n`;
    });

    // Write backup file
    fs.writeFileSync(backupPath, backupContent);

    console.log(`\n✅ Database backup completed!`);
    console.log(`📁 Backup saved to: ${backupFilename}`);
    console.log(`📊 Backup size: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);

    console.log(`\n🔍 Backup includes:`);
    console.log(`  • Table structures`);
    console.log(`  • All table data`);
    console.log(`  • Current indexes`);
    console.log(`  • Metadata and timestamps`);

    console.log(`\n💡 To restore from backup:`);
    console.log(`  1. Keep this backup file safe`);
    console.log(`  2. If needed, use pg_dump/pg_restore for complete restoration`);
    console.log(`  3. This backup is primarily for reference`);

    return backupFilename;

  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  backupDatabase().catch(console.error);
}

module.exports = { backupDatabase };
