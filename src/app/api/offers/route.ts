import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return user;
  } catch (error) {
    return null;
  }
}

// GET /api/offers - Fetch offers
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
    console.log('🔍 Offers API - GET request received for user:', user.userId);
    
    const type = searchParams.get('type'); // 'sent' or 'received'
    const status = searchParams.get('status'); // filter by status
    const conversationId = searchParams.get('conversationId'); // filter by conversation
    
    console.log('🔍 Offers API - Query params:', { type, status, conversationId });

    // Build the query based on parameters
    let offers;
    
    if (conversationId) {
      // Fetch offers for a specific conversation
      offers = await sql`
        SELECT 
          o.id,
          o.conversation_id,
          o.offer_price,
          o.quantity,
          o.message,
          o.status,
          o.delivery_options,
          o.payment_terms,
          o.expires_at,
          o.accepted_at,
          o.confirmed_at,
          o.shipped_at,
          o.delivered_at,
          o.completed_at,
          o.auto_complete_at,
          o.created_at,
          o.updated_at,
          p.id as product_id,
          p.name as product_name,
          p.category as product_category,
          pi."imageUrl" as product_image,
          buyer.id as buyer_id,
          buyer.name as buyer_name,
          buyer."userType" as buyer_type,
          buyer."accountType" as buyer_account_type,
          buyer_profile."profileImage" as buyer_image,
          seller.id as seller_id,
          seller.name as seller_name,
          seller."userType" as seller_type,
          seller."accountType" as seller_account_type,
          seller_profile."profileImage" as seller_image
        FROM offers o
        INNER JOIN products p ON o.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o.buyer_id = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o.seller_id = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o.conversation_id = ${conversationId}
        ORDER BY o.created_at DESC
      `;
    } else if (type === 'sent') {
      offers = await sql`
        SELECT 
          o.id,
          o.conversation_id,
          o.offer_price,
          o.quantity,
          o.message,
          o.status,
          o.delivery_options,
          o.payment_terms,
          o.expires_at,
          o.accepted_at,
          o.confirmed_at,
          o.shipped_at,
          o.delivered_at,
          o.completed_at,
          o.auto_complete_at,
          o.created_at,
          o.updated_at,
          p.id as product_id,
          p.name as product_name,
          p.category as product_category,
          pi."imageUrl" as product_image,
          buyer.id as buyer_id,
          buyer.name as buyer_name,
          buyer."userType" as buyer_type,
          buyer."accountType" as buyer_account_type,
          buyer_profile."profileImage" as buyer_image,
          seller.id as seller_id,
          seller.name as seller_name,
          seller."userType" as seller_type,
          seller."accountType" as seller_account_type,
          seller_profile."profileImage" as seller_image
        FROM offers o
        INNER JOIN products p ON o.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o.buyer_id = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o.seller_id = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o.buyer_id = ${user.userId}
        ORDER BY o.created_at DESC
      `;
    } else if (type === 'received') {
      offers = await sql`
        SELECT 
          o.id,
          o.conversation_id,
          o.offer_price,
          o.quantity,
          o.message,
          o.status,
          o.delivery_options,
          o.payment_terms,
          o.expires_at,
          o.accepted_at,
          o.confirmed_at,
          o.shipped_at,
          o.delivered_at,
          o.completed_at,
          o.auto_complete_at,
          o.created_at,
          o.updated_at,
          p.id as product_id,
          p.name as product_name,
          p.category as product_category,
          pi."imageUrl" as product_image,
          buyer.id as buyer_id,
          buyer.name as buyer_name,
          buyer."userType" as buyer_type,
          buyer."accountType" as buyer_account_type,
          buyer_profile."profileImage" as buyer_image,
          seller.id as seller_id,
          seller.name as seller_name,
          seller."userType" as seller_type,
          seller."accountType" as seller_account_type,
          seller_profile."profileImage" as seller_image
        FROM offers o
        INNER JOIN products p ON o.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o.buyer_id = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o.seller_id = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o.seller_id = ${user.userId}
        ORDER BY o.created_at DESC
      `;
    } else {
      // Default: fetch all offers for the user (both sent and received)
      offers = await sql`
        SELECT 
          o.id,
          o.conversation_id,
          o.offer_price,
          o.quantity,
          o.message,
          o.status,
          o.delivery_options,
          o.payment_terms,
          o.expires_at,
          o.accepted_at,
          o.confirmed_at,
          o.shipped_at,
          o.delivered_at,
          o.completed_at,
          o.auto_complete_at,
          o.created_at,
          o.updated_at,
          p.id as product_id,
          p.name as product_name,
          p.category as product_category,
          pi."imageUrl" as product_image,
          buyer.id as buyer_id,
          buyer.name as buyer_name,
          buyer."userType" as buyer_type,
          buyer."accountType" as buyer_account_type,
          buyer_profile."profileImage" as buyer_image,
          seller.id as seller_id,
          seller.name as seller_name,
          seller."userType" as seller_type,
          seller."accountType" as seller_account_type,
          seller_profile."profileImage" as seller_image
        FROM offers o
        INNER JOIN products p ON o.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o.buyer_id = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o.seller_id = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o.buyer_id = ${user.userId} OR o.seller_id = ${user.userId}
        ORDER BY o.created_at DESC
      `;
    }

    console.log('🔍 Offers API - Query successful, found', offers.length, 'offers');

    const transformedOffers = offers.map(offer => ({
      id: offer.id,
      conversationId: offer.conversation_id,
      offerPrice: parseFloat(offer.offer_price),
      quantity: offer.quantity,
      message: offer.message,
      status: offer.status,
      deliveryOptions: offer.delivery_options || [],
      paymentTerms: offer.payment_terms || [],
      expiresAt: offer.expires_at,
      acceptedAt: offer.accepted_at,
      confirmedAt: offer.confirmed_at,
      shippedAt: offer.shipped_at,
      deliveredAt: offer.delivered_at,
      completedAt: offer.completed_at,
      autoCompleteAt: offer.auto_complete_at,
      createdAt: offer.created_at,
      updatedAt: offer.updated_at,
      product: {
        id: offer.product_id,
        name: offer.product_name,
        category: offer.product_category,
        image: offer.product_image
      },
      buyer: {
        id: offer.buyer_id,
        name: offer.buyer_name,
        userType: offer.buyer_type,
        accountType: offer.buyer_account_type,
        profileImage: offer.buyer_image
      },
      seller: {
        id: offer.seller_id,
        name: offer.seller_name,
        userType: offer.seller_type,
        accountType: offer.seller_account_type,
        profileImage: offer.seller_image
      }
    }));

    return NextResponse.json({
      offers: transformedOffers,
      message: 'Offers fetched successfully'
    });

  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/offers - Create new offer
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
    const {
      productId,
      offerPrice,
      quantity,
      message,
      deliveryAddress,
      deliveryOptions,
      paymentTerms,
      expirationHours
    } = body;

    // Validate required fields
    if (!productId || !offerPrice || !quantity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get product and seller info
    const product = await sql`
      SELECT p.*, u.id as seller_id, u."userType" as seller_type
      FROM products p
      INNER JOIN users u ON p."sellerId" = u.id
      WHERE p.id = ${productId}
    `;

    if (product.length === 0) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = product[0];

    // Prevent users from making offers on their own products
    if (productData.seller_id === user.userId) {
      return NextResponse.json(
        { message: 'Cannot make offer on your own product' },
        { status: 400 }
      );
    }

    // Check if user is a farmer (farmers can't make offers, only traders/buyers can)
    const currentUser = await sql`
      SELECT "userType" FROM users WHERE id = ${user.userId}
    `;

    // Only buyers and traders can make offers (farmers sell products)
    if (currentUser[0]?.userType === 'farmer') {
      return NextResponse.json(
        { message: 'Farmers cannot make offers, they sell products' },
        { status: 400 }
      );
    }

    // Get or create conversation between buyer and seller
    let conversationId;
    const existingConversation = await sql`
      SELECT id FROM conversations 
      WHERE ("buyerId" = ${user.userId} AND "sellerId" = ${productData.seller_id})
         OR ("buyerId" = ${productData.seller_id} AND "sellerId" = ${user.userId})
      LIMIT 1
    `;
    
    if (existingConversation.length > 0) {
      conversationId = existingConversation[0].id;
    } else {
      // Create new conversation
      const [newConversation] = await sql`
        INSERT INTO conversations ("buyerId", "sellerId", "productId", "createdAt")
        VALUES (${user.userId}, ${productData.seller_id}, ${productId}, NOW())
        RETURNING id
      `;
      conversationId = newConversation.id;
    }

    // Create the offer
    const [newOffer] = await sql`
      INSERT INTO offers (
        product_id, buyer_id, seller_id, conversation_id, offer_price, quantity, 
        message, status, delivery_address, delivery_options, payment_terms,
        expires_at, created_at, updated_at
      )
      VALUES (
        ${productId}, ${user.userId}, ${productData.seller_id}, ${conversationId}, 
        ${offerPrice}, ${quantity}, ${message || null}, 'pending', 
        ${deliveryAddress ? JSON.stringify(deliveryAddress) : null},
        ${deliveryOptions || null}, ${paymentTerms || null},
        NOW() + INTERVAL '1 hour' * ${expirationHours || 24}, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({
      offer: {
        id: newOffer.id,
        conversationId: newOffer.conversation_id,
        offerPrice: parseFloat(newOffer.offer_price),
        quantity: newOffer.quantity,
        message: newOffer.message,
        status: newOffer.status,
        deliveryOptions: newOffer.delivery_options || [],
        paymentTerms: newOffer.payment_terms || [],
        expiresAt: newOffer.expires_at,
        createdAt: newOffer.created_at,
        updatedAt: newOffer.updated_at
      },
      message: 'Offer created successfully'
    });

  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}