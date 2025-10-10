import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Update email API called');
    
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

    // Parse request body
    const { newEmail, currentPassword } = await request.json();
    console.log('📝 Request body received:', { 
      newEmail: newEmail,
      hasCurrentPassword: !!currentPassword
    });

    if (!newEmail || !currentPassword) {
      return NextResponse.json({ message: 'New email and current password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }

    // Get user from database
    let users;
    try {
      console.log('🔍 Querying database for userId:', userId);
      users = await sql`
        SELECT id, email, "passwordHash", name
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
    console.log('👤 User found:', { id: user.id, currentEmail: user.email, newEmail });

    // Check if new email is the same as current email
    if (user.email === newEmail) {
      console.log('❌ New email is the same as current email');
      return NextResponse.json({ message: 'New email must be different from current email' }, { status: 400 });
    }

    // Check if new email already exists
    try {
      console.log('🔍 Checking if new email already exists');
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${newEmail}
      `;
      
      if (existingUsers.length > 0) {
        console.log('❌ Email already exists');
        return NextResponse.json({ message: 'This email address is already in use' }, { status: 400 });
      }
    } catch (error) {
      console.error('❌ Error checking email existence:', error);
      return NextResponse.json({ message: 'Failed to check email availability' }, { status: 500 });
    }

    // Verify current password
    console.log('🔐 Verifying current password...');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    console.log('🔐 Password verification result:', isCurrentPasswordValid);
    
    if (!isCurrentPasswordValid) {
      console.log('❌ Current password is incorrect');
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
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
        message: 'Demo accounts cannot change email addresses',
        isDemoAccount: true 
      }, { status: 400 });
    }

    // Generate email change verification token
    const emailChangeToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('🔐 Generated email change token:', emailChangeToken);

    // Save email change token and new email to database
    try {
      console.log('💾 Saving email change request to database...');
      await sql`
        UPDATE users 
        SET "emailVerificationToken" = ${emailChangeToken}, 
            "emailVerificationExpires" = ${expiresAt.toISOString()},
            "pendingEmail" = ${newEmail},
            "updatedAt" = NOW()
        WHERE id = ${userId}
      `;
      console.log('💾 Email change request saved successfully');
    } catch (error) {
      console.error('❌ Error saving email change request:', error);
      return NextResponse.json({ message: 'Failed to save email change request' }, { status: 500 });
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not found, skipping email sending');
      return NextResponse.json({ 
        message: 'Email change verification sent (email sending disabled)',
        verificationToken: emailChangeToken // For testing purposes
      }, { status: 200 });
    }

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email-change?token=${emailChangeToken}`;
    
    console.log('📧 Sending email change verification email to:', newEmail);

    // Send verification email to new email address
    try {
      const { data, error } = await resend.emails.send({
        from: 'AgriLink <onboarding@resend.dev>',
        to: [newEmail],
        subject: 'Confirm your new email address - AgriLink',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Email Change Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested to change your email address on AgriLink from <strong>${user.email}</strong> to <strong>${newEmail}</strong>.</p>
            <p>To confirm this change, please click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Email Change
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p><strong>If you didn't request this change, please ignore this email and your account will remain secure.</strong></p>
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

      console.log('✅ Email change verification sent successfully:', data?.id);
      return NextResponse.json({ 
        message: 'Verification email sent to your new email address',
        emailId: data?.id,
        newEmail: newEmail
      }, { status: 200 });

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Update email API error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
