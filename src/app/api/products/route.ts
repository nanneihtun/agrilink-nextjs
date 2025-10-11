import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Create connection with timeout settings
const sql = neon(process.env.DATABASE_URL!, {
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const sellerId = searchParams.get('sellerId');

    // Build the WHERE clause based on filters
    // Optimized query - fetch only essential data first
    let products;
    if (sellerId) {
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.category,
          p.description,
          p."createdAt",
          pp.price,
          pp.unit,
          pi."imageUrl",
          COALESCE(pinv."availableQuantity", 'Contact seller') as quantity,
          pinv."minimumOrder",
          u.id as seller_id,
          u.name as seller_name,
          u."userType" as seller_type,
          u."accountType" as seller_account_type,
          COALESCE(up.location, 'Myanmar') as location,
          COALESCE(up."profileImage", '') as profileImage,
          COALESCE(uv.verified, false) as verified,
          COALESCE(uv."phoneVerified", false) as phoneVerified,
          COALESCE(uv."verificationStatus", 'unverified') as verificationStatus,
          COALESCE(ur.rating, 0) as rating,
          COALESCE(ur."totalReviews", 0) as totalReviews
        FROM products p
        INNER JOIN product_pricing pp ON p.id = pp."productId"
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        LEFT JOIN product_inventory pinv ON p.id = pinv."productId"
        INNER JOIN users u ON p."sellerId" = u.id
        LEFT JOIN user_profiles up ON u.id = up."userId"
        LEFT JOIN user_verification uv ON u.id = uv."userId"
        LEFT JOIN user_ratings ur ON u.id = ur."userId"
        WHERE p."isActive" = true AND p."sellerId" = ${sellerId}
        ORDER BY p."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.category,
          p.description,
          p."createdAt",
          pp.price,
          pp.unit,
          pi."imageUrl",
          COALESCE(pinv."availableQuantity", 'Contact seller') as quantity,
          pinv."minimumOrder",
          u.id as seller_id,
          u.name as seller_name,
          u."userType" as seller_type,
          u."accountType" as seller_account_type,
          COALESCE(up.location, 'Myanmar') as location,
          COALESCE(up."profileImage", '') as profileImage,
          COALESCE(uv.verified, false) as verified,
          COALESCE(uv."phoneVerified", false) as phoneVerified,
          COALESCE(uv."verificationStatus", 'unverified') as verificationStatus,
          COALESCE(ur.rating, 0) as rating,
          COALESCE(ur."totalReviews", 0) as totalReviews
        FROM products p
        INNER JOIN product_pricing pp ON p.id = pp."productId"
        LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
        LEFT JOIN product_inventory pinv ON p.id = pinv."productId"
        INNER JOIN users u ON p."sellerId" = u.id
        LEFT JOIN user_profiles up ON u.id = up."userId"
        LEFT JOIN user_verification uv ON u.id = uv."userId"
        LEFT JOIN user_ratings ur ON u.id = ur."userId"
        WHERE p."isActive" = true
        ORDER BY p."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Simplified transformation - data is already processed by COALESCE
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      quantity: product.quantity || 0,
      createdAt: product.createdAt,
      price: parseFloat(product.price) || 0,
      unit: product.unit,
      imageUrl: product.imageUrl,
      seller: {
        id: product.seller_id,
        name: product.seller_name,
        userType: product.seller_type,
        accountType: product.seller_account_type,
        location: product.location,
        profileImage: product.profileImage,
        verified: product.verified,
        phoneVerified: product.phoneVerified,
        verificationStatus: product.verificationStatus,
        rating: parseFloat(product.rating) || 0,
        totalReviews: product.totalReviews || 0,
      }
    }));

    const response = NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length,
      message: 'Products fetched successfully from Neon database!'
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;

  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      description,
      price,
      unit,
      imageUrl,
      sellerId,
      deliveryOptions = [],
      paymentTerms = []
    } = body;

    // Insert product
    const [product] = await sql`
      INSERT INTO products (name, category, description, "sellerId", "isActive", "createdAt", "updatedAt")
      VALUES (${name}, ${category}, ${description}, ${sellerId}, true, NOW(), NOW())
      RETURNING id
    `;

    // Insert pricing
    await sql`
      INSERT INTO product_pricing ("productId", price, unit, "createdAt", "updatedAt")
      VALUES (${product.id}, ${price}, ${unit}, NOW(), NOW())
    `;

    // Insert image
    if (imageUrl) {
      await sql`
        INSERT INTO product_images ("productId", "imageUrl", "isPrimary", "createdAt", "updatedAt")
        VALUES (${product.id}, ${imageUrl}, true, NOW(), NOW())
      `;
    }

    // Insert delivery options
    if (deliveryOptions.length > 0) {
      await sql`
        INSERT INTO product_delivery ("productId", "deliveryOptions", "createdAt", "updatedAt")
        VALUES (${product.id}, ${deliveryOptions}, NOW(), NOW())
      `;
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      message: 'Product created successfully!'
    });

  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}