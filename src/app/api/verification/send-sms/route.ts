import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

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

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in database
    await sql`
      INSERT INTO verification_codes (user_id, phone, code, expires_at, created_at)
      VALUES (${userId}, ${phone}, ${verificationCode}, NOW() + INTERVAL '10 minutes', NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        code = ${verificationCode},
        expires_at = NOW() + INTERVAL '10 minutes',
        created_at = NOW()
    `;

    // In a real app, you would send SMS here using Twilio or similar service
    // For now, we'll just log the code (in production, remove this)
    console.log(`Verification code for ${phone}: ${verificationCode}`);

    return NextResponse.json({
      message: 'Verification code sent successfully',
      // In development, return the code for testing
      code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    });

  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
