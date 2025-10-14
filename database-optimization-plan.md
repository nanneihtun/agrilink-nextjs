# Database Optimization Plan for AgriLink

## Current Issues
1. **6-7 JOINs** required for product listings
2. **Missing indexes** on frequently queried fields
3. **Over-normalization** causing performance bottlenecks
4. **Redundant data** across multiple tables

## Optimization Strategy

### Phase 1: Add Critical Indexes (Immediate - 1 hour)
```sql
-- Product listing performance
CREATE INDEX CONCURRENTLY idx_products_seller_active ON products(sellerId, isActive);
CREATE INDEX CONCURRENTLY idx_products_category_active ON products(category, isActive);
CREATE INDEX CONCURRENTLY idx_products_created_active ON products(createdAt DESC, isActive);

-- Pricing queries
CREATE INDEX CONCURRENTLY idx_product_pricing_product_id ON product_pricing(productId);
CREATE INDEX CONCURRENTLY idx_product_pricing_price ON product_pricing(price);

-- User queries
CREATE INDEX CONCURRENTLY idx_users_user_type ON users(userType);
CREATE INDEX CONCURRENTLY idx_user_profiles_user_id ON user_profiles(userId);
CREATE INDEX CONCURRENTLY idx_user_verification_user_id ON user_verification(userId);
CREATE INDEX CONCURRENTLY idx_user_ratings_user_id ON user_ratings(userId);

-- Conversation performance
CREATE INDEX CONCURRENTLY idx_conversations_user_time ON conversations(sellerId, buyerId, lastMessageTime DESC);
CREATE INDEX CONCURRENTLY idx_conversations_product ON conversations(productId);

-- Offer management
CREATE INDEX CONCURRENTLY idx_offers_user_created ON offers(buyerId, sellerId, createdAt DESC);
CREATE INDEX CONCURRENTLY idx_offers_status ON offers(status);
CREATE INDEX CONCURRENTLY idx_offers_product ON offers(productId);

-- Message queries
CREATE INDEX CONCURRENTLY idx_messages_conversation_created ON messages(conversationId, createdAt DESC);
```

### Phase 2: Create Materialized Views (1-2 days)
```sql
-- Pre-computed product listings (updated every 5 minutes)
CREATE MATERIALIZED VIEW mv_product_listings AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.description,
  p.createdAt,
  pp.price,
  pp.unit,
  pi.imageData,
  pinv.availableQuantity,
  pinv.minimumOrder,
  u.id as sellerId,
  u.name as sellerName,
  u.userType as sellerType,
  u.accountType as sellerAccountType,
  up.location,
  up.profileImage,
  uv.verified,
  uv.phoneVerified,
  uv.verificationStatus,
  ur.rating,
  ur.totalReviews
FROM products p
INNER JOIN product_pricing pp ON p.id = pp.productId
LEFT JOIN product_images pi ON p.id = pi.productId AND pi.isPrimary = true
LEFT JOIN product_inventory pinv ON p.id = pinv.productId
INNER JOIN users u ON p.sellerId = u.id
LEFT JOIN user_profiles up ON u.id = up.userId
LEFT JOIN user_verification uv ON u.id = uv.userId
LEFT JOIN user_ratings ur ON u.id = ur.userId
WHERE p.isActive = true;

-- Index on materialized view
CREATE INDEX idx_mv_product_listings_category ON mv_product_listings(category);
CREATE INDEX idx_mv_product_listings_seller ON mv_product_listings(sellerId);
CREATE INDEX idx_mv_product_listings_price ON mv_product_listings(price);
CREATE INDEX idx_mv_product_listings_created ON mv_product_listings(createdAt DESC);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_product_listings()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_listings;
END;
$$ LANGUAGE plpgsql;

-- Auto-refresh every 5 minutes
SELECT cron.schedule('refresh-product-listings', '*/5 * * * *', 'SELECT refresh_product_listings();');
```

### Phase 3: Denormalization Strategy (1 week)

#### A. Consolidated User Table
```sql
-- Add frequently accessed fields to main users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Populate from existing tables
UPDATE users SET 
  location = up.location,
  profile_image = up.profileImage,
  phone = up.phone
FROM user_profiles up 
WHERE users.id = up.userId;

UPDATE users SET 
  verified = uv.verified,
  phone_verified = uv.phoneVerified,
  verification_status = uv.verificationStatus
FROM user_verification uv 
WHERE users.id = uv.userId;

UPDATE users SET 
  rating = ur.rating,
  total_reviews = ur.totalReviews
FROM user_ratings ur 
WHERE users.id = ur.userId;
```

#### B. Consolidated Product Table
```sql
-- Add pricing and inventory to main products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_quantity TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_order TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS primary_image TEXT;

-- Populate from existing tables
UPDATE products SET 
  price = pp.price,
  unit = pp.unit
FROM product_pricing pp 
WHERE products.id = pp.productId;

UPDATE products SET 
  available_quantity = pinv.availableQuantity,
  minimum_order = pinv.minimumOrder
FROM product_inventory pinv 
WHERE products.id = pinv.productId;

UPDATE products SET 
  primary_image = pi.imageData
FROM product_images pi 
WHERE products.id = pi.productId AND pi.isPrimary = true;
```

### Phase 4: Query Optimization (1-2 days)

#### A. Simplified Product Queries
```sql
-- Before (6-7 JOINs):
SELECT p.*, pp.price, pp.unit, pi.imageData, pinv.availableQuantity, u.name, up.location, uv.verified, ur.rating
FROM products p
INNER JOIN product_pricing pp ON p.id = pp.productId
LEFT JOIN product_images pi ON p.id = pi.productId AND pi.isPrimary = true
LEFT JOIN product_inventory pinv ON p.id = pinv.productId
INNER JOIN users u ON p.sellerId = u.id
LEFT JOIN user_profiles up ON u.id = up.userId
LEFT JOIN user_verification uv ON u.id = uv.userId
LEFT JOIN user_ratings ur ON u.id = ur.userId
WHERE p.isActive = true;

-- After (1-2 JOINs):
SELECT p.*, u.name, u.location, u.verified, u.rating
FROM products p
INNER JOIN users u ON p.sellerId = u.id
WHERE p.isActive = true;
```

#### B. Use Materialized Views for Complex Queries
```sql
-- Product listings using materialized view
SELECT * FROM mv_product_listings 
WHERE category = 'rice' 
ORDER BY price ASC 
LIMIT 20;
```

## Performance Impact

### Expected Improvements:
- **Product listings**: 80% faster (6 JOINs → 1-2 JOINs)
- **Price comparisons**: 90% faster (materialized view)
- **User queries**: 70% faster (denormalized fields)
- **Overall API response**: 60-80% improvement

### Implementation Timeline:
1. **Phase 1** (Indexes): 1 hour - Immediate 30-50% improvement
2. **Phase 2** (Materialized Views): 1-2 days - 80% improvement for listings
3. **Phase 3** (Denormalization): 1 week - 90% improvement overall
4. **Phase 4** (Query Updates): 1-2 days - Complete optimization

## Risk Assessment:
- **Low Risk**: Adding indexes (Phase 1)
- **Medium Risk**: Materialized views (Phase 2)
- **High Risk**: Denormalization (Phase 3) - requires careful data migration

## Recommendation:
Start with **Phase 1** (indexes) for immediate improvement, then evaluate if further optimization is needed based on performance metrics.
