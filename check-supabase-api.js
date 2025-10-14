const https = require('https');

async function checkSupabaseProject() {
  console.log('🔍 Checking Supabase project via API...');
  
  const projectUrl = 'https://ljyifqgoocsqlrsjfzrm.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWlmcWdvb2NzcWxyc2pmenJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzA0MDIsImV4cCI6MjA3NTk0NjQwMn0.vSPem47sL8ohOhx5q9iOscgV7AvZI8NG8Be41hNxs3w';
  
  // Test the REST API endpoint
  const testUrl = `${projectUrl}/rest/v1/`;
  
  console.log(`Testing API endpoint: ${testUrl}`);
  
  return new Promise((resolve, reject) => {
    const req = https.get(testUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Supabase API is accessible!');
          console.log('Response:', data);
        } else {
          console.log(`❌ API returned status ${res.statusCode}`);
          console.log('Response:', data);
        }
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

checkSupabaseProject().then(() => {
  console.log('\n📋 Next steps:');
  console.log('1. If API is accessible, try different connection string formats');
  console.log('2. If API is not accessible, check project status in dashboard');
  console.log('3. Consider creating a new project if needed');
}).catch((error) => {
  console.error('Error:', error.message);
});
