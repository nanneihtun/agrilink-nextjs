import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    // Create user in database
    const newUsers = await sql`
      INSERT INTO users (email, name, "passwordHash", "userType", "accountType", "createdAt", "updatedAt")
      VALUES (${email}, ${name}, ${passwordHash}, ${userType}, ${accountType}, NOW(), NOW())
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
        INSERT INTO business_details ("userId", "createdAt", "updatedAt")
        VALUES (${newUser.id}, NOW(), NOW())
      `;
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
      verified: false,
      phoneVerified: false,
      verificationStatus: 'not_started',
      rating: 0,
      totalReviews: 0,
    };

    const response = NextResponse.json({
      user: userData,
      token,
      message: 'Registration successful'
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
