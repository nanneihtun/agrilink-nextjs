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
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ message: 'Phone number and code are required' }, { status: 400 });
    }

    // Check verification code
    const codeResult = await sql`
      SELECT * FROM verification_codes 
      WHERE user_id = ${userId} 
      AND phone = ${phone} 
      AND code = ${code}
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (codeResult.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Update user verification status
    await sql`
      UPDATE user_verification 
      SET 
        "phoneVerified" = true,
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `;

    // Delete used verification code
    await sql`
      DELETE FROM verification_codes 
      WHERE user_id = ${userId} AND code = ${code}
    `;

    return NextResponse.json({
      message: 'Phone number verified successfully'
    });

  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
