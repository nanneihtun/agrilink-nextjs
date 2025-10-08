import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    const [adminUser] = await sql`
      SELECT id, email, "userType" 
      FROM users 
      WHERE id = ${decoded.userId} AND "userType" = 'admin'
    `;

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { requestId, reviewNotes } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Get the verification request details
    const [verificationRequest] = await sql`
      SELECT user_id, user_email, user_name
      FROM verification_requests 
      WHERE id = ${requestId}
    `;

    if (!verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    // Update verification request status
    await sql`
      UPDATE verification_requests 
      SET 
        status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = ${adminUser.id},
        review_notes = ${reviewNotes || 'Rejected by admin'},
        updated_at = NOW()
      WHERE id = ${requestId}
    `;

    // Update user verification status
    await sql`
      UPDATE users 
      SET 
        "verificationStatus" = 'rejected',
        verified = false,
        "updatedAt" = NOW()
      WHERE id = ${verificationRequest.user_id}
    `;

    console.log(`❌ Admin ${adminUser.email} rejected verification request for ${verificationRequest.user_email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification request rejected successfully' 
    });

  } catch (error) {
    console.error('❌ Error rejecting verification request:', error);
    return NextResponse.json(
      { error: 'Failed to reject verification request' },
      { status: 500 }
    );
  }
}
