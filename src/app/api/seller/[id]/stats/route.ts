import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sellerId } = await params;

    // Get total products count
    const productsResult = await sql`
      SELECT COUNT(*) as total_products
      FROM products 
      WHERE "sellerId" = ${sellerId} AND "isActive" = true
    `;

    // Get reviews from offer_reviews table with product information
    const reviewsResult = await sql`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as reviewer_name,
        p.name as product_name
      FROM offer_reviews r
      INNER JOIN users u ON r.reviewer_id = u.id
      INNER JOIN offers o ON r.offer_id = o.id
      INNER JOIN products p ON o.product_id = p.id
      WHERE r.reviewee_id = ${sellerId}
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    // Calculate average rating and total reviews from actual review data
    const totalReviews = reviewsResult.length;
    const averageRating = totalReviews > 0 
      ? reviewsResult.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const totalProducts = parseInt(productsResult[0]?.total_products || '0');
    const recentReviews = reviewsResult.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      reviewer_name: review.reviewer_name,
      product_name: review.product_name
    }));

    // Calculate completion rate based on profile completeness
    const userProfile = await sql`
      SELECT 
        u.name, u.email, u."userType", u."accountType",
        up.location, up."profileImage",
        uv.verified, uv."phoneVerified"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      WHERE u.id = ${sellerId}
    `;

    let completionRate = 0;
    if (userProfile.length > 0) {
      const profile = userProfile[0];
      let completedFields = 0;
      const totalFields = 6; // name, email, userType, location, profileImage, verified

      if (profile.name) completedFields++;
      if (profile.email) completedFields++;
      if (profile.userType) completedFields++;
      if (profile.location) completedFields++;
      if (profile.profileImage) completedFields++;
      if (profile.verified) completedFields++;

      completionRate = Math.round((completedFields / totalFields) * 100);
    }

    const stats = {
      totalProducts,
      totalSales: 0, // TODO: Implement sales tracking
      averageRating,
      totalReviews,
      responseTime: 'Within 24 hours', // TODO: Calculate based on actual response times
      completionRate,
      recentReviews
    };

    return NextResponse.json({
      stats
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
