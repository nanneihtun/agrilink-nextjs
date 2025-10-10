import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    // Check if identifier is an email or user ID
    const isEmail = identifier.includes('@');
    
    // Get user information with complete profile data from core tables
    let userData;
    if (isEmail) {
      userData = await sql`
        SELECT 
          u.id, u.name, u."userType", u."accountType", u."createdAt" as "joinedDate",
          u."businessName", u."businessDescription",
          up.location, up."profileImage", up.phone, up.website,
          uv.verified, uv."phoneVerified", uv."verificationStatus"
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up."userId"
        LEFT JOIN user_verification uv ON u.id = uv."userId"
        WHERE u.email = ${identifier}
        LIMIT 1
      `;
    } else {
      userData = await sql`
        SELECT 
          u.id, u.name, u."userType", u."accountType", u."createdAt" as "joinedDate",
          u."businessName", u."businessDescription",
          up.location, up."profileImage", up.phone, up.website,
          uv.verified, uv."phoneVerified", uv."verificationStatus"
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up."userId"
        LEFT JOIN user_verification uv ON u.id = uv."userId"
        WHERE u.id = ${identifier}
        LIMIT 1
      `;
    }

    if (userData.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = userData[0];

    // Get user's products if they're a seller (farmer/trader)
    let products = [];
    if (user.userType === 'farmer' || user.userType === 'trader') {
      const productData = await sql`
        SELECT 
          p.id, p.name, p.category, p.description, p.price, p.unit, p."imageUrl",
          p."createdAt", p."updatedAt",
          pp.price as current_price, pp.unit as current_unit,
          pi."availableQuantity", pi."minimumOrder"
        FROM products p
        LEFT JOIN product_pricing pp ON p.id = pp."productId"
        LEFT JOIN product_inventory pi ON p.id = pi."productId"
        WHERE p."sellerId" = ${user.id}
        AND p.active = true
        ORDER BY p."createdAt" DESC
        LIMIT 20
      `;
      
      products = productData.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.current_price || product.price,
        unit: product.current_unit || product.unit,
        imageUrl: product.imageUrl,
        availableQuantity: product.availableQuantity,
        minimumOrder: product.minimumOrder,
        createdAt: product.createdAt,
        lastUpdated: product.updatedAt
      }));
    }

    // Get user's reviews (reviews they received)
    const reviewsData = await sql`
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
      WHERE r.reviewee_id = ${user.id}
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    
    const reviews = reviewsData.map(review => ({
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
    }));

    // Transform the data to match the expected format
    const transformedUser = {
      id: user.id,
      name: user.name,
      userType: user.userType,
      accountType: user.accountType,
      joinedDate: user.joinedDate,
      location: user.location,
      profileImage: user.profileImage,
      phone: user.phone,
      website: user.website,
      
      // Business info (for business accounts)
      businessName: user.businessName,
      businessDescription: user.businessDescription,
      businessHours: null,
      specialties: null,
      policies: null,
      
      // Social media (placeholder)
      social: {
        facebook: null,
        instagram: null,
        telegram: null,
        whatsapp: null,
        tiktok: null
      },
      
      // Verification status
      verification: {
        verified: user.verified || false,
        phoneVerified: user.phoneVerified || false,
        verificationStatus: user.verificationStatus || 'unverified'
      },
      
      // Ratings and reviews (calculated from actual reviews)
      ratings: {
        rating: reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
        totalReviews: reviews.length,
        responseTime: null,
        qualityCertifications: null,
        farmingMethods: null
      },
      
      // Additional data
      products: products,
      reviews: reviews
    };

    return NextResponse.json({
      user: transformedUser,
      message: "User profile fetched successfully"
    });

  } catch (error) {
    console.error('User profile API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      identifier
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch user profile',
        details: error.message,
        identifier 
      },
      { status: 500 }
    );
  }
}
