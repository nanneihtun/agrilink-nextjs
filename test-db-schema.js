import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local', override: true });

const sql = neon(process.env.DATABASE_URL);

async function testSchema() {
  try {
    console.log('🔍 Testing database schema...');
    
    // Test users table
    const users = await sql`SELECT * FROM users LIMIT 1`;
    console.log('✅ Users table columns:', Object.keys(users[0] || {}));
    
    // Test products table
    const products = await sql`SELECT * FROM products LIMIT 1`;
    console.log('✅ Products table columns:', Object.keys(products[0] || {}));
    
    // Test product_pricing table
    const pricing = await sql`SELECT * FROM product_pricing LIMIT 1`;
    console.log('✅ Product pricing table columns:', Object.keys(pricing[0] || {}));
    
    // Test user_profiles table
    const profiles = await sql`SELECT * FROM user_profiles LIMIT 1`;
    console.log('✅ User profiles table columns:', Object.keys(profiles[0] || {}));
    
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
  }
}

testSchema();
