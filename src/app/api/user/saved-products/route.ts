import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/user/saved-products - Get user's saved products
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
    const userId = searchParams.get('userId') || user.userId;

    console.log('🔍 Fetching saved products for userId:', userId);

    // Get saved products with product details
    const savedProducts = await sql`
      SELECT 
        sp.id,
        sp."productId",
        sp."savedDate",
        sp."priceWhenSaved",
        sp.alerts,
        p.name as "productName",
        p.category,
        p.description,
        p.price as "currentPrice",
        p.unit,
        p."imageUrl",
        p."sellerId",
        u.name as "sellerName",
        u."userType" as "sellerType",
        up.location as "sellerLocation"
      FROM saved_products sp
      LEFT JOIN products p ON sp."productId" = p.id
      LEFT JOIN users u ON p."sellerId" = u.id
      LEFT JOIN user_profiles up ON u.id = up."userId"
      WHERE sp."userId" = ${userId}
      ORDER BY sp."savedDate" DESC
    `;

    console.log('✅ Found saved products:', savedProducts.length);

    return NextResponse.json({
      savedProducts: savedProducts.map(sp => ({
        id: sp.id,
        productId: sp.productId,
        savedDate: sp.savedDate,
        priceWhenSaved: sp.priceWhenSaved,
        alerts: sp.alerts,
        product: {
          id: sp.productId,
          name: sp.productName,
          category: sp.category,
          description: sp.description,
          price: sp.currentPrice,
          unit: sp.unit,
          imageUrl: sp.imageUrl,
          seller: {
            id: sp.sellerId,
            name: sp.sellerName,
            userType: sp.sellerType,
            location: sp.sellerLocation
          }
        }
      }))
    });

  } catch (error: any) {
    console.error('Error fetching saved products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-products - Save a product
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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('💾 Saving product for user:', { userId: user.userId, productId });

    // Get current product price
    const product = await sql`
      SELECT price FROM products WHERE id = ${productId}
    `;

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const currentPrice = product[0].price;

    // Check if already saved
    const existing = await sql`
      SELECT id FROM saved_products 
      WHERE "userId" = ${user.userId} AND "productId" = ${productId}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Product already saved' },
        { status: 409 }
      );
    }

    // Save the product
    const result = await sql`
      INSERT INTO saved_products (
        "userId", 
        "productId", 
        "savedDate", 
        "priceWhenSaved", 
        alerts,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${user.userId}, 
        ${productId}, 
        NOW(), 
        ${currentPrice}, 
        ${JSON.stringify({ priceAlert: false, stockAlert: false })},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log('✅ Product saved successfully');

    return NextResponse.json({
      message: 'Product saved successfully',
      savedProduct: result[0]
    });

  } catch (error: any) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/saved-products - Unsave a product
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Unsaving product for user:', { userId: user.userId, productId });

    // Remove the saved product
    const result = await sql`
      DELETE FROM saved_products 
      WHERE "userId" = ${user.userId} AND "productId" = ${productId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Saved product not found' },
        { status: 404 }
      );
    }

    console.log('✅ Product unsaved successfully');

    return NextResponse.json({
      message: 'Product unsaved successfully'
    });

  } catch (error: any) {
    console.error('Error unsaving product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
