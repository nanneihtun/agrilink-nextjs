import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Messages API called');
    
    // Test database connection
    const testQuery = await sql`SELECT COUNT(*) as count FROM messages`;
    console.log('🔍 Database connection test:', testQuery[0].count, 'messages total');
    
    // Test specific conversation
    const conversationId = 'ba3eff7f-f3a9-476b-8b72-aaef1ed380b2';
    const messages = await sql`
      SELECT 
        id,
        "conversationId",
        "senderId",
        content,
        "createdAt" as timestamp,
        type,
        "isRead",
        "offerDetails"
      FROM messages
      WHERE "conversationId" = ${conversationId}
      ORDER BY "createdAt" ASC
    `;
    
    console.log('🔍 Messages found for conversation:', messages.length);
    
    // Test JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔍 Token received:', token ? 'yes' : 'no');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('🔍 JWT decoded successfully:', decoded);
      } catch (jwtError) {
        console.log('🔍 JWT decode error:', jwtError);
      }
    }
    
    return NextResponse.json({
      success: true,
      totalMessages: testQuery[0].count,
      conversationMessages: messages.length,
      messages: messages.slice(0, 3), // Return first 3 messages
      jwtSecret: process.env.JWT_SECRET ? 'set' : 'not set'
    });

  } catch (error) {
    console.error('Debug Messages API error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}
