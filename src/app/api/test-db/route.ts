import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Debug environment variables
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };
    
    console.log('Environment variables:', envVars);
    
    // Check if DATABASE_URL is properly set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        envVars: envVars
      }, { status: 500 });
    }
    
    if (process.env.DATABASE_URL === '$DATABASE_URL') {
      return NextResponse.json({
        error: 'DATABASE_URL is not resolved - still showing placeholder',
        envVars: envVars
      }, { status: 500 });
    }
    
    // Create connection with timeout
    const sql = neon(process.env.DATABASE_URL, {
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
      result: result,
      envVars: envVars
    });

  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        envVars: {
          DATABASE_URL: process.env.DATABASE_URL,
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          VERCEL_ENV: process.env.VERCEL_ENV,
        }
      },
      { status: 500 }
    );
  }
}
