import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Environment-aware database URL selection
const getDatabaseUrl = () => {
  // Check for environment-specific database URLs
  if (process.env.DATABASE_URL_DEV && process.env.NODE_ENV === 'development') {
    return process.env.DATABASE_URL_DEV;
  }
  
  if (process.env.DATABASE_URL_STAGING && process.env.NODE_ENV === 'staging') {
    return process.env.DATABASE_URL_STAGING;
  }
  
  // Fallback to main DATABASE_URL
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Development fallback (for local development)
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