const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateProducts() {
  try {
    console.log('🔄 Starting product migration from Supabase to Neon...');
    
    // Read the Supabase export
    const exportData = JSON.parse(fs.readFileSync('../agrilink-marketplace/supabase-export.json', 'utf8'));
    const products = exportData.products;
    
    console.log(`📊 Found ${products.length} products in Supabase export`);
    
    // Clear existing products
    console.log('🧹 Clearing existing products...');
    await sql`DELETE FROM product_images`;
    await sql`DELETE FROM product_pricing`;
    await sql`DELETE FROM products`;
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        const productId = product.id;
        
        // Insert into products table
        await sql`
          INSERT INTO products (
            id, name, category, description, "sellerId", location, "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${productId},
            ${product.name},
            ${product.category || 'General'},
            ${product.description || ''},
            ${product.seller_id},
            ${product.location || 'Myanmar'},
            ${product.is_active !== false}, // Default to true if not specified
            ${product.created_at || new Date().toISOString()},
            ${product.updated_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        
        // Insert into product_pricing table
        await sql`
          INSERT INTO product_pricing (
            "productId", price, unit, "availableQuantity"
          ) VALUES (
            ${productId},
            ${product.price || 0},
            ${product.unit || 'units'},
            ${product.available_quantity || 100}
          )
          ON CONFLICT ("productId") DO NOTHING
        `;
        
        // Insert into product_images table if there's an image
        if (product.image_url) {
          await sql`
            INSERT INTO product_images (
              "productId", "imageUrl", "isPrimary"
            ) VALUES (
              ${productId},
              ${product.image_url},
              true
            )
            ON CONFLICT ("productId", "imageUrl") DO NOTHING
          `;
        }
        
        successCount++;
        console.log(`✅ Migrated product: ${product.name}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating product ${product.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Product migration completed!');
    console.log(`✅ Successfully migrated: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    
    // Show some sample products
    console.log('\n📋 Sample migrated products:');
    const sampleProducts = await sql`
      SELECT p.name, p.category, pp.price, pp.unit, u.name as seller_name
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp."productId"
      LEFT JOIN users u ON p."sellerId" = u.id
      LIMIT 5
    `;
    
    sampleProducts.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ${product.price} ${product.unit} - by ${product.seller_name}`);
    });
    
  } catch (error) {
    console.error('❌ Product migration failed:', error);
  }
}

// Run the migration
migrateProducts();
