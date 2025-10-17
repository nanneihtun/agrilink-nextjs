import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('✅ Verify email change API called');
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: 'No verification token provided' }, { status: 400 });
    }

    // Find user with this email change token
    const users = await sql`
      SELECT id, email, name, "pendingEmail", "emailVerificationExpires"
      FROM users 
      WHERE "emailVerificationToken" = ${token}
    `;

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid verification token' }, { status: 400 });
    }

    const user = users[0];

    if (!user.pendingEmail) {
      return NextResponse.json({ message: 'No pending email change found' }, { status: 400 });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(user.emailVerificationExpires);
    
    if (now > expiresAt) {
      // Clear expired token
      await sql`
        UPDATE users 
        SET 
          "emailVerificationToken" = NULL,
          "emailVerificationExpires" = NULL,
          "pendingEmail" = NULL,
          "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
      
      return NextResponse.json({ message: 'Verification token has expired' }, { status: 400 });
    }

    // Update the email and clear the verification data
    await sql`
      UPDATE users 
      SET 
        email = ${user.pendingEmail},
        "emailVerificationToken" = NULL,
        "emailVerificationExpires" = NULL,
        "pendingEmail" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;

    console.log('✅ Email changed successfully for user:', user.id, 'from', user.email, 'to', user.pendingEmail);

    return NextResponse.json({
      message: 'Email address updated successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.pendingEmail,
      },
    });

  } catch (error: any) {
    console.error('❌ Email change verification error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}