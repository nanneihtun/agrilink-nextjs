# AgriLink Database - Complete Connection List with Relationship Types

## 📊 **Database Overview**
- **Total Tables**: 25
- **Total Foreign Key Relationships**: 37
- **Lookup Tables**: 4 (categories, delivery_options, payment_terms, status_types, locations)

---

## 🔗 **Complete Connection List by Relationship Type**

### **1️⃣ ONE-TO-ONE (1:1) Relationships**
*Each user can have exactly one record in these tables*

| Source Table | Source Column | Target Table | Target Column | Constraint Name | Relationship Type |
|--------------|---------------|--------------|---------------|-----------------|-------------------|
| `user_profiles` | `userId` | `users` | `id` | user_profiles_userId_fkey | **1:1** |
| `user_verification` | `userId` | `users` | `id` | user_verification_userId_fkey | **1:1** |
| `business_details` | `userId` | `users` | `id` | business_details_userId_fkey | **1:1** |
| `email_management` | `userId` | `users` | `id` | email_management_new_userId_fkey | **1:1** |
| `user_ratings` | `userId` | `users` | `id` | user_ratings_userId_fkey | **1:1** |
| `user_social` | `userId` | `users` | `id` | user_social_userId_fkey | **1:1** |

### **2️⃣ ONE-TO-MANY (1:∞) Relationships**
*One record in source table can have multiple records in target table*

| Source Table | Source Column | Target Table | Target Column | Constraint Name | Relationship Type |
|--------------|---------------|--------------|---------------|-----------------|-------------------|
| `users` | `id` | `addresses` | `userId` | addresses_userId_fkey | **1:∞** |
| `users` | `id` | `verification_codes` | `userId` | verification_codes_userId_fkey | **1:∞** |
| `users` | `id` | `verification_requests` | `userId` | verification_requests_userId_fkey | **1:∞** |
| `users` | `id` | `verification_requests` | `reviewedBy` | verification_requests_reviewedby_fkey | **1:∞** |
| `users` | `id` | `products` | `sellerId` | products_sellerId_fkey | **1:∞** |
| `users` | `id` | `offers` | `buyerId` | offers_buyerId_fkey | **1:∞** |
| `users` | `id` | `offers` | `sellerId` | offers_sellerId_fkey | **1:∞** |
| `users` | `id` | `offers` | `cancelledBy` | offers_cancelledby_fkey | **1:∞** |
| `users` | `id` | `messages` | `senderId` | messages_senderId_fkey | **1:∞** |
| `users` | `id` | `offer_reviews` | `reviewerId` | offer_reviews_reviewerId_fkey | **1:∞** |
| `users` | `id` | `offer_reviews` | `revieweeId` | offer_reviews_revieweeId_fkey | **1:∞** |
| `users` | `id` | `offer_timeline` | `userId` | offer_timeline_userId_fkey | **1:∞** |
| `users` | `id` | `saved_products` | `userId` | saved_products_userId_fkey | **1:∞** |
| `users` | `id` | `seller_custom_delivery_options` | `seller_id` | seller_custom_delivery_options_seller_id_fkey | **1:∞** |
| `users` | `id` | `seller_custom_payment_terms` | `seller_id` | seller_custom_payment_terms_seller_id_fkey | **1:∞** |
| `locations` | `id` | `user_profiles` | `locationId` | user_profiles_locationId_fkey | **1:∞** |
| `locations` | `id` | `addresses` | `locationId` | addresses_locationId_fkey | **1:∞** |
| `locations` | `id` | `products` | `locationId` | products_locationId_fkey | **1:∞** |
| `categories` | `id` | `products` | `categoryId` | products_categoryId_fkey | **1:∞** |
| `status_types` | `id` | `offers` | `statusId` | offers_statusId_fkey | **1:∞** |
| `products` | `id` | `product_images` | `productId` | product_images_productId_fkey | **1:∞** |
| `products` | `id` | `saved_products` | `productId` | saved_products_productId_fkey | **1:∞** |
| `products` | `id` | `offers` | `productId` | offers_productId_fkey | **1:∞** |
| `products` | `id` | `conversations` | `productId` | conversations_productId_fkey | **1:∞** |
| `offers` | `id` | `offer_reviews` | `offerId` | offer_reviews_offerId_fkey | **1:∞** |
| `offers` | `id` | `offer_timeline` | `offerId` | offer_timeline_offerId_fkey | **1:∞** |
| `offers` | `id` | `conversations` | `offerId` | offers_conversationId_fkey | **1:∞** |
| `conversations` | `id` | `messages` | `conversationId` | messages_conversationId_fkey | **1:∞** |
| `conversations` | `id` | `offers` | `conversationId` | offers_conversationId_fkey | **1:∞** |

### **3️⃣ MANY-TO-ONE (∞:1) Relationships**
*Multiple records in source table reference one record in target table*

| Source Table | Source Column | Target Table | Target Column | Constraint Name | Relationship Type |
|--------------|---------------|--------------|---------------|-----------------|-------------------|
| `addresses` | `userId` | `users` | `id` | addresses_userId_fkey | **∞:1** |
| `addresses` | `locationId` | `locations` | `id` | addresses_locationId_fkey | **∞:1** |
| `verification_codes` | `userId` | `users` | `id` | verification_codes_userId_fkey | **∞:1** |
| `verification_requests` | `userId` | `users` | `id` | verification_requests_userId_fkey | **∞:1** |
| `verification_requests` | `reviewedBy` | `users` | `id` | verification_requests_reviewedby_fkey | **∞:1** |
| `user_profiles` | `userId` | `users` | `id` | user_profiles_userId_fkey | **∞:1** |
| `user_profiles` | `locationId` | `locations` | `id` | user_profiles_locationId_fkey | **∞:1** |
| `user_verification` | `userId` | `users` | `id` | user_verification_userId_fkey | **∞:1** |
| `business_details` | `userId` | `users` | `id` | business_details_userId_fkey | **∞:1** |
| `user_social` | `userId` | `users` | `id` | user_social_userId_fkey | **∞:1** |
| `user_ratings` | `userId` | `users` | `id` | user_ratings_userId_fkey | **∞:1** |
| `email_management` | `userId` | `users` | `id` | email_management_new_userId_fkey | **∞:1** |
| `products` | `sellerId` | `users` | `id` | products_sellerId_fkey | **∞:1** |
| `products` | `categoryId` | `categories` | `id` | products_categoryId_fkey | **∞:1** |
| `products` | `locationId` | `locations` | `id` | products_locationId_fkey | **∞:1** |
| `product_images` | `productId` | `products` | `id` | product_images_productId_fkey | **∞:1** |
| `saved_products` | `userId` | `users` | `id` | saved_products_userId_fkey | **∞:1** |
| `saved_products` | `productId` | `products` | `id` | saved_products_productId_fkey | **∞:1** |
| `seller_custom_delivery_options` | `seller_id` | `users` | `id` | seller_custom_delivery_options_seller_id_fkey | **∞:1** |
| `seller_custom_payment_terms` | `seller_id` | `users` | `id` | seller_custom_payment_terms_seller_id_fkey | **∞:1** |
| `offers` | `productId` | `products` | `id` | offers_productId_fkey | **∞:1** |
| `offers` | `buyerId` | `users` | `id` | offers_buyerId_fkey | **∞:1** |
| `offers` | `sellerId` | `users` | `id` | offers_sellerId_fkey | **∞:1** |
| `offers` | `cancelledBy` | `users` | `id` | offers_cancelledby_fkey | **∞:1** |
| `offers` | `statusId` | `status_types` | `id` | offers_statusId_fkey | **∞:1** |
| `offers` | `conversationId` | `conversations` | `id` | offers_conversationId_fkey | **∞:1** |
| `conversations` | `productId` | `products` | `id` | conversations_productId_fkey | **∞:1** |
| `conversations` | `buyerId` | `users` | `id` | conversations_buyerId_fkey | **∞:1** |
| `conversations` | `sellerId` | `users` | `id` | conversations_sellerId_fkey | **∞:1** |
| `conversations` | `offerId` | `offers` | `id` | offers_conversationId_fkey | **∞:1** |
| `messages` | `conversationId` | `conversations` | `id` | messages_conversationId_fkey | **∞:1** |
| `messages` | `senderId` | `users` | `id` | messages_senderId_fkey | **∞:1** |
| `offer_reviews` | `offerId` | `offers` | `id` | offer_reviews_offerId_fkey | **∞:1** |
| `offer_reviews` | `reviewerId` | `users` | `id` | offer_reviews_reviewerId_fkey | **∞:1** |
| `offer_reviews` | `revieweeId` | `users` | `id` | offer_reviews_revieweeId_fkey | **∞:1** |
| `offer_timeline` | `offerId` | `offers` | `id` | offer_timeline_offerId_fkey | **∞:1** |
| `offer_timeline` | `userId` | `users` | `id` | offer_timeline_userId_fkey | **∞:1** |

---

## 📋 **Summary by Table**

### **Core Tables (Most Connected)**
- **`users`**: 22 connections (central hub)
- **`products`**: 8 connections
- **`offers`**: 8 connections
- **`conversations`**: 6 connections

### **Lookup Tables (Reference Only)**
- **`categories`**: 1 connection (to products)
- **`delivery_options`**: 0 direct connections (referenced via arrays)
- **`payment_terms`**: 0 direct connections (referenced via arrays)
- **`status_types`**: 1 connection (to offers)
- **`locations`**: 3 connections (to user_profiles, addresses, products)

### **Supporting Tables**
- **`user_profiles`**: 2 connections
- **`addresses`**: 2 connections
- **`messages`**: 2 connections
- **`offer_reviews`**: 3 connections
- **`offer_timeline`**: 2 connections
- **`product_images`**: 1 connection
- **`saved_products`**: 2 connections
- **`seller_custom_delivery_options`**: 1 connection
- **`seller_custom_payment_terms`**: 1 connection

### **User Management Tables**
- **`user_verification`**: 1 connection
- **`business_details`**: 1 connection
- **`user_social`**: 1 connection
- **`user_ratings`**: 1 connection
- **`email_management`**: 1 connection
- **`verification_codes`**: 1 connection
- **`verification_requests`**: 2 connections

---

## 🎯 **Key Insights**

1. **`users` table is the central hub** with 22 foreign key relationships
2. **All user management tables have 1:1 relationships** with users
3. **Lookup tables use array references** instead of direct foreign keys
4. **Trading system** (offers, conversations, messages) has complex many-to-many relationships
5. **Product management** has both direct and indirect relationships through arrays

---

*Generated on: $(date)*
*Total Relationships: 37*
*Database Tables: 25*
