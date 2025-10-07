const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateRealUsers() {
  try {
    console.log('🔄 Starting real user migration from Supabase to Neon...');
    
    // Read the Supabase export
    const exportData = JSON.parse(fs.readFileSync('../agrilink-marketplace/supabase-export.json', 'utf8'));
    const users = exportData.users;
    
    console.log(`📊 Found ${users.length} users in Supabase export`);
    
    // Clear existing users (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing users...');
    await sql`DELETE FROM user_ratings`;
    await sql`DELETE FROM user_verification`;
    await sql`DELETE FROM business_details`;
    await sql`DELETE FROM user_profiles`;
    await sql`DELETE FROM users`;
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Hash the password (using a default password for all users)
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        // Insert into users table
        const userId = user.id;
        
        await sql`
          INSERT INTO users (
            id, email, name, "userType", "accountType", "passwordHash", "createdAt", "updatedAt"
          ) VALUES (
            ${userId},
            ${user.email},
            ${user.name},
            ${user.user_type || 'farmer'},
            ${user.account_type || 'individual'},
            ${hashedPassword},
            ${user.created_at || new Date().toISOString()},
            ${user.updated_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            "userType" = EXCLUDED."userType",
            "accountType" = EXCLUDED."accountType",
            "passwordHash" = EXCLUDED."passwordHash",
            "updatedAt" = EXCLUDED."updatedAt"
        `;
        
        // Insert into user_profiles table
        await sql`
          INSERT INTO user_profiles (
            "userId", location, "profileImage", experience, phone
          ) VALUES (
            ${userId},
            ${user.location || 'Myanmar'},
            ${user.profile_image || null},
            ${user.experience || '1 year'},
            ${user.phone || null}
          )
          ON CONFLICT ("userId") DO UPDATE SET
            location = EXCLUDED.location,
            "profileImage" = EXCLUDED."profileImage",
            experience = EXCLUDED.experience,
            phone = EXCLUDED.phone
        `;
        
        // Insert into user_verification table
        await sql`
          INSERT INTO user_verification (
            "userId", verified, "phoneVerified", "verificationStatus", "verificationSubmitted"
          ) VALUES (
            ${userId},
            ${user.verified || false},
            ${user.phone_verified || false},
            ${user.verification_status || 'unverified'},
            ${user.verification_submitted || false}
          )
          ON CONFLICT ("userId") DO UPDATE SET
            verified = EXCLUDED.verified,
            "phoneVerified" = EXCLUDED."phoneVerified",
            "verificationStatus" = EXCLUDED."verificationStatus",
            "verificationSubmitted" = EXCLUDED."verificationSubmitted"
        `;
        
        // Insert into user_ratings table
        await sql`
          INSERT INTO user_ratings (
            "userId", rating, "totalReviews"
          ) VALUES (
            ${userId},
            ${user.rating || 0},
            ${user.total_reviews || 0}
          )
          ON CONFLICT ("userId") DO UPDATE SET
            rating = EXCLUDED.rating,
            "totalReviews" = EXCLUDED."totalReviews"
        `;
        
        // Insert into business_details table if it's a business account
        if (user.account_type === 'business' && user.business_name) {
          await sql`
            INSERT INTO business_details (
              "user_id", "business_name", "business_description"
            ) VALUES (
              ${userId},
              ${user.business_name},
              ${user.business_description || null}
            )
            ON CONFLICT ("user_id") DO UPDATE SET
              "business_name" = EXCLUDED."business_name",
              "business_description" = EXCLUDED."business_description"
          `;
        }
        
        successCount++;
        console.log(`✅ Migrated user: ${user.name} (${user.email})`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating user ${user.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    
    // Show some sample users
    console.log('\n📋 Sample migrated users:');
    const sampleUsers = await sql`
      SELECT u.email, u.name, u."userType", u."accountType", up.location, uv.verified
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LIMIT 5
    `;
    
    sampleUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.userType} ${user.accountType} - ${user.verified ? 'Verified' : 'Unverified'}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateRealUsers();
