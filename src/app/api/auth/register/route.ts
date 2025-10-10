import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      userType, 
      accountType, 
      location 
    } = await request.json();

    if (!email || !password || !name || !userType || !accountType || !location) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomUUID();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Create user in database
    const newUsers = await sql`
      INSERT INTO users (email, name, "passwordHash", "userType", "accountType", email_verification_token, email_verification_expires, "createdAt", "updatedAt")
      VALUES (${email}, ${name}, ${passwordHash}, ${userType}, ${accountType}, ${emailVerificationToken}, ${verificationExpires.toISOString()}, NOW(), NOW())
      RETURNING id, email, name, "userType", "accountType", "createdAt"
    `;

    const newUser = newUsers[0];

    // Create user profile
    await sql`
      INSERT INTO user_profiles ("userId", location, "createdAt", "updatedAt")
      VALUES (${newUser.id}, ${location}, NOW(), NOW())
    `;

    // Create verification record
    await sql`
      INSERT INTO user_verification ("userId", verified, "phoneVerified", "verificationStatus", "createdAt", "updatedAt")
      VALUES (${newUser.id}, false, false, 'not_started', NOW(), NOW())
    `;

    // Create ratings record
    await sql`
      INSERT INTO user_ratings ("userId", rating, "totalReviews", "createdAt", "updatedAt")
      VALUES (${newUser.id}, 0, 0, NOW(), NOW())
    `;

    // Create business details if business account
    if (accountType === 'business') {
      await sql`
        INSERT INTO business_details (user_id, created_at, updated_at)
        VALUES (${newUser.id}, NOW(), NOW())
      `;
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    
    console.log('📧 Sending verification email to:', newUser.email);
    console.log('🔗 VERIFICATION URL FOR TESTING:', verificationUrl);
    
    if (process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Attempting to send verification email...');
        console.log('📧 Email details:', {
          from: 'AgriLink <onboarding@resend.dev>',
          to: newUser.email,
          subject: 'Verify Your AgriLink Account'
        });
        
        const emailResult = await resend.emails.send({
          from: 'AgriLink <onboarding@resend.dev>',
          to: [newUser.email],
          subject: 'Verify Your AgriLink Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Welcome to AgriLink!</h2>
              <p>Hello ${newUser.name},</p>
              <p>Thank you for joining AgriLink! To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p style="color: #666; font-size: 14px;">
                This link will expire in 24 hours. If you didn't create an account with AgriLink, you can safely ignore this email.
              </p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from AgriLink. If you have any questions, please contact our support team.
              </p>
            </div>
          `
        });
        
        console.log('✅ Verification email sent successfully!');
        console.log('📧 Resend API response:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        console.error('❌ Email error details:', JSON.stringify(emailError, null, 2));
        // Don't fail registration if email sending fails
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured, skipping verification email');
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        userType: newUser.userType,
        accountType: newUser.accountType
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user data
    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      userType: newUser.userType,
      accountType: newUser.accountType,
      location,
      emailVerified: false,
      verified: false,
      phoneVerified: false,
      verificationStatus: 'not_started',
      rating: 0,
      totalReviews: 0,
    };

    const response = NextResponse.json({
      user: userData,
      token,
      message: 'Registration successful. Please check your email to verify your account.',
      verificationEmailSent: true
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
