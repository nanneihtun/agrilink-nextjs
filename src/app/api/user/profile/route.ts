import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data
    const [userProfile] = await sql`
      SELECT 
        u.id, u.email, u.name, u."userType", u."accountType",
        up.location, up.phone, up."profileImage",
        uv.verified, uv."phoneVerified"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      WHERE u.id = ${user.userId}
    `;

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        userType: userProfile.userType,
        accountType: userProfile.accountType,
        location: userProfile.location,
        phone: userProfile.phone,
        profileImage: userProfile.profileImage,
        verified: userProfile.verified,
        phoneVerified: userProfile.phoneVerified
      }
    });

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profileImage, location, phone } = body;

    // Update user profile
    if (profileImage !== undefined) {
      // Check if user_profiles record exists
      const [existingProfile] = await sql`
        SELECT "userId" FROM user_profiles WHERE "userId" = ${user.userId}
      `;

      if (existingProfile) {
        // Update existing record
        await sql`
          UPDATE user_profiles 
          SET "profileImage" = ${profileImage}, "updatedAt" = NOW()
          WHERE "userId" = ${user.userId}
        `;
      } else {
        // Insert new record with default location
        await sql`
          INSERT INTO user_profiles ("userId", "profileImage", location, "updatedAt")
          VALUES (${user.userId}, ${profileImage}, '', NOW())
        `;
      }
    }

    if (location !== undefined) {
      await sql`
        INSERT INTO user_profiles ("userId", location, "updatedAt")
        VALUES (${user.userId}, ${location}, NOW())
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          location = ${location},
          "updatedAt" = NOW()
      `;
    }

    if (phone !== undefined) {
      await sql`
        INSERT INTO user_profiles ("userId", phone, "updatedAt")
        VALUES (${user.userId}, ${phone}, NOW())
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          phone = ${phone},
          "updatedAt" = NOW()
      `;
    }

    // Get updated user profile
    const [updatedProfile] = await sql`
      SELECT 
        u.id, u.email, u.name, u."userType", u."accountType",
        up.location, up.phone, up."profileImage",
        uv.verified, uv."phoneVerified"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      WHERE u.id = ${user.userId}
    `;

    return NextResponse.json({
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        userType: updatedProfile.userType,
        accountType: updatedProfile.accountType,
        location: updatedProfile.location,
        phone: updatedProfile.phone,
        profileImage: updatedProfile.profileImage,
        verified: updatedProfile.verified,
        phoneVerified: updatedProfile.phoneVerified
      },
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
