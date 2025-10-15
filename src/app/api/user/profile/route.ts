import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { 
  users, 
  userProfiles, 
  userVerification, 
  userRatings, 
  businessDetails,
  locations
} from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

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

    // Get user profile data using normalized structure
    console.log('🔍 Querying database for "userId":', user.userId);
    console.log('📍 Profile API - Debugging location data for user:', user.userId);
    
    const userProfileResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        userType: users.userType,
        accountType: users.accountType,
        phone: userProfiles.phone,
        profileImage: userProfiles.profileImage,
        storefrontImage: userProfiles.storefrontImage,
        location: sql<string>`CASE WHEN ${locations.city} IS NOT NULL AND ${locations.region} IS NOT NULL THEN ${locations.city} || ', ' || ${locations.region} ELSE ${locations.city} END`,
        region: locations.region,
        city: locations.city,
        verified: userVerification.verified,
        phoneVerified: userVerification.phoneVerified,
        verificationStatus: userVerification.verificationStatus,
        verificationDocuments: userVerification.verificationDocuments,
        businessDetailsCompleted: userVerification.businessDetailsCompleted,
        rating: userRatings.rating,
        totalReviews: userRatings.totalReviews,
        businessName: businessDetails.businessName,
        businessDescription: businessDetails.businessDescription,
        businessLicenseNumber: businessDetails.businessLicenseNumber,
        specialties: businessDetails.specialties,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(locations, eq(userProfiles.locationId, locations.id))
      .leftJoin(userVerification, eq(users.id, userVerification.userId))
      .leftJoin(userRatings, eq(users.id, userRatings.userId))
      .leftJoin(businessDetails, eq(users.id, businessDetails.userId))
      .where(eq(users.id, user.userId))
      .limit(1);

    const userProfile = userProfileResult[0];
    
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
        businessDetailsCompleted: userProfile.businessDetailsCompleted
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

    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        emailVerified: userProfile.emailVerified,
        userType: userProfile.userType,
        accountType: userProfile.accountType,
        location: userProfile.location,
        region: userProfile.region,
        city: userProfile.city,
        phone: userProfile.phone,
        profileImage: userProfile.profileImage,
        storefrontImage: userProfile.storefrontImage,
        verified: userProfile.verified,
        phoneVerified: userProfile.phoneVerified,
        businessName: userProfile.businessName,
        businessDescription: userProfile.businessDescription,
        businessLicenseNumber: userProfile.businessLicenseNumber,
        verificationDocuments: userProfile.verificationDocuments,
        verificationStatus: userProfile.verificationStatus,
        businessDetailsCompleted: userProfile.businessDetailsCompleted,
        rating: parseFloat(userProfile.rating?.toString() || '0'),
        totalReviews: userProfile.totalReviews || 0,
        joinedDate: userProfile.createdAt,
        specialties: userProfile.specialties
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
      verificationSubmittedAt,
      specialties
    } = body;

    // Update user profile images
    if (profileImage !== undefined || storefrontImage !== undefined) {
      console.log('🖼️ Updating user profile images:', {
        "userId": user.userId,
        profileImage: profileImage ? 'provided' : 'undefined',
        storefrontImage: storefrontImage ? 'provided' : 'undefined',
        profileImageLength: profileImage?.length || 0,
        storefrontImageLength: storefrontImage?.length || 0,
        bodyKeys: Object.keys(body)
      });
      
      const profileUpdates: any = {};
      if (profileImage !== undefined) profileUpdates.profileImage = profileImage;
      if (storefrontImage !== undefined) profileUpdates.storefrontImage = storefrontImage;

      // Check if user_profiles record exists
      const existingProfile = await db
        .select({ userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.userId))
        .limit(1);
      
      console.log('🔍 Existing profile check:', existingProfile.length > 0 ? 'found' : 'not found');

      if (existingProfile.length > 0) {
        // Update existing record
        console.log('🔄 Updating existing profile record...');
        await db.update(userProfiles).set(profileUpdates).where(eq(userProfiles.userId, user.userId));
        console.log('✅ Profile images updated successfully');
      } else {
        // Insert new record
        console.log('🆕 Creating new profile record for user:', user.userId);
        await db.insert(userProfiles).values({
          userId: user.userId,
          ...profileUpdates
        });
        console.log('✅ New profile record created');
      }
    }

    // Update location
    if (location !== undefined) {
      // Find locationId from locations table
      const locationResult = await db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.city, location))
        .limit(1);

      let locationId = null;
      if (locationResult.length > 0) {
        locationId = locationResult[0].id;
      }

      // Check if user_profiles record exists
      const existingProfile = await db
        .select({ userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.userId))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing record
        await db.update(userProfiles).set({ locationId }).where(eq(userProfiles.userId, user.userId));
      } else {
        // Insert new record
        await db.insert(userProfiles).values({
          userId: user.userId,
          locationId
        });
      }
    }

    // Update phone
    if (phone !== undefined) {
      // Check if user_profiles record exists
      const existingProfile = await db
        .select({ userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.userId))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing record
        await db.update(userProfiles).set({ phone }).where(eq(userProfiles.userId, user.userId));
      } else {
        // Insert new record
        await db.insert(userProfiles).values({
          userId: user.userId,
          phone
        });
      }
    }

    // Update specialties
    if (specialties !== undefined) {
      console.log('🔧 Updating user specialties:', {
        userId: user.userId,
        specialties: specialties,
        specialtiesLength: Array.isArray(specialties) ? specialties.length : 'not array',
        specialtiesType: typeof specialties
      });

      // Ensure specialties is an array (handle null, undefined, or empty string)
      const specialtiesArray = Array.isArray(specialties) ? specialties : [];
      
      console.log('🔧 Processed specialties array:', {
        original: specialties,
        processed: specialtiesArray,
        length: specialtiesArray.length
      });

      // Check if business_details record exists
      const existingBusiness = await db
        .select({ userId: businessDetails.userId })
        .from(businessDetails)
        .where(eq(businessDetails.userId, user.userId))
        .limit(1);

      if (existingBusiness.length > 0) {
        // Update existing record
        console.log('🔄 Updating existing business details with specialties:', specialtiesArray);
        await db.update(businessDetails).set({ specialties: specialtiesArray }).where(eq(businessDetails.userId, user.userId));
        console.log('✅ Updated specialties for existing business details');
      } else {
        // Insert new record
        console.log('🆕 Creating new business details with specialties:', specialtiesArray);
        await db.insert(businessDetails).values({
          userId: user.userId,
          specialties: specialtiesArray
        });
        console.log('✅ Inserted specialties for new business details');
      }
    }

    // Update phone verification status if phone was verified
    if (phone !== undefined || phoneVerified === true) {
      const existingVerification = await db
        .select({ userId: userVerification.userId })
        .from(userVerification)
        .where(eq(userVerification.userId, user.userId))
        .limit(1);

      if (existingVerification.length > 0) {
        await db.update(userVerification).set({ phoneVerified: true }).where(eq(userVerification.userId, user.userId));
      } else {
        await db.insert(userVerification).values({
          userId: user.userId,
          phoneVerified: true
        });
      }
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
        const businessUpdates: any = {};
        if (business_name !== undefined) businessUpdates.businessName = business_name;
        if (business_description !== undefined) businessUpdates.businessDescription = business_description;
        if (business_license_number !== undefined) businessUpdates.businessLicenseNumber = business_license_number;

        // Check if business_details record exists
        const existingBusiness = await db
          .select({ userId: businessDetails.userId })
          .from(businessDetails)
          .where(eq(businessDetails.userId, user.userId))
          .limit(1);

        if (existingBusiness.length > 0) {
          // Update existing record
          await db.update(businessDetails).set(businessUpdates).where(eq(businessDetails.userId, user.userId));
        } else {
          // Insert new record
          await db.insert(businessDetails).values({
            userId: user.userId,
            ...businessUpdates
          });
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
        const existingVerification = await db
          .select({ userId: userVerification.userId })
          .from(userVerification)
          .where(eq(userVerification.userId, user.userId))
          .limit(1);

        if (existingVerification.length > 0) {
          await db.update(userVerification).set({ verificationDocuments }).where(eq(userVerification.userId, user.userId));
        } else {
          await db.insert(userVerification).values({
            userId: user.userId,
            verificationDocuments
          });
        }
        console.log('✅ Verification documents updated successfully');
      } catch (dbError: any) {
        console.error('❌ Database error updating verification documents:', dbError);
        throw dbError;
      }
    }

    // Update verification status if provided
    if (verificationStatus !== undefined || agriLinkVerificationRequested !== undefined || business_details_completed !== undefined) {
      console.log('🔄 Updating user verification status...');
      
      const verificationUpdates: any = {};
      if (verificationStatus !== undefined) verificationUpdates.verificationStatus = verificationStatus;
      if (business_details_completed !== undefined) verificationUpdates.businessDetailsCompleted = business_details_completed;

      const existingVerification = await db
        .select({ userId: userVerification.userId })
        .from(userVerification)
        .where(eq(userVerification.userId, user.userId))
        .limit(1);

      if (existingVerification.length > 0) {
        await db.update(userVerification).set(verificationUpdates).where(eq(userVerification.userId, user.userId));
      } else {
        await db.insert(userVerification).values({
          userId: user.userId,
          ...verificationUpdates
        });
      }
      
      console.log('✅ User verification status updated');
    }


    // Get updated user profile using normalized structure
    const updatedProfileResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        userType: users.userType,
        accountType: users.accountType,
        phone: userProfiles.phone,
        profileImage: userProfiles.profileImage,
        storefrontImage: userProfiles.storefrontImage,
        location: sql<string>`CASE WHEN ${locations.city} IS NOT NULL AND ${locations.region} IS NOT NULL THEN ${locations.city} || ', ' || ${locations.region} ELSE ${locations.city} END`,
        region: locations.region,
        city: locations.city,
        verified: userVerification.verified,
        phoneVerified: userVerification.phoneVerified,
        verificationStatus: userVerification.verificationStatus,
        verificationDocuments: userVerification.verificationDocuments,
        businessDetailsCompleted: userVerification.businessDetailsCompleted,
        businessName: businessDetails.businessName,
        businessDescription: businessDetails.businessDescription,
        businessLicenseNumber: businessDetails.businessLicenseNumber,
        specialties: businessDetails.specialties,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(locations, eq(userProfiles.locationId, locations.id))
      .leftJoin(userVerification, eq(users.id, userVerification.userId))
      .leftJoin(businessDetails, eq(users.id, businessDetails.userId))
      .where(eq(users.id, user.userId))
      .limit(1);

    const updatedProfile = updatedProfileResult[0];
    
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
        emailVerified: updatedProfile.emailVerified,
        userType: updatedProfile.userType,
        accountType: updatedProfile.accountType,
        location: updatedProfile.location,
        region: updatedProfile.region,
        city: updatedProfile.city,
        phone: updatedProfile.phone,
        profileImage: updatedProfile.profileImage,
        storefrontImage: updatedProfile.storefrontImage,
        verified: updatedProfile.verified,
        phoneVerified: updatedProfile.phoneVerified,
        businessName: updatedProfile.businessName,
        businessDescription: updatedProfile.businessDescription,
        businessLicenseNumber: updatedProfile.businessLicenseNumber,
        verificationDocuments: updatedProfile.verificationDocuments,
        verificationStatus: updatedProfile.verificationStatus,
        businessDetailsCompleted: updatedProfile.businessDetailsCompleted,
        specialties: updatedProfile.specialties
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
