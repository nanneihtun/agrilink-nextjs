const fs = require('fs');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateRealImages() {
  try {
    console.log('🔄 Starting image migration from Supabase export...');
    
    // Read the Supabase export file
    const exportData = JSON.parse(fs.readFileSync('/Users/hlathiha/Desktop/agrilink_recover/agrilink-marketplace/supabase-export.json', 'utf8'));
    
    console.log(`📊 Found ${exportData.products.length} products in export data`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const product of exportData.products) {
      try {
        // Check if this product has a real image (base64 data)
        if (product.image && product.image.startsWith('data:image/')) {
          console.log(`🖼️  Updating product: ${product.name}`);
          console.log(`   Image size: ${Math.round(product.image.length / 1024)}KB`);
          
          // Update the product image in Neon
          await sql`
            UPDATE product_images 
            SET "imageUrl" = ${product.image}
            WHERE "productId" = ${product.id} AND "isPrimary" = true
          `;
          
          updatedCount++;
        } else {
          console.log(`⏭️  Skipping product: ${product.name} (no real image)`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating product ${product.name}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n✅ Migration completed!`);
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Skipped: ${skippedCount} products`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateRealImages();
