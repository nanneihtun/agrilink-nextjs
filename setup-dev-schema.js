#!/usr/bin/env node

/**
 * Setup Development Database Schema
 * 
 * Creates the database schema in the development branch
 */

const { neon } = require('@neondatabase/serverless');
const { config } = require('dotenv');

// Load development environment
config({ path: '.env.dev' });

async function setupDevSchema() {
  console.log('🚀 Setting up Development Database Schema\n');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Test connection first
    await sql`SELECT 1 as test`;
    console.log('✅ Connected to development branch\n');
    
    // Create the schema using SQL directly
    console.log('📋 Creating database schema...\n');
    
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "userType" TEXT NOT NULL,
        "accountType" TEXT NOT NULL,
        "emailVerified" BOOLEAN DEFAULT false,
        "emailVerificationToken" TEXT,
        "emailVerificationExpires" TIMESTAMP WITH TIME ZONE,
        "pendingEmail" TEXT,
        "agriLinkVerificationRequested" BOOLEAN DEFAULT false,
        "agriLinkVerificationRequestedAt" TIMESTAMP WITH TIME ZONE,
        "verificationDocuments" JSONB,
        "rejectedDocuments" JSONB,
        "businessName" TEXT,
        "businessDescription" TEXT,
        "businessLicenseNumber" TEXT,
        "verificationStatus" TEXT,
        "verificationSubmittedAt" TIMESTAMP WITH TIME ZONE,
        "passwordResetToken" TEXT,
        "passwordResetExpires" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created users table');
    
    // User profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location TEXT NOT NULL,
        phone TEXT,
        experience TEXT,
        "profileImage" TEXT,
        "storefrontImage" TEXT,
        website TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created user_profiles table');
    
    // Products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sellerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created products table');
    
    // Product pricing table
    await sql`
      CREATE TABLE IF NOT EXISTS product_pricing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        price DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        unit TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created product_pricing table');
    
    // Conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "buyerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "sellerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "productId" UUID REFERENCES products(id) ON DELETE SET NULL,
        "lastMessageTime" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created conversations table');
    
    // Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversationId" UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "messageType" TEXT DEFAULT 'text',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created messages table');
    
    // Offers table
    await sql`
      CREATE TABLE IF NOT EXISTS offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "buyerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "sellerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "productId" UUID REFERENCES products(id) ON DELETE SET NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        message TEXT,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Created offers table');
    
    // Insert some test data
    console.log('\n📊 Inserting test data...');
    
    // Test users
    await sql`
      INSERT INTO users (id, email, name, "passwordHash", "userType", "accountType") VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'test@example.com', 'Test User', 'hashedpassword', 'farmer', 'individual'),
      ('550e8400-e29b-41d4-a716-446655440002', 'seller@example.com', 'Test Seller', 'hashedpassword', 'trader', 'business')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✅ Added test users');
    
    // Test products
    await sql`
      INSERT INTO products (id, "sellerId", name, description, category) VALUES
      ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Test Product 1', 'A test product', 'vegetables'),
      ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Test Product 2', 'Another test product', 'fruits')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Added test products');
    
    // Test pricing
    await sql`
      INSERT INTO product_pricing ("productId", price, currency, unit) VALUES
      ('650e8400-e29b-41d4-a716-446655440001', 10.50, 'USD', 'kg'),
      ('650e8400-e29b-41d4-a716-446655440002', 5.25, 'USD', 'kg')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Added test pricing');
    
    // Test conversations
    await sql`
      INSERT INTO conversations (id, "buyerId", "sellerId", "productId") VALUES
      ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Added test conversations');
    
    // Test messages
    await sql`
      INSERT INTO messages ("conversationId", "senderId", content) VALUES
      ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hello, I am interested in your product'),
      ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hi! Great to hear from you')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Added test messages');
    
    // Test offers
    await sql`
      INSERT INTO offers ("buyerId", "sellerId", "productId", price, quantity, message, status) VALUES
      ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 9.50, 2, 'I would like to buy this product', 'pending')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Added test offers');
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...');
    const users = await sql`SELECT COUNT(*) FROM users`;
    const products = await sql`SELECT COUNT(*) FROM products`;
    const conversations = await sql`SELECT COUNT(*) FROM conversations`;
    const offers = await sql`SELECT COUNT(*) FROM offers`;
    
    console.log(`\n📈 Test data counts:`);
    console.log(`  Users: ${users[0].count}`);
    console.log(`  Products: ${products[0].count}`);
    console.log(`  Conversations: ${conversations[0].count}`);
    console.log(`  Offers: ${offers[0].count}`);
    
    console.log('\n🎉 Development database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test baseline performance: node check-indexes.js --env=.env.dev');
    console.log('2. Apply optimizations: node apply-indexes.js --env=.env.dev');
    console.log('3. Verify improvements: node check-indexes.js --env=.env.dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupDevSchema().catch(console.error);
}

module.exports = { setupDevSchema };
