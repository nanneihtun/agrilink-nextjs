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
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch (error) {
    return null;
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Profile update API called');
    
    const user = verifyToken(request);
    
    if (!user) {
      console.log('❌ Unauthorized - no valid token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = body;
    
    console.log('📝 Profile update data:', {
      userId: user.userId,
      updates: {
        hasProfileImage: !!updates.profileImage,
        hasStorefrontImage: !!updates.storefrontImage,
        hasLocation: !!updates.location,
        hasPhone: !!updates.phone,
        otherFields: Object.keys(updates).filter(key => !['profileImage', 'storefrontImage', 'location', 'phone'].includes(key))
      }
    });

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
    if (Object.keys(updateData).length > 0) {
      console.log('💾 Updating users table with:', updateData);
      
      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        updateFields.push(`"${key}" = $${updateFields.length + 1}`);
        updateValues.push(value);
      }
      
      updateValues.push(user.userId);
      
      // Use template literal for dynamic query
      await sql.unsafe(`UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateFields.length + 1}`, updateValues);
      console.log('✅ users table updated successfully');
    }

    // Update user_profiles table if profile-specific fields are provided
    if (updates.profileImage !== undefined || updates.storefrontImage !== undefined || updates.location !== undefined || updates.phone !== undefined) {
      const profileUpdates: any = {
        updatedAt: new Date().toISOString()
      };
      
      if (updates.profileImage !== undefined) profileUpdates.profileImage = updates.profileImage;
      if (updates.storefrontImage !== undefined) profileUpdates.storefrontImage = updates.storefrontImage;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;

      // Use UPSERT (INSERT ... ON CONFLICT DO UPDATE) to handle cases where user_profiles doesn't exist
      console.log('💾 Updating user_profiles table with:', profileUpdates);
      
      await sql`
        INSERT INTO user_profiles ("userId", "profileImage", "storefrontImage", location, phone, "updatedAt")
        VALUES (${user.userId}, ${profileUpdates.profileImage || null}, ${profileUpdates.storefrontImage || null}, ${profileUpdates.location || ''}, ${profileUpdates.phone || null}, ${profileUpdates.updatedAt})
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          "profileImage" = ${profileUpdates.profileImage || null},
          "storefrontImage" = ${profileUpdates.storefrontImage || null},
          location = ${profileUpdates.location || ''},
          phone = ${profileUpdates.phone || null},
          "updatedAt" = ${profileUpdates.updatedAt}
      `;
      
      console.log('✅ user_profiles updated successfully');
    }

    // Update user_verification table if verification fields are provided
    if (updates.verificationStatus !== undefined || updates.verificationDocuments !== undefined) {
      const verificationUpdates: any = {
        updatedAt: new Date().toISOString()
      };
      
      if (updates.verificationStatus !== undefined) verificationUpdates.verificationStatus = updates.verificationStatus;
      if (updates.verificationDocuments !== undefined) verificationUpdates.verificationDocuments = JSON.stringify(updates.verificationDocuments);
      if (updates.agriLinkVerificationRequested !== undefined) verificationUpdates.verificationSubmitted = updates.agriLinkVerificationRequested;

      // Build SET clause for user_verification table
      const verificationSetClauses = [];
      const verificationValues = [];
      let verificationParamIndex = 1;

      for (const [key, value] of Object.entries(verificationUpdates)) {
        verificationSetClauses.push(`"${key}" = $${verificationParamIndex}`);
        verificationValues.push(value);
        verificationParamIndex++;
      }

      if (verificationSetClauses.length > 0) {
        const verificationQuery = `UPDATE user_verification SET ${verificationSetClauses.join(', ')} WHERE "userId" = $${verificationParamIndex}`;
        verificationValues.push(user.userId);
        
        await sql.query(verificationQuery, verificationValues);
      }
    }

    console.log('✅ Profile update completed successfully');
    
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
