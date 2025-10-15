import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// HARDCODED DEVELOPMENT DATABASE URL - NO PRODUCTION FALLBACK
const databaseUrl = 'postgresql://neondb_owner:npg_0Usptraqf7om@ep-divine-haze-ag9kgfk7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🔗 Using DEVELOPMENT database:', databaseUrl.includes('ep-divine-haze') ? '✅ DEVELOPMENT' : '❌ NOT DEVELOPMENT');

// Initialize Neon connection
const sql = neon(databaseUrl);

// Initialize Drizzle with normalized schema
export const db = drizzle(sql, { schema });

// Export the raw SQL client for custom queries
export { sql };

// Export schema for use in API routes
export * from './schema';