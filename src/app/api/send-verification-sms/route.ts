import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number with country code (e.g., +959123456789)' },
        { status: 400 }
      );
    }

    // Send SMS via Twilio
    const result = await TwilioService.sendVerificationSMS(phoneNumber);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      verificationSid: result.verificationSid
    });

  } catch (error: any) {
    console.error('Error sending verification SMS:', error);
    
    // Return proper JSON error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to send verification SMS';
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
