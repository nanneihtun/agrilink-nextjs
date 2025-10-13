import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No authorization header or invalid format');
    return null;
  }

  const token = authHeader.substring(7);
  console.log('🔐 Verifying token:', token.substring(0, 20) + '...');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('✅ Token verified successfully for user:', decoded.userId);
    return decoded;
  } catch (error: any) {
    console.log('❌ Token verification failed:', error.message);
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
    console.log('🔍 Querying database for "userId":', user.userId);
    console.log('📍 Profile API - Debugging location data for user:', user.userId);
    
    const [userProfile] = await sql`
      SELECT 
        u.id, u.email, u.name, u."userType", u."accountType",
        u."businessName", u."businessDescription", u."businessLicenseNumber",
        u."verificationDocuments", u."rejectedDocuments",
        u."agriLinkVerificationRequested", u."agriLinkVerificationRequestedAt",
        up.location, up.phone, up."profileImage", up."storefrontImage",
        uv.verified, uv."phoneVerified", uv."verificationStatus", uv."verificationSubmitted",
        ur.rating, ur."totalReviews"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LEFT JOIN user_ratings ur ON u.id = ur."userId"
      WHERE u.id = ${user.userId}
    `;
    
    console.log('🔍 Database query completed. Result:', !!userProfile);
    if (userProfile) {
      console.log('📍 Profile API - Location data from database:', {
        userId: userProfile.id,
        location: userProfile.location,
        locationType: typeof userProfile.location,
        locationLength: userProfile.location?.length,
        isEmpty: userProfile.location === '',
        isNull: userProfile.location === null
      });
    }
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
        storefrontImage: userProfile.storefrontImage,
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
        verificationSubmitted: userProfile.verificationSubmitted,
        rating: userProfile.rating || 0,
        totalReviews: userProfile.totalReviews || 0
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
    console.log('🔐 PUT /api/user/profile - Verifying token...');
    const user = verifyToken(request);
    if (!user) {
      console.log('❌ Authentication failed - no valid token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('✅ Authentication successful for user:', user.userId);

    const body = await request.json();
    const { 
      profileImage, 
      storefrontImage,
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
    if (profileImage !== undefined || storefrontImage !== undefined) {
      console.log('🖼️ Updating user profile images:', {
        "userId": user.userId,
        profileImage: profileImage ? 'provided' : 'undefined',
        storefrontImage: storefrontImage ? 'provided' : 'undefined',
        profileImageLength: profileImage?.length || 0,
        storefrontImageLength: storefrontImage?.length || 0,
        bodyKeys: Object.keys(body)
      });
      
      // Check if user_profiles record exists
      const [existingProfile] = await sql`
        SELECT "userId" FROM user_profiles WHERE "userId" = ${user.userId}
      `;
      
      console.log('🔍 Existing profile check:', existingProfile ? 'found' : 'not found');

      if (existingProfile) {
        // Update existing record using template literals
        console.log('🔄 Updating existing profile record...');
        
        if (profileImage !== undefined && storefrontImage !== undefined) {
          // Update both images
          await sql`
            UPDATE user_profiles 
            SET "profileImage" = ${profileImage}, "storefrontImage" = ${storefrontImage}, "updatedAt" = NOW()
            WHERE "userId" = ${user.userId}
          `;
          console.log('✅ Updated both profile and storefront images');
        } else if (profileImage !== undefined) {
          // Update only profile image
          await sql`
            UPDATE user_profiles 
            SET "profileImage" = ${profileImage}, "updatedAt" = NOW()
            WHERE "userId" = ${user.userId}
          `;
          console.log('✅ Updated profile image only');
        } else if (storefrontImage !== undefined) {
          // Update only storefront image
          await sql`
            UPDATE user_profiles 
            SET "storefrontImage" = ${storefrontImage}, "updatedAt" = NOW()
            WHERE "userId" = ${user.userId}
          `;
          console.log('✅ Updated storefront image only');
        }
        
        console.log('✅ Profile image update completed');
      } else {
        // Insert new record with default location
        console.log('🆕 Creating new profile record for user:', user.userId);
        
        if (profileImage !== undefined && storefrontImage !== undefined) {
          // Insert with both images
          await sql`
            INSERT INTO user_profiles ("userId", "profileImage", "storefrontImage", location, "updatedAt")
            VALUES (${user.userId}, ${profileImage}, ${storefrontImage}, '', NOW())
          `;
          console.log('✅ New profile record created with both images');
        } else if (profileImage !== undefined) {
          // Insert with profile image only
          await sql`
            INSERT INTO user_profiles ("userId", "profileImage", location, "updatedAt")
            VALUES (${user.userId}, ${profileImage}, '', NOW())
          `;
          console.log('✅ New profile record created with profile image');
        } else if (storefrontImage !== undefined) {
          // Insert with storefront image only
          await sql`
            INSERT INTO user_profiles ("userId", "storefrontImage", location, "updatedAt")
            VALUES (${user.userId}, ${storefrontImage}, '', NOW())
          `;
          console.log('✅ New profile record created with storefront image');
        } else {
          // Insert with no images
          await sql`
            INSERT INTO user_profiles ("userId", location, "updatedAt")
            VALUES (${user.userId}, '', NOW())
          `;
          console.log('✅ New profile record created without images');
        }
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
      console.log('🔄 Updating business details for user:', user.userId);
      console.log('📋 Business data:', {
        business_name,
        business_description,
        business_license_number,
        "userId": user.userId
      });
      
      try {
        // Update users table
        await sql`
          UPDATE users 
          SET 
            "businessName" = COALESCE(${business_name}, "businessName"),
            "businessDescription" = COALESCE(${business_description}, "businessDescription"),
            "businessLicenseNumber" = COALESCE(${business_license_number}, "businessLicenseNumber"),
            "updatedAt" = NOW()
          WHERE id = ${user.userId}
        `;
        
        // Also update business_details table if business_name is provided
        if (business_name !== undefined) {
          await sql`
            INSERT INTO business_details ("userId", "businessName", "updatedAt")
            VALUES (${user.userId}, ${business_name}, NOW())
            ON CONFLICT ("userId") 
            DO UPDATE SET 
              "businessName" = ${business_name},
              "updatedAt" = NOW()
          `;
        }
        
        console.log('✅ Business details updated successfully');
      } catch (dbError: any) {
        console.error('❌ Database error updating business details:', dbError);
        throw dbError;
      }
    }

    // Update verification documents if provided
    if (verificationDocuments !== undefined) {
      console.log('🔄 Updating verification documents for user:', user.userId);
      console.log('📋 Verification documents data:', {
        keys: Object.keys(verificationDocuments),
        documentTypes: Object.keys(verificationDocuments).map(key => ({
          type: key,
          status: verificationDocuments[key]?.status,
          name: verificationDocuments[key]?.name,
          hasData: !!verificationDocuments[key]?.data,
          dataLength: verificationDocuments[key]?.data?.length || 0
        }))
      });
      
      try {
        await sql`
          UPDATE users 
          SET 
            "verificationDocuments" = ${JSON.stringify(verificationDocuments)},
            "updatedAt" = NOW()
          WHERE id = ${user.userId}
        `;
        console.log('✅ Verification documents updated successfully');
      } catch (dbError: any) {
        console.error('❌ Database error updating verification documents:', dbError);
        throw dbError;
      }
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
        // Update each field individually using conditional updates
        if (agriLinkVerificationRequested !== undefined) {
          await sql`UPDATE users SET "agriLinkVerificationRequested" = ${agriLinkVerificationRequested}, "updatedAt" = NOW() WHERE id = ${user.userId}`;
        }
        if (agriLinkVerificationRequestedAt !== undefined) {
          await sql`UPDATE users SET "agriLinkVerificationRequestedAt" = ${agriLinkVerificationRequestedAt}, "updatedAt" = NOW() WHERE id = ${user.userId}`;
        }
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
        // Update each field individually using conditional updates
        if (verificationStatus !== undefined) {
          await sql`UPDATE user_verification SET "verificationStatus" = ${verificationStatus}, "updatedAt" = NOW() WHERE "userId" = ${user.userId}`;
        }
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
        up.location, up.phone, up."profileImage", up."storefrontImage",
        uv.verified, uv."phoneVerified"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      WHERE u.id = ${user.userId}
    `;
    
    console.log('🔍 Raw database result:', {
      profileImage: updatedProfile.profileImage ? `${updatedProfile.profileImage.substring(0, 50)}... (${updatedProfile.profileImage.length})` : 'null',
      storefrontImage: updatedProfile.storefrontImage ? `${updatedProfile.storefrontImage.substring(0, 50)}... (${updatedProfile.storefrontImage.length})` : 'null',
      allKeys: Object.keys(updatedProfile)
    });

    // Return updated user data
    console.log('📤 Returning updated profile:', {
      profileImage: updatedProfile.profileImage ? `${updatedProfile.profileImage.substring(0, 50)}... (${updatedProfile.profileImage.length})` : 'null',
      storefrontImage: updatedProfile.storefrontImage ? `${updatedProfile.storefrontImage.substring(0, 50)}... (${updatedProfile.storefrontImage.length})` : 'null'
    });
    
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
        storefrontImage: updatedProfile.storefrontImage,
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
    console.error('❌ Error updating user profile:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        code: error.code,
        hint: error.hint
      },
      { status: 500 }
    );
  }
}
