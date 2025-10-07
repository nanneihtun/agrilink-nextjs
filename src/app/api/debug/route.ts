import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Test simple query
    const simpleQuery = await sql`
      SELECT p.id, p.name, p."sellerId", u.id as seller_id, u.name as seller_name
      FROM products p
      LEFT JOIN users u ON p."sellerId" = u.id
      WHERE p.id = 'c65a34d1-9cdf-406d-a0fb-ff6a7c13bde3'
    `;

    // Test complex query
    const complexQuery = await sql`
      SELECT 
        p.id, p.name, p.category, p.description, p."isActive", p."createdAt",
        pp.price, pp.unit,
        pi."imageUrl",
        u.id as seller_id, u.name as seller_name, u."userType" as seller_type, u.email as seller_email, u."accountType" as seller_account_type,
        up.location, up."profileImage",
        uv.verified, uv."phoneVerified", uv."verificationStatus",
        ur.rating, ur."totalReviews"
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
      LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
      LEFT JOIN users u ON p."sellerId" = u.id
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LEFT JOIN user_ratings ur ON u.id = ur."userId"
      WHERE p.id = 'c65a34d1-9cdf-406d-a0fb-ff6a7c13bde3'
    `;

    return NextResponse.json({
      simpleQuery: simpleQuery[0],
      complexQuery: complexQuery[0],
      message: 'Debug data fetched successfully!'
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error.message },
      { status: 500 }
    );
  }
}
