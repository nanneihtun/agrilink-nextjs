#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * 
 * Helps set up a Neon development database for testing optimizations
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

async function setupDevEnvironment() {
  console.log('🚀 Neon Development Database Setup');
  console.log('=====================================\n');

  try {
    // Check if .env.dev already exists
    if (fs.existsSync('.env.dev')) {
      const overwrite = await askQuestion('⚠️  .env.dev already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled.');
        process.exit(0);
      }
    }

    // Get Neon dev database connection string
    console.log('📋 Please provide your Neon development database details:');
    console.log('');
    console.log('1. Go to https://console.neon.tech/');
    console.log('2. Create a new project (e.g., "agrilink-dev")');
    console.log('3. Copy the connection string');
    console.log('');

    const devDatabaseUrl = await askQuestion('🔗 Enter your Neon dev database connection string: ');
    
    if (!devDatabaseUrl.includes('postgresql://')) {
      console.log('❌ Invalid connection string format. Please include the full postgresql:// URL.');
      process.exit(1);
    }

    // Read current .env.local to copy other variables
    let envContent = '';
    if (fs.existsSync('.env.local')) {
      envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Create .env.dev content
    const devEnvContent = `# Development Environment Configuration
# Created: ${new Date().toISOString()}
# Purpose: Testing database optimizations

# Development Database (Neon)
DATABASE_URL="${devDatabaseUrl}"

# Copy other environment variables from production
${envContent.split('\n').filter(line => 
  !line.includes('DATABASE_URL') && 
  line.trim() !== '' && 
  !line.startsWith('#')
).join('\n')}
`;

    // Write .env.dev file
    fs.writeFileSync('.env.dev', devEnvContent);
    console.log('✅ Created .env.dev file');

    // Create development database verification script
    const verifyScript = `#!/usr/bin/env node
const { neon } = require('@neondatabase/serverless');
const { config } = require('dotenv');

config({ path: '.env.dev' });

async function verifyDevDatabase() {
  console.log('🔍 Verifying Development Database Connection...\\n');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Test connection
    await sql\`SELECT 1 as test\`;
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await sql\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    \`;
    
    console.log(\`📊 Found \${tables.length} tables:\`);
    tables.forEach(table => console.log(\`  • \${table.table_name}\`));
    
    if (tables.length === 0) {
      console.log('\\n⚠️  No tables found. You may need to import data:');
      console.log('   export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"');
      console.log('   psql -d "\$DATABASE_URL" -f dump.sql');
    } else {
      // Check data counts
      const users = await sql\`SELECT COUNT(*) FROM users\`;
      const products = await sql\`SELECT COUNT(*) FROM products\`;
      
      console.log(\`\\n📈 Data counts:\`);
      console.log(\`  Users: \${users[0].count}\`);
      console.log(\`  Products: \${products[0].count}\`);
    }
    
    console.log('\\n🎯 Development database is ready for testing!');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.log('\\n💡 Please check your connection string and try again.');
  }
}

verifyDevDatabase();
`;

    fs.writeFileSync('verify-dev-db.js', verifyScript);
    fs.chmodSync('verify-dev-db.js', '755');
    console.log('✅ Created verify-dev-db.js script');

    console.log('\n🎉 Development environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify database connection: node verify-dev-db.js');
    console.log('2. Import production data: psql -d "$(grep DATABASE_URL .env.dev | cut -d\'=\' -f2)" -f dump.sql');
    console.log('3. Test indexes: node apply-indexes.js --env=.env.dev');
    console.log('4. Verify performance: node check-indexes.js --env=.env.dev');

    console.log('\n💡 Development Database Benefits:');
    console.log('✅ Safe testing environment');
    console.log('✅ Identical to production setup');
    console.log('✅ Easy performance comparison');
    console.log('✅ Zero risk to production data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
if (require.main === module) {
  setupDevEnvironment().catch(console.error);
}

module.exports = { setupDevEnvironment };
