import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('🔍 Fetching verification status for user:', user.userId);

    // Get the latest verification request for this user
    const [latestRequest] = await sql`
      SELECT id, status, submitted_at, reviewed_at, review_notes, verification_documents
      FROM verification_requests 
      WHERE user_id = ${user.userId}
      ORDER BY submitted_at DESC
      LIMIT 1
    `;

    console.log('📋 Latest verification request:', latestRequest);

    return NextResponse.json({
      success: true,
      verificationRequest: latestRequest || null
    });

  } catch (error: any) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
