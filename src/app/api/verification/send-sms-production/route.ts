import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { twilioProductionService } from '@/lib/twilio-production';

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
      return NextResponse.json({ 
        message: 'Phone number is required' 
      }, { status: 400 });
    }

    // Send verification code using production Twilio service
    const result = await twilioProductionService.sendVerificationCode(userId, phone);

    if (!result.success) {
      return NextResponse.json({ 
        message: result.message 
      }, { 
        status: result.message.includes('wait a minute') ? 429 : 400 
      });
    }

    return NextResponse.json({
      message: result.message,
      success: true
    });

  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
