# 🗄️ AgriLink Database ERD (Entity Relationship Diagram)

> **📖 For the complete and detailed ERD with all 18 tables, relationships, and comprehensive documentation, see [DATABASE_ERD_DETAILED.md](DATABASE_ERD_DETAILED.md)**

## 📊 **Quick Reference ERD Diagram**

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string name
        string passwordHash
        string userType
        string accountType
        string emailVerificationToken
        timestamp emailVerificationExpires
        boolean emailVerified
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER_PROFILES {
        uuid userId PK,FK
        string location
        string region
        string phone
        string website
        text profileImage
        text storefrontImage
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER_VERIFICATION {
        uuid userId PK,FK
        boolean verified
        boolean phoneVerified
        string verificationStatus
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER_RATINGS {
        uuid userId PK,FK
        decimal rating
        integer totalReviews
        integer responseTime
        timestamp createdAt
        timestamp updatedAt
    }
    
    PRODUCTS {
        uuid id PK
        string name
        string category
        text description
        uuid sellerId FK
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    PRODUCT_PRICING {
        uuid productId PK,FK
        decimal price
        string unit
        timestamp createdAt
        timestamp updatedAt
    }
    
    PRODUCT_INVENTORY {
        uuid productId PK,FK
        string availableQuantity
        string minimumOrder
        string quantity
        timestamp createdAt
        timestamp updatedAt
    }
    
    PRODUCT_IMAGES {
        uuid productId PK,FK
        text imageData
        boolean isPrimary
        timestamp createdAt
        timestamp updatedAt
    }
    
    PRODUCT_DELIVERY {
        uuid productId PK,FK
        json deliveryOptions
        json paymentTerms
        string location
        text additionalNotes
        timestamp createdAt
        timestamp updatedAt
    }
    
    CONVERSATIONS {
        uuid id PK
        uuid buyerId FK
        uuid sellerId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    MESSAGES {
        uuid id PK
        uuid conversationId FK
        uuid senderId FK
        text content
        timestamp createdAt
    }
    
    OFFERS {
        uuid id PK
        uuid buyerId FK
        uuid sellerId FK
        uuid productId FK
        string quantity
        decimal price
        string status
        timestamp createdAt
        timestamp updatedAt
    }
    
    OFFER_REVIEWS {
        uuid id PK
        uuid offerId FK
        uuid reviewerId FK
        uuid revieweeId FK
        integer rating
        text comment
        string productName
        timestamp createdAt
    }
    
    VERIFICATION_REQUESTS {
        uuid userId PK,FK
        string userEmail
        string userName
        string userType
        string accountType
        string requestType
        string status
        timestamp submittedAt
        json verificationDocuments
        json businessInfo
        boolean phoneVerified
        timestamp createdAt
        timestamp updatedAt
    }
    
    VERIFICATION_CODES {
        uuid userId PK,FK
        string phone
        string code
        timestamp expiresAt
        timestamp createdAt
    }
    
    USER_SAVED_PRODUCTS {
        uuid userId PK,FK
        uuid productId PK,FK
        timestamp createdAt
    }
    
    USER_ADDRESSES {
        uuid id PK
        uuid userId FK
        string addressType
        text address
        string city
        string region
        string postalCode
        timestamp createdAt
        timestamp updatedAt
    }

    %% Relationships
    USERS ||--o{ USER_PROFILES : "has profile"
    USERS ||--o{ USER_VERIFICATION : "has verification"
    USERS ||--o{ USER_RATINGS : "has ratings"
    USERS ||--o{ PRODUCTS : "sells"
    USERS ||--o{ CONVERSATIONS : "buyer in"
    USERS ||--o{ CONVERSATIONS : "seller in"
    USERS ||--o{ MESSAGES : "sends"
    USERS ||--o{ OFFERS : "creates"
    USERS ||--o{ OFFERS : "receives"
    USERS ||--o{ OFFER_REVIEWS : "writes"
    USERS ||--o{ OFFER_REVIEWS : "receives"
    USERS ||--o{ VERIFICATION_REQUESTS : "submits"
    USERS ||--o{ VERIFICATION_CODES : "has codes"
    USERS ||--o{ USER_SAVED_PRODUCTS : "saves"
    USERS ||--o{ USER_ADDRESSES : "has addresses"
    
    PRODUCTS ||--o{ PRODUCT_PRICING : "has pricing"
    PRODUCTS ||--o{ PRODUCT_INVENTORY : "has inventory"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has images"
    PRODUCTS ||--o{ PRODUCT_DELIVERY : "has delivery"
    PRODUCTS ||--o{ OFFERS : "included in"
    PRODUCTS ||--o{ USER_SAVED_PRODUCTS : "saved by users"
    
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    
    OFFERS ||--o{ OFFER_REVIEWS : "has reviews"
```

## 🎯 **Key Relationships**

### **Core User Relationships**
- **Users** → **User Profiles** (1:1) - Extended user information
- **Users** → **User Verification** (1:1) - Verification status
- **Users** → **User Ratings** (1:1) - Rating and review stats
- **Users** → **Products** (1:Many) - Users can sell multiple products

### **Product Relationships**
- **Products** → **Product Pricing** (1:1) - Price and unit information
- **Products** → **Product Inventory** (1:1) - Stock and order details
- **Products** → **Product Images** (1:Many) - Multiple images per product
- **Products** → **Product Delivery** (1:1) - Delivery and payment options

### **Communication Relationships**
- **Users** → **Conversations** (1:Many) - Users can have multiple conversations
- **Conversations** → **Messages** (1:Many) - Multiple messages per conversation
- **Users** → **Offers** (1:Many) - Users can create/receive multiple offers

### **Review Relationships**
- **Offers** → **Offer Reviews** (1:Many) - Multiple reviews per offer
- **Users** → **Offer Reviews** (1:Many) - Users can write/receive reviews

## 📊 **Database Statistics**

### **Table Sizes (Estimated)**
- **USERS**: ~1,000 records
- **PRODUCTS**: ~5,000 records
- **MESSAGES**: ~50,000 records
- **OFFERS**: ~10,000 records
- **PRODUCT_IMAGES**: ~15,000 records (large base64 data)

### **Key Performance Tables**
- **PRODUCTS** - Most queried table
- **MESSAGES** - Highest volume table
- **PRODUCT_IMAGES** - Largest storage consumption
- **OFFERS** - Complex relationship queries

## 🔍 **Optimization Insights**

### **High-Traffic Relationships**
1. **Products ↔ Users** - Seller information frequently joined
2. **Products ↔ Product Images** - Image loading performance critical
3. **Conversations ↔ Messages** - Real-time chat performance
4. **Offers ↔ Users** - Offer management queries

### **Index Recommendations**
- `products.sellerId` - For seller product listings
- `products.category` - For category filtering
- `messages.conversationId` - For chat performance
- `offers.status` - For offer management
- `user_profiles.location` - For location filtering

---

*This ERD provides a visual representation of the AgriLink database schema and helps identify optimization opportunities.*

