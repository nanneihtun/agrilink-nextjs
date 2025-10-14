-- ============================================================================
-- PHASE 1: Critical Database Indexes for Performance Optimization
-- Expected Improvement: 30-50% faster queries
-- Implementation Time: 5-10 minutes
-- Risk Level: LOW (indexes don't change data structure)
-- ============================================================================

-- ============================================================================
-- PRODUCT QUERY OPTIMIZATION
-- ============================================================================

-- Index for product listings by seller (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_active 
ON products(sellerId, isActive);

-- Index for product listings by category (browsing functionality)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active 
ON products(category, isActive);

-- Index for product listings by creation date (newest first)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_active 
ON products(createdAt DESC, isActive);

-- Index for product pricing queries (price comparisons)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_pricing_product_id 
ON product_pricing(productId);

-- Index for price-based sorting and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_pricing_price 
ON product_pricing(price);

-- Index for product inventory queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_inventory_product_id 
ON product_inventory(productId);

-- Index for primary product images (most common image query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_primary 
ON product_images(productId, isPrimary) WHERE isPrimary = true;

-- ============================================================================
-- USER QUERY OPTIMIZATION
-- ============================================================================

-- Index for user type filtering (farmer, trader, buyer)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_type 
ON users(userType);

-- Index for user account type filtering (individual, business)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_account_type 
ON users(accountType);

-- Index for user verification status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verification_status 
ON users(verificationStatus);

-- Index for user profiles lookup (very common join)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id 
ON user_profiles(userId);

-- Index for user verification lookup (very common join)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_verification_user_id 
ON user_verification(userId);

-- Index for user ratings lookup (very common join)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ratings_user_id 
ON user_ratings(userId);

-- Index for user social media lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_social_user_id 
ON user_social(userId);

-- Index for business details lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_details_user_id 
ON business_details(userId);

-- ============================================================================
-- CONVERSATION QUERY OPTIMIZATION
-- ============================================================================

-- Index for conversation listings (most complex query - 7 JOINs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_time 
ON conversations(sellerId, buyerId, lastMessageTime DESC);

-- Index for conversations by product
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_product 
ON conversations(productId);

-- Index for active conversations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_active 
ON conversations(isActive);

-- Index for messages by conversation (very common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversationId, createdAt DESC);

-- Index for messages by sender
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender 
ON messages(senderId);

-- ============================================================================
-- OFFER QUERY OPTIMIZATION
-- ============================================================================

-- Index for offer listings by user (very common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_user_created 
ON offers(buyerId, sellerId, createdAt DESC);

-- Index for offers by product
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_product 
ON offers(productId);

-- Index for offers by status (pending, accepted, etc.)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_status 
ON offers(status);

-- Index for offers by conversation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_conversation 
ON offers(conversationId);

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Index for saved products (user favorites)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_products_user_id 
ON saved_products(userId);

-- Index for saved products by product
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_products_product_id 
ON saved_products(productId);

-- Index for user addresses
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_addresses_user_id 
ON user_addresses(user_id);

-- Index for verification requests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_requests_user_id 
ON verification_requests(user_id);

-- Index for verification requests by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_requests_status 
ON verification_requests(status);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ============================================================================

-- Composite index for product listings with multiple filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_complex_filter 
ON products(isActive, category, createdAt DESC) 
WHERE isActive = true;

-- Composite index for user verification status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verification_complex 
ON users(userType, verificationStatus, createdAt DESC);

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================

-- Update table statistics after creating indexes
ANALYZE products;
ANALYZE users;
ANALYZE conversations;
ANALYZE offers;
ANALYZE messages;
ANALYZE product_pricing;
ANALYZE user_profiles;
ANALYZE user_verification;
ANALYZE user_ratings;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN (
    'products', 'users', 'conversations', 'offers', 
    'messages', 'product_pricing', 'user_profiles',
    'user_verification', 'user_ratings'
)
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check index usage statistics (run this after some time to verify usage)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC;
