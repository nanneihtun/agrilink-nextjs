import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('✅ Verify email change API called');
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log('🔐 Token received:', !!token);
    
    if (!token) {
      console.log('❌ No verification token provided');
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
    }

    // Find user with this email change verification token
    let users;
    try {
      console.log('🔍 Querying database for email change token');
      users = await sql`
        SELECT id, email, name, "emailVerificationToken", "emailVerificationExpires", "pendingEmail"
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
      currentEmail: user.email, 
      pendingEmail: user.pendingEmail,
      name: user.name,
      tokenExpires: user.emailVerificationExpires 
    });

    // Check if there's a pending email
    if (!user.pendingEmail) {
      console.log('❌ No pending email found');
      return NextResponse.json({ message: 'No pending email change found' }, { status: 400 });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(user.emailVerificationExpires);
    
    console.log('⏰ Token expires at:', expiresAt.toISOString());
    console.log('⏰ Current time:', now.toISOString());
    
    if (now > expiresAt) {
      console.log('❌ Email change verification token has expired');
      return NextResponse.json({ message: 'Email change verification token has expired' }, { status: 400 });
    }

    // Check if pending email is still available
    try {
      console.log('🔍 Checking if pending email is still available');
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${user.pendingEmail}
      `;
      
      if (existingUsers.length > 0) {
        console.log('❌ Pending email is no longer available');
        return NextResponse.json({ message: 'The email address is no longer available' }, { status: 400 });
      }
    } catch (error) {
      console.error('❌ Error checking pending email availability:', error);
      return NextResponse.json({ message: 'Failed to verify email availability' }, { status: 500 });
    }

    // Update the email address
    try {
      console.log('✅ Updating email address from', user.email, 'to', user.pendingEmail);
      await sql`
        UPDATE users 
        SET email = ${user.pendingEmail},
            "pendingEmail" = NULL,
            "emailVerificationToken" = NULL,
            "emailVerificationExpires" = NULL,
            "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
      console.log('✅ Email address updated successfully');
    } catch (error) {
      console.error('❌ Error updating email address:', error);
      return NextResponse.json({ message: 'Failed to update email address' }, { status: 500 });
    }

    console.log('🎉 Email change verification completed successfully');
    return NextResponse.json({ 
      message: 'Email address updated successfully',
      user: {
        id: user.id,
        email: user.pendingEmail,
        name: user.name,
        emailVerified: true
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Verify email change API error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
