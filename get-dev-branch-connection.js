#!/usr/bin/env node

/**
 * Get Development Branch Connection String
 * 
 * Helps you get the connection string for your existing development branch
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupDevBranch() {
  console.log('🎯 Setup Development Branch for Testing');
  console.log('=======================================\n');

  try {
    console.log('✅ I can see you already have a development branch in your Neon project!');
    console.log('');
    console.log('📋 To get your development branch connection string:');
    console.log('');
    console.log('1. Go to your Neon console: https://console.neon.tech/');
    console.log('2. Select your project');
    console.log('3. Click on the "development" branch in the branches list');
    console.log('4. Go to "Connection Details" or "Connect" tab');
    console.log('5. Copy the connection string for the development branch');
    console.log('');

    const devConnectionString = await askQuestion('🔗 Paste your development branch connection string here: ');
    
    if (!devConnectionString.includes('postgresql://')) {
      console.log('❌ Invalid connection string format. Please include the full postgresql:// URL.');
      process.exit(1);
    }

    // Create .env.dev file
    const envContent = `# Development Branch Configuration
# Created: ${new Date().toISOString()}
# Purpose: Testing database optimizations on development branch

# Development Branch Database (Neon)
DATABASE_URL="${devConnectionString}"

# Copy other environment variables from production
${fs.existsSync('.env.local') ? 
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(line => 
      !line.includes('DATABASE_URL') && 
      line.trim() !== '' && 
      !line.startsWith('#')
    ).join('\n') : ''}
`;

    fs.writeFileSync('.env.dev', envContent);
    console.log('✅ Created .env.dev file with development branch connection');

    // Test the connection
    console.log('\n🔍 Testing development branch connection...');
    
    try {
      const { neon } = require('@neondatabase/serverless');
      const { config } = require('dotenv');
      
      config({ path: '.env.dev' });
      const sql = neon(process.env.DATABASE_URL);
      
      // Test connection
      await sql`SELECT 1 as test`;
      console.log('✅ Development branch connection successful!');
      
      // Check tables
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      
      console.log(`📊 Found ${tables.length} tables in development branch`);
      
      if (tables.length > 0) {
        // Check data counts
        try {
          const users = await sql`SELECT COUNT(*) FROM users`;
          const products = await sql`SELECT COUNT(*) FROM products`;
          const conversations = await sql`SELECT COUNT(*) FROM conversations`;
          
          console.log('\n📈 Current data in development branch:');
          console.log(`  Users: ${users[0].count}`);
          console.log(`  Products: ${products[0].count}`);
          console.log(`  Conversations: ${conversations[0].count}`);
          
          console.log('\n🎯 Development branch is ready for testing!');
          console.log('\n📋 Next steps:');
          console.log('1. Test current performance: node check-indexes.js --env=.env.dev');
          console.log('2. Apply optimizations: node apply-indexes.js --env=.env.dev');
          console.log('3. Verify improvements: node check-indexes.js --env=.env.dev');
          console.log('4. Test application: DATABASE_URL=$(grep DATABASE_URL .env.dev | cut -d\'=\' -f2) npm run dev');
          
        } catch (error) {
          console.log('\n⚠️  Development branch has schema but no data');
          console.log('💡 You may want to sync data from production branch first');
          console.log('   (This is optional - you can test indexes on empty tables too)');
        }
      } else {
        console.log('\n⚠️  No tables found in development branch');
        console.log('💡 You may need to sync schema from production branch');
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      console.log('\n💡 Please check your connection string and try again.');
    }

    console.log('\n🚀 Benefits of using your development branch:');
    console.log('✅ Same project, isolated environment');
    console.log('✅ Easy to reset if needed');
    console.log('✅ Zero risk to production');
    console.log('✅ Perfect for testing optimizations');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
if (require.main === module) {
  setupDevBranch().catch(console.error);
}

module.exports = { setupDevBranch };
