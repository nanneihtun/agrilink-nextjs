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
          pi."imageData",
          COALESCE(pinv."availableQuantity", 'Contact seller') as quantity,
          pinv."minimumOrder",
          u.id as "sellerId",
          u.name as "sellerName",
          u."userType" as "sellerType",
          u."accountType" as "sellerAccountType",
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
          pi."imageData",
          COALESCE(pinv."availableQuantity", 'Contact seller') as quantity,
          pinv."minimumOrder",
          u.id as "sellerId",
          u.name as "sellerName",
          u."userType" as "sellerType",
          u."accountType" as "sellerAccountType",
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
      imageUrl: product.imageData,
      seller: {
        id: product.sellerId,
        name: product.sellerName,
        userType: product.sellerType,
        accountType: product.sellerAccountType,
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
    // But disable caching for seller-specific queries to avoid stale data after deletions
    if (sellerId) {
      // No caching for seller-specific queries to ensure fresh data after deletions
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      // Cache general product listings for better performance
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    
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
      availableQuantity,
      minimumOrder,
      location,
      region,
      additionalNotes,
      deliveryOptions = [],
      paymentTerms = []
    } = body;

    console.log('🔄 Creating product with data:', {
      name,
      category,
      price,
      unit,
      availableQuantity,
      minimumOrder,
      location,
      region,
      additionalNotes,
      deliveryOptions: deliveryOptions?.length || 0,
      paymentTerms: paymentTerms?.length || 0
    });

    // Insert product
    const [product] = await sql`
      INSERT INTO products (name, category, description, "sellerId", "isActive", "createdAt", "updatedAt")
      VALUES (${name}, ${category}, ${description}, ${sellerId}, true, NOW(), NOW())
      RETURNING id
    `;

    console.log('✅ Product created with ID:', product.id);

    // Insert pricing
    await sql`
      INSERT INTO product_pricing ("productId", price, unit, "createdAt", "updatedAt")
      VALUES (${product.id}, ${price}, ${unit}, NOW(), NOW())
    `;

    console.log('✅ Pricing inserted');

    // Insert inventory if provided
    if (availableQuantity !== undefined || minimumOrder !== undefined) {
      await sql`
        INSERT INTO product_inventory ("productId", "availableQuantity", "minimumOrder", "quantity", "createdAt", "updatedAt")
        VALUES (${product.id}, ${availableQuantity || ''}, ${minimumOrder || ''}, ${availableQuantity || ''}, NOW(), NOW())
      `;
      console.log('✅ Inventory inserted');
    }

    // Insert image
    if (imageUrl) {
      await sql`
        INSERT INTO product_images ("productId", "imageData", "isPrimary", "createdAt", "updatedAt")
        VALUES (${product.id}, ${imageUrl}, true, NOW(), NOW())
      `;
      console.log('✅ Image inserted');
    }

    // Insert delivery options and additional data
    if (deliveryOptions && Array.isArray(deliveryOptions) && deliveryOptions.length > 0) {
      try {
        await sql`
          INSERT INTO product_delivery ("productId", "deliveryOptions", "paymentTerms", "location", "additionalNotes", "createdAt", "updatedAt")
          VALUES (${product.id}, ${JSON.stringify(deliveryOptions)}, ${JSON.stringify(paymentTerms || [])}, ${location || 'Myanmar'}, ${additionalNotes || ''}, NOW(), NOW())
        `;
        console.log('✅ Delivery options inserted successfully');
      } catch (deliveryError) {
        console.warn('⚠️ Failed to insert delivery options:', deliveryError);
        // Don't fail the whole request for delivery options
      }
    }

    // Update user profile location and region if provided
    if (location || region) {
      try {
        // Build dynamic update query for user profile
        const updateFields = [];
        const updateValues = [];
        
        if (location) {
          updateFields.push('location = $' + (updateValues.length + 1));
          updateValues.push(location);
        }
        
        if (region) {
          updateFields.push('region = $' + (updateValues.length + 1));
          updateValues.push(region);
        }
        
        updateFields.push('"updatedAt" = NOW()');
        updateValues.push(sellerId);
        
        const query = `
          UPDATE user_profiles 
          SET ${updateFields.join(', ')}
          WHERE "userId" = $${updateValues.length}
          RETURNING *
        `;
        
        await sql.unsafe(query, updateValues);
        console.log('✅ User profile location/region updated');
      } catch (profileError) {
        console.warn('⚠️ Failed to update user profile:', profileError);
        // Don't fail the whole request for profile update
      }
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