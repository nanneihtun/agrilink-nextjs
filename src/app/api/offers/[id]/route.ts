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
        o.buyer_id,
        o.seller_id,
        o.status,
        p.name as product_name,
        buyer.name as buyer_name,
        seller.name as seller_name
      FROM offers o
      INNER JOIN products p ON o.product_id = p.id
      INNER JOIN users buyer ON o.buyer_id = buyer.id
      INNER JOIN users seller ON o.seller_id = seller.id
      WHERE o.id = ${offerId}
    `;

    if (!existingOffer) {
      return NextResponse.json(
        { message: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user is the seller (can accept/reject) or buyer (can update their own offers)
    const isSeller = existingOffer.seller_id === user.userId;
    const isBuyer = existingOffer.buyer_id === user.userId;

    if (!isSeller && !isBuyer) {
      return NextResponse.json(
        { message: 'Forbidden - You can only update your own offers or offers on your products' },
        { status: 403 }
      );
    }

    // Get current offer to check delivery options
    const [currentOffer] = await sql`
      SELECT delivery_options FROM offers WHERE id = ${offerId}
    `;

    // Auto-complete logic: if buyer marks as "to_receive", automatically complete the transaction
    let finalStatus = status;
    
    if (status === 'to_receive') {
      // Check if pickup is in delivery options to determine workflow (case-insensitive)
      const isPickup = currentOffer.delivery_options && currentOffer.delivery_options.some((option: string) => 
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
      updated_at: new Date().toISOString()
    };

    // Add cancellation details if cancelling
    if (finalStatus === 'cancelled') {
      updateData.cancelled_by = user.userId;
      updateData.cancellation_reason = cancellationReason || null;
    }

    const [updatedOffer] = await sql`
      UPDATE offers
      SET 
        status = ${finalStatus},
        updated_at = NOW(),
        ${finalStatus === 'accepted' ? sql`accepted_at = NOW(),` : sql``}
        ${finalStatus === 'cancelled' ? sql`cancelled_by = ${user.userId},` : sql``}
        ${finalStatus === 'cancelled' ? sql`cancellation_reason = ${cancellationReason || null},` : sql``}
        ${finalStatus === 'cancelled' ? sql`cancelled_at = NOW(),` : sql``}
        ${finalStatus === 'shipped' ? sql`shipped_at = NOW(),` : sql``}
        ${status === 'to_receive' ? sql`received_at = NOW(),` : sql``}
        ${finalStatus === 'completed' ? sql`completed_at = NOW(),` : sql``}
        status_updated_at = NOW()
      WHERE id = ${offerId}
      RETURNING *
    `;

    console.log('✅ Offer updated successfully:', updatedOffer.id);

    return NextResponse.json({
      offer: {
        id: updatedOffer.id,
        conversationId: updatedOffer.conversation_id,
        offerPrice: parseFloat(updatedOffer.offer_price),
        quantity: updatedOffer.quantity,
        message: updatedOffer.message,
        status: updatedOffer.status,
        deliveryOptions: updatedOffer.delivery_options || [],
        paymentTerms: updatedOffer.payment_terms || [],
        expiresAt: updatedOffer.expires_at,
        acceptedAt: updatedOffer.accepted_at,
        createdAt: updatedOffer.created_at,
        updatedAt: updatedOffer.updated_at,
        statusUpdatedAt: updatedOffer.status_updated_at,
        shippedAt: updatedOffer.shipped_at,
        receivedAt: updatedOffer.received_at,
        completedAt: updatedOffer.completed_at,
        cancelledAt: updatedOffer.cancelled_at,
        cancelledBy: updatedOffer.cancelled_by,
        cancellationReason: updatedOffer.cancellation_reason
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
        o.conversation_id,
        o.offer_price,
        o.quantity,
        o.message,
        o.status,
        o.delivery_address,
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
        o.status_updated_at,
        o.cancelled_at,
        o.cancelled_by,
        o.cancellation_reason,
        p.id as product_id,
        p.name as product_name,
        p.category as product_category,
        pi."imageUrl" as product_image,
        buyer.id as buyer_id,
        buyer.name as buyer_name,
        buyer.email as buyer_email,
        buyer."userType" as buyer_type,
        buyer."accountType" as buyer_account_type,
        buyer_profile."profileImage" as buyer_image,
        seller.id as seller_id,
        seller.name as seller_name,
        seller.email as seller_email,
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
      WHERE o.id = ${offerId}
    `;

    if (!offer) {
      return NextResponse.json(
        { message: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this offer
    const isSeller = offer.seller_id === user.userId;
    const isBuyer = offer.buyer_id === user.userId;

    if (!isSeller && !isBuyer) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      offer: {
        id: offer.id,
        conversationId: offer.conversation_id,
        offerPrice: parseFloat(offer.offer_price),
        quantity: offer.quantity,
        message: offer.message,
        status: offer.status,
        deliveryAddress: offer.delivery_address,
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
        statusUpdatedAt: offer.status_updated_at,
        cancelledAt: offer.cancelled_at,
        cancelledBy: offer.cancelled_by,
        cancellationReason: offer.cancellation_reason,
        productId: offer.product_id,
        productName: offer.product_name,
        productCategory: offer.product_category,
        productImage: offer.product_image,
        buyerId: offer.buyer_id,
        buyerName: offer.buyer_name,
        buyerEmail: offer.buyer_email,
        buyerUserType: offer.buyer_type,
        buyerAccountType: offer.buyer_account_type,
        buyerImage: null, // We don't have buyer image in this query
        sellerId: offer.seller_id,
        sellerName: offer.seller_name,
        sellerEmail: offer.seller_email,
        sellerUserType: offer.seller_type,
        sellerAccountType: offer.seller_account_type,
        sellerImage: offer.seller_image,
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