import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    if (decoded.email !== 'admin@agrilink.com') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const users = await sql`
      SELECT 
        u.id, u.name, u.email, u."userType" as "accountType", u."createdAt",
        up.location,
        uv.verified, uv."phoneVerified", uv."verificationStatus"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      ORDER BY u."createdAt" DESC
    `;

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        location: user.location,
        verified: user.verified,
        phoneVerified: user.phoneVerified,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt.toISOString(),
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
