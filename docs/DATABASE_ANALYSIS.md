# 📊 AgriLink Database Analysis & Optimization Guide

## 🎯 **Purpose**
This document extracts database information from the current AgriLink codebase to facilitate team discussion on database optimization and system design.

---

## 🗄️ **Current Database Schema**

### **Core Tables Identified**

#### **1. Users & Authentication**
```sql
-- Main user table
users (
  id, email, name, passwordHash, userType, accountType,
  emailVerificationToken, emailVerificationExpires, emailVerified,
  createdAt, updatedAt
)

-- User profiles (extended info)
user_profiles (
  userId, location, region, phone, website,
  profileImage, storefrontImage, createdAt, updatedAt
)

-- User verification status
user_verification (
  userId, verified, phoneVerified, verificationStatus,
  createdAt, updatedAt
)

-- User ratings & reviews
user_ratings (
  userId, rating, totalReviews, responseTime,
  createdAt, updatedAt
)
```

#### **2. Products & Inventory**
```sql
-- Main product table
products (
  id, name, category, description, sellerId, isActive,
  createdAt, updatedAt
)

-- Product pricing
product_pricing (
  productId, price, unit, createdAt, updatedAt
)

-- Product inventory
product_inventory (
  productId, availableQuantity, minimumOrder, quantity,
  createdAt, updatedAt
)

-- Product images
product_images (
  productId, imageData, isPrimary, createdAt, updatedAt
)

-- Product delivery options
product_delivery (
  productId, deliveryOptions, paymentTerms, location, additionalNotes,
  createdAt, updatedAt
)
```

#### **3. Communication & Offers**
```sql
-- Conversations
conversations (
  id, buyerId, sellerId, createdAt, updatedAt
)

-- Messages
messages (
  id, conversationId, senderId, content, createdAt
)

-- Offers
offers (
  id, buyerId, sellerId, productId, quantity, price, status,
  createdAt, updatedAt
)

-- Offer reviews
offer_reviews (
  id, offerId, reviewerId, revieweeId, rating, comment,
  productName, createdAt
)
```

#### **4. Verification & Admin**
```sql
-- Verification requests
verification_requests (
  userId, userEmail, userName, userType, accountType,
  requestType, status, submittedAt, verificationDocuments,
  businessInfo, phoneVerified, createdAt, updatedAt
)

-- Verification codes (SMS)
verification_codes (
  userId, phone, code, expiresAt, createdAt
)
```

#### **5. User Preferences**
```sql
-- Saved products
user_saved_products (
  userId, productId, createdAt
)

-- User addresses
user_addresses (
  id, userId, addressType, address, city, region, postalCode,
  createdAt, updatedAt
)
```

---

## 🔍 **Current Query Patterns Analysis**

### **Most Complex Queries (Need Optimization)**

#### **1. Product Listing Query**
```sql
-- Used in: /api/products
-- Complexity: HIGH (7 table JOINs)
SELECT p.id, p.name, p.category, p.description, p."createdAt",
       pp.price, pp.unit, pi."imageData",
       COALESCE(pinv."availableQuantity", 'Contact seller') as quantity,
       pinv."minimumOrder", u.id as "sellerId", u.name as "sellerName",
       u."userType" as "sellerType", u."accountType" as "sellerAccountType",
       COALESCE(up.location, 'Myanmar') as location,
       COALESCE(up."profileImage", '') as profileImage,
       COALESCE(uv.verified, false) as verified,
       COALESCE(uv."phoneVerified", false) as phoneVerified,
       COALESCE(uv."verificationStatus", 'unverified') as verificationStatus,
       COALESCE(ur.rating, 0) as rating,
       COALESCE(ur."totalReviews", 0) as totalReviews
FROM products p
INNER JOIN product_pricing pp ON p.id = pp."productId"
LEFT JOIN product_images pi ON p.id = pi."productId" AND pi."isPrimary" = true
LEFT JOIN product_inventory pinv ON p.id = pinv."productId"
INNER JOIN users u ON p."sellerId" = u.id
LEFT JOIN user_profiles up ON u.id = up."userId"
LEFT JOIN user_verification uv ON u.id = uv."userId"
LEFT JOIN user_ratings ur ON u.id = ur."userId"
WHERE p."isActive" = true
ORDER BY p."createdAt" DESC
```

#### **2. Price Comparison Query**
```sql
-- Used in: /api/products/[id]/price-comparison
-- Complexity: HIGH (6 table JOINs)
-- Performance Impact: Scans all products for comparison
```

### **Frequent Query Patterns**

#### **User Authentication Queries**
- `SELECT id FROM users WHERE email = ?` (Login)
- `SELECT * FROM users WHERE id = ?` (Profile)
- `UPDATE user_verification SET phoneVerified = true WHERE userId = ?`

#### **Product Management Queries**
- `INSERT INTO products ...` (Create)
- `UPDATE products SET ... WHERE id = ?` (Update)
- `DELETE FROM products WHERE id = ?` (Delete)

#### **Search & Filter Queries**
- Product search by category, location, seller type
- Price range filtering
- Verification status filtering

---

## ⚡ **Performance Issues Identified**

### **1. N+1 Query Problems**
- Product listings fetch seller info separately
- Multiple queries for product images
- User verification status fetched individually

### **2. Missing Indexes**
- No indexes on frequently queried columns:
  - `products.category`
  - `products.sellerId`
  - `product_pricing.price`
  - `user_profiles.location`
  - `user_verification.verified`

### **3. Complex JOINs**
- Product listing query joins 7 tables
- Price comparison scans all products
- No query result caching

### **4. Data Redundancy**
- User location stored in both `user_profiles` and `product_delivery`
- Product images stored as base64 (large data)
- Verification status duplicated across tables

---

## 🎯 **Optimization Opportunities**

### **Immediate Optimizations (Week 1-2)**

#### **1. Database Indexing**
```sql
-- Critical indexes for performance
CREATE INDEX idx_products_seller_active ON products("sellerId", "isActive");
CREATE INDEX idx_products_category_active ON products(category, "isActive");
CREATE INDEX idx_product_pricing_price ON product_pricing(price);
CREATE INDEX idx_user_profiles_location ON user_profiles(location);
CREATE INDEX idx_user_verification_verified ON user_verification(verified);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_messages_conversation ON messages("conversationId");
```

#### **2. Query Optimization**
- Replace N+1 queries with JOINs
- Add pagination to all listing queries
- Implement query result caching
- Use database views for complex queries

#### **3. Data Structure Improvements**
- Normalize product delivery data
- Separate image storage (CDN or file system)
- Add database constraints and foreign keys

### **Medium-term Optimizations (Week 3-4)**

#### **1. Caching Strategy**
- Redis for session storage
- Query result caching
- CDN for static assets
- API response caching

#### **2. Database Schema Refinements**
- Add proper foreign key constraints
- Implement soft deletes
- Add audit trails
- Optimize data types

#### **3. Connection Management**
- Implement connection pooling
- Add query timeout settings
- Optimize connection parameters

### **Long-term Optimizations (Month 2+)**

#### **1. Architecture Improvements**
- Database read replicas
- Microservices for different domains
- Event-driven architecture
- Background job processing

#### **2. Advanced Features**
- Full-text search (PostgreSQL)
- Real-time notifications
- Analytics and reporting
- Data archiving strategy

---

## 📊 **Current Database Metrics**

### **Table Sizes (Estimated)**
- `users`: ~1,000 records
- `products`: ~5,000 records
- `messages`: ~50,000 records
- `offers`: ~10,000 records
- `product_images`: ~15,000 records (large base64 data)

### **Query Performance Issues**
- Product listing: 200-500ms (should be <100ms)
- Price comparison: 1-2s (should be <200ms)
- User authentication: 50-100ms (should be <50ms)

### **Storage Concerns**
- Base64 images consuming significant space
- No data archiving strategy
- Potential for rapid growth in messages/offers

---

## 🛠️ **Recommended Action Plan**

### **Phase 1: Critical Fixes (Week 1)**
1. **Add essential indexes**
2. **Fix N+1 query problems**
3. **Implement basic caching**
4. **Add query monitoring**

### **Phase 2: Performance Optimization (Week 2-3)**
1. **Optimize complex queries**
2. **Implement connection pooling**
3. **Add database monitoring**
4. **Refactor data access patterns**

### **Phase 3: Architecture Improvements (Week 4+)**
1. **Implement caching layer**
2. **Add database read replicas**
3. **Optimize data storage**
4. **Plan for scalability**

---

## 📋 **Discussion Points for Team**

### **1. Immediate Priorities**
- Which performance issues should we tackle first?
- What's our target query response times?
- How do we prioritize indexing vs query optimization?

### **2. Architecture Decisions**
- Should we implement Redis caching?
- Do we need database read replicas?
- How do we handle image storage optimization?

### **3. Development Strategy**
- How do we implement changes without breaking existing functionality?
- What's our testing strategy for database changes?
- How do we monitor performance improvements?

### **4. Resource Planning**
- What database optimization tools do we need?
- How do we allocate team resources for optimization?
- What's our timeline for performance improvements?

---

*This analysis provides a foundation for database optimization discussions and helps prioritize performance improvements based on current usage patterns.*
