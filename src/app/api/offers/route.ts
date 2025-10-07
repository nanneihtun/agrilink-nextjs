import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const buyerId = decoded.userId;

    const body = await request.json();
    const { productId, offerPrice, quantity, deliveryDate, deliveryLocation, paymentTerms, additionalNotes } = body;

    // Validate required fields
    if (!productId || !offerPrice || !quantity) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get product and seller information
    const productResult = await sql`
      SELECT p.*, u.id as seller_id, u.name as seller_name
      FROM products p
      JOIN users u ON p."sellerId" = u.id
      WHERE p.id = ${productId} AND p."isActive" = true
    `;

    if (productResult.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = productResult[0];

    // Check if buyer is not the seller
    if (buyerId === product.seller_id) {
      return NextResponse.json({ message: 'Cannot make offer on your own product' }, { status: 400 });
    }

    // Create offer
    const offerResult = await sql`
      INSERT INTO offers (
        "productId", "buyerId", "sellerId", "offerPrice", "quantity", 
        "deliveryDate", "deliveryLocation", "paymentTerms", "additionalNotes", 
        "status", "createdAt", "updatedAt"
      ) VALUES (
        ${productId}, ${buyerId}, ${product.seller_id}, ${offerPrice}, ${quantity},
        ${deliveryDate || null}, ${deliveryLocation || null}, ${paymentTerms || 'Cash on Delivery'}, 
        ${additionalNotes || null}, 'pending', NOW(), NOW()
      ) RETURNING *
    `;

    const offer = offerResult[0];

    return NextResponse.json({
      message: 'Offer submitted successfully',
      offer: {
        id: offer.id,
        productId: offer.productId,
        offerPrice: offer.offerPrice,
        quantity: offer.quantity,
        status: offer.status,
        createdAt: offer.createdAt,
      }
    });

  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    let offers;
    if (type === 'sent') {
      // Offers sent by the user
      offers = await sql`
        SELECT 
          o.*,
          p.name as product_name,
          p.category as product_category,
          u.name as seller_name,
          u."userType" as seller_type
        FROM offers o
        JOIN products p ON o."productId" = p.id
        JOIN users u ON o."sellerId" = u.id
        WHERE o."buyerId" = ${userId}
        ORDER BY o."createdAt" DESC
      `;
    } else {
      // Offers received by the user
      offers = await sql`
        SELECT 
          o.*,
          p.name as product_name,
          p.category as product_category,
          u.name as buyer_name,
          u."userType" as buyer_type
        FROM offers o
        JOIN products p ON o."productId" = p.id
        JOIN users u ON o."buyerId" = u.id
        WHERE o."sellerId" = ${userId}
        ORDER BY o."createdAt" DESC
      `;
    }

    return NextResponse.json({
      offers: offers.map(offer => ({
        id: offer.id,
        productId: offer.productId,
        productName: offer.product_name,
        productCategory: offer.product_category,
        offerPrice: offer.offerPrice,
        quantity: offer.quantity,
        status: offer.status,
        deliveryDate: offer.deliveryDate,
        deliveryLocation: offer.deliveryLocation,
        paymentTerms: offer.paymentTerms,
        additionalNotes: offer.additionalNotes,
        createdAt: offer.createdAt,
        otherPartyName: type === 'sent' ? offer.seller_name : offer.buyer_name,
        otherPartyType: type === 'sent' ? offer.seller_type : offer.buyer_type,
      }))
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
