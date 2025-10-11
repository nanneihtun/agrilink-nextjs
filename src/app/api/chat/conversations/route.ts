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

    // Get conversations for the current user with complete other party info
    const conversations = await sql`
      SELECT 
        c.id,
        c."productId",
        p.name as product_name,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN u_seller.id
          ELSE u_buyer.id
        END as other_party_id,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN u_seller.name
          ELSE u_buyer.name
        END as other_party_name,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN u_seller."userType"
          ELSE u_buyer."userType"
        END as other_party_type,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN uv_seller.verified
          ELSE uv_buyer.verified
        END as other_party_verified,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN u_seller."accountType"
          ELSE u_buyer."accountType"
        END as other_party_account_type,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN uv_seller."phoneVerified"
          ELSE uv_buyer."phoneVerified"
        END as other_party_phone_verified,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN uv_seller."verificationStatus"
          ELSE uv_buyer."verificationStatus"
        END as other_party_verification_status,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN up_seller.location
          ELSE up_buyer.location
        END as other_party_location,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN up_seller."profileImage"
          ELSE up_buyer."profileImage"
        END as other_party_profile_image,
        CASE 
          WHEN c."buyerId" = ${user.userId} THEN ur_seller.rating
          ELSE ur_buyer.rating
        END as other_party_rating,
        c."lastMessage",
        c."lastMessageTime",
        c."unreadCount"
      FROM conversations c
      LEFT JOIN products p ON c."productId" = p.id
      LEFT JOIN users u_seller ON c."sellerId" = u_seller.id
      LEFT JOIN users u_buyer ON c."buyerId" = u_buyer.id
      LEFT JOIN user_verification uv_seller ON c."sellerId" = uv_seller."userId"
      LEFT JOIN user_verification uv_buyer ON c."buyerId" = uv_buyer."userId"
      LEFT JOIN user_profiles up_seller ON c."sellerId" = up_seller."userId"
      LEFT JOIN user_profiles up_buyer ON c."buyerId" = up_buyer."userId"
      LEFT JOIN user_ratings ur_seller ON c."sellerId" = ur_seller."userId"
      LEFT JOIN user_ratings ur_buyer ON c."buyerId" = ur_buyer."userId"
      WHERE c."sellerId" = ${user.userId} OR c."buyerId" = ${user.userId}
      ORDER BY c."lastMessageTime" DESC NULLS LAST, c."createdAt" DESC
    `;

    // Transform results to match frontend expectations
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      productId: conv.productId,
      productName: conv.product_name,
      productImage: '/api/placeholder/400/300', // Local placeholder image
      otherParty: {
        id: conv.other_party_id,
        name: conv.other_party_name,
        type: conv.other_party_type,
        accountType: conv.other_party_account_type || 'individual',
        location: conv.other_party_location || 'Myanmar',
        rating: parseFloat(conv.other_party_rating) || 0,
        verified: conv.other_party_verified || false,
        phoneVerified: conv.other_party_phone_verified || false,
        verificationStatus: conv.other_party_verification_status || 'unverified',
        profileImage: conv.other_party_profile_image
      },
      lastMessage: {
        content: conv.lastMessage || 'No messages yet',
        timestamp: conv.lastMessageTime || new Date().toISOString(),
        isOwn: false // We'll need to determine this based on sender
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
    const existingConversation = await sql`
      SELECT * FROM conversations
      WHERE "buyerId" = ${buyerId} 
      AND "sellerId" = ${sellerId} 
      AND "productId" = ${productId}
      LIMIT 1
    `;

    if (existingConversation.length > 0) {
      return NextResponse.json({
        conversation: existingConversation[0],
        message: 'Existing conversation found'
      });
    }

    // Get product and user details
    const productData = await sql`
      SELECT name FROM products WHERE id = ${productId}
    `;

    const buyerData = await sql`
      SELECT name FROM users WHERE id = ${buyerId}
    `;

    const sellerData = await sql`
      SELECT name FROM users WHERE id = ${sellerId}
    `;

    // Create new conversation
    const newConversation = await sql`
      INSERT INTO conversations (
        "buyerId",
        "sellerId", 
        "productId",
        "lastMessage",
        "lastMessageTime",
        "unreadCount"
      ) VALUES (
        ${buyerId},
        ${sellerId},
        ${productId},
        null,
        null,
        0
      )
      RETURNING *
    `;

    return NextResponse.json({
      conversation: newConversation[0],
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
