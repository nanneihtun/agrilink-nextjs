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
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ 
        message: 'Phone number and code are required' 
      }, { status: 400 });
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ 
        message: 'Invalid verification code format. Please enter a 6-digit code.' 
      }, { status: 400 });
    }

    // Verify the code using the service
    const result = await twilioService.verifyCode(userId, phone, code);

    if (!result.success) {
      return NextResponse.json({ 
        message: result.error || 'Invalid or expired verification code' 
      }, { status: 400 });
    }

    // Update user verification status
    await sql`
      UPDATE user_verification 
      SET 
        "phoneVerified" = true,
        phone_verification_method = ${result.method},
        phone_verified_at = NOW(),
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `;

    // Clean up used verification codes
    await sql`
      DELETE FROM verification_codes 
      WHERE "userId" = ${userId} 
      AND phone = ${phone}
      AND twilio_status = 'approved'
    `;

    console.log(`✅ Phone verification successful for user ${userId} using ${result.method}`);

    return NextResponse.json({
      message: 'Phone number verified successfully',
      method: result.method
    });

  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
