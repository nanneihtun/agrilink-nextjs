import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, code, verificationSid } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    // For demo purposes, accept any 6-digit code
    const isValidCode = /^\d{6}$/.test(code);
    
    if (!isValidCode) {
      return NextResponse.json(
        { error: 'Invalid verification code format. Please enter a 6-digit code.' },
        { status: 400 }
      );
    }

    console.log(`✅ Phone number ${phoneNumber} verified with code: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber
    });

  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return NextResponse.json(
      { error: 'Failed to verify SMS code' },
      { status: 500 }
    );
  }
}
