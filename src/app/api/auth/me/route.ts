import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from database - simplified query
    const userData = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u."userType",
        u."accountType",
        u.location,
        u.phone,
        u.verified,
        u."phoneVerified",
        u."createdAt"
      FROM users u
      WHERE u.id = ${user.userId}
    `;

    if (userData.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const profile = userData[0];
    const userObj = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      userType: profile.userType,
      accountType: profile.accountType,
      location: profile.location,
      phone: profile.phone,
      verified: profile.verified,
      phoneVerified: profile.phoneVerified,
      businessVerified: profile.verified && profile.accountType === 'business',
      profileImage: '',
      storefrontImage: '',
      joinedDate: profile.createdAt,
      verificationStatus: 'not_started',
      verificationDocuments: {},
      phoneVerifiedAt: null,
      verifiedAt: null,
      agriLinkVerificationRequested: false,
      agriLinkVerificationRequestedAt: null,
      totalReviews: 0
    };

    return NextResponse.json({
      user: userObj,
      message: 'User data fetched successfully'
    });

  } catch (error) {
    console.error('Auth me API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
