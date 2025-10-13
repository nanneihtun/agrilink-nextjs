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
  } catch (error: any) {
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
      console.log('🔍 Fetching offers for conversation:', conversationId);
      offers = await sql`
        SELECT 
          o.id,
          o."conversationId",
          o."offerPrice",
          o.quantity,
          o.message,
          o.status,
          o."deliveryOptions",
          o."paymentTerms",
          o."expiresAt",
          o."acceptedAt",
          o."confirmedAt",
          o."readyToShipAt",
          o."readyToPickupAt",
          o."shippedAt",
          o."deliveredAt",
          o."completedAt",
          o."autoCompleteAt",
          o."createdAt",
          o."updatedAt",
          p.id as "productId",
          p.name as "productName",
          p.category as "productCategory",
          pi."imageData" as "productImage",
          buyer.id as "buyerId",
          buyer.name as "buyerName",
          buyer."userType" as "buyerType",
          buyer."accountType" as "buyerAccountType",
          buyer_profile."profileImage" as "buyerImage",
          seller.id as "sellerId",
          seller.name as "sellerName",
          seller."userType" as "sellerType",
          seller."accountType" as "sellerAccountType",
          seller_profile."profileImage" as "sellerImage"
        FROM offers o
        INNER JOIN products p ON o."productId" = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o."buyerId" = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o."sellerId" = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o."conversationId" = ${conversationId}
        ORDER BY o."createdAt" DESC
      `;
      console.log('✅ Offers query executed, found', offers.length, 'offers');
    } else if (type === 'sent') {
      offers = await sql`
        SELECT 
          o.id,
          o."conversationId",
          o."offerPrice",
          o.quantity,
          o.message,
          o.status,
          o."deliveryOptions",
          o."paymentTerms",
          o."expiresAt",
          o."acceptedAt",
          o."confirmedAt",
          o."readyToShipAt",
          o."readyToPickupAt",
          o."shippedAt",
          o."deliveredAt",
          o."completedAt",
          o."autoCompleteAt",
          o."createdAt",
          o."updatedAt",
          p.id as "productId",
          p.name as "productName",
          p.category as "productCategory",
          pi."imageData" as "productImage",
          buyer.id as "buyerId",
          buyer.name as "buyerName",
          buyer."userType" as "buyerType",
          buyer."accountType" as "buyerAccountType",
          buyer_profile."profileImage" as "buyerImage",
          seller.id as "sellerId",
          seller.name as "sellerName",
          seller."userType" as "sellerType",
          seller."accountType" as "sellerAccountType",
          seller_profile."profileImage" as "sellerImage"
        FROM offers o
        INNER JOIN products p ON o."productId" = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o."buyerId" = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o."sellerId" = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o."buyerId" = ${user.userId}
        ORDER BY o."createdAt" DESC
      `;
    } else if (type === 'received') {
      offers = await sql`
        SELECT 
          o.id,
          o."conversationId",
          o."offerPrice",
          o.quantity,
          o.message,
          o.status,
          o."deliveryOptions",
          o."paymentTerms",
          o."expiresAt",
          o."acceptedAt",
          o."confirmedAt",
          o."readyToShipAt",
          o."readyToPickupAt",
          o."shippedAt",
          o."deliveredAt",
          o."completedAt",
          o."autoCompleteAt",
          o."createdAt",
          o."updatedAt",
          p.id as "productId",
          p.name as "productName",
          p.category as "productCategory",
          pi."imageData" as "productImage",
          buyer.id as "buyerId",
          buyer.name as "buyerName",
          buyer."userType" as "buyerType",
          buyer."accountType" as "buyerAccountType",
          buyer_profile."profileImage" as "buyerImage",
          seller.id as "sellerId",
          seller.name as "sellerName",
          seller."userType" as "sellerType",
          seller."accountType" as "sellerAccountType",
          seller_profile."profileImage" as "sellerImage"
        FROM offers o
        INNER JOIN products p ON o."productId" = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o."buyerId" = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o."sellerId" = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o."sellerId" = ${user.userId}
        ORDER BY o."createdAt" DESC
      `;
    } else {
      // Default: fetch all offers for the user (both sent and received)
      offers = await sql`
        SELECT 
          o.id,
          o."conversationId",
          o."offerPrice",
          o.quantity,
          o.message,
          o.status,
          o."deliveryOptions",
          o."paymentTerms",
          o."expiresAt",
          o."acceptedAt",
          o."confirmedAt",
          o."readyToShipAt",
          o."readyToPickupAt",
          o."shippedAt",
          o."deliveredAt",
          o."completedAt",
          o."autoCompleteAt",
          o."createdAt",
          o."updatedAt",
          p.id as "productId",
          p.name as "productName",
          p.category as "productCategory",
          pi."imageData" as "productImage",
          buyer.id as "buyerId",
          buyer.name as "buyerName",
          buyer."userType" as "buyerType",
          buyer."accountType" as "buyerAccountType",
          buyer_profile."profileImage" as "buyerImage",
          seller.id as "sellerId",
          seller.name as "sellerName",
          seller."userType" as "sellerType",
          seller."accountType" as "sellerAccountType",
          seller_profile."profileImage" as "sellerImage"
        FROM offers o
        INNER JOIN products p ON o."productId" = p.id
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        INNER JOIN users buyer ON o."buyerId" = buyer.id
        LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
        INNER JOIN users seller ON o."sellerId" = seller.id
        LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
        WHERE o."buyerId" = ${user.userId} OR o."sellerId" = ${user.userId}
        ORDER BY o."createdAt" DESC
      `;
    }

    console.log('🔍 Offers API - Query successful, found', offers.length, 'offers');

    const transformedOffers = offers.map(offer => ({
      id: offer.id,
      conversationId: offer.conversationId,
      offerPrice: parseFloat(offer.offerPrice),
      quantity: offer.quantity,
      message: offer.message,
      status: offer.status,
      deliveryOptions: offer.deliveryOptions || [],
      paymentTerms: offer.paymentTerms || [],
      expiresAt: offer.expiresAt,
      acceptedAt: offer.acceptedAt,
      confirmedAt: offer.confirmedAt,
      readyToShipAt: offer.readyToShipAt,
      readyToPickupAt: offer.readyToPickupAt,
      shippedAt: offer.shippedAt,
      deliveredAt: offer.deliveredAt,
      completedAt: offer.completedAt,
      autoCompleteAt: offer.autoCompleteAt,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      product: {
        id: offer.productId,
        name: offer.productName,
        category: offer.productCategory,
        image: offer.productImage
      },
      buyer: {
        id: offer.buyerId,
        name: offer.buyerName,
        userType: offer.buyerType,
        accountType: offer.buyerAccountType,
        profileImage: offer.buyerImage
      },
      seller: {
        id: offer.sellerId,
        name: offer.sellerName,
        userType: offer.sellerType,
        accountType: offer.sellerAccountType,
        profileImage: offer.sellerImage
      }
    }));

    return NextResponse.json({
      offers: transformedOffers,
      message: 'Offers fetched successfully'
    });

  } catch (error: any) {
    console.error('❌ Error fetching offers:', {
      message: error.message,
      stack: error.stack,
      query: conversationId ? 'conversationId query' : 'other query',
      conversationId: conversationId || 'none'
    });
    return NextResponse.json(
      { message: 'Internal server error', error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}

// POST /api/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Offers API - POST request received');
    const user = verifyToken(request);
    
    if (!user) {
      console.log('❌ Offers API - Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Offers API - User authenticated:', user.userId);
    const body = await request.json();
    console.log('📦 Offers API - Request body:', {
      productId: body.productId,
      offerPrice: body.offerPrice,
      quantity: body.quantity,
      hasMessage: !!body.message,
      hasDeliveryAddress: !!body.deliveryAddress
    });
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
      SELECT p.*, u.id as "sellerId", u."userType" as "sellerType"
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
    if (productData.sellerId === user.userId) {
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
      WHERE ("buyerId" = ${user.userId} AND "sellerId" = ${productData.sellerId})
         OR ("buyerId" = ${productData.sellerId} AND "sellerId" = ${user.userId})
      LIMIT 1
    `;
    
    if (existingConversation.length > 0) {
      conversationId = existingConversation[0].id;
    } else {
      // Create new conversation
      const [newConversation] = await sql`
        INSERT INTO conversations ("buyerId", "sellerId", "productId", "createdAt")
        VALUES (${user.userId}, ${productData.sellerId}, ${productId}, NOW())
        RETURNING id
      `;
      conversationId = newConversation.id;
    }

    // Create the offer
    const [newOffer] = await sql`
      INSERT INTO offers (
        "productId", "buyerId", "sellerId", "conversationId", "offerPrice", quantity, 
        message, status, "deliveryAddress", "deliveryOptions", "paymentTerms",
        "expiresAt", "createdAt", "updatedAt"
      )
      VALUES (
        ${productId}, ${user.userId}, ${productData.sellerId}, ${conversationId}, 
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
        conversationId: newOffer.conversationId,
        offerPrice: parseFloat(newOffer.offerPrice),
        quantity: newOffer.quantity,
        message: newOffer.message,
        status: newOffer.status,
        deliveryOptions: newOffer.deliveryOptions || [],
        paymentTerms: newOffer.paymentTerms || [],
        expiresAt: newOffer.expiresAt,
        createdAt: newOffer.createdAt,
        updatedAt: newOffer.updatedAt
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