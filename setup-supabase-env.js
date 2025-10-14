#!/usr/bin/env node

/**
 * Setup Supabase Environment Configuration
 * 
 * This script helps you set up your environment variables for Supabase
 */

const fs = require('fs');
const path = require('path');

function createEnvTemplate() {
  const envTemplate = `# Database URLs
# Replace these with your actual database URLs

# Neon Database (source)
NEON_DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# Supabase Database (target)
SUPABASE_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# Supabase Project Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Optional: Keep your existing DATABASE_URL for gradual migration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
`;

  const envPath = path.join(__dirname, '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Creating .env.supabase instead.');
    fs.writeFileSync('.env.supabase', envTemplate);
    console.log('✅ Created .env.supabase template');
  } else {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local template');
  }
}

function createSupabaseConfig() {
  const supabaseConfig = {
    dialect: "postgresql",
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
      url: "env(SUPABASE_DATABASE_URL)"
    }
  };

  fs.writeFileSync('drizzle.config.supabase.json', JSON.stringify(supabaseConfig, null, 2));
  console.log('✅ Created drizzle.config.supabase.json');
}

function main() {
  console.log('🔧 Setting up Supabase environment configuration...\n');
  
  createEnvTemplate();
  createSupabaseConfig();
  
  console.log('\n📋 Next steps:');
  console.log('1. Get your Supabase project URL and keys from https://supabase.com/dashboard');
  console.log('2. Update the .env.local or .env.supabase file with your actual values');
  console.log('3. Run the migration script: node migrate-to-supabase.js');
  console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard');
  console.log('📖 Supabase Docs: https://supabase.com/docs');
}

if (require.main === module) {
  main();
}

module.exports = { createEnvTemplate, createSupabaseConfig };
