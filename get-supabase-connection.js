/**
 * Get Supabase Database Connection Details
 * 
 * This script will help you get the correct connection string from your Supabase dashboard
 */

console.log('🔍 Supabase Connection Setup Helper');
console.log('');
console.log('To get your correct Supabase database connection string:');
console.log('');
console.log('1. Go to your Supabase project dashboard:');
console.log('   https://supabase.com/dashboard/project/ljyifqgoocsqlrsjfzrm');
console.log('');
console.log('2. Navigate to Settings → Database');
console.log('');
console.log('3. Look for "Connection string" section');
console.log('   - Choose "URI" format');
console.log('   - It should look like:');
console.log('     postgresql://postgres:[YOUR-PASSWORD]@[HOSTNAME]:5432/postgres');
console.log('');
console.log('4. The hostname might be different from what we tried.');
console.log('   Common formats:');
console.log('   - db.[project-ref].supabase.co');
console.log('   - [project-ref].supabase.co');
console.log('   - aws-0-[region].pooler.supabase.com (for pooler)');
console.log('');
console.log('5. Copy the exact connection string and update your .env.supabase file');
console.log('');
console.log('6. Then run the migration again');
console.log('');
console.log('Alternative: You can also try the "Session pooler" connection string');
console.log('which might be more reliable for migrations.');
console.log('');
console.log('Your current project details:');
console.log('- Project URL: https://ljyifqgoocsqlrsjfzrm.supabase.co');
console.log('- Project Reference: ljyifqgoocsqlrsjfzrm');
console.log('- Password: Wsxedcrfv!23');
