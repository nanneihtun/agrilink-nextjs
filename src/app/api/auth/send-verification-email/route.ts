import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send verification email API called');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('📝 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    let userId: string;
    try {
      console.log('🔑 JWT_SECRET present:', !!process.env.JWT_SECRET);
      
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET environment variable is not set');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      userId = decoded.userId;
      console.log('✅ JWT verified, userId:', userId);
      
      if (!userId) {
        console.log('❌ No userId in token payload');
        return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
      }
    } catch (error) {
      console.error('❌ JWT verification error:', error);
      return NextResponse.json({ 
        message: error instanceof jwt.JsonWebTokenError ? 'Invalid or expired token' : 'Token verification failed' 
      }, { status: 401 });
    }

    // Get user from database
    let users;
    try {
      console.log('🔍 Querying database for userId:', userId);
      users = await sql`
        SELECT id, email, name, email_verified, "emailVerificationToken", "emailVerificationExpires"
        FROM users WHERE id = ${userId}
      `;
      console.log('📊 Database query result:', users.length, 'users found');
    } catch (error) {
      console.error('❌ Database query error:', error);
      return NextResponse.json({ message: 'Database connection error' }, { status: 500 });
    }

    if (users.length === 0) {
      console.log('❌ User not found in database');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    console.log('👤 User found:', { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      emailVerified: user.email_verified 
    });

    // Check if user is already verified
    if (user.email_verified) {
      console.log('✅ User email is already verified');
      return NextResponse.json({ 
        message: 'Email is already verified',
        alreadyVerified: true 
      }, { status: 200 });
    }

    // Check if user is a demo account
    const isDemoAccount = user.email.includes('farmerindi') || 
                         user.email.includes('farmerbiz') ||
                         user.email.includes('traderindi') ||
                         user.email.includes('traderbiz') ||
                         user.email.includes('buyerindi') ||
                         user.email.includes('buyerbiz');

    if (isDemoAccount) {
      console.log('🎭 Demo account detected, skipping email verification');
      return NextResponse.json({ 
        message: 'Demo accounts do not require email verification',
        isDemoAccount: true 
      }, { status: 200 });
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('🔐 Generated verification token:', verificationToken);

    // Save verification token to database
    try {
      console.log('💾 Saving verification token to database...');
      await sql`
        UPDATE users 
        SET "emailVerificationToken" = ${verificationToken}, 
            "emailVerificationExpires" = ${expiresAt.toISOString()},
            "updatedAt" = NOW()
        WHERE id = ${userId}
      `;
      console.log('💾 Verification token saved successfully');
    } catch (error) {
      console.error('❌ Error saving verification token:', error);
      return NextResponse.json({ message: 'Failed to save verification token' }, { status: 500 });
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not found, skipping email sending');
      return NextResponse.json({ 
        message: 'Email verification token generated (email sending disabled)',
        verificationToken: verificationToken // For testing purposes
      }, { status: 200 });
    }

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    console.log('📧 Sending verification email to:', user.email);

    // Send verification email
    try {
      const { data, error } = await resend.emails.send({
        from: 'AgriLink <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Verify your AgriLink account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Welcome to AgriLink!</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for joining AgriLink! To complete your account setup, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with AgriLink, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The AgriLink Team
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 });
      }

      console.log('✅ Verification email sent successfully:', data?.id);
      return NextResponse.json({ 
        message: 'Verification email sent successfully',
        emailId: data?.id 
      }, { status: 200 });

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Send verification email API error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
