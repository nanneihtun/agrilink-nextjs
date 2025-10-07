import { neon } from '@neondatabase/serverless';
import { MarketplacePage } from '@/components/MarketplacePage';

const sql = neon(process.env.DATABASE_URL!);

async function getProducts() {
  try {
    const products = await sql`
      SELECT 
        p.id, p.name, p.category, p.description, p."isActive", p."createdAt",
        pp.price, pp.unit,
        pi."imageUrl",
        u.name as seller_name, u."userType" as seller_type,
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
      WHERE p."isActive" = true
      ORDER BY p."createdAt" DESC
      LIMIT 50
    `;

    return products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      isActive: product.isActive,
      createdAt: product.createdAt,
      price: parseFloat(product.price) || 0,
      unit: product.unit,
      image: product.imageUrl,
      seller: {
        id: product.seller_id,
        name: product.seller_name,
        userType: product.seller_type,
        location: product.location,
        profileImage: product.profileImage,
        verified: product.verified,
        phoneVerified: product.phoneVerified,
        verificationStatus: product.verificationStatus,
        rating: parseFloat(product.rating) || 0,
        totalReviews: product.totalReviews || 0,
      }
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Marketplace() {
  const products = await getProducts();

  return <MarketplacePage products={products} />;
}

export const metadata = {
  title: 'AgriLink Marketplace - Buy and Sell Agricultural Products',
  description: 'Connect with farmers and traders. Buy fresh produce, sell your products, and grow your agricultural business.',
};
