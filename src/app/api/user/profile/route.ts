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
  } catch (error: any) {
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
    console.log('🔍 Querying database for userId:', user.userId);
    
    const [userProfile] = await sql`
      SELECT 
        u.id, u.email, u.name, u."userType", u."accountType",
        u."businessName", u."businessDescription",
        u."verificationDocuments", u."rejectedDocuments",
        u."agriLinkVerificationRequested", u."agriLinkVerificationRequestedAt",
        up.location, up.phone, up."profileImage",
        uv.verified, uv."phoneVerified", uv."verificationStatus", uv."verificationSubmitted"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      WHERE u.id = ${user.userId}
    `;
    
    console.log('🔍 Database query completed. Result:', !!userProfile);
    if (userProfile) {
      console.log('📊 User verification status from DB:', {
        verified: userProfile.verified,
        phoneVerified: userProfile.phoneVerified,
        verificationStatus: userProfile.verificationStatus,
        verificationSubmitted: userProfile.verificationSubmitted
      });
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('🔍 API /user/profile - Raw database result:', {
      id: userProfile.id,
      location: userProfile.location,
      phone: userProfile.phone,
      name: userProfile.name
    });
    
    // Check if user_profiles record exists separately
    const [profileRecord] = await sql`
      SELECT * FROM user_profiles WHERE "userId" = ${user.userId}
    `;
    console.log('🔍 Separate user_profiles query result:', profileRecord);

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
        phoneVerified: userProfile.phoneVerified,
        businessName: userProfile.businessName,
        businessDescription: userProfile.businessDescription,
        businessLicenseNumber: userProfile.businessLicenseNumber,
        verificationDocuments: userProfile.verificationDocuments,
        rejectedDocuments: userProfile.rejectedDocuments,
        agriLinkVerificationRequested: userProfile.agriLinkVerificationRequested,
        agriLinkVerificationRequestedAt: userProfile.agriLinkVerificationRequestedAt,
        verificationStatus: userProfile.verificationStatus,
        verificationSubmitted: userProfile.verificationSubmitted
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
    const { 
      profileImage, 
      location, 
      phone, 
      phoneVerified,
      business_name,
      business_description,
      business_license_number,
      business_details_completed,
      verificationDocuments,
      agriLinkVerificationRequested,
      agriLinkVerificationRequestedAt,
      verificationStatus,
      verificationSubmittedAt
    } = body;

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
      // Check if user_profiles record exists
      const [existingProfile] = await sql`
        SELECT "userId" FROM user_profiles WHERE "userId" = ${user.userId}
      `;

      if (existingProfile) {
        // Update existing record
        await sql`
          UPDATE user_profiles 
          SET phone = ${phone}, "updatedAt" = NOW()
          WHERE "userId" = ${user.userId}
        `;
      } else {
        // Insert new record with default location
        await sql`
          INSERT INTO user_profiles ("userId", phone, location, "updatedAt")
          VALUES (${user.userId}, ${phone}, '', NOW())
        `;
      }
    }

    // Update phone verification status if phone was verified
    if (phone !== undefined || phoneVerified === true) {
      await sql`
        INSERT INTO user_verification ("userId", "phoneVerified", "updatedAt")
        VALUES (${user.userId}, true, NOW())
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          "phoneVerified" = true,
          "updatedAt" = NOW()
      `;
    }

    // Update business details if provided
    if (business_name !== undefined || business_description !== undefined || business_license_number !== undefined) {
      await sql`
        UPDATE users 
        SET 
          "businessName" = COALESCE(${business_name}, "businessName"),
          "businessDescription" = COALESCE(${business_description}, "businessDescription"),
          "businessLicenseNumber" = COALESCE(${business_license_number}, "businessLicenseNumber"),
          "updatedAt" = NOW()
        WHERE id = ${user.userId}
      `;
    }

    // Update verification documents if provided
    if (verificationDocuments !== undefined) {
      await sql`
        UPDATE users 
        SET 
          "verificationDocuments" = ${JSON.stringify(verificationDocuments)},
          "updatedAt" = NOW()
        WHERE id = ${user.userId}
      `;
    }

    // Update AgriLink verification request fields if provided
    if (agriLinkVerificationRequested !== undefined || agriLinkVerificationRequestedAt !== undefined) {
      console.log('🔄 Updating AgriLink verification request fields...');
      
      const updateFields = [];
      const updateValues = [];
      
      if (agriLinkVerificationRequested !== undefined) {
        updateFields.push('"agriLinkVerificationRequested" = $' + (updateValues.length + 1));
        updateValues.push(agriLinkVerificationRequested);
      }
      
      if (agriLinkVerificationRequestedAt !== undefined) {
        updateFields.push('"agriLinkVerificationRequestedAt" = $' + (updateValues.length + 1));
        updateValues.push(agriLinkVerificationRequestedAt);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('"updatedAt" = NOW()');
        updateValues.push(user.userId);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length}`;
        await sql.unsafe(updateQuery, updateValues);
        console.log('✅ AgriLink verification request fields updated');
      }
    }

    // Update verification status fields in user_verification table if provided
    if (verificationStatus !== undefined) {
      console.log('🔄 Updating user verification status...');
      
      const updateFields = [];
      const updateValues = [];
      
      if (verificationStatus !== undefined) {
        updateFields.push('"verificationStatus" = $' + (updateValues.length + 1));
        updateValues.push(verificationStatus);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('"updatedAt" = NOW()');
        updateValues.push(user.userId);
        
        const updateQuery = `UPDATE user_verification SET ${updateFields.join(', ')} WHERE "userId" = $${updateValues.length}`;
        await sql.unsafe(updateQuery, updateValues);
        console.log('✅ User verification status updated');
      }
    }

    // Get updated user profile
    const [updatedProfile] = await sql`
      SELECT 
        u.id, u.email, u.name, u."userType", u."accountType",
        u."businessName", u."businessDescription", u."businessLicenseNumber",
        u."verificationDocuments",
        u."agriLinkVerificationRequested", u."agriLinkVerificationRequestedAt",
        u."verificationStatus", u."verificationSubmittedAt",
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
        phoneVerified: updatedProfile.phoneVerified,
        businessName: updatedProfile.businessName,
        businessDescription: updatedProfile.businessDescription,
        businessLicenseNumber: updatedProfile.businessLicenseNumber,
        verificationDocuments: updatedProfile.verificationDocuments,
        agriLinkVerificationRequested: updatedProfile.agriLinkVerificationRequested,
        agriLinkVerificationRequestedAt: updatedProfile.agriLinkVerificationRequestedAt,
        verificationStatus: updatedProfile.verificationStatus,
        verificationSubmittedAt: updatedProfile.verificationSubmittedAt
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
