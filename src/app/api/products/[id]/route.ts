import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get product with seller info using the same approach as the main products API
    const products = await sql`
      SELECT 
        p.id, p.name, p.category, p.description, p."isActive", p."createdAt",
        pp.price, pp.unit,
        pi."imageUrl",
        pinv."availableQuantity", pinv."minimumOrder",
        pd.location as delivery_location, pd."deliveryOptions", pd."paymentTerms", pd."additionalNotes",
        u.id as seller_id, u.name as seller_name, u."userType" as seller_type,
        up.location, up."profileImage",
        uv.verified, uv."phoneVerified", uv."verificationStatus",
        ur.rating, ur."totalReviews"
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
      LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
      LEFT JOIN product_inventory pinv ON p.id = pinv."productId"
      LEFT JOIN product_delivery pd ON p.id = pd."productId"
      LEFT JOIN users u ON p."sellerId" = u.id
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LEFT JOIN user_ratings ur ON u.id = ur."userId"
      WHERE p.id = ${productId} AND p."isActive" = true
      LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const product = products[0];

    // Transform the data to match the expected format
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      images: product.imageUrl ? [product.imageUrl] : [],
      sellerId: product.seller_id,
      sellerName: product.seller_name || 'Unknown Seller',
      sellerType: product.seller_type || 'farmer',
      location: product.delivery_location || product.location || 'Unknown Location',
      lastUpdated: product.createdAt,
      availableQuantity: product.availableQuantity || '',
      minimumOrder: product.minimumOrder || '',
      deliveryOptions: product.deliveryOptions || [],
      paymentTerms: product.paymentTerms || [],
      additionalNotes: product.additionalNotes || '',
      sellerVerificationStatus: {
        accountType: 'individual',
        trustLevel: product.verificationStatus === 'approved' ? 'id-verified' : 'unverified',
        businessVerified: false,
      },
    };

    return NextResponse.json({
      product: transformedProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();

    console.log('🔄 PUT /api/products/[id] - Received data:', {
      productId,
      body: {
        id: body.id,
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price,
        unit: body.unit,
        location: body.location,
        region: body.region,
        availableQuantity: body.availableQuantity,
        minimumOrder: body.minimumOrder,
        deliveryOptions: body.deliveryOptions,
        paymentTerms: body.paymentTerms,
        additionalNotes: body.additionalNotes
      }
    });

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header provided');
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Start a transaction to update all related tables
    console.log('🔄 Starting database updates...');

    // Update main product table
    const updatedProduct = await sql`
      UPDATE products 
      SET 
        name = ${body.name || ''},
        category = ${body.category || ''},
        description = ${body.description || ''},
        "updatedAt" = NOW()
      WHERE id = ${productId}
      RETURNING *
    `;

    if (updatedProduct.length === 0) {
      console.log('❌ Product not found:', productId);
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    console.log('✅ Updated product:', updatedProduct[0]);

    // Update pricing if provided (UPSERT - Insert or Update)
    if (body.price !== undefined && body.price !== null) {
      const pricingResult = await sql`
        INSERT INTO product_pricing ("productId", price, unit, "createdAt", "updatedAt")
        VALUES (${productId}, ${body.price}, ${body.unit || 'kg'}, NOW(), NOW())
        ON CONFLICT ("productId") 
        DO UPDATE SET
          price = ${body.price},
          unit = ${body.unit || 'kg'},
          "updatedAt" = NOW()
        RETURNING *
      `;
      console.log('✅ Updated pricing:', pricingResult[0]);
    }

    // Update inventory if provided (UPSERT - Insert or Update)
    if (body.availableQuantity || body.minimumOrder) {
      const inventoryResult = await sql`
        INSERT INTO product_inventory ("productId", "availableQuantity", "minimumOrder", "quantity", "createdAt", "updatedAt")
        VALUES (${productId}, ${body.availableQuantity || ''}, ${body.minimumOrder || ''}, ${body.availableQuantity || ''}, NOW(), NOW())
        ON CONFLICT ("productId") 
        DO UPDATE SET
          "availableQuantity" = ${body.availableQuantity || ''},
          "minimumOrder" = ${body.minimumOrder || ''},
          "quantity" = ${body.availableQuantity || ''},
          "updatedAt" = NOW()
        RETURNING *
      `;
      console.log('✅ Updated inventory:', inventoryResult[0]);
    }

    // Update user profile location if provided
    if (body.location) {
      // First get the seller ID from the product
      const productWithSeller = await sql`
        SELECT "sellerId" FROM products WHERE id = ${productId}
      `;

      if (productWithSeller.length > 0) {
        const sellerId = productWithSeller[0].sellerId;
        const profileResult = await sql`
          UPDATE user_profiles 
          SET 
            location = ${body.location},
            "updatedAt" = NOW()
          WHERE "userId" = ${sellerId}
          RETURNING *
        `;
        console.log('✅ Updated user profile:', profileResult[0]);
      }
    }

    // Update product delivery information if provided (UPSERT - Insert or Update)
    if (body.deliveryOptions || body.paymentTerms || body.additionalNotes !== undefined || body.location) {
      // First get the seller info from the product
      const productWithSeller = await sql`
        SELECT p."sellerId", u.name as seller_name, u."userType" as seller_type
        FROM products p
        JOIN users u ON p."sellerId" = u.id
        WHERE p.id = ${productId}
      `;

      if (productWithSeller.length > 0) {
        const seller = productWithSeller[0];
        const deliveryResult = await sql`
          INSERT INTO product_delivery ("productId", location, "sellerType", "sellerName", "deliveryOptions", "paymentTerms", "additionalNotes", "createdAt", "updatedAt")
          VALUES (${productId}, ${body.location || ''}, ${seller.seller_type}, ${seller.seller_name}, ${body.deliveryOptions || []}, ${body.paymentTerms || []}, ${body.additionalNotes || ''}, NOW(), NOW())
          ON CONFLICT ("productId") 
          DO UPDATE SET
            location = ${body.location || ''},
            "deliveryOptions" = ${body.deliveryOptions || []},
            "paymentTerms" = ${body.paymentTerms || []},
            "additionalNotes" = ${body.additionalNotes || ''},
            "updatedAt" = NOW()
          RETURNING *
        `;
        console.log('✅ Updated product delivery:', deliveryResult[0]);
      }
    }

    console.log('✅ Product update completed successfully');

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct[0],
      updated: true
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
