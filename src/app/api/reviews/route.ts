import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/reviews - Get reviews for a specific offer or user
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
    const offerId = searchParams.get('offerId');
    const userId = searchParams.get('userId');

    if (offerId) {
      // Get reviews for a specific offer
      const reviews = await sql`
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          reviewer.id as reviewer_id,
          reviewer.name as reviewer_name,
          reviewer."userType" as reviewer_type,
          reviewer."accountType" as reviewer_account_type,
          reviewer_profile."profileImage" as reviewer_image,
          reviewee.id as reviewee_id,
          reviewee.name as reviewee_name,
          reviewee."userType" as reviewee_type,
          reviewee."accountType" as reviewee_account_type,
          reviewee_profile."profileImage" as reviewee_image
        FROM offer_reviews r
        INNER JOIN users reviewer ON r.reviewer_id = reviewer.id
        LEFT JOIN user_profiles reviewer_profile ON reviewer.id = reviewer_profile."userId"
        INNER JOIN users reviewee ON r.reviewee_id = reviewee.id
        LEFT JOIN user_profiles reviewee_profile ON reviewee.id = reviewee_profile."userId"
        WHERE r.offer_id = ${offerId}
        ORDER BY r.created_at DESC
      `;

      return NextResponse.json({
        reviews: reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          reviewer: {
            id: review.reviewer_id,
            name: review.reviewer_name,
            userType: review.reviewer_type,
            accountType: review.reviewer_account_type,
            profileImage: review.reviewer_image
          },
          reviewee: {
            id: review.reviewee_id,
            name: review.reviewee_name,
            userType: review.reviewee_type,
            accountType: review.reviewee_account_type,
            profileImage: review.reviewee_image
          }
        }))
      });
    }

    if (userId) {
      // Get reviews for a specific user (reviews they received)
      const reviews = await sql`
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          r.offer_id,
          reviewer.id as reviewer_id,
          reviewer.name as reviewer_name,
          reviewer."userType" as reviewer_type,
          reviewer."accountType" as reviewer_account_type,
          reviewer_profile."profileImage" as reviewer_image,
          p.name as product_name
        FROM offer_reviews r
        INNER JOIN users reviewer ON r.reviewer_id = reviewer.id
        LEFT JOIN user_profiles reviewer_profile ON reviewer.id = reviewer_profile."userId"
        INNER JOIN offers o ON r.offer_id = o.id
        INNER JOIN products p ON o.product_id = p.id
        WHERE r.reviewee_id = ${userId}
        ORDER BY r.created_at DESC
      `;

      return NextResponse.json({
        reviews: reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          offerId: review.offer_id,
          productName: review.product_name,
          reviewer: {
            id: review.reviewer_id,
            name: review.reviewer_name,
            userType: review.reviewer_type,
            accountType: review.reviewer_account_type,
            profileImage: review.reviewer_image
          }
        }))
      });
    }

    return NextResponse.json(
      { error: 'Missing offerId or userId parameter' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
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
    const { offerId, rating, comment } = body;

    // Validate required fields
    if (!offerId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: offerId, rating' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if offer exists and is completed
    const [offer] = await sql`
      SELECT 
        o.id,
        o.status,
        o.buyer_id,
        o.seller_id,
        buyer.name as buyer_name,
        seller.name as seller_name
      FROM offers o
      INNER JOIN users buyer ON o.buyer_id = buyer.id
      INNER JOIN users seller ON o.seller_id = seller.id
      WHERE o.id = ${offerId}
    `;

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (offer.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed offers' },
        { status: 400 }
      );
    }

    // Check if user is part of this offer
    const isBuyer = offer.buyer_id === user.userId;
    const isSeller = offer.seller_id === user.userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You can only review offers you are part of' },
        { status: 403 }
      );
    }

    // Determine who is being reviewed (the other party)
    const revieweeId = isBuyer ? offer.seller_id : offer.buyer_id;

    // Check if user has already reviewed this offer
    const [existingReview] = await sql`
      SELECT id FROM offer_reviews 
      WHERE offer_id = ${offerId} AND reviewer_id = ${user.userId}
    `;

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this offer' },
        { status: 400 }
      );
    }

    // Create the review
    const [newReview] = await sql`
      INSERT INTO offer_reviews (offer_id, reviewer_id, reviewee_id, rating, comment)
      VALUES (${offerId}, ${user.userId}, ${revieweeId}, ${rating}, ${comment || null})
      RETURNING *
    `;

    // Update user_ratings table with new average rating and total reviews
    const allReviewsForUser = await sql`
      SELECT rating FROM offer_reviews WHERE reviewee_id = ${revieweeId}
    `;

    const totalReviews = allReviewsForUser.length;
    const averageRating = totalReviews > 0 
      ? allReviewsForUser.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Upsert user_ratings table
    await sql`
      INSERT INTO user_ratings ("userId", rating, "totalReviews", "updatedAt")
      VALUES (${revieweeId}, ${averageRating}, ${totalReviews}, NOW())
      ON CONFLICT ("userId") 
      DO UPDATE SET 
        rating = ${averageRating},
        "totalReviews" = ${totalReviews},
        "updatedAt" = NOW()
    `;

    return NextResponse.json({
      review: {
        id: newReview.id,
        offerId: newReview.offer_id,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.created_at,
        updatedAt: newReview.updated_at
      },
      message: 'Review created successfully'
    });

  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
