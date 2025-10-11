import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/twilio';

// Team member phone numbers that are verified in Twilio
const TEAM_PHONE_NUMBERS = {
  'team1': process.env.TEAM_PHONE_1 || process.env.TWILIO_PHONE_NUMBER,
  'team2': process.env.TEAM_PHONE_2,
  'team3': process.env.TEAM_PHONE_3,
  'default': process.env.TWILIO_PHONE_NUMBER,
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, senderId = 'default' } = body;

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

    // Get the sender phone number
    const senderNumber = TEAM_PHONE_NUMBERS[senderId as keyof typeof TEAM_PHONE_NUMBERS];
    
    if (!senderNumber) {
      return NextResponse.json(
        { error: `Invalid sender ID: ${senderId}. Available: ${Object.keys(TEAM_PHONE_NUMBERS).join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`📱 Sending SMS from team member ${senderId} (${senderNumber}) to ${phoneNumber}`);

    // Send SMS via Twilio using team member number
    const result = await TwilioService.sendVerificationSMSFromTeam(phoneNumber, senderNumber);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      verificationSid: result.verificationSid,
      senderId,
      senderNumber
    });

  } catch (error: any) {
    console.error('Error sending verification SMS from team member:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification SMS'
      },
      { status: 500 }
    );
  }
}
