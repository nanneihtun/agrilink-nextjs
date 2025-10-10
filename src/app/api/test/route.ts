import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    
    return NextResponse.json({
      message: 'Next.js API is working!',
      database: 'Connected to Neon',
      userCount: result[0].count,
      timestamp: new Date().toISOString(),
      performance: 'Optimized with Neon database!'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
