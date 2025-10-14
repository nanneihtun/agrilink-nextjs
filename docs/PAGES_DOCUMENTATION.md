# 📄 AgriLink Pages Documentation

*Comprehensive documentation for all 25 pages in the AgriLink agricultural marketplace application.*

---

## 📋 **Page Overview**

AgriLink consists of **25 pages** organized into logical groups:

- **🏠 Public Pages** (6): Homepage, About, Contact, FAQ, Login, Register
- **🔐 Authentication Pages** (5): Login, Register, Forgot Password, Reset Password, Email Verification
- **👤 User Pages** (6): Dashboard, Profile, Messages, Chat, Offers, Products
- **🛒 Product Pages** (4): Product Details, Edit Product, New Product, Price Comparison
- **👥 Seller/User Pages** (2): Seller Storefront, User Profile
- **🔧 Admin Pages** (2): Admin Dashboard, Admin Verification

---

## 🏠 **Public Pages**

### **1. Homepage (`/`)**
**File**: `src/app/page.tsx`

**Purpose**: Main marketplace landing page with product browsing and search functionality.

**Key Features**:
- **Product Grid**: Displays all active products in a responsive grid (12 items per page)
- **Search & Filters**: Advanced filtering by category, location, price range
- **Real-time Chat**: Popup chat interface for immediate seller contact
- **Pagination**: Navigate through product listings
- **User Authentication**: Shows different UI based on login status

**Components Used**:
- `MarketplaceHero` - Hero section with search
- `SearchFilters` - Advanced filtering system
- `ProductCard` - Individual product display
- `ChatInterface` - Real-time messaging popup

**Navigation**:
- Click product → `/product/[id]`
- Click seller → `/seller/[id]`
- Chat button → Opens chat popup
- Login/Register buttons → Authentication pages

**API Calls**:
- `GET /api/products` - Fetch all products
- `GET /api/user/[id]/public` - Get seller information

---

### **2. About Page (`/about`)**
**File**: `src/app/about/page.tsx`

**Purpose**: Information about AgriLink, mission, and team.

**Key Features**:
- Company information and mission
- Team member profiles
- Contact information
- Social media links

**Navigation**:
- Back to homepage
- Contact page link

---

### **3. Contact Page (`/contact`)**
**File**: `src/app/contact/page.tsx`

**Purpose**: Contact form and company contact information.

**Key Features**:
- Contact form with validation
- Company address and phone
- Business hours
- Map integration (if available)

**Navigation**:
- Back to homepage
- Submit form → Success message

---

### **4. FAQ Page (`/faq`)**
**File**: `src/app/faq/page.tsx`

**Purpose**: Frequently asked questions and help center.

**Key Features**:
- Categorized FAQ sections
- Search functionality
- Expandable answer sections
- Contact support option

**Navigation**:
- Back to homepage
- Contact support link

---

## 🔐 **Authentication Pages**

### **5. Login Page (`/login`)**
**File**: `src/app/login/page.tsx`

**Purpose**: User authentication and login functionality.

**Key Features**:
- Email and password authentication
- Password visibility toggle
- "Forgot Password" link
- "Register" link for new users
- Form validation and error handling
- Loading states during authentication

**Form Fields**:
- Email (required, email validation)
- Password (required, min 6 characters)

**API Calls**:
- `POST /api/auth/login` - Authenticate user

**Redirects**:
- Admin users → `/admin`
- Regular users → `/dashboard`
- Invalid credentials → Error message

**Navigation**:
- Register link → `/register`
- Forgot password → `/forgot-password`
- Successful login → Dashboard or Admin

---

### **6. Register Page (`/register`)**
**File**: `src/app/register/page.tsx`

**Purpose**: New user registration with comprehensive profile setup.

**Key Features**:
- **Two-step registration process**:
  1. Personal Information (name, email, phone, password)
  2. Role & Location Selection (user type, account type, region, city)
- **User Type Selection**: Farmer, Trader, Buyer with descriptions
- **Account Type**: Individual or Business account
- **Location Selection**: Myanmar regions and cities
- **Form Validation**: Comprehensive client-side validation
- **Password Security**: Show/hide password, confirmation matching

**Form Fields**:
- **Personal Info**: Name*, Email*, Phone, Password*, Confirm Password*
- **Account Setup**: User Type*, Account Type*, Region*, City*

**User Types**:
- **Farmer**: "I grow and produce fresh agricultural products to sell"
- **Trader**: "I connect farmers with buyers through distribution and trading"
- **Buyer**: "I purchase agricultural products for my business or personal consumption"

**Account Types**:
- **Individual**: Personal accounts, small operations
- **Business**: Registered businesses, companies, formal operations

**API Calls**:
- `POST /api/auth/register` - Create new user account

**Redirects**:
- Successful registration → `/verify-email` (if email verification enabled)
- Fallback → `/dashboard`

**Navigation**:
- Login link → `/login`
- Back to home → `/`

---

### **7. Forgot Password Page (`/forgot-password`)**
**File**: `src/app/forgot-password/page.tsx`

**Purpose**: Password reset request functionality.

**Key Features**:
- Email input for password reset request
- Success confirmation message
- Back to login option

**API Calls**:
- `POST /api/auth/request-password-reset` - Send reset email

**Navigation**:
- Back to login → `/login`
- Success → Login page with message

---

### **8. Reset Password Page (`/reset-password`)**
**File**: `src/app/reset-password/page.tsx`

**Purpose**: Password reset form with token validation.

**Key Features**:
- Token-based password reset
- New password confirmation
- Form validation
- Success/error handling

**API Calls**:
- `POST /api/auth/reset-password` - Reset password with token

**Navigation**:
- Success → `/login`
- Invalid token → Error message

---

### **9. Email Verification Page (`/verify-email`)**
**File**: `src/app/verify-email/page.tsx`

**Purpose**: Email verification after registration.

**Key Features**:
- Email verification code input
- Resend verification email
- Success confirmation
- Redirect to dashboard after verification

**API Calls**:
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/send-verification-email` - Resend verification

**Navigation**:
- Successful verification → `/dashboard`
- Resend email → Stay on page with message

---

### **10. Email Change Verification (`/verify-email-change`)**
**File**: `src/app/verify-email-change/page.tsx`

**Purpose**: Verify new email address when user changes email.

**Key Features**:
- New email verification
- Code input form
- Success confirmation

**API Calls**:
- `POST /api/auth/verify-email-change` - Verify new email

**Navigation**:
- Success → `/dashboard`
- Back to profile → `/profile`

---

## 👤 **User Pages**

### **11. Dashboard (`/dashboard`)**
**File**: `src/app/dashboard/page.tsx`

**Purpose**: Main user dashboard with personalized content and quick actions.

**Key Features**:
- **User-specific dashboard** based on user type (Farmer, Trader, Buyer)
- **Product management**: View own products, add new products
- **Saved products**: Quick access to bookmarked products
- **Recent activity**: Latest offers, messages, reviews
- **Quick actions**: Add product, view offers, manage profile
- **Auto-refresh**: Updates data when page becomes visible
- **Responsive design**: Optimized for all devices

**Dashboard Types**:
- **FreshDashboard**: Main dashboard component
- **BuyerDashboard**: Buyer-specific features

**Components Used**:
- `FreshDashboard` - Main dashboard interface
- `BuyerDashboard` - Buyer-specific dashboard
- `AppHeader` - Navigation header

**API Calls**:
- `GET /api/user/profile` - Get user data
- `GET /api/products?sellerId=[userId]` - Get user's products
- `GET /api/user/saved-products` - Get saved products
- `GET /api/products` - Get all products

**Navigation**:
- Add product → `/products/new`
- View offers → `/offers`
- Edit profile → `/profile`
- View products → `/product/[id]`
- Logout → Homepage

---

### **12. Profile Page (`/profile`)**
**File**: `src/app/profile/page.tsx`

**Purpose**: User profile management and viewing.

**Key Features**:
- **Profile viewing and editing**
- **Verification status display**
- **Business information management**
- **Profile image upload**
- **Contact information**
- **Rating and review display**
- **Storefront preview**

**Components Used**:
- `Profile` - Main profile component

**API Calls**:
- `GET /api/user/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/user/[id]/public` - Get public profile data

**Navigation**:
- Edit profile → Profile with edit mode
- Verification → `/verify`
- View storefront → `/seller/[id]`
- Back to dashboard → `/dashboard`

---

### **13. Messages Page (`/messages`)**
**File**: `src/app/messages/page.tsx`

**Purpose**: Centralized messaging hub for all conversations.

**Key Features**:
- **Conversation list**: All active conversations
- **Message threading**: Organized by conversation
- **Real-time updates**: Live message delivery
- **Search functionality**: Find specific conversations
- **Message status**: Read/unread indicators
- **Quick actions**: Mark as read, archive, delete

**API Calls**:
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages` - Get messages for conversation

**Navigation**:
- Click conversation → Open chat interface
- Back to dashboard → `/dashboard`

---

### **14. Chat Page (`/chat`)**
**File**: `src/app/chat/page.tsx`

**Purpose**: Dedicated chat interface page.

**Key Features**:
- **Full-screen chat interface**
- **Multiple conversation support**
- **File sharing capabilities**
- **Message history**
- **Typing indicators**

**Components Used**:
- `ChatInterface` - Main chat component

**Navigation**:
- Back to messages → `/messages`
- Close chat → Previous page

---

### **15. Offers Page (`/offers`)**
**File**: `src/app/offers/page.tsx`

**Purpose**: Manage trade offers (sent and received).

**Key Features**:
- **Tabbed interface**: Sent offers vs Received offers
- **Offer status tracking**: Pending, Accepted, Rejected, Completed, etc.
- **Detailed offer information**: Price, quantity, delivery options
- **Quick actions**: View details, accept/reject offers
- **Status indicators**: Visual status badges with icons
- **User-specific tabs**: Different tabs based on user type

**Offer Statuses**:
- **Pending**: Awaiting response
- **Accepted**: Offer accepted by seller
- **Rejected**: Offer declined
- **To Ship**: Ready for shipping
- **Shipped**: In transit
- **To Receive**: Ready for delivery
- **Completed**: Successfully delivered
- **Cancelled**: Offer cancelled
- **Expired**: Offer expired

**Components Used**:
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` - Tab interface
- `Badge` - Status indicators
- `Card` - Offer display cards

**API Calls**:
- `GET /api/offers?type=sent` - Get sent offers
- `GET /api/offers?type=received` - Get received offers

**Navigation**:
- View offer details → `/offers/[id]`
- Browse products → `/` (homepage)
- List products → `/products/new`

---

### **16. Products New Page (`/products/new`)**
**File**: `src/app/products/new/page.tsx`

**Purpose**: Create new product listings.

**Key Features**:
- **Product form**: Name, category, description, price
- **Image upload**: Multiple image support
- **Inventory management**: Available quantity, minimum order
- **Delivery options**: Shipping and pickup options
- **Payment terms**: Accepted payment methods
- **Form validation**: Client-side validation
- **Preview mode**: See how product will appear

**Components Used**:
- `SimplifiedProductForm` - Product creation form
- `ImageUpload` - Image upload component

**API Calls**:
- `POST /api/products` - Create new product
- `POST /api/products/[id]` - Update existing product

**Navigation**:
- Save product → Product details page
- Cancel → Dashboard
- Preview → Product view mode

---

## 🛒 **Product Pages**

### **17. Product Details Page (`/product/[id]`)**
**File**: `src/app/product/[id]/page.tsx`

**Purpose**: Detailed product view with seller information and interaction options.

**Key Features**:
- **Product gallery**: Multiple images with navigation
- **Product information**: Name, price, description, availability
- **Seller information**: Profile, ratings, verification status
- **Order details**: Minimum order, delivery options, payment terms
- **Interactive elements**: Contact seller, compare prices
- **Preview mode**: For product owners to see customer view
- **Mobile optimization**: Touch/swipe support for images

**Product Information Displayed**:
- **Basic Info**: Name, price, unit, category
- **Availability**: Stock quantity, minimum order
- **Location**: Seller location
- **Last Updated**: Timestamp
- **Images**: Gallery with thumbnails and navigation

**Seller Information**:
- **Profile**: Name, user type, verification status
- **Ratings**: Star rating, review count
- **Response time**: Typical response time
- **Storefront link**: View full seller profile

**Interactive Features**:
- **Image Navigation**: Previous/next, thumbnail selection
- **Keyboard Support**: Arrow keys for image navigation
- **Touch Support**: Swipe gestures on mobile
- **Chat Integration**: Direct seller contact

**Components Used**:
- `UserBadge` - Seller verification display
- `ChatInterface` - Seller communication
- `Dialog` - Reviews modal

**API Calls**:
- `GET /api/products/[id]` - Get product details
- `GET /api/user/[id]/public` - Get seller information

**Navigation**:
- Edit product → `/product/[id]/edit` (owner only)
- Compare prices → `/products/[id]/price-comparison`
- Contact seller → Chat popup
- View seller → `/user/[id]`
- Back → Homepage

---

### **18. Product Edit Page (`/product/[id]/edit`)**
**File**: `src/app/product/[id]/edit/page.tsx`

**Purpose**: Edit existing product listings.

**Key Features**:
- **Pre-filled form**: Current product data
- **Image management**: Add, remove, reorder images
- **Form validation**: Ensure data integrity
- **Save changes**: Update product information
- **Cancel option**: Discard changes

**Components Used**:
- `SimplifiedProductForm` - Product editing form

**API Calls**:
- `GET /api/products/[id]` - Get current product data
- `PUT /api/products/[id]` - Update product

**Navigation**:
- Save changes → Product details page
- Cancel → Product details page
- Delete product → Confirmation dialog

---

### **19. Price Comparison Page (`/products/[id]/price-comparison`)**
**File**: `src/app/products/[id]/price-comparison/page.tsx`

**Purpose**: Compare product prices with market data.

**Key Features**:
- **Market price comparison**: Compare with similar products
- **Price trends**: Historical price data
- **Regional pricing**: Price variations by location
- **Competitor analysis**: Other sellers' prices
- **Price alerts**: Set price notifications

**Components Used**:
- `PriceComparison` - Price comparison component

**API Calls**:
- `GET /api/products/[id]/price-comparison` - Get price data

**Navigation**:
- Back to product → `/product/[id]`
- Contact seller → Chat interface

---

## 👥 **Seller/User Pages**

### **20. Seller Storefront (`/seller/[id]`)**
**File**: `src/app/seller/[id]/page.tsx`

**Purpose**: Public seller profile and product showcase.

**Key Features**:
- **Seller information**: Profile, business details, verification status
- **Product showcase**: All seller's products
- **Rating display**: Customer reviews and ratings
- **Contact options**: Direct messaging, phone contact
- **Business information**: Description, location, certifications
- **Responsive design**: Mobile-optimized layout

**Seller Information Displayed**:
- **Profile**: Name, user type, account type
- **Business**: Business name, description, location
- **Verification**: Verification status, trust level
- **Ratings**: Average rating, total reviews
- **Contact**: Phone, messaging options

**Components Used**:
- `SellerStorefront` - Main storefront component
- `ChatInterface` - Contact seller
- `UserBadge` - Verification display

**API Calls**:
- `GET /api/user/[id]/public` - Get seller public data
- `GET /api/products?sellerId=[id]` - Get seller's products

**Navigation**:
- Contact seller → Chat popup
- View product → `/product/[id]`
- Back → Previous page

---

### **21. User Profile (`/user/[id]`)**
**File**: `src/app/user/[id]/page.tsx`

**Purpose**: Public user profile viewing.

**Key Features**:
- **Public profile**: Viewable by all users
- **User information**: Name, type, location, verification
- **Activity summary**: Recent listings, ratings
- **Contact options**: Messaging, following (if implemented)

**API Calls**:
- `GET /api/user/[id]/public` - Get public user data

**Navigation**:
- Contact user → Chat interface
- Back → Previous page

---

## 🔧 **Admin Pages**

### **22. Admin Dashboard (`/admin`)**
**File**: `src/app/admin/page.tsx`

**Purpose**: Administrative control panel for system management.

**Key Features**:
- **User statistics**: Total users, active users, new registrations
- **Product management**: Total products, active listings
- **System metrics**: Performance indicators
- **Quick actions**: User verification, system settings
- **Access control**: Admin-only access

**Components Used**:
- `AdminDashboard` - Main admin interface

**API Calls**:
- `GET /api/admin/stats` - Get system statistics

**Navigation**:
- Verification panel → `/admin/verification`
- User management → User list
- Logout → Homepage

---

### **23. Admin Verification (`/admin/verification`)**
**File**: `src/app/admin/verification/page.tsx`

**Purpose**: Manage user verification requests and approvals.

**Key Features**:
- **Verification queue**: Pending verification requests
- **User details**: Review submitted documents
- **Approval workflow**: Approve or reject requests
- **Bulk actions**: Process multiple requests
- **Audit trail**: Track verification history

**Components Used**:
- `AdminVerificationPanel` - Verification management

**API Calls**:
- `GET /api/admin/verification-requests` - Get pending requests
- `POST /api/admin/verification-requests/approve` - Approve request
- `POST /api/admin/verification-requests/reject` - Reject request

**Navigation**:
- Back to admin → `/admin`
- View user → User profile

---

## 📱 **Additional Pages**

### **24. Forgot Password Page (`/forgot-password`)**
**File**: `src/app/forgot-password/page.tsx`

**Purpose**: Request password reset via email.

**Key Features**:
- Email input form
- Success confirmation
- Back to login option

### **25. Reset Password Page (`/reset-password`)**
**File**: `src/app/reset-password/page.tsx`

**Purpose**: Reset password with verification token.

**Key Features**:
- Token validation
- New password form
- Confirmation matching
- Success handling

---

## 🔄 **Page Navigation Flow**

### **Authentication Flow**:
```
Homepage → Login/Register → Email Verification → Dashboard
```

### **User Journey**:
```
Dashboard → Profile → Products → Offers → Messages
```

### **Product Flow**:
```
Homepage → Product Details → Contact Seller → Chat → Offers
```

### **Admin Flow**:
```
Login (Admin) → Admin Dashboard → Verification Panel → User Management
```

---

## 📊 **Page Statistics**

- **Total Pages**: 25
- **Public Pages**: 6
- **Authentication Pages**: 5
- **User Pages**: 6
- **Product Pages**: 4
- **Seller/User Pages**: 2
- **Admin Pages**: 2

---

## 🎯 **Key Features by Page Category**

### **Public Pages**:
- Product browsing and search
- Company information
- Contact and support

### **Authentication Pages**:
- User registration and login
- Password management
- Email verification

### **User Pages**:
- Personal dashboard
- Profile management
- Communication tools
- Offer management

### **Product Pages**:
- Product creation and editing
- Detailed product views
- Price comparison tools

### **Seller Pages**:
- Public storefronts
- Seller profiles
- Product showcases

### **Admin Pages**:
- System management
- User verification
- Analytics and reporting

---

*This documentation provides a comprehensive overview of all pages in the AgriLink application, helping developers understand the purpose, functionality, and navigation flow of each page.*
