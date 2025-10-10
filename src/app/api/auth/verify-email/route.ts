import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('✅ Verify email API called');
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log('🔐 Token received:', !!token);
    
    if (!token) {
      console.log('❌ No verification token provided');
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
    }

    // Find user with this verification token
    let users;
    try {
      console.log('🔍 Querying database for verification token');
      users = await sql`
        SELECT id, email, name, email_verified, "emailVerificationToken", "emailVerificationExpires"
        FROM users 
        WHERE "emailVerificationToken" = ${token}
      `;
      console.log('📊 Database query result:', users.length, 'users found');
    } catch (error) {
      console.error('❌ Database query error:', error);
      return NextResponse.json({ message: 'Database connection error' }, { status: 500 });
    }

    if (users.length === 0) {
      console.log('❌ Invalid verification token');
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
    }

    const user = users[0];
    console.log('👤 User found:', { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      emailVerified: user.email_verified,
      tokenExpires: user.emailVerificationExpires 
    });

    // Check if email is already verified
    if (user.email_verified) {
      console.log('✅ Email is already verified');
      return NextResponse.json({ 
        message: 'Email is already verified',
        alreadyVerified: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }, { status: 200 });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(user.emailVerificationExpires);
    
    console.log('⏰ Token expires at:', expiresAt.toISOString());
    console.log('⏰ Current time:', now.toISOString());
    
    if (now > expiresAt) {
      console.log('❌ Verification token has expired');
      return NextResponse.json({ message: 'Verification token has expired' }, { status: 400 });
    }

    // Verify the email
    try {
      console.log('✅ Verifying email for user:', user.email);
      await sql`
        UPDATE users 
        SET email_verified = TRUE, 
            "emailVerificationToken" = NULL,
            "emailVerificationExpires" = NULL,
            "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
      console.log('✅ Email verified successfully');
    } catch (error) {
      console.error('❌ Error verifying email:', error);
      return NextResponse.json({ message: 'Failed to verify email' }, { status: 500 });
    }

    console.log('🎉 Email verification completed successfully');
    return NextResponse.json({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Verify email API error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
