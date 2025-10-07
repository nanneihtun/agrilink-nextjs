const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateProductsSimple() {
  try {
    console.log('🔄 Starting simple product migration from Supabase to Neon...');
    
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
        
        // Insert into products table with minimal data
        await sql`
          INSERT INTO products (
            id, name, category, description, "sellerId", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${productId},
            ${product.name || 'Unknown Product'},
            ${product.category || 'General'},
            ${product.description || 'No description available'},
            ${product.seller_id},
            true,
            NOW(),
            NOW()
          )
        `;
        
        // Insert into product_pricing table
        await sql`
          INSERT INTO product_pricing (
            "productId", price, unit
          ) VALUES (
            ${productId},
            ${product.price || 0},
            ${product.unit || 'units'}
          )
        `;
        
        // Insert into product_images table with a simple placeholder image
        await sql`
          INSERT INTO product_images (
            "productId", "imageUrl", "isPrimary"
          ) VALUES (
            ${productId},
            'https://images.unsplash.com/photo-1546470427-227c013b2b5f?w=400&h=300&fit=crop',
            true
          )
        `;
        
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
migrateProductsSimple();
