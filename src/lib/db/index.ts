import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Environment-aware database URL selection
const getDatabaseUrl = () => {
  console.log('🔍 Environment variables check:');
  console.log('  DATABASE_URL_DEV:', process.env.DATABASE_URL_DEV ? '✅ SET' : '❌ NOT SET');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
  
  // Priority 1: Use DATABASE_URL_DEV if available (for development)
  if (process.env.DATABASE_URL_DEV) {
    console.log('🎯 Using DATABASE_URL_DEV');
    return process.env.DATABASE_URL_DEV;
  }
  
  // Priority 2: Use DATABASE_URL_STAGING if available and NODE_ENV is staging
  if (process.env.DATABASE_URL_STAGING && process.env.NODE_ENV === 'staging') {
    console.log('🎯 Using DATABASE_URL_STAGING');
    return process.env.DATABASE_URL_STAGING;
  }
  
  // Priority 3: Use main DATABASE_URL
  if (process.env.DATABASE_URL) {
    console.log('🎯 Using DATABASE_URL');
    return process.env.DATABASE_URL;
  }
  
  // Fallback: Development database (for local development)
  console.log('🎯 Using FALLBACK database');
  return 'postgresql://neondb_owner:npg_0Usptraqf7om@ep-divine-haze-ag9kgfk7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
};

const databaseUrl = getDatabaseUrl();

console.log('🔗 Database URL:', databaseUrl.includes('ep-divine-haze') ? '✅ DEVELOPMENT' : '✅ PRODUCTION/STAGING');

// Initialize Neon connection
const sql = neon(databaseUrl);

// Initialize Drizzle with normalized schema
export const db = drizzle(sql, { schema });

// Export the raw SQL client for custom queries
export { sql };

// Export schema for use in API routes
export * from './schema';