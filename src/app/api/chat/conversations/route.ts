import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations as conversationsTable, messages as messagesTable, products as productsTable, users as usersTable, userProfiles, userVerification, userRatings } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
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

    // Get conversations for the current user using Drizzle ORM
    const conversations = await db
      .select({
        id: conversationsTable.id,
        productId: conversationsTable.productId,
        buyerId: conversationsTable.buyerId,
        sellerId: conversationsTable.sellerId,
        lastMessage: conversationsTable.lastMessage,
        lastMessageTime: conversationsTable.lastMessageTime,
        unreadCount: conversationsTable.unreadCount,
        isActive: conversationsTable.isActive,
        createdAt: conversationsTable.createdAt,
        updatedAt: conversationsTable.updatedAt,
      })
      .from(conversationsTable)
      .where(or(
        eq(conversationsTable.buyerId, user.userId),
        eq(conversationsTable.sellerId, user.userId)
      ))
      .orderBy(desc(conversationsTable.lastMessageTime));

    // Transform results to match frontend expectations
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      productId: conv.productId,
      productName: 'Product', // Will be populated later with actual product name
      productImage: '/api/placeholder/400/300',
      otherParty: {
        id: conv.buyerId === user.userId ? conv.sellerId : conv.buyerId,
        name: 'User', // Will be populated later with actual user name
        type: 'farmer',
        accountType: 'individual',
        location: 'Myanmar',
        rating: 0,
        verified: false,
        phoneVerified: false,
        verificationStatus: 'unverified',
        profileImage: ''
      },
      lastMessage: {
        content: conv.lastMessage || 'No messages yet',
        timestamp: conv.lastMessageTime || conv.createdAt,
        isOwn: false
      },
      unreadCount: conv.unreadCount || 0,
      status: 'active' as const
    }));

    return NextResponse.json({
      conversations: transformedConversations,
      message: 'Conversations fetched successfully'
    });

  } catch (error: any) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
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
    const { buyerId, sellerId, productId } = body;

    if (!buyerId || !sellerId || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversations = await db
      .select()
      .from(conversationsTable)
      .where(and(
        eq(conversationsTable.buyerId, buyerId),
        eq(conversationsTable.sellerId, sellerId),
        eq(conversationsTable.productId, productId)
      ))
      .limit(1);

    if (existingConversations.length > 0) {
      return NextResponse.json({
        conversation: existingConversations[0],
        message: 'Existing conversation found'
      });
    }

    // Get product and user details using Drizzle
    const productData = await db
      .select({ name: productsTable.name })
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    const buyerData = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, buyerId));

    const sellerData = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, sellerId));

    // Create new conversation using Drizzle
    const [newConversation] = await db
      .insert(conversationsTable)
      .values({
        buyerId,
        sellerId,
        productId,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0
      })
      .returning();

    return NextResponse.json({
      conversation: newConversation,
      message: 'Conversation created successfully'
    });

  } catch (error: any) {
    console.error('Create conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
