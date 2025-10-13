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

// PUT /api/offers/[id] - Update offer status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: offerId } = await params;
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, cancellationReason } = body;

    console.log('🔍 Update offer API - Request:', {
      offerId,
      userId: user.userId,
      status,
      cancellationReason
    });

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'to_ship', 'ready_to_pickup', 'shipped', 'to_receive', 'completed', 'cancelled', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if offer exists and user has permission to update it
    const [existingOffer] = await sql`
      SELECT 
        o.id,
        o."buyerId",
        o."sellerId",
        o.status,
        p.name as "productName",
        buyer.name as "buyerName",
        seller.name as "sellerName"
      FROM offers o
      INNER JOIN products p ON o."productId" = p.id
      INNER JOIN users buyer ON o."buyerId" = buyer.id
      INNER JOIN users seller ON o."sellerId" = seller.id
      WHERE o.id = ${offerId}
    `;

    if (!existingOffer) {
      return NextResponse.json(
        { message: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user is the seller (can accept/reject) or buyer (can update their own offers)
    const isSeller = existingOffer.sellerId === user.userId;
    const isBuyer = existingOffer.buyerId === user.userId;

    if (!isSeller && !isBuyer) {
      return NextResponse.json(
        { message: 'Forbidden - You can only update your own offers or offers on your products' },
        { status: 403 }
      );
    }

    // Get current offer to check delivery options
    const [currentOffer] = await sql`
      SELECT "deliveryOptions" FROM offers WHERE id = ${offerId}
    `;

    // Auto-complete logic: if buyer marks as "to_receive", automatically complete the transaction
    let finalStatus = status;
    
    if (status === 'to_receive') {
      // Check if pickup is in delivery options to determine workflow (case-insensitive)
      const isPickup = currentOffer.deliveryOptions && currentOffer.deliveryOptions.some((option: string) => 
        option.toLowerCase() === 'pickup'
      );
      
      if (isPickup) {
        finalStatus = 'completed'; // Auto-complete pickup orders immediately
      } else {
        finalStatus = 'completed'; // Auto-complete delivery orders immediately
      }
    }

    // Update the offer with new status workflow
    const updateData: any = {
      status: finalStatus,
      "updatedAt": new Date().toISOString()
    };

    // Add cancellation details if cancelling
    if (finalStatus === 'cancelled') {
      updateData.cancelledBy = user.userId;
      updateData.cancellationReason = cancellationReason || null;
    }

    const [updatedOffer] = await sql`
      UPDATE offers
      SET 
        status = ${finalStatus},
        "updatedAt" = NOW(),
        ${finalStatus === 'accepted' ? sql`"acceptedAt" = NOW(),` : sql``}
        ${finalStatus === 'to_ship' ? sql`"readyToShipAt" = NOW(),` : sql``}
        ${finalStatus === 'ready_to_pickup' ? sql`"readyToPickupAt" = NOW(),` : sql``}
        ${finalStatus === 'cancelled' ? sql`"cancelledBy" = ${user.userId},` : sql``}
        ${finalStatus === 'cancelled' ? sql`"cancellationReason" = ${cancellationReason || null},` : sql``}
        ${finalStatus === 'cancelled' ? sql`"cancelledAt" = NOW(),` : sql``}
        ${finalStatus === 'shipped' ? sql`"shippedAt" = NOW(),` : sql``}
        ${status === 'to_receive' ? sql`"receivedAt" = NOW(),` : sql``}
        ${finalStatus === 'completed' ? sql`"completedAt" = NOW(),` : sql``}
        "statusUpdatedAt" = NOW()
      WHERE id = ${offerId}
      RETURNING *
    `;

    console.log('✅ Offer updated successfully:', updatedOffer.id);

    return NextResponse.json({
      offer: {
        id: updatedOffer.id,
        conversationId: updatedOffer.conversationId,
        offerPrice: parseFloat(updatedOffer.offerPrice),
        quantity: updatedOffer.quantity,
        message: updatedOffer.message,
        status: updatedOffer.status,
        deliveryOptions: updatedOffer.deliveryOptions || [],
        paymentTerms: updatedOffer.paymentTerms || [],
        expiresAt: updatedOffer.expiresAt,
        acceptedAt: updatedOffer.acceptedAt,
        readyToShipAt: updatedOffer.readyToShipAt,
        readyToPickupAt: updatedOffer.readyToPickupAt,
        createdAt: updatedOffer.createdAt,
        updatedAt: updatedOffer.updatedAt,
        statusUpdatedAt: updatedOffer.statusUpdatedAt,
        shippedAt: updatedOffer.shippedAt,
        receivedAt: updatedOffer.receivedAt,
        completedAt: updatedOffer.completedAt,
        cancelledAt: updatedOffer.cancelledAt,
        cancelledBy: updatedOffer.cancelledBy,
        cancellationReason: updatedOffer.cancellationReason
      },
      message: 'Offer updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/offers/[id] - Get single offer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: offerId } = await params;
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [offer] = await sql`
      SELECT 
        o.id,
        o."conversationId",
        o."offerPrice",
        o.quantity,
        o.message,
        o.status,
        o."deliveryAddress",
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
        o."statusUpdatedAt",
        o."cancelledAt",
        o."cancelledBy",
        o."cancellationReason",
        p.id as "productId",
        p.name as "productName",
        p.category as "productCategory",
        pi."imageData" as "productImage",
        buyer.id as "buyerId",
        buyer.name as "buyerName",
        buyer.email as "buyerEmail",
        buyer."userType" as "buyerType",
        buyer."accountType" as "buyerAccountType",
        buyer."verificationStatus" as "buyerVerificationLevel",
        buyer_profile."profileImage" as "buyerImage",
        seller.id as "sellerId",
        seller.name as "sellerName",
        seller.email as "sellerEmail",
        seller."userType" as "sellerType",
        seller."accountType" as "sellerAccountType",
        seller."verificationStatus" as "sellerVerificationLevel",
        seller_profile."profileImage" as "sellerImage"
      FROM offers o
      INNER JOIN products p ON o."productId" = p.id
      LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
      INNER JOIN users buyer ON o."buyerId" = buyer.id
      LEFT JOIN user_profiles buyer_profile ON buyer.id = buyer_profile."userId"
      INNER JOIN users seller ON o."sellerId" = seller.id
      LEFT JOIN user_profiles seller_profile ON seller.id = seller_profile."userId"
      WHERE o.id = ${offerId}
    `;

    if (!offer) {
      return NextResponse.json(
        { message: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this offer
    const isSeller = offer.sellerId === user.userId;
    const isBuyer = offer.buyerId === user.userId;

    if (!isSeller && !isBuyer) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      offer: {
        id: offer.id,
        conversationId: offer.conversationId,
        offerPrice: parseFloat(offer.offerPrice),
        quantity: offer.quantity,
        message: offer.message,
        status: offer.status,
        deliveryAddress: offer.deliveryAddress,
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
        statusUpdatedAt: offer.statusUpdatedAt,
        cancelledAt: offer.cancelledAt,
        cancelledBy: offer.cancelledBy,
        cancellationReason: offer.cancellationReason,
        productId: offer.productId,
        productName: offer.productName,
        productCategory: offer.productCategory,
        productImage: offer.productImage,
        buyerId: offer.buyerId,
        buyerName: offer.buyerName,
        buyerEmail: offer.buyerEmail,
        buyerUserType: offer.buyerType,
        buyerAccountType: offer.buyerAccountType,
        buyerVerificationLevel: offer.buyerVerificationLevel,
        buyerImage: null, // We don't have buyer image in this query
        sellerId: offer.sellerId,
        sellerName: offer.sellerName,
        sellerEmail: offer.sellerEmail,
        sellerUserType: offer.sellerType,
        sellerAccountType: offer.sellerAccountType,
        sellerVerificationLevel: offer.sellerVerificationLevel,
        sellerImage: offer.sellerImage,
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
          verificationLevel: offer.buyerVerificationLevel,
          profileImage: offer.buyerImage
        },
        seller: {
          id: offer.sellerId,
          name: offer.sellerName,
          userType: offer.sellerType,
          accountType: offer.sellerAccountType,
          verificationLevel: offer.sellerVerificationLevel,
          profileImage: offer.sellerImage
        }
      },
      message: 'Offer fetched successfully'
    });

  } catch (error: any) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}