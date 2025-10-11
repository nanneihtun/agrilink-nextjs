import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database with all related data
    const users = await sql`
      SELECT 
        u.id, u.email, u.name, u."passwordHash", u."userType", u."accountType",
        up.location, up.phone, up."profileImage",
        uv.verified, uv."phoneVerified", uv."verificationStatus",
        ur.rating, ur."totalReviews"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LEFT JOIN user_ratings ur ON u.id = ur."userId"
      WHERE u.email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        userType: user.userType,
        accountType: user.accountType
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      accountType: user.accountType,
      location: user.location,
      phone: user.phone,
      profileImage: user.profileImage,
      verified: user.verified,
      phoneVerified: user.phoneVerified,
      verificationStatus: user.verificationStatus,
      rating: parseFloat(user.rating) || 0,
      totalReviews: user.totalReviews || 0,
    };

    const response = NextResponse.json({
      user: userData,
      token,
      message: 'Login successful'
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
