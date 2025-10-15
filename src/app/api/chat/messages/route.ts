import { NextRequest, NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';
import { messages as messagesTable, conversations as conversationsTable } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    // For development mode, allow any token
    if (process.env.NODE_ENV === 'development') {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
        return user;
      } catch (error) {
        // If token verification fails in development, return null to force re-authentication
        return null;
      }
    }
    
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

    // Get messages for the conversation using Drizzle ORM
    const messages = await db
      .select({
        id: messagesTable.id,
        conversationId: messagesTable.conversationId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        timestamp: messagesTable.createdAt,
        type: messagesTable.messageType,
        isRead: messagesTable.isRead
      })
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

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

    // Insert new message using Drizzle
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        conversationId,
        senderId,
        content,
        messageType: type,
        isRead: false
      })
      .returning();

    // Update conversation last message using Drizzle
    await db
      .update(conversationsTable)
      .set({
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date()
      })
      .where(eq(conversationsTable.id, conversationId));

    const message = {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      senderId: newMessage.senderId,
      content: newMessage.content,
      timestamp: newMessage.createdAt,
      type: newMessage.messageType,
      isRead: newMessage.isRead
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