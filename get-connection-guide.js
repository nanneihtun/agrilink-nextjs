/**
 * Get the exact Supabase connection string
 */

console.log('🔍 Getting the correct Supabase connection string...');
console.log('');
console.log('Since the standard connection formats are not working, please follow these steps:');
console.log('');
console.log('1. Go to your Supabase project dashboard:');
console.log('   https://supabase.com/dashboard/project/ljyifqgoocsqlrsjfzrm');
console.log('');
console.log('2. Navigate to Settings → Database');
console.log('');
console.log('3. Scroll down to find "Connection string" section');
console.log('');
console.log('4. You should see different connection options:');
console.log('   - Direct connection');
console.log('   - Session pooler');
console.log('   - Transaction pooler');
console.log('');
console.log('5. Copy the EXACT connection string (URI format)');
console.log('   It should look something like:');
console.log('   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
console.log('   OR');
console.log('   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres');
console.log('');
console.log('6. Replace [password] with your actual password: Wsxedcrfv!23');
console.log('');
console.log('7. Update the SUPABASE_DATABASE_URL in your .env.supabase file');
console.log('');
console.log('8. Run the import again');
console.log('');
console.log('Common issues:');
console.log('- Make sure you\'re using the correct region (us-east-1, eu-west-1, etc.)');
console.log('- Ensure the project reference is correct: ljyifqgoocsqlrsjfzrm');
console.log('- Try both direct connection and pooler connection');
console.log('- Check if your IP is whitelisted in Supabase settings');
console.log('');
console.log('Your project details:');
console.log('- Project URL: https://ljyifqgoocsqlrsjfzrm.supabase.co');
console.log('- Project Reference: ljyifqgoocsqlrsjfzrm');
console.log('- Password: Wsxedcrfv!23');
console.log('');
console.log('Once you have the correct connection string, run:');
console.log('node import-to-supabase.js');
