# 🔌 AgriLink API Documentation

*Comprehensive documentation for all 45 API routes with request/response examples, authentication requirements, and error handling.*

---

## 📋 **API Overview**

AgriLink provides **45 RESTful API endpoints** organized into logical groups:

- **🔐 Authentication APIs** (14 routes): Login, register, password management, email verification
- **🛒 Product APIs** (3 routes): CRUD operations, price comparison
- **👥 User APIs** (7 routes): Profile management, addresses, verification
- **💬 Chat APIs** (3 routes): Conversations, messages, real-time communication
- **🎯 Offer APIs** (2 routes): Trade offer management
- **👨‍💼 Admin APIs** (12 routes): System management, user verification, statistics
- **📱 Verification APIs** (4 routes): SMS verification, OTP management

**Base URL**: `https://agrilink-nextjs.vercel.app/api`

---

## 🔐 **Authentication APIs**

### **1. User Login**
**`POST /api/auth/login`**

Authenticate user and return JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "farmer",
    "accountType": "individual",
    "location": "Yangon",
    "phone": "+959123456789",
    "profileImage": "https://...",
    "verified": true,
    "phoneVerified": true,
    "verificationStatus": "verified",
    "rating": 4.5,
    "totalReviews": 12
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**Error Responses**:
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Internal server error

---

### **2. User Registration**
**`POST /api/auth/register`**

Register new user account with comprehensive profile setup.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "userType": "farmer",
  "accountType": "business",
  "location": "Yangon",
  "phone": "+959123456789"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "user_456",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "userType": "farmer",
    "accountType": "business",
    "location": "Yangon",
    "phone": "+959123456789",
    "emailVerified": false,
    "verified": false,
    "phoneVerified": false,
    "verificationStatus": "not_started",
    "rating": 0,
    "totalReviews": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful. Please check your email to verify your account.",
  "verificationEmailSent": true
}
```

**Error Responses**:
- `400`: Missing required fields
- `409`: User already exists
- `500`: Internal server error

---

### **3. Get Current User**
**`GET /api/auth/me`**

Get current authenticated user information.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "farmer",
    "accountType": "individual",
    "location": "Yangon",
    "phone": "+959123456789",
    "profileImage": "https://...",
    "verified": true,
    "phoneVerified": true,
    "verificationStatus": "verified",
    "rating": 4.5,
    "totalReviews": 12
  }
}
```

**Error Responses**:
- `401`: Unauthorized (invalid/missing token)
- `500`: Internal server error

---

### **4. Update User Profile**
**`PUT /api/auth/profile`**

Update user profile information.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Smith",
  "location": "Mandalay",
  "phone": "+959987654321",
  "businessName": "Green Farm Co.",
  "businessDescription": "Organic vegetable farming"
}
```

**Success Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_123",
    "name": "John Smith",
    "location": "Mandalay",
    "phone": "+959987654321",
    "businessName": "Green Farm Co.",
    "businessDescription": "Organic vegetable farming"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `400`: Invalid data
- `500`: Internal server error

---

### **5. Email Verification**
**`POST /api/auth/verify-email`**

Verify email address with verification code.

**Request Body**:
```json
{
  "token": "verification_token_from_email"
}
```

**Success Response** (200):
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

**Error Responses**:
- `400`: Invalid or expired token
- `404`: Token not found
- `500`: Internal server error

---

### **6. Send Verification Email**
**`POST /api/auth/send-verification-email`**

Send email verification to user's email address.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "Verification email sent successfully"
}
```

---

### **7. Request Password Reset**
**`POST /api/auth/request-password-reset`**

Send password reset email to user.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "Password reset email sent successfully"
}
```

---

### **8. Reset Password**
**`POST /api/auth/reset-password`**

Reset password with verification token.

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Password reset successfully"
}
```

---

### **9. Change Password**
**`PUT /api/auth/change-password`**

Change password for authenticated user.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

---

### **10. Update Email**
**`PUT /api/auth/update-email`**

Update user email address.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "newEmail": "newemail@example.com",
  "password": "currentpassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Email update request sent. Please verify your new email.",
  "verificationEmailSent": true
}
```

---

### **11. Verify Email Change**
**`POST /api/auth/verify-email-change`**

Verify new email address.

**Request Body**:
```json
{
  "token": "email_change_token"
}
```

**Success Response** (200):
```json
{
  "message": "Email updated successfully"
}
```

---

## 🛒 **Product APIs**

### **12. Get Products**
**`GET /api/products`**

Fetch products with filtering and pagination.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sellerId` (optional): Filter by seller ID
- `category` (optional): Filter by category
- `location` (optional): Filter by location

**Example Request**:
```
GET /api/products?page=1&limit=12&category=vegetables&location=Yangon
```

**Success Response** (200):
```json
{
  "products": [
    {
      "id": "product_123",
      "name": "Fresh Tomatoes",
      "category": "vegetables",
      "description": "Organic tomatoes from local farm",
      "price": 1500,
      "unit": "kg",
      "imageUrl": "https://...",
      "seller": {
        "id": "user_456",
        "name": "Green Farm",
        "userType": "farmer",
        "location": "Yangon",
        "verified": true,
        "phoneVerified": true,
        "verificationStatus": "verified",
        "accountType": "business"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "availableQuantity": "100 kg",
      "minimumOrder": "5 kg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 150,
    "totalPages": 13
  }
}
```

---

### **13. Get Product Details**
**`GET /api/products/[id]`**

Get detailed information about a specific product.

**Path Parameters**:
- `id`: Product ID

**Success Response** (200):
```json
{
  "product": {
    "id": "product_123",
    "name": "Fresh Tomatoes",
    "category": "vegetables",
    "description": "Organic tomatoes from local farm",
    "price": 1500,
    "unit": "kg",
    "images": [
      "https://image1.jpg",
      "https://image2.jpg"
    ],
    "sellerId": "user_456",
    "sellerName": "Green Farm",
    "sellerType": "farmer",
    "location": "Yangon",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "availableQuantity": "100 kg",
    "minimumOrder": "5 kg",
    "deliveryOptions": ["Pickup", "Delivery"],
    "paymentTerms": ["Cash", "Bank Transfer"],
    "additionalNotes": "Available Monday to Friday",
    "sellerVerificationStatus": {
      "accountType": "business",
      "trustLevel": "business-verified",
      "businessVerified": true
    }
  }
}
```

---

### **14. Create Product**
**`POST /api/products`**

Create new product listing.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Fresh Tomatoes",
  "category": "vegetables",
  "description": "Organic tomatoes from local farm",
  "price": 1500,
  "unit": "kg",
  "images": ["base64_image_data"],
  "availableQuantity": "100 kg",
  "minimumOrder": "5 kg",
  "deliveryOptions": ["Pickup", "Delivery"],
  "paymentTerms": ["Cash", "Bank Transfer"],
  "additionalNotes": "Available Monday to Friday"
}
```

**Success Response** (201):
```json
{
  "product": {
    "id": "product_123",
    "name": "Fresh Tomatoes",
    "category": "vegetables",
    "description": "Organic tomatoes from local farm",
    "price": 1500,
    "unit": "kg",
    "sellerId": "user_456",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Product created successfully"
}
```

---

### **15. Update Product**
**`PUT /api/products/[id]`**

Update existing product listing.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Product ID

**Request Body**:
```json
{
  "name": "Fresh Organic Tomatoes",
  "description": "Updated description",
  "price": 1600,
  "availableQuantity": "80 kg"
}
```

**Success Response** (200):
```json
{
  "product": {
    "id": "product_123",
    "name": "Fresh Organic Tomatoes",
    "description": "Updated description",
    "price": 1600,
    "availableQuantity": "80 kg",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "Product updated successfully"
}
```

---

### **16. Delete Product**
**`DELETE /api/products/[id]`**

Delete product listing.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Product ID

**Success Response** (200):
```json
{
  "message": "Product deleted successfully"
}
```

---

### **17. Price Comparison**
**`GET /api/products/[id]/price-comparison`**

Get price comparison data for a product.

**Path Parameters**:
- `id`: Product ID

**Success Response** (200):
```json
{
  "productId": "product_123",
  "productName": "Fresh Tomatoes",
  "currentPrice": 1500,
  "marketAverage": 1450,
  "priceRange": {
    "min": 1200,
    "max": 1800
  },
  "competitors": [
    {
      "sellerId": "user_789",
      "sellerName": "Farm Fresh",
      "price": 1400,
      "location": "Mandalay"
    }
  ],
  "trend": "stable",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

---

## 👥 **User APIs**

### **18. Get User Public Profile**
**`GET /api/user/[id]/public`**

Get public user profile information.

**Path Parameters**:
- `id`: User ID

**Success Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "userType": "farmer",
    "accountType": "business",
    "location": "Yangon",
    "profileImage": "https://...",
    "businessName": "Green Farm Co.",
    "businessDescription": "Organic vegetable farming",
    "verified": true,
    "phoneVerified": true,
    "verificationStatus": "verified",
    "rating": 4.5,
    "totalReviews": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "totalProducts": 25,
    "activeProducts": 20,
    "ratings": {
      "rating": 4.5,
      "totalReviews": 12
    },
    "reviews": [
      {
        "id": "review_123",
        "rating": 5,
        "comment": "Great quality products!",
        "reviewer": {
          "name": "Jane Smith"
        },
        "createdAt": "2024-01-10T10:30:00Z"
      }
    ]
  }
}
```

---

### **19. Get User Addresses**
**`GET /api/user/addresses`**

Get user's saved addresses.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "addresses": [
    {
      "id": "address_123",
      "addressType": "home",
      "address": "123 Main Street",
      "city": "Yangon",
      "region": "Yangon",
      "postalCode": "11001",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **20. Create Address**
**`POST /api/user/addresses`**

Add new address for user.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "addressType": "home",
  "address": "123 Main Street",
  "city": "Yangon",
  "region": "Yangon",
  "postalCode": "11001",
  "isDefault": true
}
```

**Success Response** (201):
```json
{
  "address": {
    "id": "address_123",
    "addressType": "home",
    "address": "123 Main Street",
    "city": "Yangon",
    "region": "Yangon",
    "postalCode": "11001",
    "isDefault": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Address created successfully"
}
```

---

### **21. Update Address**
**`PUT /api/user/addresses/[id]`**

Update existing address.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Address ID

**Request Body**:
```json
{
  "address": "456 New Street",
  "city": "Mandalay",
  "region": "Mandalay"
}
```

---

### **22. Delete Address**
**`DELETE /api/user/addresses/[id]`**

Delete address.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Address ID

---

### **23. Get Saved Products**
**`GET /api/user/saved-products`**

Get user's saved/bookmarked products.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "savedProducts": [
    {
      "id": "product_123",
      "name": "Fresh Tomatoes",
      "price": 1500,
      "unit": "kg",
      "imageUrl": "https://...",
      "seller": {
        "id": "user_456",
        "name": "Green Farm"
      },
      "savedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### **24. Get Verification Status**
**`GET /api/user/verification-status`**

Get user's verification status and requirements.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "verification": {
    "verified": true,
    "phoneVerified": true,
    "verificationStatus": "verified",
    "trustLevel": "business-verified",
    "requiredDocuments": [],
    "completedSteps": [
      "email_verification",
      "phone_verification",
      "business_documents"
    ],
    "nextSteps": []
  }
}
```

---

### **25. Reset Verification**
**`POST /api/user/reset-verification`**

Reset user verification status.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "message": "Verification status reset successfully"
}
```

---

## 💬 **Chat APIs**

### **26. Get Conversations**
**`GET /api/chat/conversations`**

Get all conversations for current user.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "productId": "product_456",
      "productName": "Fresh Tomatoes",
      "productImage": "/api/placeholder/400/300",
      "otherParty": {
        "id": "user_789",
        "name": "Jane Smith",
        "type": "buyer",
        "accountType": "individual",
        "location": "Mandalay",
        "rating": 4.2,
        "verified": true,
        "phoneVerified": true,
        "verificationStatus": "verified",
        "profileImage": "https://..."
      },
      "lastMessage": {
        "content": "Is this still available?",
        "timestamp": "2024-01-15T10:30:00Z",
        "isOwn": false
      },
      "unreadCount": 2,
      "status": "active"
    }
  ],
  "message": "Conversations fetched successfully"
}
```

---

### **27. Create Conversation**
**`POST /api/chat/conversations`**

Create new conversation between buyer and seller.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "buyerId": "user_123",
  "sellerId": "user_456",
  "productId": "product_789"
}
```

**Success Response** (201):
```json
{
  "conversation": {
    "id": "conv_123",
    "buyerId": "user_123",
    "sellerId": "user_456",
    "productId": "product_789",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Conversation created successfully"
}
```

---

### **28. Get Conversation Messages**
**`GET /api/chat/conversations/[id]`**

Get messages for specific conversation.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `id`: Conversation ID

**Success Response** (200):
```json
{
  "messages": [
    {
      "id": "msg_123",
      "conversationId": "conv_123",
      "senderId": "user_123",
      "content": "Hello, is this product still available?",
      "createdAt": "2024-01-15T10:30:00Z",
      "isRead": true
    },
    {
      "id": "msg_124",
      "conversationId": "conv_123",
      "senderId": "user_456",
      "content": "Yes, it's still available!",
      "createdAt": "2024-01-15T10:35:00Z",
      "isRead": false
    }
  ],
  "conversation": {
    "id": "conv_123",
    "buyerId": "user_123",
    "sellerId": "user_456",
    "productId": "product_789"
  }
}
```

---

### **29. Send Message**
**`POST /api/chat/messages`**

Send message in conversation.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "conversationId": "conv_123",
  "content": "What's the minimum order quantity?"
}
```

**Success Response** (201):
```json
{
  "message": {
    "id": "msg_125",
    "conversationId": "conv_123",
    "senderId": "user_123",
    "content": "What's the minimum order quantity?",
    "createdAt": "2024-01-15T10:40:00Z",
    "isRead": false
  },
  "message": "Message sent successfully"
}
```

---

## 🎯 **Offer APIs**

### **30. Get Offers**
**`GET /api/offers`**

Get offers (sent or received) for current user.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `type` (required): `sent` or `received`
- `status` (optional): Filter by status
- `conversationId` (optional): Filter by conversation

**Example Request**:
```
GET /api/offers?type=sent&status=pending
```

**Success Response** (200):
```json
{
  "offers": [
    {
      "id": "offer_123",
      "productId": "product_456",
      "product": {
        "id": "product_456",
        "name": "Fresh Tomatoes",
        "category": "vegetables",
        "image": "https://..."
      },
      "buyerId": "user_123",
      "buyer": {
        "id": "user_123",
        "name": "John Doe",
        "userType": "buyer",
        "accountType": "individual",
        "profileImage": "https://..."
      },
      "sellerId": "user_789",
      "seller": {
        "id": "user_789",
        "name": "Green Farm",
        "userType": "farmer",
        "accountType": "business",
        "profileImage": "https://..."
      },
      "offerPrice": 1400,
      "quantity": 10,
      "message": "Interested in bulk purchase",
      "status": "pending",
      "deliveryOptions": ["Pickup"],
      "paymentTerms": ["Cash"],
      "expiresAt": "2024-01-20T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Offers fetched successfully"
}
```

---

### **31. Create Offer**
**`POST /api/offers`**

Create new trade offer.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "productId": "product_456",
  "sellerId": "user_789",
  "offerPrice": 1400,
  "quantity": 10,
  "message": "Interested in bulk purchase",
  "deliveryOptions": ["Pickup"],
  "paymentTerms": ["Cash"],
  "expiresAt": "2024-01-20T10:30:00Z"
}
```

**Success Response** (201):
```json
{
  "offer": {
    "id": "offer_123",
    "productId": "product_456",
    "buyerId": "user_123",
    "sellerId": "user_789",
    "offerPrice": 1400,
    "quantity": 10,
    "message": "Interested in bulk purchase",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Offer created successfully"
}
```

---

### **32. Update Offer Status**
**`PUT /api/offers/[id]`**

Update offer status (accept, reject, etc.).

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Offer ID

**Request Body**:
```json
{
  "status": "accepted",
  "message": "Offer accepted, will prepare for pickup"
}
```

**Success Response** (200):
```json
{
  "offer": {
    "id": "offer_123",
    "status": "accepted",
    "acceptedAt": "2024-01-15T11:30:00Z",
    "message": "Offer accepted, will prepare for pickup"
  },
  "message": "Offer updated successfully"
}
```

---

## 👨‍💼 **Admin APIs**

### **33. Get Admin Statistics**
**`GET /api/admin/stats`**

Get system-wide statistics for admin dashboard.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response** (200):
```json
{
  "stats": {
    "users": {
      "total": 1250,
      "active": 1100,
      "verified": 850,
      "newThisMonth": 150
    },
    "products": {
      "total": 3200,
      "active": 2800,
      "newThisMonth": 200
    },
    "offers": {
      "total": 4500,
      "pending": 120,
      "completed": 3800,
      "thisMonth": 580
    },
    "conversations": {
      "total": 8900,
      "active": 1200
    }
  }
}
```

---

### **34. Get User Statistics**
**`GET /api/admin/stats/users`**

Get detailed user statistics.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response** (200):
```json
{
  "userStats": {
    "byType": {
      "farmers": 650,
      "traders": 300,
      "buyers": 300
    },
    "byAccountType": {
      "individual": 800,
      "business": 450
    },
    "byVerification": {
      "verified": 850,
      "pending": 200,
      "unverified": 200
    },
    "byLocation": {
      "Yangon": 400,
      "Mandalay": 350,
      "Naypyidaw": 200,
      "Other": 300
    }
  }
}
```

---

### **35. Get All Users**
**`GET /api/admin/users`**

Get list of all users for admin management.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or email
- `userType` (optional): Filter by user type
- `verified` (optional): Filter by verification status

**Success Response** (200):
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "farmer",
      "accountType": "business",
      "location": "Yangon",
      "verified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActive": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

---

### **36. Verify User**
**`POST /api/admin/users/[id]/verify`**

Verify user account (admin only).

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: User ID

**Request Body**:
```json
{
  "verificationStatus": "verified",
  "notes": "All documents verified successfully"
}
```

**Success Response** (200):
```json
{
  "message": "User verification updated successfully",
  "user": {
    "id": "user_123",
    "verificationStatus": "verified",
    "verified": true
  }
}
```

---

### **37. Get All Products**
**`GET /api/admin/products`**

Get all products for admin management.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response** (200):
```json
{
  "products": [
    {
      "id": "product_123",
      "name": "Fresh Tomatoes",
      "category": "vegetables",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "sellerName": "Green Farm"
    }
  ]
}
```

---

### **38. Get Product by ID**
**`GET /api/admin/products/[id]`**

Get specific product details for admin.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:
- `id`: Product ID

**Success Response** (200):
```json
{
  "product": {
    "id": "product_123",
    "name": "Fresh Tomatoes",
    "category": "vegetables",
    "description": "Organic tomatoes",
    "price": 1500,
    "unit": "kg",
    "isActive": true,
    "sellerId": "user_456",
    "sellerName": "Green Farm",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### **39. Get Verification Requests**
**`GET /api/admin/verification-requests`**

Get all pending verification requests.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Success Response** (200):
```json
{
  "requests": [
    {
      "id": "req_123",
      "userId": "user_456",
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "userType": "farmer",
      "accountType": "business",
      "requestType": "business_verification",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00Z",
      "businessInfo": {
        "businessName": "Green Farm Co.",
        "businessDescription": "Organic farming",
        "businessLicenseNumber": "BL123456"
      },
      "verificationDocuments": ["license.pdf", "certificate.pdf"],
      "location": "Yangon",
      "phone": "+959123456789"
    }
  ]
}
```

---

### **40. Approve Verification Request**
**`POST /api/admin/verification-requests/approve`**

Approve user verification request.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "requestId": "req_123",
  "notes": "All documents verified and approved"
}
```

**Success Response** (200):
```json
{
  "message": "Verification request approved successfully",
  "request": {
    "id": "req_123",
    "status": "approved",
    "reviewedAt": "2024-01-15T11:30:00Z",
    "reviewedBy": "admin_user_id"
  }
}
```

---

### **41. Reject Verification Request**
**`POST /api/admin/verification-requests/reject`**

Reject user verification request.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "requestId": "req_123",
  "reason": "Incomplete documentation",
  "notes": "Please provide business license and tax certificate"
}
```

**Success Response** (200):
```json
{
  "message": "Verification request rejected",
  "request": {
    "id": "req_123",
    "status": "rejected",
    "reviewedAt": "2024-01-15T11:30:00Z",
    "reviewedBy": "admin_user_id"
  }
}
```

---

## 📱 **Verification APIs**

### **42. Send SMS Verification**
**`POST /api/send-verification-sms`**

Send SMS verification code to phone number.

**Request Body**:
```json
{
  "phone": "+959123456789"
}
```

**Success Response** (200):
```json
{
  "message": "SMS verification code sent successfully",
  "phone": "+959123456789"
}
```

---

### **43. Send Team SMS**
**`POST /api/send-verification-sms-team`**

Send SMS verification for team accounts.

**Request Body**:
```json
{
  "phone": "+959123456789",
  "teamId": "team_123"
}
```

**Success Response** (200):
```json
{
  "message": "Team SMS verification sent successfully"
}
```

---

### **44. Send Multi OTP**
**`POST /api/send-otp-multi`**

Send OTP to multiple phone numbers.

**Request Body**:
```json
{
  "phones": ["+959123456789", "+959987654321"],
  "message": "Your verification code is: {code}"
}
```

**Success Response** (200):
```json
{
  "message": "OTP sent to multiple numbers successfully",
  "sentCount": 2,
  "failedCount": 0
}
```

---

### **45. Verify SMS Code**
**`POST /api/verify-sms-code`**

Verify SMS verification code.

**Request Body**:
```json
{
  "phone": "+959123456789",
  "code": "123456"
}
```

**Success Response** (200):
```json
{
  "message": "Phone number verified successfully",
  "verified": true,
  "phone": "+959123456789"
}
```

---

## 🔒 **Authentication & Security**

### **JWT Token Structure**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "userType": "farmer",
  "accountType": "business",
  "iat": 1642248000,
  "exp": 1642852800
}
```

### **Authorization Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Common Error Responses**

**401 Unauthorized**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**403 Forbidden**:
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions for this action"
}
```

**400 Bad Request**:
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

**404 Not Found**:
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 📊 **Rate Limiting**

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute
- **Admin endpoints**: 50 requests per minute

---

## 🌐 **Environment Variables**

Required environment variables for API functionality:

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_secret_key

# Email Service
RESEND_API_KEY=your_resend_key

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# App Configuration
NEXT_PUBLIC_APP_URL=https://agrilink-nextjs.vercel.app
```

---

*This API documentation provides comprehensive coverage of all 45 endpoints in the AgriLink application, enabling developers to integrate with and extend the platform effectively.*
