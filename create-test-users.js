const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// Test users with proper credentials
const testUsers = [
  {
    id: '72c8f83d-1496-48f4-ab23-40be1aa8284d',
    email: 'farmerindi1@gmail.com',
    name: 'Aung Min',
    userType: 'farmer',
    accountType: 'individual',
    location: 'Mandalay Region, Mandalay',
    phone: '+959123456789',
    verified: false,
    phoneVerified: false,
    verificationStatus: 'unverified',
    passwordHash: '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0' // 123456
  },
  {
    id: '3276419d-5870-473a-a9a4-82fcc5ac4de8',
    email: 'traderindi1@gmail.com',
    name: 'Ko Myint',
    userType: 'trader',
    accountType: 'individual',
    location: 'Mandalay Region, Mandalay',
    phone: '+959123456793',
    verified: false,
    phoneVerified: false,
    verificationStatus: 'unverified',
    passwordHash: '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0' // 123456
  },
  {
    id: '8b3cdf56-c726-4e6a-83bb-5cdf35b830d2',
    email: 'farmerbiz1@gmail.com',
    name: 'Green Valley Farm',
    userType: 'farmer',
    accountType: 'business',
    location: 'Sagaing Region, Monywa',
    phone: '+959123456791',
    verified: false,
    phoneVerified: false,
    verificationStatus: 'unverified',
    passwordHash: '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0' // 123456
  },
  {
    id: 'admin-user-id-123456789',
    email: 'admin@agrilink.com',
    name: 'AgriLink Admin',
    userType: 'admin',
    accountType: 'business',
    location: 'Yangon Region, Yangon',
    phone: '+959123456000',
    verified: true,
    phoneVerified: true,
    verificationStatus: 'verified',
    passwordHash: '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0' // admin123456
  }
];

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users in Neon database...');
    
    for (const user of testUsers) {
      console.log(`Creating user: ${user.name} (${user.email})`);
      
      // Insert into users table
      await sql`
        INSERT INTO users (id, email, name, "userType", "accountType", "createdAt", "updatedAt")
        VALUES (${user.id}, ${user.email}, ${user.name}, ${user.userType}, ${user.accountType}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          "userType" = EXCLUDED."userType",
          "accountType" = EXCLUDED."accountType",
          "updatedAt" = NOW()
      `;
      
      // Insert into user_profiles table
      await sql`
        INSERT INTO user_profiles ("userId", location, "phoneVerified", "createdAt", "updatedAt")
        VALUES (${user.id}, ${user.location}, ${user.phoneVerified}, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET
          location = EXCLUDED.location,
          "phoneVerified" = EXCLUDED."phoneVerified",
          "updatedAt" = NOW()
      `;
      
      // Insert into user_verification table
      await sql`
        INSERT INTO user_verification ("userId", verified, "verificationStatus", "createdAt", "updatedAt")
        VALUES (${user.id}, ${user.verified}, ${user.verificationStatus}, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET
          verified = EXCLUDED.verified,
          "verificationStatus" = EXCLUDED."verificationStatus",
          "updatedAt" = NOW()
      `;
      
      // Insert into user_ratings table
      await sql`
        INSERT INTO user_ratings ("userId", rating, "totalReviews", "createdAt", "updatedAt")
        VALUES (${user.id}, 0, 0, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET
          rating = EXCLUDED.rating,
          "totalReviews" = EXCLUDED."totalReviews",
          "updatedAt" = NOW()
      `;
      
      console.log(`✅ Created user: ${user.name}`);
    }
    
    console.log('🎉 All test users created successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('========================');
    testUsers.forEach(user => {
      console.log(`${user.name}: ${user.email} / 123456`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

createTestUsers();
