import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    console.log('🔍 Price Comparison API - Fetching price data for product:', productId);

    // Get the current product details first
    const currentProduct = await sql`
      SELECT 
        p.id, p.name, p.category, p."createdAt",
        pp.price, pp.unit
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
      WHERE p.id = ${productId} AND p."isActive" = true
      LIMIT 1
    `;

    if (currentProduct.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const product = currentProduct[0];

    // First, get all products with pricing data
    const allProductsWithPricing = await sql`
      SELECT 
        p.id,
        p.name,
        p."createdAt",
        pp.price,
        pp.unit,
        pinv."availableQuantity",
        pinv."minimumOrder",
        u.id as seller_id,
        u.name as seller_name,
        u."userType" as seller_type,
        up.location,
        up."profileImage",
        uv.verified,
        uv."phoneVerified",
        uv."verificationStatus",
        ur.rating,
        ur."totalReviews"
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
      LEFT JOIN product_inventory pinv ON p.id = pinv."productId"
      LEFT JOIN users u ON p."sellerId" = u.id
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LEFT JOIN user_ratings ur ON u.id = ur."userId"
      WHERE 
        p."isActive" = true 
        AND pp.price IS NOT NULL
        AND p.id != ${productId}
      ORDER BY pp.price ASC
    `;

    // Filter products with similar names using JavaScript (more reliable)
    const searchTerm = product.name.toLowerCase();
    const priceComparisonData = allProductsWithPricing.filter(item => {
      const itemName = item.name.toLowerCase();
      
      // Exact match
      if (itemName === searchTerm) return true;
      
      // One contains the other
      if (itemName.includes(searchTerm) || searchTerm.includes(itemName)) return true;
      
      // Check for meaningful word matches (exclude common words like "fresh", "organic", "premium")
      const commonWords = ['fresh', 'organic', 'premium', 'quality', 'grade', 'a', 'the', 'and', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
      const searchWords = searchTerm.split(' ').filter((word: string) => word.length > 2 && !commonWords.includes(word));
      const itemWords = itemName.split(' ').filter((word: string) => word.length > 2 && !commonWords.includes(word));
      
      // Must have at least one meaningful word in common
      const hasCommonWords = searchWords.some((searchWord: string) => 
        itemWords.some((itemWord: string) => 
          searchWord.includes(itemWord) || itemWord.includes(searchWord)
        )
      );
      
      return hasCommonWords;
    });

    console.log('📊 Price Comparison API - Total products with pricing:', allProductsWithPricing.length);
    console.log('📊 Price Comparison API - Found', priceComparisonData.length, 'similar products');
    console.log('🔍 Search product name:', product.name);
    console.log('🔍 Search term:', searchTerm);
    console.log('🔍 All product names:', allProductsWithPricing.map(p => p.name));
    console.log('🔍 Found products:', priceComparisonData.map(p => ({ id: p.id, name: p.name, seller: p.seller_name, price: p.price })));

    // Transform the data to match PriceComparison component expectations
    const transformedData = priceComparisonData.map(item => ({
      id: item.id,
      name: item.name, // Full product name
      sellerName: item.seller_name || 'Unknown Seller',
      sellerType: item.seller_type || 'farmer',
      price: parseFloat(item.price) || 0,
      unit: item.unit,
      location: item.location || 'Unknown Location',
      quantity: item.availableQuantity || item.minimumOrder || 'Inquire for quantity',
      availableQuantity: item.availableQuantity,
      minimumOrder: item.minimumOrder,
      lastUpdated: item.createdAt,
      seller: {
        id: item.seller_id,
        name: item.seller_name,
        userType: item.seller_type,
        location: item.location,
        profileImage: item.profileImage,
        verified: item.verified,
        phoneVerified: item.phoneVerified,
        verificationStatus: item.verificationStatus,
        rating: parseFloat(item.rating) || 0,
        totalReviews: item.totalReviews || 0,
      }
    }));

    return NextResponse.json({
      productName: product.name,
      unit: product.unit,
      currentProduct: {
        id: product.id,
        price: parseFloat(product.price) || 0,
        unit: product.unit
      },
      priceData: transformedData,
      message: 'Price comparison data fetched successfully'
    });

  } catch (error) {
    console.error("❌ Price Comparison API Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
