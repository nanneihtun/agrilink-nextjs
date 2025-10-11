import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database_url_set: !!process.env.DATABASE_URL,
      jwt_secret_set: !!process.env.JWT_SECRET,
      resend_api_set: !!process.env.RESEND_API_KEY
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
