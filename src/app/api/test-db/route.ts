import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Create connection with timeout
    const sql = neon(process.env.DATABASE_URL!, {
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
    
    // Test basic connection with timeout
    const result = await Promise.race([
      sql`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      )
    ]);
    
    console.log('Database connection successful:', result);
    
    return NextResponse.json({
      success: true,
      database_connected: true,
      message: 'Database test successful',
      result: result
    });

  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        database_url_present: !!process.env.DATABASE_URL,
        database_url_length: process.env.DATABASE_URL?.length || 0
      },
      { status: 500 }
    );
  }
}
