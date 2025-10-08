const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function exportDatabase() {
  try {
    console.log('🔄 Starting database export...');
    
    // Get all table names
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => t.table_name));
    
    let exportScript = `-- AgriLink Marketplace Database Export
-- Generated on: ${new Date().toISOString()}
-- Source: Neon Database
-- Target: PostgreSQL (AWS RDS compatible)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

`;

    // Export each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`📊 Exporting table: ${tableName}`);
      
      // Get table structure
      const columns = await sql`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `;
      
      // Get constraints
      const constraints = await sql`
        SELECT 
          constraint_name,
          constraint_type
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName};
      `;
      
      // Get indexes
      const indexes = await sql`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = ${tableName};
      `;
      
      // Create table structure
      exportScript += `\n-- Table: ${tableName}\n`;
      exportScript += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
      exportScript += `CREATE TABLE "${tableName}" (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  "${col.column_name}" ${col.data_type}`;
        
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      exportScript += columnDefs.join(',\n') + '\n);\n\n';
      
      // Add constraints
      for (const constraint of constraints) {
        if (constraint.constraint_type === 'PRIMARY KEY') {
          const pkColumns = await sql`
            SELECT column_name
            FROM information_schema.key_column_usage
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
            AND constraint_name = ${constraint.constraint_name}
            ORDER BY ordinal_position;
          `;
          
          const pkColNames = pkColumns.map(c => `"${c.column_name}"`).join(', ');
          exportScript += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraint.constraint_name}" PRIMARY KEY (${pkColNames});\n`;
        } else if (constraint.constraint_type === 'FOREIGN KEY') {
          const fkInfo = await sql`
            SELECT 
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.key_column_usage AS kcu
            JOIN information_schema.referential_constraints AS rc
              ON kcu.constraint_name = rc.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = rc.unique_constraint_name
            WHERE kcu.table_schema = 'public' 
            AND kcu.table_name = ${tableName}
            AND kcu.constraint_name = ${constraint.constraint_name};
          `;
          
          if (fkInfo.length > 0) {
            const fk = fkInfo[0];
            exportScript += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraint.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}"("${fk.foreign_column_name}");\n`;
          }
        } else if (constraint.constraint_type === 'UNIQUE') {
          const uniqueColumns = await sql`
            SELECT column_name
            FROM information_schema.key_column_usage
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
            AND constraint_name = ${constraint.constraint_name}
            ORDER BY ordinal_position;
          `;
          
          const uniqueColNames = uniqueColumns.map(c => `"${c.column_name}"`).join(', ');
          exportScript += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraint.constraint_name}" UNIQUE (${uniqueColNames});\n`;
        }
      }
      
      // Add indexes
      for (const index of indexes) {
        if (!index.indexdef.includes('UNIQUE') && !index.indexdef.includes('PRIMARY')) {
          exportScript += `${index.indexdef};\n`;
        }
      }
      
      // Export data - use dynamic query for each table
      let data = [];
      try {
        // Use a switch statement to handle each table specifically
        switch (tableName) {
          case 'users':
            data = await sql`SELECT * FROM users`;
            break;
          case 'user_profiles':
            data = await sql`SELECT * FROM user_profiles`;
            break;
          case 'user_verification':
            data = await sql`SELECT * FROM user_verification`;
            break;
          case 'user_ratings':
            data = await sql`SELECT * FROM user_ratings`;
            break;
          case 'user_addresses':
            data = await sql`SELECT * FROM user_addresses`;
            break;
          case 'user_social':
            data = await sql`SELECT * FROM user_social`;
            break;
          case 'business_details':
            data = await sql`SELECT * FROM business_details`;
            break;
          case 'products':
            data = await sql`SELECT * FROM products`;
            break;
          case 'product_pricing':
            data = await sql`SELECT * FROM product_pricing`;
            break;
          case 'product_images':
            data = await sql`SELECT * FROM product_images`;
            break;
          case 'product_inventory':
            data = await sql`SELECT * FROM product_inventory`;
            break;
          case 'product_delivery':
            data = await sql`SELECT * FROM product_delivery`;
            break;
          case 'conversations':
            data = await sql`SELECT * FROM conversations`;
            break;
          case 'messages':
            data = await sql`SELECT * FROM messages`;
            break;
          case 'offers':
            data = await sql`SELECT * FROM offers`;
            break;
          case 'offer_reviews':
            data = await sql`SELECT * FROM offer_reviews`;
            break;
          default:
            console.log(`⚠️  Skipping data export for table: ${tableName}`);
            break;
        }
      } catch (error) {
        console.log(`⚠️  Error exporting data for table ${tableName}:`, error.message);
        data = [];
      }
      
      if (data.length > 0) {
        exportScript += `\n-- Data for table: ${tableName}\n`;
        
        for (const row of data) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            if (value instanceof Date) return `'${value.toISOString()}'`;
            if (Array.isArray(value)) return `'${JSON.stringify(value)}'`;
            return value;
          });
          
          const colNames = columns.map(c => `"${c}"`).join(', ');
          exportScript += `INSERT INTO "${tableName}" (${colNames}) VALUES (${values.join(', ')});\n`;
        }
      }
      
      exportScript += '\n';
    }
    
    // Export functions and triggers
    const functions = await sql`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION';
    `;
    
    if (functions.length > 0) {
      exportScript += '\n-- Functions\n';
      for (const func of functions) {
        exportScript += `-- Function: ${func.routine_name}\n`;
        exportScript += `${func.routine_definition};\n\n`;
      }
    }
    
    // Export triggers
    const triggers = await sql`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public';
    `;
    
    if (triggers.length > 0) {
      exportScript += '\n-- Triggers\n';
      for (const trigger of triggers) {
        exportScript += `-- Trigger: ${trigger.trigger_name} on ${trigger.event_object_table}\n`;
        exportScript += `CREATE TRIGGER "${trigger.trigger_name}"\n`;
        exportScript += `  ${trigger.action_statement};\n\n`;
      }
    }
    
    // Write to file
    const fs = require('fs');
    const filename = `agrilink-database-export-${new Date().toISOString().split('T')[0]}.sql`;
    fs.writeFileSync(filename, exportScript);
    
    console.log(`✅ Database exported successfully to: ${filename}`);
    console.log(`📊 Exported ${tables.length} tables with data`);
    console.log(`🔧 Exported ${functions.length} functions`);
    console.log(`⚡ Exported ${triggers.length} triggers`);
    
  } catch (error) {
    console.error('❌ Error exporting database:', error);
  }
}

exportDatabase();
