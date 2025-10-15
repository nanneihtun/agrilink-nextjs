import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { 
  products as productsTable, 
  productImages, 
  savedProducts,
  users,
  userProfiles,
  userVerification,
  userRatings,
  locations,
  categories,
  deliveryOptions as deliveryOptionsTable,
  paymentTerms as paymentTermsTable,
  sellerCustomDeliveryOptions,
  sellerCustomPaymentTerms
} from '@/lib/db/schema';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const sellerId = searchParams.get('sellerId');

    // Build query using normalized structure
    let productsQuery;
    if (sellerId) {
      productsQuery = db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          description: productsTable.description,
          createdAt: productsTable.createdAt,
          price: productsTable.price,
          packageSize: productsTable.packageSize,
          availableStock: productsTable.availableStock,
          minimumOrder: productsTable.minimumOrder,
          deliveryOptions: productsTable.deliveryOptions,
          paymentTerms: productsTable.paymentTerms,
          additionalNotes: productsTable.additionalNotes,
          sellerType: productsTable.sellerType,
          sellerName: productsTable.sellerName,
          imageData: productImages.imageData,
          sellerId: users.id,
          sellerNameFromUser: users.name,
          userType: users.userType,
          accountType: users.accountType,
          category: categories.name,
          location: sql<string>`CASE WHEN ${locations.city} IS NOT NULL AND ${locations.region} IS NOT NULL THEN ${locations.city} || ', ' || ${locations.region} ELSE ${locations.city} END`,
          region: locations.region,
          city: locations.city,
          profileImage: userProfiles.profileImage,
          verified: userVerification.verified,
          phoneVerified: userVerification.phoneVerified,
          verificationStatus: userVerification.verificationStatus,
          rating: userRatings.rating,
          totalReviews: userRatings.totalReviews,
        })
        .from(productsTable)
        .leftJoin(categories, eq(productsTable.categoryId, categories.id))
        .leftJoin(locations, eq(productsTable.locationId, locations.id))
        .leftJoin(users, eq(productsTable.sellerId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .leftJoin(userVerification, eq(users.id, userVerification.userId))
        .leftJoin(userRatings, eq(users.id, userRatings.userId))
        .leftJoin(productImages, and(eq(productImages.productId, productsTable.id), eq(productImages.isPrimary, true)))
        .where(and(eq(productsTable.isActive, true), eq(productsTable.sellerId, sellerId)))
        .orderBy(desc(productsTable.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      productsQuery = db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          description: productsTable.description,
          createdAt: productsTable.createdAt,
          price: productsTable.price,
          packageSize: productsTable.packageSize,
          availableStock: productsTable.availableStock,
          minimumOrder: productsTable.minimumOrder,
          deliveryOptions: productsTable.deliveryOptions,
          paymentTerms: productsTable.paymentTerms,
          additionalNotes: productsTable.additionalNotes,
          sellerType: productsTable.sellerType,
          sellerName: productsTable.sellerName,
          imageData: productImages.imageData,
          sellerId: users.id,
          sellerNameFromUser: users.name,
          userType: users.userType,
          accountType: users.accountType,
          category: categories.name,
          location: sql<string>`CASE WHEN ${locations.city} IS NOT NULL AND ${locations.region} IS NOT NULL THEN ${locations.city} || ', ' || ${locations.region} ELSE ${locations.city} END`,
          region: locations.region,
          city: locations.city,
          profileImage: userProfiles.profileImage,
          verified: userVerification.verified,
          phoneVerified: userVerification.phoneVerified,
          verificationStatus: userVerification.verificationStatus,
          rating: userRatings.rating,
          totalReviews: userRatings.totalReviews,
        })
        .from(productsTable)
        .leftJoin(categories, eq(productsTable.categoryId, categories.id))
        .leftJoin(locations, eq(productsTable.locationId, locations.id))
        .leftJoin(users, eq(productsTable.sellerId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .leftJoin(userVerification, eq(users.id, userVerification.userId))
        .leftJoin(userRatings, eq(users.id, userRatings.userId))
        .leftJoin(productImages, and(eq(productImages.productId, productsTable.id), eq(productImages.isPrimary, true)))
        .where(eq(productsTable.isActive, true))
        .orderBy(desc(productsTable.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const products = await productsQuery;

    // Resolve delivery options and payment terms UUIDs to names for all products
    const transformedProducts = await Promise.all(products.map(async (product) => {
      // Resolve delivery options
      let deliveryOptionNames: string[] = [];
      if (product.deliveryOptions && product.deliveryOptions.length > 0) {
        // Get standard delivery options
        const standardDeliveryResults = await db
          .select({ name: deliveryOptionsTable.name })
          .from(deliveryOptionsTable)
          .where(inArray(deliveryOptionsTable.id, product.deliveryOptions));
        
        // Get custom delivery options for this seller
        const customDeliveryResults = await db
          .select({ name: sellerCustomDeliveryOptions.name })
          .from(sellerCustomDeliveryOptions)
          .where(inArray(sellerCustomDeliveryOptions.id, product.deliveryOptions));
        
        // Combine both results
        deliveryOptionNames = [...standardDeliveryResults.map(r => r.name), ...customDeliveryResults.map(r => r.name)];
      }

      // Resolve payment terms
      let paymentTermNames: string[] = [];
      if (product.paymentTerms && product.paymentTerms.length > 0) {
        // Get standard payment terms
        const standardPaymentResults = await db
          .select({ name: paymentTermsTable.name })
          .from(paymentTermsTable)
          .where(inArray(paymentTermsTable.id, product.paymentTerms));
        
        // Get custom payment terms for this seller
        const customPaymentResults = await db
          .select({ name: sellerCustomPaymentTerms.name })
          .from(sellerCustomPaymentTerms)
          .where(inArray(sellerCustomPaymentTerms.id, product.paymentTerms));
        
        // Combine both results
        paymentTermNames = [...standardPaymentResults.map(r => r.name), ...customPaymentResults.map(r => r.name)];
      }

      return {
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      description: product.description,
      quantity: product.availableStock || 'Contact seller',
      createdAt: product.createdAt,
      price: parseFloat(product.price?.toString() || '0') || 0,
      unit: product.packageSize || 'kg',
      imageUrl: product.imageData,
      seller: {
        id: product.sellerId,
        name: product.sellerNameFromUser || product.sellerName || 'Unknown Seller',
        userType: product.userType || 'farmer',
        accountType: product.accountType || 'individual',
        location: product.city || 'Myanmar', // Show only city, not city/region
        region: product.region || '',
        city: product.city || '',
        profileImage: product.profileImage || '',
        verified: product.verified || false,
        phoneVerified: product.phoneVerified || false,
        verificationStatus: product.verificationStatus || 'unverified',
        rating: parseFloat(product.rating?.toString() || '0') || 0,
        totalReviews: product.totalReviews || 0,
      },
      deliveryOptions: deliveryOptionNames,
      paymentTerms: paymentTermNames,
      additionalNotes: product.additionalNotes || '',
      };
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
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    // Extract and verify the JWT token
    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      price,
      unit,
      imageUrl,
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

    // Find categoryId from categories table
    let categoryId = null;
    if (category) {
      const categoryResult = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, category))
        .limit(1);

      if (categoryResult.length > 0) {
        categoryId = categoryResult[0].id;
      }
    }

    // Find or create locationId from locations table
    let locationId = null;
    if (location && region) {
      try {
        // First, try to find existing location by both city and region
        const existingLocation = await db
          .select({ id: locations.id })
          .from(locations)
          .where(and(eq(locations.city, location), eq(locations.region, region)))
          .limit(1);

        if (existingLocation.length > 0) {
          locationId = existingLocation[0].id;
          console.log('📍 Found existing location:', locationId);
        } else {
          // Create new location
          const newLocation = await db
            .insert(locations)
            .values({
              city: location,
              region: region
            })
            .returning({ id: locations.id });
          
          locationId = newLocation[0].id;
          console.log('📍 Created new location:', locationId);
        }
      } catch (error) {
        console.error('❌ Error handling location:', error);
      }
    }

    // Handle delivery options and payment terms
    let deliveryOptionIds = null;
    let paymentTermIds = null;
    
    console.log('🔍 Delivery options received:', deliveryOptions, 'Type:', typeof deliveryOptions);
    console.log('🔍 Payment terms received:', paymentTerms, 'Type:', typeof paymentTerms);
    
    // Look up delivery option IDs (both standard and custom)
    if (deliveryOptions && deliveryOptions.length > 0) {
      // Convert single value to array if needed
      const deliveryArray = Array.isArray(deliveryOptions) ? deliveryOptions : [deliveryOptions];
      
      console.log('🔍 Looking up delivery options:', deliveryArray);
      
      // Look up standard delivery options
      const standardDeliveryResults = await db
        .select({ id: deliveryOptionsTable.id, name: deliveryOptionsTable.name })
        .from(deliveryOptionsTable)
        .where(inArray(deliveryOptionsTable.name, deliveryArray));
      
      // Look up custom delivery options for this seller
      const customDeliveryResults = await db
        .select({ id: sellerCustomDeliveryOptions.id, name: sellerCustomDeliveryOptions.name })
        .from(sellerCustomDeliveryOptions)
        .where(and(
          eq(sellerCustomDeliveryOptions.sellerId, userId),
          inArray(sellerCustomDeliveryOptions.name, deliveryArray)
        ));
      
      console.log('🔍 Standard delivery options found:', standardDeliveryResults);
      console.log('🔍 Custom delivery options found:', customDeliveryResults);
      
      // Combine both results
      const allDeliveryResults = [...standardDeliveryResults, ...customDeliveryResults];
      
      if (allDeliveryResults.length > 0) {
        deliveryOptionIds = allDeliveryResults.map(r => r.id);
      }
    }

    // Look up payment term IDs (both standard and custom)
    if (paymentTerms && paymentTerms.length > 0) {
      // Convert single value to array if needed
      const paymentArray = Array.isArray(paymentTerms) ? paymentTerms : [paymentTerms];
      
      console.log('🔍 Looking up payment terms:', paymentArray);
      
      // Look up standard payment terms
      const standardPaymentResults = await db
        .select({ id: paymentTermsTable.id, name: paymentTermsTable.name })
        .from(paymentTermsTable)
        .where(inArray(paymentTermsTable.name, paymentArray));
      
      // Look up custom payment terms for this seller
      const customPaymentResults = await db
        .select({ id: sellerCustomPaymentTerms.id, name: sellerCustomPaymentTerms.name })
        .from(sellerCustomPaymentTerms)
        .where(and(
          eq(sellerCustomPaymentTerms.sellerId, userId),
          inArray(sellerCustomPaymentTerms.name, paymentArray)
        ));
      
      console.log('🔍 Standard payment terms found:', standardPaymentResults);
      console.log('🔍 Custom payment terms found:', customPaymentResults);
      
      // Combine both results
      const allPaymentResults = [...standardPaymentResults, ...customPaymentResults];
      
      if (allPaymentResults.length > 0) {
        paymentTermIds = allPaymentResults.map(r => r.id);
      }
    }

    // Create product with normalized structure
    const newProduct = await db.insert(productsTable).values({
      name,
      description,
      price: price.toString(),
      packageSize: unit || 'kg',
      availableStock: availableQuantity || 'Contact seller',
      minimumOrder: minimumOrder || '',
      deliveryOptions: deliveryOptionIds,
      paymentTerms: paymentTermIds,
      additionalNotes: additionalNotes || '',
      categoryId,
      locationId,
      sellerId: userId,
      isActive: true,
    }).returning({
      id: productsTable.id,
      name: productsTable.name,
      createdAt: productsTable.createdAt,
    });

    console.log('✅ Product created with ID:', newProduct[0].id);

    // Insert primary image if provided
    if (imageUrl) {
      await db.insert(productImages).values({
        productId: newProduct[0].id,
        imageData: imageUrl,
        isPrimary: true,
      });
      console.log('✅ Primary image inserted');
    }

    return NextResponse.json({
      success: true,
      productId: newProduct[0].id,
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