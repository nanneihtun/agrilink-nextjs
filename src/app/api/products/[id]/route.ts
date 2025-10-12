import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

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
        pinv."availableQuantity", pinv."minimumOrder",
        pd.location as delivery_location, pd."deliveryOptions", pd."paymentTerms", pd."additionalNotes",
        u.id as seller_id, u.name as seller_name, u."userType" as seller_type,
        up.location, up."profileImage",
        uv.verified, uv."phoneVerified", uv."verificationStatus",
        ur.rating, ur."totalReviews"
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
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

    // Get all images for this product
    const productImages = await sql`
      SELECT "imageUrl", "isPrimary", "createdAt"
      FROM product_images 
      WHERE "productId" = ${productId}
      ORDER BY "createdAt" ASC
    `;

    console.log('🖼️ Found images for product:', productImages.length);

    // Transform the data to match the expected format
    const primaryImage = productImages.find(img => img.isPrimary);
    const allImageUrls = productImages.map(img => img.imageUrl);
    
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      unit: product.unit,
      imageUrl: primaryImage?.imageUrl || allImageUrls[0] || null,
      image: primaryImage?.imageUrl || allImageUrls[0] || null, // Add legacy image field for compatibility
      images: allImageUrls,
      sellerId: product.seller_id,
      sellerName: product.seller_name || 'Unknown Seller',
      sellerType: product.seller_type || 'farmer',
      location: product.delivery_location || product.location || 'Unknown Location',
      region: product.region || 'yangon', // Use actual region from user profile or default
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
  } catch (error: any) {
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
  console.log('🚀 PUT /api/products/[id] - Request received');
  try {
    const { id: productId } = await params;
    console.log('📝 Product ID from params:', productId);
    
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body parsed successfully');
      console.log('📥 Request body details:', {
        hasImages: !!(body.images && body.images.length > 0),
        imagesLength: body.images?.length || 0,
        hasImage: !!body.image,
        bodyKeys: Object.keys(body),
        imagesPreview: body.images?.map(img => ({
          length: img?.length || 0,
          isBase64: img?.startsWith('data:') || false,
          preview: img?.substring(0, 50) + '...' || 'null'
        }))
      });
    } catch (bodyError) {
      console.error('❌ Failed to parse request body:', bodyError);
      return NextResponse.json(
        { message: "Invalid JSON in request body", error: bodyError.message },
        { status: 400 }
      );
    }

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
        additionalNotes: body.additionalNotes,
        images: body.images,
        image: body.image
      }
    });

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header provided');
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 Token extracted:', token ? 'yes' : 'no');
    
    try {
      // For development, allow any non-empty token
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Development mode - token accepted:', token ? 'yes' : 'no');
      } else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        console.log('✅ Token verified for user:', decoded.userId);
      }
    } catch (error) {
      console.log('❌ Invalid token:', error);
      return NextResponse.json(
        { message: "Invalid token" },
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

    // Update user profile location and region if provided
    if (body.location || body.region) {
      // First get the seller ID from the product
      const productWithSeller = await sql`
        SELECT "sellerId" FROM products WHERE id = ${productId}
      `;

      if (productWithSeller.length > 0) {
        const sellerId = productWithSeller[0].sellerId;
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        
        if (body.location) {
          updateFields.push('location = $' + (updateValues.length + 1));
          updateValues.push(body.location);
        }
        
        if (body.region) {
          updateFields.push('region = $' + (updateValues.length + 1));
          updateValues.push(body.region);
        }
        
        updateFields.push('"updatedAt" = NOW()');
        updateValues.push(sellerId);
        
        const query = `
          UPDATE user_profiles 
          SET ${updateFields.join(', ')}
          WHERE "userId" = $${updateValues.length}
          RETURNING *
        `;
        
        const profileResult = await sql.unsafe(query, updateValues);
        console.log('✅ Updated user profile:', profileResult[0]);
      }
    }

    // Update product images if provided (UPSERT - Insert or Update)
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      console.log('🖼️ Processing images array:', body.images.length, 'images');
      console.log('🖼️ Image data preview:', body.images.map(img => ({
        length: img?.length || 0,
        isBase64: img?.startsWith('data:') || false,
        preview: img?.substring(0, 50) + '...' || 'null'
      })));
      
      // Delete existing images for this product
      console.log('🗑️ Deleting existing images for product:', productId);
      await sql`DELETE FROM product_images WHERE "productId" = ${productId}`;
      console.log('✅ Deleted existing images');
      
      // Insert new images
      for (let i = 0; i < body.images.length; i++) {
        const imageUrl = body.images[i];
        if (imageUrl) {
          console.log(`🖼️ Processing image ${i + 1}:`, {
            length: imageUrl.length,
            isBase64: imageUrl.startsWith('data:'),
            preview: imageUrl.substring(0, 50) + '...'
          });
          
          try {
            // Check if image URL is too long (base64 images can be very large)
            if (imageUrl.length > 1000000) { // 1MB limit for base64
              console.log('⚠️ Image too large, skipping:', imageUrl.length, 'characters');
              continue;
            }
            
            await sql`
              INSERT INTO product_images ("productId", "imageUrl", "isPrimary", "createdAt")
              VALUES (${productId}, ${imageUrl}, ${i === 0}, NOW())
            `;
            console.log(`✅ Inserted image ${i + 1}`);
          } catch (imageError) {
            console.error(`❌ Failed to insert image ${i + 1}:`, imageError);
            // Continue with other images even if one fails
          }
        }
      }
      console.log('✅ Updated product images:', body.images.length, 'images');
    } else if (body.image) {
      console.log('🖼️ Processing single image (legacy)');
      
      // Handle single image (legacy support)
      try {
        // Check if image URL is too long
        if (body.image.length > 1000000) { // 1MB limit for base64
          console.log('⚠️ Single image too large, skipping:', body.image.length, 'characters');
        } else {
          await sql`DELETE FROM product_images WHERE "productId" = ${productId}`;
          await sql`
            INSERT INTO product_images ("productId", "imageUrl", "isPrimary", "createdAt")
            VALUES (${productId}, ${body.image}, true, NOW())
          `;
          console.log('✅ Updated product image (legacy)');
        }
      } catch (imageError) {
        console.error('❌ Failed to insert single image:', imageError);
        // Don't fail the entire request if image insertion fails
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

    // Get the updated product with images for response
    const updatedProductWithImages = await sql`
      SELECT "imageUrl", "isPrimary", "createdAt"
      FROM product_images 
      WHERE "productId" = ${productId}
      ORDER BY "createdAt" ASC
    `;

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct[0],
      updated: true,
      imagesProcessed: {
        imagesReceived: body.images?.length || 0,
        imageReceived: body.image ? 1 : 0,
        imagesSaved: updatedProductWithImages.length,
        imageDetails: updatedProductWithImages
      }
    });
  } catch (error: any) {
    console.error("❌ Error updating product:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    return NextResponse.json(
      { 
        message: "Internal server error", 
        error: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🗑️ DELETE /api/products/[id] - Request received');
  try {
    const { id: productId } = await params;
    console.log('📝 Product ID from params:', productId);

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('🔐 Token received:', token ? 'present' : 'missing');

    // Verify JWT token
    let decodedToken;
    try {
      if (process.env.NODE_ENV === 'development') {
        // For development, allow any token
        decodedToken = { userId: 'dev-user' };
        console.log('🔧 Development mode - bypassing JWT verification');
      } else {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('✅ JWT token verified:', { userId: decodedToken.userId });
      }
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError);
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // First, check if the product exists and get the seller ID
    const productCheck = await sql`
      SELECT "sellerId" FROM products WHERE id = ${productId}
    `;

    if (productCheck.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const productSellerId = productCheck[0].sellerId;

    // In development mode, allow deletion of any product
    // In production, verify that the user owns the product
    if (process.env.NODE_ENV !== 'development') {
      if (decodedToken.userId !== productSellerId) {
        return NextResponse.json(
          { message: "Unauthorized - you can only delete your own products" },
          { status: 403 }
        );
      }
    }

    console.log('🗑️ Deleting product and related data:', productId);

    // Delete related data first (due to foreign key constraints)
    await sql`DELETE FROM product_images WHERE "productId" = ${productId}`;
    console.log('✅ Deleted product images');

    await sql`DELETE FROM product_pricing WHERE "productId" = ${productId}`;
    console.log('✅ Deleted product pricing');

    await sql`DELETE FROM product_inventory WHERE "productId" = ${productId}`;
    console.log('✅ Deleted product inventory');

    await sql`DELETE FROM product_delivery WHERE "productId" = ${productId}`;
    console.log('✅ Deleted product delivery');

    // Finally, delete the product itself
    const deleteResult = await sql`
      DELETE FROM products WHERE id = ${productId}
      RETURNING id, name
    `;

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { message: "Product not found or already deleted" },
        { status: 404 }
      );
    }

    console.log('✅ Product deleted successfully:', deleteResult[0]);

    return NextResponse.json({
      message: "Product deleted successfully",
      deletedProduct: deleteResult[0]
    });

  } catch (error: any) {
    console.error("❌ Error deleting product:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error.message,
        details: {
          code: error.code,
          detail: error.detail,
          hint: error.hint
        }
      },
      { status: 500 }
    );
  }
}
