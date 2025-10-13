# 🛠️ AgriLink Developer Guide - Page Functions & Behaviors

*This guide outlines the expected functions, behaviors, and requirements for each page in the AgriLink application.*

---

## 📋 Table of Contents
1. [Public Pages](#public-pages)
2. [Authentication Pages](#authentication-pages)
3. [User Dashboard Pages](#user-dashboard-pages)
4. [Product Management Pages](#product-management-pages)
5. [User Profile Pages](#user-profile-pages)
6. [Communication Pages](#communication-pages)
7. [Admin Pages](#admin-pages)
8. [API Endpoints](#api-endpoints)

---

## 🌐 Public Pages

### **Home/Marketplace (`/`)**
**Purpose**: Main landing page and product marketplace
**Expected Functions**:
- ✅ Display featured products in grid layout
- ✅ Search bar with real-time suggestions
- ✅ Category filtering (Vegetables, Fruits, Grains, etc.)
- ✅ Region/City filtering dropdown
- ✅ Seller type filtering (Farmer, Trader, Verified)
- ✅ Sort options (Price, Date, Rating)
- ✅ Pagination for large product sets
- ✅ Responsive design (mobile-first)
- ✅ Loading states and error handling

**User Interactions**:
- Click product card → Navigate to product details
- Click seller name → Navigate to seller storefront
- Use filters → Update product list dynamically
- Search → Show filtered results with debouncing

**Data Requirements**:
- Product list with images, prices, seller info
- Category list for filtering
- Region/city data for location filtering
- User authentication status

---

### **About Us (`/about`)**
**Purpose**: Company information and mission
**Expected Functions**:
- ✅ Display company information
- ✅ Team member profiles
- ✅ Mission and vision statements
- ✅ Company values and achievements
- ✅ Contact information
- ✅ Back navigation to home

**User Interactions**:
- Scroll through content
- Click contact links
- Navigate back to home

**Data Requirements**:
- Static content (can be hardcoded or from CMS)

---

### **Contact (`/contact`)**
**Purpose**: Contact form and company information
**Expected Functions**:
- ✅ Contact form with validation
- ✅ Form fields: Name, Email, Subject, Message
- ✅ Form submission with loading state
- ✅ Success/error messaging
- ✅ Company contact information display
- ✅ Support options and FAQ links

**User Interactions**:
- Fill out contact form
- Submit form with validation
- View success/error messages
- Access support resources

**Data Requirements**:
- Form validation rules
- Email sending service integration
- Company contact information

---

### **FAQ (`/faq`)**
**Purpose**: Frequently Asked Questions
**Expected Functions**:
- ✅ Expandable FAQ items with smooth animations
- ✅ Search functionality across FAQ content
- ✅ Category organization (General, Account, Products, etc.)
- ✅ Responsive design for mobile
- ✅ Back navigation

**User Interactions**:
- Click to expand/collapse FAQ items
- Search through FAQ content
- Navigate between categories

**Data Requirements**:
- FAQ data structure with categories
- Search indexing for FAQ content

---

## 🔐 Authentication Pages

### **Register (`/register`)**
**Purpose**: User registration with account type selection
**Expected Functions**:
- ✅ Multi-step registration form
- ✅ User type selection (Farmer, Trader, Buyer)
- ✅ Account type selection (Individual, Business)
- ✅ Location selection (Region → City dropdown)
- ✅ Form validation with real-time feedback
- ✅ Password strength indicator
- ✅ Terms and conditions acceptance
- ✅ Account type guide integration
- ✅ Success/error messaging

**User Interactions**:
- Select user type and account type
- Fill out personal information
- Choose location from dropdowns
- Submit form with validation
- View account type guide

**Data Requirements**:
- Myanmar regions and cities data
- Form validation rules
- User registration API
- Email verification system

**Validation Rules**:
- Email: Valid email format, unique
- Password: Minimum 6 characters
- Phone: Valid Myanmar phone format
- Required fields: Name, Email, Password, User Type, Location

---

### **Login (`/login`)**
**Purpose**: User authentication
**Expected Functions**:
- ✅ Email/password login form
- ✅ Password visibility toggle
- ✅ Remember me functionality
- ✅ Form validation
- ✅ Loading states during authentication
- ✅ Error handling for invalid credentials
- ✅ Redirect to appropriate dashboard after login
- ✅ Links to register and forgot password

**User Interactions**:
- Enter email and password
- Toggle password visibility
- Submit login form
- Navigate to register or forgot password

**Data Requirements**:
- User authentication API
- JWT token management
- User role-based redirects

**Redirect Logic**:
- Admin → `/admin`
- Regular users → `/dashboard`
- Unverified users → `/verify`

---

### **Forgot Password (`/forgot-password`)**
**Purpose**: Password reset request
**Expected Functions**:
- ✅ Email input with validation
- ✅ Submit password reset request
- ✅ Loading state during submission
- ✅ Success message with instructions
- ✅ Error handling for invalid email
- ✅ Back to login navigation

**User Interactions**:
- Enter email address
- Submit reset request
- View success/error messages

**Data Requirements**:
- Email validation
- Password reset API
- Email sending service

---

### **Reset Password (`/reset-password`)**
**Purpose**: Password reset with token
**Expected Functions**:
- ✅ Token validation
- ✅ New password input with confirmation
- ✅ Password strength indicator
- ✅ Form validation
- ✅ Submit new password
- ✅ Success message and redirect to login

**User Interactions**:
- Enter new password and confirmation
- Submit password reset
- Navigate to login

**Data Requirements**:
- Token validation API
- Password reset confirmation API

---

### **Verify Email (`/verify-email`)**
**Purpose**: Email verification after registration
**Expected Functions**:
- ✅ Display verification status
- ✅ Resend verification email option
- ✅ Success message after verification
- ✅ Redirect to next step (phone verification)
- ✅ Error handling for invalid tokens

**User Interactions**:
- Click resend verification email
- View verification status
- Navigate to next step

**Data Requirements**:
- Email verification API
- Token validation
- Email sending service

---

## 🏠 User Dashboard Pages

### **Dashboard (`/dashboard`)**
**Purpose**: Main user dashboard with role-based content
**Expected Functions**:
- ✅ Welcome message with user name
- ✅ Role-based quick actions
- ✅ Recent activity feed
- ✅ Statistics overview (products, offers, messages)
- ✅ Quick access to main features
- ✅ Responsive design

**Role-Specific Content**:
- **Farmers/Traders**: Add product, manage storefront, view offers
- **Buyers**: Browse products, saved products, recent searches
- **All Users**: Messages, profile, verification status

**User Interactions**:
- Click quick action buttons
- Navigate to different sections
- View activity feed

**Data Requirements**:
- User profile data
- Role-based statistics
- Recent activity data
- Quick action configurations

---

## 📦 Product Management Pages

### **Add Product (`/products/new`)**
**Purpose**: Create new product listing
**Expected Functions**:
- ✅ Product form with all required fields
- ✅ Image upload (multiple images, base64)
- ✅ Category selection dropdown
- ✅ Price and quantity inputs
- ✅ Delivery options selection
- ✅ Form validation with error messages
- ✅ Save draft functionality
- ✅ Publish product with loading state
- ✅ Success message and redirect

**Form Fields**:
- Product name, description, category
- Price per unit, minimum order quantity
- Available quantity, unit type
- Delivery options, payment terms
- Product images (up to 5)

**User Interactions**:
- Fill out product form
- Upload and manage images
- Select delivery options
- Save draft or publish product

**Data Requirements**:
- Product categories list
- Form validation rules
- Image upload API
- Product creation API

---

### **Edit Product (`/product/[id]/edit`)**
**Purpose**: Edit existing product listing
**Expected Functions**:
- ✅ Pre-populate form with existing data
- ✅ All add product functionality
- ✅ Image management (add, remove, reorder)
- ✅ Update product with loading state
- ✅ Delete product with confirmation
- ✅ Success/error messaging
- ✅ Redirect to product details after save

**User Interactions**:
- Edit product information
- Manage product images
- Update or delete product
- Navigate back to product details

**Data Requirements**:
- Existing product data
- Product update API
- Product deletion API
- Image management API

---

### **Product Details (`/product/[id]`)**
**Purpose**: Display detailed product information
**Expected Functions**:
- ✅ Product image gallery with navigation
- ✅ Product information display
- ✅ Seller information with verification badges
- ✅ Price and quantity display
- ✅ Contact seller button
- ✅ Save product functionality
- ✅ Price comparison tool
- ✅ Back navigation
- ✅ Edit product button (for owner)

**User Interactions**:
- View product images
- Click contact seller
- Save/unsave product
- Navigate to seller storefront
- Use price comparison tool

**Data Requirements**:
- Product details with images
- Seller information
- User authentication status
- Price comparison data

---

## 👤 User Profile Pages

### **Profile (`/profile`)**
**Purpose**: User profile management
**Expected Functions**:
- ✅ Display and edit profile information
- ✅ Image upload for profile and storefront
- ✅ Business information management
- ✅ Verification status display
- ✅ Rating and review display
- ✅ Farm/store name editing (farmers/traders)
- ✅ Form validation and error handling
- ✅ Save changes with loading state

**Profile Sections**:
- Personal information
- Contact details
- Business information (if applicable)
- Verification status
- Rating and reviews
- Account statistics

**User Interactions**:
- Edit profile information
- Upload profile/storefront images
- Update business details
- View verification status

**Data Requirements**:
- User profile data
- Image upload API
- Profile update API
- Verification status data

---

### **Public Profile (`/user/[id]`)**
**Purpose**: Public user profile view
**Expected Functions**:
- ✅ Public profile information display
- ✅ User statistics and ratings
- ✅ Product listings from the user
- ✅ Contact information (if public)
- ✅ Verification status display
- ✅ Back navigation

**User Interactions**:
- View public profile
- Browse user's products
- Contact the user
- Navigate back

**Data Requirements**:
- Public user data
- User's product listings
- User statistics and ratings

---

### **Seller Storefront (`/seller/[id]`)**
**Purpose**: Seller's storefront page
**Expected Functions**:
- ✅ Storefront information display
- ✅ Business/farm name with edit option (for owner)
- ✅ Storefront image with fallback
- ✅ Owner information display
- ✅ Product listings grid
- ✅ Seller statistics and ratings
- ✅ Verification badges
- ✅ Contact seller functionality
- ✅ Preview mode toggle (for owner)

**Owner-Specific Features**:
- Edit business/farm name
- Upload storefront image
- Toggle preview mode
- Manage product listings

**User Interactions**:
- View storefront information
- Browse seller's products
- Contact seller
- Edit storefront (if owner)

**Data Requirements**:
- Seller profile data
- Seller's product listings
- Seller statistics and ratings
- User authentication status

---

## 💬 Communication Pages

### **Messages (`/messages`)**
**Purpose**: Conversation list and management
**Expected Functions**:
- ✅ Conversation list with unread indicators
- ✅ Search conversations functionality
- ✅ Conversation management (delete, archive)
- ✅ User verification status in conversation list
- ✅ Real-time updates for new messages
- ✅ Conversation sorting and filtering
- ✅ Click to open chat interface

**User Interactions**:
- View conversation list
- Search conversations
- Click to open chat
- Manage conversations
- Delete conversations

**Data Requirements**:
- Conversation list data
- User verification status
- Real-time message updates
- Search functionality

---

### **Chat Interface (`/chat`)**
**Purpose**: Real-time chat with sellers/buyers
**Expected Functions**:
- ✅ Real-time message display
- ✅ Message input with send functionality
- ✅ File and image sharing capabilities
- ✅ Offer creation directly from chat
- ✅ User verification status display
- ✅ Message status indicators
- ✅ Scroll to bottom functionality
- ✅ Close chat and return to messages

**User Interactions**:
- Send text messages
- Share files and images
- Create offers
- View message status
- Close chat

**Data Requirements**:
- Real-time message data
- File upload API
- Offer creation API
- User verification status

---

### **Offer Details (`/offers/[id]`)**
**Purpose**: Detailed offer management and timeline
**Expected Functions**:
- ✅ Offer details display
- ✅ Timeline with status updates
- ✅ Action buttons based on user role and status
- ✅ Status update functionality
- ✅ Real-time status updates
- ✅ Back navigation
- ✅ Seller/buyer information cards

**Status Management**:
- Pending → Accept/Reject (seller)
- Accepted → Ready to Ship/Pickup
- Shipped → Mark as Received
- Completed → Leave Review

**User Interactions**:
- View offer details and timeline
- Update offer status
- Navigate back to messages
- Contact other party

**Data Requirements**:
- Offer details with timeline
- User role and permissions
- Status update API
- Real-time updates

---

## 👑 Admin Pages

### **Admin Dashboard (`/admin`)**
**Purpose**: Admin system overview
**Expected Functions**:
- ✅ System statistics display
- ✅ User statistics and metrics
- ✅ Recent user activity
- ✅ Quick action buttons
- ✅ Real-time data updates
- ✅ Navigation to admin features

**Admin Features**:
- User management
- Verification requests
- System statistics
- Content moderation

**User Interactions**:
- View system statistics
- Access admin features
- Manage users and content

**Data Requirements**:
- System statistics
- User activity data
- Admin permissions

---

### **Admin Verification (`/admin/verification`)**
**Purpose**: User verification management
**Expected Functions**:
- ✅ Verification requests list
- ✅ Document review interface
- ✅ Approve/reject actions with notes
- ✅ Bulk operations for multiple requests
- ✅ Search and filter verification requests
- ✅ User information display

**User Interactions**:
- Review verification requests
- Approve or reject requests
- Add review notes
- Search and filter requests

**Data Requirements**:
- Verification requests data
- User documents and information
- Admin action API

---

## 🔌 API Endpoints

### **Authentication APIs**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### **User APIs**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/[id]/public` - Get public user data
- `GET /api/user/addresses` - Get user addresses
- `POST /api/user/addresses` - Add user address

### **Product APIs**
- `GET /api/products` - Get products list
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### **Offer APIs**
- `GET /api/offers` - Get user offers
- `POST /api/offers` - Create offer
- `GET /api/offers/[id]` - Get offer details
- `PUT /api/offers/[id]` - Update offer status

### **Communication APIs**
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/messages/[id]` - Get conversation messages
- `POST /api/chat/messages` - Send message

### **Admin APIs**
- `GET /api/admin/verification-requests` - Get verification requests
- `POST /api/admin/verification-requests/approve` - Approve verification
- `POST /api/admin/verification-requests/reject` - Reject verification

---

## 🎯 Development Guidelines

### **Code Standards**
- Use TypeScript for all components
- Follow React best practices
- Implement proper error handling
- Use consistent naming conventions
- Add proper loading states

### **Testing Requirements**
- Test all user interactions
- Verify form validations
- Test responsive design
- Verify API integrations
- Test error scenarios

### **Performance Considerations**
- Implement lazy loading for images
- Use proper caching strategies
- Optimize API calls
- Implement proper loading states
- Use React.memo for expensive components

### **Security Requirements**
- Validate all user inputs
- Implement proper authentication
- Use HTTPS for all communications
- Sanitize user-generated content
- Implement rate limiting

---

*This developer guide should be updated whenever new features are added or existing functionality is modified.*
