import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user data from database
    const [userData] = await sql`
      SELECT id, name, email, "userType", "accountType", verified, "phoneVerified"
      FROM users 
      WHERE id = ${user.userId}
    `;

    return NextResponse.json({
      tokenUser: user,
      databaseUser: userData,
      shouldShowOfferManagement: userData?.userType === 'farmer' || userData?.userType === 'trader' || userData?.userType === 'buyer'
    });

  } catch (error: any) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { message: 'Error fetching user data', error: error.message },
      { status: 500 }
    );
  }
}
