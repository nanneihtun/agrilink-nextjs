// Setup database for Next.js project
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local', override: true });

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database for Next.js project...');
    
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✅ UUID extension enabled');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'trader', 'buyer', 'admin')),
        account_type TEXT NOT NULL CHECK (account_type IN ('individual', 'business')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Users table created');
    
    // Create user profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location TEXT NOT NULL,
        phone TEXT,
        experience TEXT,
        profile_image TEXT,
        storefront_image TEXT,
        website TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('✅ User profiles table created');
    
    // Create business details table
    await sql`
      CREATE TABLE IF NOT EXISTS business_details (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name TEXT,
        business_description TEXT,
        business_hours TEXT,
        specialties TEXT[],
        policies JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('✅ Business details table created');
    
    // Create user verification table
    await sql`
      CREATE TABLE IF NOT EXISTS user_verification (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        verification_status TEXT DEFAULT 'not_started' CHECK (verification_status IN ('not_started', 'in_progress', 'under_review', 'verified', 'rejected')),
        verification_submitted BOOLEAN DEFAULT FALSE,
        verification_documents JSONB,
        business_details_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('✅ User verification table created');
    
    // Create user ratings table
    await sql`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating DECIMAL(3,2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        response_time TEXT,
        quality_certifications TEXT[],
        farming_methods TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    console.log('✅ User ratings table created');
    
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Products table created');
    
    // Create product pricing table
    await sql`
      CREATE TABLE IF NOT EXISTS product_pricing (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        price DECIMAL(12,2) NOT NULL,
        unit TEXT NOT NULL,
        price_change DECIMAL(5,2),
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(product_id)
      )
    `;
    console.log('✅ Product pricing table created');
    
    // Create product inventory table
    await sql`
      CREATE TABLE IF NOT EXISTS product_inventory (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity TEXT NOT NULL,
        minimum_order TEXT,
        available_quantity TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(product_id)
      )
    `;
    console.log('✅ Product inventory table created');
    
    // Create product images table
    await sql`
      CREATE TABLE IF NOT EXISTS product_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Product images table created');
    
    // Create product delivery table
    await sql`
      CREATE TABLE IF NOT EXISTS product_delivery (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        location TEXT NOT NULL,
        seller_type TEXT NOT NULL CHECK (seller_type IN ('farmer', 'trader')),
        seller_name TEXT NOT NULL,
        delivery_options TEXT[],
        payment_terms TEXT[],
        additional_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(product_id)
      )
    `;
    console.log('✅ Product delivery table created');
    
    // Create conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message TEXT,
        last_message_time TIMESTAMP WITH TIME ZONE,
        unread_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Conversations table created');
    
    // Create messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'offer')),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Messages table created');
    
    // Create indexes for performance
    console.log('🔧 Creating performance indexes...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`;
    
    console.log('✅ Performance indexes created');
    
    // Create sample data
    console.log('🌱 Creating sample data...');
    
    // Create sample users
    const sampleUsers = [
      {
        email: 'farmer1@example.com',
        name: 'Golden Harvest Co.',
        password: 'password123',
        userType: 'farmer',
        accountType: 'business',
        location: 'Yangon, Myanmar'
      },
      {
        email: 'trader1@example.com',
        name: 'AgriConnect Trading',
        password: 'password123',
        userType: 'trader',
        accountType: 'business',
        location: 'Mandalay, Myanmar'
      },
      {
        email: 'buyer1@example.com',
        name: 'Fresh Market Buyer',
        password: 'password123',
        userType: 'buyer',
        accountType: 'individual',
        location: 'Naypyidaw, Myanmar'
      }
    ];
    
    for (const userData of sampleUsers) {
      const passwordHash = await import('bcryptjs').then(bcrypt => 
        bcrypt.default.hash(userData.password, 12)
      );
      
      const users = await sql`
        INSERT INTO users (email, name, password_hash, user_type, account_type, created_at, updated_at)
        VALUES (${userData.email}, ${userData.name}, ${passwordHash}, ${userData.userType}, ${userData.accountType}, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      
      if (users.length > 0) {
        const userId = users[0].id;
        
        await sql`
          INSERT INTO user_profiles (user_id, location, created_at, updated_at)
          VALUES (${userId}, ${userData.location}, NOW(), NOW())
          ON CONFLICT (user_id) DO NOTHING
        `;
        
        await sql`
          INSERT INTO user_verification (user_id, verified, phone_verified, verification_status, created_at, updated_at)
          VALUES (${userId}, true, true, 'verified', NOW(), NOW())
          ON CONFLICT (user_id) DO NOTHING
        `;
        
        await sql`
          INSERT INTO user_ratings (user_id, rating, total_reviews, created_at, updated_at)
          VALUES (${userId}, 4.5, 10, NOW(), NOW())
          ON CONFLICT (user_id) DO NOTHING
        `;
      }
    }
    
    console.log('✅ Sample users created');
    
    // Create sample products
    const sampleProducts = [
      {
        name: 'Fresh Organic Tomatoes',
        category: 'Vegetables',
        description: 'Fresh, organic tomatoes grown with sustainable farming methods',
        price: 2500,
        unit: 'kg',
        quantity: '100 kg',
        sellerEmail: 'farmer1@example.com'
      },
      {
        name: 'Premium Jasmine Rice',
        category: 'Grains',
        description: 'High-quality jasmine rice, perfect for cooking',
        price: 4500,
        unit: 'bag',
        quantity: '50 bags',
        sellerEmail: 'trader1@example.com'
      }
    ];
    
    for (const productData of sampleProducts) {
      const sellers = await sql`SELECT id FROM users WHERE email = ${productData.sellerEmail} LIMIT 1`;
      
      if (sellers.length > 0) {
        const sellerId = sellers[0].id;
        
        const products = await sql`
          INSERT INTO products (seller_id, name, category, description, is_active, created_at, updated_at)
          VALUES (${sellerId}, ${productData.name}, ${productData.category}, ${productData.description}, true, NOW(), NOW())
          RETURNING id
        `;
        
        const productId = products[0].id;
        
        await sql`
          INSERT INTO product_pricing (product_id, price, unit, created_at, updated_at)
          VALUES (${productId}, ${productData.price}, ${productData.unit}, NOW(), NOW())
        `;
        
        await sql`
          INSERT INTO product_inventory (product_id, quantity, created_at, updated_at)
          VALUES (${productId}, ${productData.quantity}, NOW(), NOW())
        `;
        
        await sql`
          INSERT INTO product_delivery (product_id, location, seller_type, seller_name, created_at, updated_at)
          VALUES (${productId}, 'Yangon, Myanmar', 'farmer', 'Golden Harvest Co.', NOW(), NOW())
        `;
      }
    }
    
    console.log('✅ Sample products created');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
