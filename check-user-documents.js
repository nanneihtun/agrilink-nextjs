const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkUserDocuments() {
  try {
    console.log('Checking user documents for Hnin Ei Htun...');
    
    // Check users table for verification documents
    const userResult = await sql`
      SELECT id, name, "verificationDocuments"
      FROM users 
      WHERE name = 'Hnin Ei Htun'
    `;
    
    console.log('User verification documents:', userResult[0]?.verificationDocuments);
    
    if (userResult[0]?.verificationDocuments) {
      console.log('Parsed verification documents:', JSON.parse(userResult[0].verificationDocuments));
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

checkUserDocuments();
