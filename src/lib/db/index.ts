import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle with schema
export const db = drizzle(sql, { schema });

// Export the raw SQL client for custom queries
export { sql };

// Export schema for use in API routes
export * from './schema';