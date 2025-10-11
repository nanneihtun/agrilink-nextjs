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
  } catch (error: any) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get messages for the conversation
    const messages = await sql`
      SELECT 
        id,
        "conversationId",
        "senderId",
        content,
        "createdAt" as timestamp,
        "messageType" as type,
        "isRead"
      FROM messages
      WHERE "conversationId" = ${conversationId}
      ORDER BY "createdAt" ASC
    `;

    return NextResponse.json({
      messages: messages,
      message: 'Messages fetched successfully'
    });

  } catch (error: any) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, content, senderId, type = 'text', offerDetails } = body;

    if (!conversationId || !content || !senderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new message
    const newMessage = await sql`
      INSERT INTO messages (
        "conversationId",
        "senderId",
        content,
        "messageType",
        "isRead"
      ) VALUES (
        ${conversationId},
        ${senderId},
        ${content},
        ${type},
        false
      )
      RETURNING *
    `;

    // Update conversation last message
    await sql`
      UPDATE conversations
      SET 
        "lastMessage" = ${content},
        "lastMessageTime" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${conversationId}
    `;

    const message = {
      id: newMessage[0].id,
      conversationId: newMessage[0].conversationId,
      senderId: newMessage[0].senderId,
      content: newMessage[0].content,
      timestamp: newMessage[0].createdAt,
      type: newMessage[0].messageType,
      isRead: newMessage[0].isRead
    };

    return NextResponse.json({
      message: message,
      success: true
    });

  } catch (error: any) {
    console.error('Send message API error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}