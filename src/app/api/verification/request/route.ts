import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const body = await request.json();

    // For now, we'll just store the verification request in the database
    // In a real implementation, you might want to verify the JWT token
    
    const {
      user_id,
      user_email,
      user_name,
      user_type,
      account_type,
      request_type,
      status,
      submitted_at,
      verification_documents,
      business_info,
      phone_verified
    } = body;

    // Insert verification request into database
    const result = await sql`
      INSERT INTO verification_requests (
        user_id,
        user_email,
        user_name,
        user_type,
        account_type,
        request_type,
        status,
        submitted_at,
        verification_documents,
        business_info,
        phone_verified
      ) VALUES (
        ${user_id},
        ${user_email},
        ${user_name},
        ${user_type},
        ${account_type},
        ${request_type},
        ${status},
        ${submitted_at},
        ${JSON.stringify(verification_documents)},
        ${business_info ? JSON.stringify(business_info) : null},
        ${phone_verified}
      )
      RETURNING id
    `;

    // Update user's verification status
    await sql`
      UPDATE users 
      SET 
        "agriLinkVerificationRequested" = true,
        "agriLinkVerificationRequestedAt" = NOW(),
        "verificationStatus" = 'under_review',
        "verificationSubmittedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${user_id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      requestId: result[0].id
    });

  } catch (error) {
    console.error('Error creating verification request:', error);
    return NextResponse.json(
      { error: 'Failed to create verification request' },
      { status: 500 }
    );
  }
}
