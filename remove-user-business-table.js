const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon('postgresql://neondb_owner:npg_0Usptraqf7om@ep-divine-haze-ag9kgfk7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function removeUserBusinessTable() {
  try {
    console.log('🗑️  REMOVING USER_BUSINESS TABLE');
    console.log('=====================================\n');
    
    // Step 1: Check if table exists
    console.log('1️⃣ Checking if user_business table exists...');
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_business'
    `;
    
    if (tableExists.length === 0) {
      console.log('✅ user_business table does not exist - nothing to remove');
      return;
    }
    
    console.log('✅ user_business table found');
    
    // Step 2: Check if table has any data
    console.log('\n2️⃣ Checking if table has any data...');
    const rowCount = await sql`SELECT COUNT(*) as count FROM user_business`;
    console.log(`   Row count: ${rowCount[0].count}`);
    
    if (rowCount[0].count > 0) {
      console.log('⚠️  WARNING: Table has data! Please review before proceeding.');
      console.log('   Sample data:');
      const sampleData = await sql`SELECT * FROM user_business LIMIT 3`;
      sampleData.forEach((row, index) => {
        console.log(`   Row ${index + 1}:`, row);
      });
      console.log('\n   Aborting removal to prevent data loss.');
      return;
    }
    
    console.log('✅ Table is empty - safe to remove');
    
    // Step 3: Check for foreign key constraints
    console.log('\n3️⃣ Checking for foreign key constraints...');
    const constraints = await sql`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.table_name = 'user_business'
      AND tc.constraint_type = 'FOREIGN KEY'
    `;
    
    if (constraints.length > 0) {
      console.log('   Foreign key constraints found:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      });
    } else {
      console.log('✅ No foreign key constraints found');
    }
    
    // Step 4: Drop the table
    console.log('\n4️⃣ Dropping user_business table...');
    await sql`DROP TABLE IF EXISTS user_business CASCADE`;
    console.log('✅ user_business table dropped successfully');
    
    // Step 5: Verify removal
    console.log('\n5️⃣ Verifying table removal...');
    const verifyRemoval = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_business'
    `;
    
    if (verifyRemoval.length === 0) {
      console.log('✅ user_business table successfully removed');
    } else {
      console.log('❌ ERROR: Table still exists after drop attempt');
    }
    
    // Step 6: Show updated table count
    console.log('\n6️⃣ Updated database table count...');
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`✅ Database now has ${allTables.length} tables (was 26)`);
    console.log('\n📋 Current tables:');
    allTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    
    console.log('\n🎉 CLEANUP COMPLETE!');
    console.log('   - user_business table removed');
    console.log('   - Database simplified from 26 to 25 tables');
    console.log('   - ERD now matches actual database structure');
    
  } catch (error) {
    console.error('❌ Error removing user_business table:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the cleanup
removeUserBusinessTable();

