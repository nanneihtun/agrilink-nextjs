import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Products API - Fetching all products');

    // Get all products with basic info
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.category,
        p."isActive",
        pp.price,
        u.name as seller_name,
        u."userType" as seller_type
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
      LEFT JOIN users u ON p."sellerId" = u.id
      WHERE p."isActive" = true
      ORDER BY p.name ASC
    `;

    console.log('📊 Debug Products API - Found', products.length, 'active products');

    // Filter products with "jasmine" in the name
    const jasmineProducts = products.filter(p => 
      p.name && p.name.toLowerCase().includes('jasmine')
    );

    console.log('🌾 Jasmine products found:', jasmineProducts.length);
    console.log('🌾 Jasmine product names:', jasmineProducts.map(p => p.name));

    return NextResponse.json({
      totalProducts: products.length,
      jasmineProducts: jasmineProducts.length,
      allProducts: products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        seller: p.seller_name,
        sellerType: p.seller_type
      })),
      jasmineProducts: jasmineProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        seller: p.seller_name,
        sellerType: p.seller_type
      }))
    });

  } catch (error) {
    console.error('❌ Debug Products API Error:', error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
