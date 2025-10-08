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
        u.id as seller_id, u.name as seller_name, u."userType" as seller_type,
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
      location: product.location || 'Unknown Location',
      lastUpdated: product.createdAt,
      availableQuantity: null,
      minimumOrder: null,
      deliveryOptions: [],
      paymentTerms: [],
      additionalNotes: null,
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

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, we'll just update the basic product fields
    // In a real implementation, you'd want to update all related tables
    const updatedProduct = await sql`
      UPDATE products 
      SET 
        name = ${body.name},
        category = ${body.category},
        description = ${body.description},
        "updatedAt" = NOW()
      WHERE id = ${productId}
      RETURNING *
    `;

    if (updatedProduct.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Update pricing if provided
    if (body.price !== undefined) {
      await sql`
        UPDATE product_pricing 
        SET 
          price = ${body.price},
          unit = ${body.unit || 'kg'},
          "updatedAt" = NOW()
        WHERE "productId" = ${productId}
      `;
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct[0]
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
