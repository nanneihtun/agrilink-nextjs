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
    const updates = body;

    // Update user data in database
    const updateData: any = {
      "updatedAt": new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.userType !== undefined) updateData.userType = updates.userType;
    if (updates.accountType !== undefined) updateData.accountType = updates.accountType;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.verified !== undefined) updateData.verified = updates.verified;
    if (updates.phoneVerified !== undefined) updateData.phoneVerified = updates.phoneVerified;

    // Update main users table
    await sql`
      UPDATE users
      SET ${sql(updateData)}
      WHERE id = ${user.userId}
    `;

    // Update user_profiles table if profile-specific fields are provided
    if (updates.profileImage !== undefined || updates.storefrontImage !== undefined) {
      const profileUpdates: any = {
        updatedAt: new Date().toISOString()
      };
      
      if (updates.profileImage !== undefined) profileUpdates.profileImage = updates.profileImage;
      if (updates.storefrontImage !== undefined) profileUpdates.storefrontImage = updates.storefrontImage;

      await sql`
        UPDATE user_profiles
        SET ${sql(profileUpdates)}
        WHERE userId = ${user.userId}
      `;
    }

    // Update user_verification table if verification fields are provided
    if (updates.verificationStatus !== undefined || updates.verificationDocuments !== undefined) {
      const verificationUpdates: any = {
        updatedAt: new Date().toISOString()
      };
      
      if (updates.verificationStatus !== undefined) verificationUpdates.verificationStatus = updates.verificationStatus;
      if (updates.verificationDocuments !== undefined) verificationUpdates.verificationDocuments = JSON.stringify(updates.verificationDocuments);
      if (updates.agriLinkVerificationRequested !== undefined) verificationUpdates.verificationSubmitted = updates.agriLinkVerificationRequested;

      await sql`
        UPDATE user_verification
        SET ${sql(verificationUpdates)}
        WHERE userId = ${user.userId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
