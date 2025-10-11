import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
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

    // Fetch all verification requests
    const requests = await sql`
      SELECT 
        vr.id,
        vr.user_id,
        vr.user_email,
        vr.user_name,
        vr.user_type,
        vr.account_type,
        vr.request_type,
        vr.status,
        vr.submitted_at,
        vr.reviewed_at,
        vr.reviewed_by,
        vr.verification_documents,
        vr.business_info,
        vr.business_name,
        vr.business_description,
        vr.business_license_number,
        vr.phone_verified,
        vr.review_notes,
        vr.created_at,
        vr.updated_at
      FROM verification_requests vr
      ORDER BY vr.submitted_at DESC
    `;

    return NextResponse.json({ 
      success: true, 
      requests: requests || [] 
    });

  } catch (error: any) {
    console.error('❌ Error fetching verification requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    );
  }
}
