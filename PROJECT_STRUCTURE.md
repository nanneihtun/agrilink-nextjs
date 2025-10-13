# AgriLink Project Structure

## 🏗️ **Project Overview**
**AgriLink** is a Next.js-based agricultural marketplace connecting farmers, traders, and buyers in Myanmar.

**Live URL**: https://hthheh.com  
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, PostgreSQL (Neon), Resend (Email)

---

## 📁 **Root Directory Structure**

```
agrilink-nextjs/
├── 📁 src/                    # Main source code
├── 📁 docs/                   # Project documentation
├── 📁 templates/              # Documentation templates
├── 📁 public/                 # Static assets (currently empty after cleanup)
├── 📄 Configuration files     # package.json, next.config.ts, etc.
└── 📄 Documentation files     # README.md, deployment guides, etc.
```

---

## 🎯 **Core Application Structure (`src/`)**

### **📁 `src/app/` - Next.js App Router Pages**

#### **🏠 Main Pages**
```
app/
├── 📄 page.tsx                    # Homepage (marketplace)
├── 📄 layout.tsx                  # Root layout with metadata
├── 📄 globals.css                 # Global styles
├── 📄 favicon.ico                 # App icon
```

#### **👤 User Authentication Pages**
```
├── 📁 login/                      # User login
│   └── 📄 page.tsx
├── 📁 register/                   # User registration
│   └── 📄 page.tsx
├── 📁 forgot-password/            # Password reset request
│   └── 📄 page.tsx
├── 📁 reset-password/             # Password reset form
│   └── 📄 page.tsx
├── 📁 verify-email/               # Email verification
│   └── 📄 page.tsx
└── 📁 verify-email-change/        # Email change verification
    └── 📄 page.tsx
```

#### **🛒 Product & Marketplace Pages**
```
├── 📁 marketplace/                # Marketplace directory (if any)
├── 📁 products/                   # Product listing & management
│   ├── 📄 page.tsx                # Products listing
│   ├── 📄 new/page.tsx            # Add new product
│   └── 📁 [id]/
│       └── 📁 price-comparison/
│           └── 📄 page.tsx        # Price comparison tool
├── 📁 product/[id]/               # Individual product pages
│   ├── 📄 page.tsx                # Product details
│   └── 📁 edit/
│       └── 📄 page.tsx            # Edit product
```

#### **👥 User & Seller Pages**
```
├── 📁 dashboard/                  # User dashboard
│   └── 📄 page.tsx
├── 📁 profile/                    # User profile
│   └── 📄 page.tsx
├── 📁 user/[id]/                  # Public user profiles
│   └── 📄 page.tsx
├── 📁 seller/[id]/                # Seller storefronts
│   ├── 📄 page.tsx                # Main storefront
│   └── 📄 page-simple.tsx         # Simplified storefront
```

#### **💬 Communication & Offers**
```
├── 📁 messages/                   # Chat/messaging
│   └── 📄 page.tsx
├── 📁 offers/                     # Trade offers
│   ├── 📄 page.tsx                # Offers listing
│   └── 📁 [id]/
│       └── 📄 page.tsx            # Individual offer details
├── 📁 chat/                       # Chat interface
│   └── 📄 page.tsx
```

#### **🔐 Verification & Admin**
```
├── 📁 verify/                     # Account verification
│   └── 📄 page.tsx
├── 📁 admin/                      # Admin panel
│   ├── 📄 page.tsx                # Admin dashboard
│   └── 📁 verification/
│       └── 📄 page.tsx            # Admin verification panel
```

#### **📄 Information Pages**
```
├── 📁 about/                      # About us
│   └── 📄 page.tsx
├── 📁 contact/                    # Contact page
│   └── 📄 page.tsx
└── 📁 faq/                        # Frequently asked questions
    └── 📄 page.tsx
```

### **📁 `src/app/api/` - API Routes (Backend)**

#### **🔐 Authentication APIs**
```
api/auth/
├── 📄 login/route.ts              # User login
├── 📄 register/route.ts           # User registration
├── 📄 me/route.ts                 # Get current user
├── 📄 profile/route.ts            # User profile management
├── 📄 verify-email/route.ts       # Email verification
├── 📄 send-verification-email/route.ts
├── 📄 verify-email-change/route.ts
├── 📄 update-email/route.ts
├── 📄 request-password-reset/route.ts
└── 📄 reset-password/route.ts
```

#### **🛒 Product APIs**
```
api/products/
├── 📄 route.ts                    # List/create products
└── 📁 [id]/
    ├── 📄 route.ts                # Get/update/delete product
    └── 📁 price-comparison/
        └── 📄 route.ts            # Price comparison data
```

#### **👥 User & Seller APIs**
```
api/user/
├── 📄 saved-products/route.ts     # Saved products management
├── 📄 profile/route.ts            # User profile API
└── 📁 [id]/
    └── 📁 public/
        └── 📄 route.ts            # Public user/seller data
```

#### **🔐 Verification APIs**
```
api/verification/
├── 📄 send-sms/route.ts           # SMS verification
├── 📄 verify-sms/route.ts         # SMS code verification
└── 📄 request/route.ts            # Verification requests
```

#### **👨‍💼 Admin APIs**
```
api/admin/
├── 📁 stats/
│   └── 📁 users/
│       └── 📄 route.ts            # User statistics
├── 📁 verification-requests/
│   └── 📁 approve/
│       └── 📄 route.ts            # Approve verification
└── 📁 users/[id]/
    └── 📁 verify/
        └── 📄 route.ts            # Admin user verification
```

### **📁 `src/components/` - React Components**

#### **🏗️ Core Layout Components**
```
components/
├── 📄 AppHeader.tsx               # Main navigation header
├── 📄 AppFooter.tsx               # Footer component
├── 📄 ErrorBoundary.tsx           # Error handling
└── 📄 LoadingSpinner.tsx          # Loading states
```

#### **🔐 Authentication Components**
```
├── 📄 Login.tsx                   # Login form
├── 📄 Register.tsx                # Registration form
├── 📄 ForgotPassword.tsx          # Password reset form
├── 📄 OTPVerification.tsx         # OTP input
├── 📄 PhoneVerification.tsx       # Phone verification
├── 📄 EmailVerificationPrompt.tsx
└── 📄 DemoAccountsLogin.tsx       # Demo accounts for testing
```

#### **🛒 Product Components**
```
├── 📄 ProductCard.tsx             # Product display card
├── 📄 ProductCardSkeleton.tsx     # Loading skeleton
├── 📄 ProductDetails.tsx          # Product details view
├── 📄 SimplifiedProductForm.tsx   # Add/edit product form
├── 📄 ImageUpload.tsx             # Image upload component
├── 📄 OptimizedImage.tsx          # Image optimization
├── 📄 SimpleProductCard.tsx       # Simplified product card
├── 📄 PriceComparison.tsx         # Price comparison tool
├── 📄 SearchFilters.tsx           # Product search filters
└── 📄 SimpleSearch.tsx            # Simple search interface
```

#### **👥 User & Seller Components**
```
├── 📄 UserProfile.tsx             # User profile display
├── 📄 Profile.tsx                 # Profile management
├── 📄 EditProfile.tsx             # Profile editing
├── 📄 SellerStorefront.tsx        # Seller storefront
├── 📄 UserMenuWithSupport.tsx     # User menu dropdown
├── 📄 UserBadgeSystem.tsx         # User verification badges
└── 📄 AccountTypeVerification.tsx # Account verification flow
```

#### **💬 Communication Components**
```
├── 📄 ChatInterface.tsx           # Chat functionality
├── 📄 Messages.tsx                # Messages management
├── 📄 OfferCard.tsx               # Trade offer display
├── 📄 OfferModal.tsx              # Offer creation modal
├── 📄 OfferDetailsModal.tsx       # Offer details
├── 📄 SimpleChatModal.tsx         # Simple chat interface
└── 📄 OfferMessage.tsx            # Offer messaging
```

#### **📊 Dashboard Components**
```
├── 📄 FreshDashboard.tsx          # Main user dashboard
├── 📄 BuyerDashboard.tsx          # Buyer-specific dashboard
├── 📄 AdminDashboard.tsx          # Admin dashboard
├── 📄 MarketplaceHero.tsx         # Marketplace homepage hero
├── 📄 MarketplacePage.tsx         # Marketplace page
└── 📄 InteractiveMarketplace.tsx  # Interactive marketplace features
```

#### **🎨 UI Components (`components/ui/`)**
```
ui/
├── 📄 button.tsx                  # Button component
├── 📄 card.tsx                    # Card component
├── 📄 input.tsx                   # Input component
├── 📄 modal.tsx                   # Modal component
├── 📄 badge.tsx                   # Badge component
├── 📄 alert.tsx                   # Alert component
├── 📄 pagination.tsx              # Pagination component
└── 📄 ... (48 total UI components)
```

### **📁 `src/lib/` - Utilities & Services**

```
lib/
├── 📄 utils.ts                    # General utilities
├── 📄 aws-ses.ts                  # AWS SES email service
├── 📄 smsService.ts               # SMS service
├── 📄 twilio.ts                   # Twilio integration
└── 📁 db/
    ├── 📄 index.ts                # Database connection
    ├── 📄 queries.ts              # Database queries
    ├── 📄 mutations.ts            # Database mutations
    └── 📄 ... (6 total DB files)
```

### **📁 `src/services/` - Business Logic**

```
services/
├── 📄 api.ts                      # API service layer
├── 📄 analytics.ts                # Analytics service
├── 📄 offers.ts                   # Offers business logic
├── 📄 reviews.ts                  # Reviews service
└── 📄 sellerService.ts            # Seller services
```

### **📁 `src/hooks/` - Custom React Hooks**

```
hooks/
├── 📄 useAuth.ts                  # Authentication hook
└── 📄 useChat.ts                  # Chat functionality hook
```

### **📁 `src/utils/` - Utility Functions**

```
utils/
├── 📄 countryCodes.ts             # Country code utilities
├── 📄 dates.ts                    # Date formatting utilities
└── 📄 regions.ts                  # Myanmar regions data
```

---

## 🗄️ **Database Schema Overview**

**Database**: PostgreSQL (Neon)  
**Main Tables**:
- `users` - User accounts and profiles
- `products` - Product listings
- `product_images` - Product images
- `product_pricing` - Product pricing data
- `product_inventory` - Inventory management
- `user_verification` - Verification status
- `business_details` - Business information
- `user_ratings` - User ratings and reviews

---

## 🚀 **Key Features**

### **🔐 Authentication & Verification**
- Email verification system
- Phone/SMS verification
- Account type verification (Individual/Business)
- Admin verification panel

### **🛒 Product Management**
- Product CRUD operations
- Image upload and management
- Price comparison tools
- Inventory tracking

### **👥 User Management**
- User profiles and storefronts
- Seller verification system
- Rating and review system
- Messaging between users

### **💬 Communication**
- Real-time messaging
- Trade offer system
- Chat interface
- Notification system

### **📊 Analytics & Admin**
- User statistics
- Admin dashboard
- Verification management
- Performance monitoring

---

## 🛠️ **Development Setup**

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📝 **Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://...

# JWT Secret
JWT_SECRET=your_secret_key

# Email Service
RESEND_API_KEY=your_resend_key

# App URL
NEXT_PUBLIC_APP_URL=https://hthheh.com
```

---

## 🎯 **Project Status**

✅ **Completed Features**:
- User authentication and verification
- Product management system
- Marketplace functionality
- Email verification system
- Admin panel
- Responsive design

🔄 **In Progress**:
- Mandatory email verification
- Performance optimizations

📋 **Future Enhancements**:
- Advanced search filters
- Mobile app
- Payment integration
- Advanced analytics

---

*This structure supports a scalable agricultural marketplace with comprehensive user management, product listings, and communication features.*
