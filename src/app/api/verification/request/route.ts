import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Verification request API called');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token and extract user information
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('✅ Token verified successfully for user:', decoded.userId);
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Extract user information from JWT token
    const userId = decoded.userId;
    const userEmail = decoded.email;
    const userType = decoded.userType;
    const accountType = decoded.accountType;
    
    // Fetch user's name from database
    const userResult = await sql`
      SELECT name FROM users WHERE id = ${userId} LIMIT 1
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userName = userResult[0].name;
    
    const {
      requestType = 'agrilink_verification',
      status = 'under_review',
      submittedAt = new Date().toISOString(),
      verificationDocuments,
      businessInfo,
      phoneVerified = false
    } = body;

    // Insert verification request into database
    console.log('🔄 Inserting verification request...');
    const result = await sql`
      INSERT INTO verification_requests (
        "userId",
        "userEmail",
        "userName",
        "userType",
        "accountType",
        "requestType",
        status,
        "submittedAt",
        "verificationDocuments",
        "businessInfo",
        "phoneVerified",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${userId},
        ${userEmail},
        ${userName},
        ${userType},
        ${accountType},
        ${requestType},
        ${status},
        ${submittedAt},
        ${verificationDocuments ? JSON.stringify(verificationDocuments) : null},
        ${businessInfo ? JSON.stringify(businessInfo) : null},
        ${phoneVerified},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    console.log('✅ Verification request inserted with ID:', result[0].id);

    // Update user's verification status in user_verification table
    console.log('🔄 Updating user verification status...');
    await sql`
      UPDATE user_verification 
      SET 
        "verificationStatus" = 'under_review',
        "verificationSubmitted" = true,
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `;
    console.log('✅ User verification status updated');

    // Update agriLinkVerificationRequested in users table
    console.log('🔄 Updating agriLinkVerificationRequested in users table...');
    await sql`
      UPDATE users 
      SET 
        "agriLinkVerificationRequested" = true,
        "agriLinkVerificationRequestedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${userId}
    `;
    console.log('✅ agriLinkVerificationRequested updated in users table');

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      requestId: result[0].id
    });

  } catch (error: any) {
    console.error('Error creating verification request:', error);
    return NextResponse.json(
      { error: 'Failed to create verification request' },
      { status: 500 }
    );
  }
}
