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

    // Fetch all verification requests with user profile data
    const requests = await sql`
      SELECT 
        vr.id,
        vr."userId",
        vr."userEmail",
        vr."userName",
        vr."userType",
        vr."accountType",
        vr."requestType",
        vr.status,
        vr."submittedAt",
        vr."reviewedAt",
        vr."reviewedBy",
        vr."verificationDocuments" as verification_request_documents,
        vr."businessInfo",
        vr."businessName",
        vr."businessDescription",
        vr."businessLicenseNumber",
        vr."phoneVerified" as verification_phone_verified,
        vr."reviewNotes",
        vr."createdAt",
        vr."updatedAt",
        up.location,
        up.phone,
        uv."phoneVerified" as user_phone_verified,
        u."businessName" as user_business_name,
        u."businessDescription" as user_business_description,
        u."businessLicenseNumber" as user_business_license_number,
        u."verificationDocuments" as user_verification_documents
      FROM verification_requests vr
      LEFT JOIN user_profiles up ON vr."userId" = up."userId"
      LEFT JOIN users u ON vr."userId" = u.id
      LEFT JOIN user_verification uv ON vr."userId" = uv."userId"
      ORDER BY vr."submittedAt" DESC
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
