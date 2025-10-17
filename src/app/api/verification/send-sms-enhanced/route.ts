import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { twilioService } from '@/lib/twilio-service';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ 
        message: 'Invalid phone number format. Please include country code (e.g., +1234567890)' 
      }, { status: 400 });
    }

    // Check for recent verification attempts (rate limiting)
    const recentAttempts = await sql`
      SELECT COUNT(*) as count
      FROM verification_codes 
      WHERE "userId" = ${userId} 
      AND "createdAt" > NOW() - INTERVAL '1 minute'
    `;

    if (recentAttempts[0].count > 0) {
      return NextResponse.json({ 
        message: 'Please wait a minute before requesting another verification code' 
      }, { status: 429 });
    }

    // Send verification code using the service
    const result = await twilioService.sendVerificationCode(userId, phone);

    if (!result.success) {
      return NextResponse.json({ 
        message: result.error || 'Failed to send verification code' 
      }, { status: 500 });
    }

    const response: any = {
      message: 'Verification code sent successfully',
      method: result.method
    };

    // In development mode, include the code for testing
    if (result.method === 'fallback' && process.env.NODE_ENV === 'development') {
      response.code = result.code;
      response.fallbackCode = process.env.TWILIO_FALLBACK_CODE || '123456';
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
