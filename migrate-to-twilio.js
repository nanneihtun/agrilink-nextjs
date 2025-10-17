#!/usr/bin/env node

/**
 * Migration script to prepare database for Twilio integration
 * while maintaining fallback support for development
 */

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrateToTwilio() {
  console.log('🚀 Starting Twilio migration...');

  try {
    // Check if verification_codes table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `;

    if (!tableExists[0].exists) {
      console.log('📋 Creating verification_codes table...');
      await sql`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL,
          phone TEXT NOT NULL,
          code TEXT NOT NULL,
          "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          twilio_sid TEXT,
          verification_method TEXT DEFAULT 'fallback',
          twilio_status TEXT,
          attempts INTEGER DEFAULT 0,
          last_attempt_at TIMESTAMP WITH TIME ZONE
        );
      `;
    }

    // Add Twilio columns to verification_codes
    console.log('🔧 Adding Twilio columns to verification_codes...');
    await sql`
      ALTER TABLE verification_codes 
      ADD COLUMN IF NOT EXISTS twilio_sid TEXT,
      ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'fallback',
      ADD COLUMN IF NOT EXISTS twilio_status TEXT,
      ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP WITH TIME ZONE;
    `;

    // Add indexes
    console.log('📊 Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_twilio_sid ON verification_codes(twilio_sid);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_method ON verification_codes(verification_method);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes("expiresAt");
    `;

    // Add phone verification tracking to user_verification
    console.log('📱 Adding phone verification tracking to user_verification...');
    await sql`
      ALTER TABLE user_verification 
      ADD COLUMN IF NOT EXISTS phone_verification_method TEXT DEFAULT 'fallback',
      ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS phone_verification_attempts INTEGER DEFAULT 0;
    `;

    // Create twilio_config table
    console.log('⚙️ Creating twilio_config table...');
    await sql`
      CREATE TABLE IF NOT EXISTS twilio_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        environment TEXT NOT NULL,
        account_sid TEXT,
        auth_token_encrypted TEXT,
        verify_service_sid TEXT,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Insert default development config
    await sql`
      INSERT INTO twilio_config (environment, is_active) 
      VALUES ('development', false)
      ON CONFLICT DO NOTHING;
    `;

    // Update existing verification records to use fallback method
    console.log('🔄 Updating existing verification records...');
    await sql`
      UPDATE verification_codes 
      SET verification_method = 'fallback'
      WHERE verification_method IS NULL;
    `;

    // Update existing user verification records
    await sql`
      UPDATE user_verification 
      SET phone_verification_method = 'fallback'
      WHERE phone_verification_method IS NULL;
    `;

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Install Twilio SDK: npm install twilio');
    console.log('2. Set environment variables in .env.local');
    console.log('3. Update your frontend to use the new API endpoints');
    console.log('4. Test with fallback mode first');
    console.log('5. Switch to Twilio for production');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToTwilio();
}

module.exports = { migrateToTwilio };
