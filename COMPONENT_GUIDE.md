# AgriLink Component Guide

*Last Updated: January 2025*

This document provides a comprehensive overview of all components in the AgriLink application, organized by functionality and purpose. This guide reflects the current state of the codebase after cleanup and optimization.

## 📋 Table of Contents
1. [Core Layout Components](#core-layout-components)
2. [Authentication Components](#authentication-components)
3. [Product Management Components](#product-management-components)
4. [User Profile Components](#user-profile-components)
5. [Marketplace Components](#marketplace-components)
6. [Chat & Messaging Components](#chat--messaging-components)
7. [Offer Management Components](#offer-management-components)
8. [Admin Components](#admin-components)
9. [UI Components](#ui-components)
10. [Utility Components](#utility-components)
11. [UI Library Components (shadcn/ui)](#ui-library-components-shadcnui)

---

## 🏗️ Core Layout Components

### AppHeader.tsx
**Purpose**: Main navigation header for the application
**Key Features**:
- User authentication status display
- Navigation menu with user type-specific options
- User profile dropdown with logout functionality
- Responsive design for mobile and desktop
**Props**: `currentUser`, `onLogout`
**Usage**: Used on all authenticated pages
**Dependencies**: UserBadgeSystem, UserMenuWithSupport

### AppFooter.tsx
**Purpose**: Footer component with links and company information
**Key Features**:
- Company information and links
- Social media links
- Quick navigation links
- Copyright information
**Props**: None
**Usage**: Used on public pages

---

## 🔐 Authentication Components

### Login.tsx
**Purpose**: User login form with authentication
**Key Features**:
- Email/password authentication
- Form validation with error handling
- Password visibility toggle
- Remember me functionality
- Redirect after successful login
**Props**: `onLogin`, `onSwitchToRegister`, `onForgotPassword`, `onClose`
**Usage**: `/login` page and login modals
**Dependencies**: Form validation, API authentication

### Register.tsx
**Purpose**: Multi-step user registration form
**Key Features**:
- Multi-step registration process
- User type selection (farmer/trader/buyer)
- Account type selection (individual/business)
- Location selection (region/city)
- Form validation and error handling
- Account type guide integration
**Props**: `onRegister`, `onSwitchToLogin`, `onClose`
**Usage**: `/register` page
**Dependencies**: AccountTypeGuide, CountryCodeSelector, myanmarRegions

### ForgotPassword.tsx
**Purpose**: Password reset request form
**Key Features**:
- Email input validation
- Password reset request submission
- Success/error messaging
- Return to login option
**Props**: `onBack`, `onSwitchToLogin`
**Usage**: `/forgot-password` page
**Dependencies**: Email validation, password reset API

### OTPVerification.tsx
**Purpose**: OTP verification for phone numbers
**Key Features**:
- 6-digit OTP input with auto-focus
- Resend OTP functionality with timer
- Verification status display
- Error handling for invalid codes
**Props**: `phoneNumber`, `onVerify`, `onResend`
**Usage**: Used in registration and profile verification
**Dependencies**: SMS verification API

### PhoneVerification.tsx
**Purpose**: Phone number verification component
**Key Features**:
- Phone number input with country code selector
- SMS verification process
- Verification status display
- Re-verification option
**Props**: `onVerified`, `currentPhone`
**Usage**: Used in profile verification process
**Dependencies**: CountryCodeSelector, SMS service

### PhoneVerificationStatus.tsx
**Purpose**: Display phone verification status
**Key Features**:
- Status indicator (verified/unverified)
- Verification date display
- Re-verification option
- Visual status icons
**Props**: `isVerified`, `verifiedAt`, `onReverify`
**Usage**: Used in user profiles and verification panels

### BasicOTPInput.tsx
**Purpose**: Basic OTP input component for verification codes
**Key Features**:
- 6-digit input with individual digit boxes
- Auto-focus navigation between digits
- Validation and completion handling
- Error state display
**Props**: `onChange`, `value`, `onComplete`
**Usage**: OTP verification forms
**Dependencies**: Form validation

---

## 📦 Product Management Components

### SimplifiedProductForm.tsx
**Purpose**: Comprehensive form for creating and editing products
**Key Features**:
- Product details input (name, category, description)
- Price and quantity management
- Multiple image upload with base64 storage
- Delivery options and payment terms
- Form validation with error handling
- Edit mode support with pre-populated data
- Image management (add, remove, reorder)
**Props**: `editingProduct`, `onSave`, `onCancel`, `currentUser`
**Usage**: `/products/new` and `/product/[id]/edit` pages
**Dependencies**: ImageUpload, form validation, product API

### ProductDetails.tsx
**Purpose**: Display detailed product information with interactive features
**Key Features**:
- Product image gallery with navigation
- Price and quantity display with unit conversion
- Seller information with verification badges
- Contact seller functionality
- Price comparison tool integration
- Save product functionality
- Back navigation
**Props**: `product`, `currentUser`, `onContactSeller`, `onBack`, `onPriceCompare`, `onViewStorefront`, `onEditProduct`
**Usage**: `/product/[id]` page
**Dependencies**: UserBadgeSystem, PriceComparison, SimpleOfferModal

### ProductCard.tsx
**Purpose**: Product card for marketplace listings
**Key Features**:
- Product image display with fallback
- Price and seller information
- Quick actions (contact seller, save product)
- Responsive design for different screen sizes
- Seller verification badges
- Relative time display for listings
**Props**: `product`, `currentUser`, `onContactSeller`, `onSaveProduct`
**Usage**: Marketplace listings and search results
**Dependencies**: ImageWithFallback, UserBadgeSystem, getRelativeTime

### ProductCardSkeleton.tsx
**Purpose**: Loading skeleton for product cards
**Key Features**:
- Animated loading placeholders
- Matches product card layout structure
- Smooth loading animation
**Props**: None
**Usage**: Loading states in marketplace and search results

### ImageUpload.tsx
**Purpose**: Image upload component with preview and validation
**Key Features**:
- Drag and drop functionality
- Multiple image support
- Image preview with thumbnails
- File validation (size, type)
- Base64 conversion for database storage
- Remove image functionality
**Props**: `onImageChange`, `currentImage`, `multiple`, `maxImages`
**Usage**: Used in product forms and profile editing
**Dependencies**: FileReader API, image validation

### SimpleProductCard.tsx
**Purpose**: Simplified product card for compact displays
**Key Features**:
- Minimal design with essential information
- Quick actions and selection
- Compact layout for dense listings
- Responsive design
**Props**: `product`, `onSelect`
**Usage**: Compact product listings and search results

---

## 👤 User Profile Components

### Profile.tsx
**Purpose**: Comprehensive user profile display and editing
**Key Features**:
- Profile information display and editing
- Image upload for profile and storefront images
- Business information management
- Verification status display with progress
- Dynamic rating display with stars
- Farm/store name editing for farmers/traders
- Form validation and error handling
**Props**: `user`, `onUpdate`, `isOwnProfile`, `onViewStorefront`
**Usage**: `/profile` page
**Dependencies**: ImageUpload, UserBadgeSystem, form validation

### UserProfile.tsx
**Purpose**: Public user profile view for other users
**Key Features**:
- Public profile information display
- User statistics and ratings
- Product listings from the user
- Contact information (if public)
- Verification status display
**Props**: `user`, `products`, `stats`
**Usage**: Public user profiles and seller pages

### EditProfile.tsx
**Purpose**: Dedicated profile editing form
**Key Features**:
- Comprehensive profile editing form
- Image upload for profile and storefront
- Business details editing
- Location and contact information
- Save/cancel functionality with validation
**Props**: `user`, `onSave`, `onCancel`
**Usage**: Profile editing modals and pages
**Dependencies**: ImageUpload, myanmarRegions, form validation

### UserBadgeSystem.tsx
**Purpose**: Comprehensive user type and verification badge system
**Key Features**:
- Account type badges (Farmer/Trader/Buyer) with colors
- Verification status badges (Verified/Unverified/In Progress)
- Public vs private verification display
- Consistent styling across the application
- Badge size variants (small, medium, large)
**Props**: `userType`, `accountType`, `verificationLevel`, `size`, `showPublic`
**Usage**: Throughout the application for user identification
**Exports**: `UserBadge`, `AccountTypeBadge`, `PublicVerificationStatus`, utility functions

---

## 🛒 Marketplace Components

### MarketplacePage.tsx
**Purpose**: Main marketplace page with product listings and filtering
**Key Features**:
- Product grid display with responsive layout
- Advanced search and filtering system
- Category and seller type filtering
- Location-based filtering
- Pagination for large product sets
- Real-time search with debouncing
**Props**: `products`, `filters`, `onFilterChange`, `onSearch`
**Usage**: `/` (homepage) and marketplace pages
**Dependencies**: SearchFilters, ProductCard, Pagination

### MarketplaceHero.tsx
**Purpose**: Hero section for marketplace with search and categories
**Key Features**:
- Prominent search functionality
- Category quick access buttons
- Featured content display
- Call-to-action elements
**Props**: `onSearch`, `categories`
**Usage**: Marketplace homepage hero section

### InteractiveMarketplace.tsx
**Purpose**: Interactive marketplace with advanced features
**Key Features**:
- Real-time search with instant results
- Advanced filtering options
- Map integration for location-based search
- Price comparison tools
- Interactive product selection
**Props**: `products`, `userLocation`, `onProductSelect`
**Usage**: Advanced marketplace views and search pages

### SearchFilters.tsx
**Purpose**: Comprehensive search and filter controls
**Key Features**:
- Text search with debouncing
- Category filtering with multi-select
- Price range filtering with sliders
- Location filtering (region/city)
- Seller type filtering
- Verification status filtering
- Clear all filters functionality
**Props**: `onFilterChange`, `currentFilters`
**Usage**: Marketplace and product listing pages
**Dependencies**: myanmarRegions, form components

### SimpleSearch.tsx
**Purpose**: Simple search input component with icon
**Key Features**:
- Search input with search icon
- Debounced search functionality
- Clear search functionality
- Placeholder text customization
**Props**: `onSearch`, `placeholder`, `value`
**Usage**: Various pages requiring simple search functionality

### PriceComparison.tsx
**Purpose**: Price comparison tool for products across sellers
**Key Features**:
- Compare prices across multiple sellers
- Unit conversion for accurate comparison
- Best deal highlighting
- Seller information and verification status
- Direct contact options
**Props**: `productId`, `currentPrice`
**Usage**: Product detail pages and comparison views
**Dependencies**: Product API, UserBadgeSystem

---

## 💬 Chat & Messaging Components

### ChatInterface.tsx
**Purpose**: Main chat interface for conversations
**Key Features**:
- Real-time message display with timestamps
- Message input with send functionality
- File and image sharing capabilities
- Offer creation directly from chat
- User verification status display
- Message status indicators (sent, delivered, read)
- Scroll to bottom functionality
**Props**: `conversationId`, `otherPartyId`, `otherPartyName`, `onClose`
**Usage**: Chat popups and dedicated chat pages
**Dependencies**: useChat hook, SimpleOfferModal, OfferCardCompact, UserBadgeSystem

### Messages.tsx
**Purpose**: Messages page with conversation list and management
**Key Features**:
- Conversation list with unread indicators
- Search conversations functionality
- Conversation management (delete, archive)
- User verification status in conversation list
- Real-time updates for new messages
- Conversation sorting and filtering
**Props**: `conversations`, `currentUser`
**Usage**: `/messages` page
**Dependencies**: ChatInterface, useChat hook, UserBadgeSystem

### SimpleChatModal.tsx
**Purpose**: Simple chat modal for quick conversations
**Key Features**:
- Popup chat window with overlay
- Basic messaging functionality
- Close and minimize functionality
- Quick contact with sellers
**Props**: `isOpen`, `onClose`, `conversationId`
**Usage**: Quick chat from product pages and seller profiles

---

## 🤝 Offer Management Components

### SimpleOfferModal.tsx
**Purpose**: Modal for creating and managing product offers
**Key Features**:
- Comprehensive offer form (price, quantity, message)
- Delivery options selection
- Payment terms specification
- Address management integration
- Form validation with error handling
- Scrollable content for long forms
- Address input visibility based on delivery method
**Props**: `isOpen`, `onClose`, `productId`, `currentUser`
**Usage**: Product detail pages and chat interfaces
**Dependencies**: Address management, form validation, offers API

### OfferCardCompact.tsx
**Purpose**: Compact offer display card for lists and messages
**Key Features**:
- Offer summary with key details
- Status indicator with colors
- Quick action buttons
- Responsive design for different contexts
- Timestamp display
**Props**: `offer`, `onSelect`, `onAction`
**Usage**: Chat messages, offer lists, and conversation history

### OfferStatusManager.tsx
**Purpose**: Offer status management and timeline display
**Key Features**:
- Status update functionality
- Visual timeline with timestamps
- Action buttons based on user role and status
- Status history tracking
- Real-time status updates
**Props**: `offer`, `onStatusUpdate`, `currentUserId`
**Usage**: Offer detail pages and offer management interfaces
**Dependencies**: Timeline display, status management logic

### ReviewModal.tsx
**Purpose**: Modal for submitting reviews after completed offers
**Key Features**:
- Star rating input system
- Comment textarea with validation
- Form submission with loading states
- Error handling and success feedback
**Props**: `isOpen`, `onClose`, `offerId`, `otherParty`
**Usage**: Completed offer reviews and rating system

### ReviewSection.tsx
**Purpose**: Display and manage reviews for users and products
**Key Features**:
- Review display with ratings and comments
- Rating summary with averages
- Review submission integration
- Review management (edit, delete)
- Pagination for large review sets
**Props**: `offerId`, `currentUserId`, `otherParty`
**Usage**: Offer detail pages, user profiles, and product pages

---

## 👨‍💼 Admin Components

### AdminDashboard.tsx
**Purpose**: Main admin dashboard with system overview
**Key Features**:
- User statistics and metrics
- System overview with key indicators
- Recent user activity display
- Quick action buttons for admin tasks
- Real-time data updates
**Props**: `stats`, `recentActivity`
**Usage**: `/admin` page
**Dependencies**: Admin APIs, statistics display

### AdminVerificationPanel.tsx
**Purpose**: Admin panel for managing user verification requests
**Key Features**:
- Verification requests list with details
- Document review interface
- Approve/reject actions with notes
- Bulk operations for multiple requests
- Search and filter verification requests
**Props**: `verificationRequests`, `onApprove`, `onReject`
**Usage**: Admin verification management interface
**Dependencies**: Document viewer, admin APIs

---

## 🎨 UI Components

### LoadingSpinner.tsx
**Purpose**: Loading spinner component for async operations
**Key Features**:
- Animated spinner with customizable size
- Centered display with backdrop option
- Smooth animation with CSS transitions
**Props**: `size`, `className`, `centered`
**Usage**: Loading states throughout the application

### Pagination.tsx
**Purpose**: Pagination controls for large datasets
**Key Features**:
- Page navigation with previous/next buttons
- Page number display with ellipsis
- Page size selection dropdown
- Total count and current page display
- Responsive design for mobile
**Props**: `currentPage`, `totalPages`, `onPageChange`, `pageSize`, `totalItems`
**Usage**: Product listings, search results, and admin interfaces

### ErrorBoundary.tsx
**Purpose**: Error boundary for React error handling
**Key Features**:
- Error catching and display
- Fallback UI with error message
- Error reporting integration
- Recovery options for users
**Props**: `children`, `fallback`, `onError`
**Usage**: Wrapping major components and page sections

---

## 🔧 Utility Components

### AccountTypeVerification.tsx
**Purpose**: Multi-step account type verification process
**Key Features**:
- Step-by-step verification workflow
- Document upload with validation
- Business information collection
- Verification status tracking
- Progress indicator
- Submission with loading states
**Props**: `currentUser`, `onVerificationComplete`
**Usage**: Profile verification process and account setup
**Dependencies**: Document upload, form validation, verification API

### AddressManagement.tsx
**Purpose**: User address management system
**Key Features**:
- Address list display with cards
- Add/edit/delete address functionality
- Default address setting
- Address validation with error handling
- Location autocomplete integration
**Props**: `addresses`, `onAdd`, `onEdit`, `onDelete`, `onSetDefault`
**Usage**: Profile management and checkout processes
**Dependencies**: Address validation, location APIs

### CountryCodeSelector.tsx
**Purpose**: Country code selector for phone numbers
**Key Features**:
- Comprehensive country list with flags
- Search functionality for countries
- Flag display with country names
- Code selection with callback
- Responsive design
**Props**: `onSelect`, `currentCode`, `placeholder`
**Usage**: Phone number inputs in registration and profile forms

### EmailEditModal.tsx
**Purpose**: Modal for editing email addresses
**Key Features**:
- Email input with validation
- Confirmation process with current email
- Error handling for duplicate emails
- Success feedback
**Props**: `isOpen`, `onClose`, `currentEmail`, `onUpdate`
**Usage**: Profile editing and account management

### EmailVerificationPrompt.tsx
**Purpose**: Email verification status and prompt
**Key Features**:
- Verification status display
- Resend verification email functionality
- Success messaging after verification
- Integration with email verification flow
**Props**: `isVerified`, `onResend`, `email`
**Usage**: Profile pages and account setup

### ContactUsPage.tsx
**Purpose**: Contact us page with form and information
**Key Features**:
- Contact form with validation
- Company information display
- Support options and contact methods
- Form submission with feedback
**Props**: `onSubmit`
**Usage**: `/contact` page
**Dependencies**: Form validation, contact API

### FAQ.tsx
**Purpose**: Frequently Asked Questions component
**Key Features**:
- Expandable FAQ items with smooth animations
- Search functionality across FAQ content
- Category organization and filtering
- Responsive design for mobile
**Props**: `faqs`, `onSearch`
**Usage**: `/faq` page and help sections
**Dependencies**: Search functionality, accordion UI

### AboutUs.tsx
**Purpose**: About us page component
**Key Features**:
- Company information and history
- Team member details
- Mission and vision statements
- Company values and achievements
**Props**: `onBack`
**Usage**: `/about` page
**Dependencies**: Content management

### UserMenuWithSupport.tsx
**Purpose**: User menu with profile access and support options
**Key Features**:
- User profile display with avatar
- Quick access to profile settings
- Support links and help documentation
- Logout functionality
- Responsive design for mobile
**Props**: `currentUser`, `onLogout`
**Usage**: App header user menu
**Dependencies**: UserBadgeSystem, ImageWithFallback

### FreshDashboard.tsx
**Purpose**: Modern dashboard design for users
**Key Features**:
- Clean, modern UI design
- Quick action buttons
- Statistics display with charts
- Recent activity feed
- Responsive grid layout
**Props**: `user`, `stats`, `recentActivity`
**Usage**: Dashboard pages and user home
**Dependencies**: Statistics APIs, activity feeds

### BuyerDashboard.tsx
**Purpose**: Dashboard specifically designed for buyers
**Key Features**:
- Saved products management
- Recent searches and history
- Order history and tracking
- Product recommendations
- Price alerts and notifications
**Props**: `user`, `savedProducts`, `recentSearches`
**Usage**: Buyer-specific dashboard
**Dependencies**: Saved products API, search history

---

## 🎨 UI Library Components (shadcn/ui)

The application uses shadcn/ui components located in `src/components/ui/`. These are reusable, accessible UI components built on Radix UI primitives.

### Form Components
- **`button.tsx`** - Button component with variants (primary, secondary, ghost, etc.)
- **`input.tsx`** - Text input with validation states
- **`textarea.tsx`** - Multi-line text input
- **`select.tsx`** - Dropdown select with search
- **`checkbox.tsx`** - Checkbox input with indeterminate state
- **`radio-group.tsx`** - Radio button group
- **`form.tsx`** - Form wrapper with validation integration

### Layout Components
- **`card.tsx`** - Card container with header, content, footer
- **`dialog.tsx`** - Modal dialog with overlay
- **`sheet.tsx`** - Side panel/sheet component
- **`drawer.tsx`** - Mobile drawer component
- **`tabs.tsx`** - Tab navigation component
- **`accordion.tsx`** - Collapsible content sections
- **`collapsible.tsx`** - Simple collapsible content

### Navigation Components
- **`navigation-menu.tsx`** - Main navigation menu
- **`breadcrumb.tsx`** - Breadcrumb navigation
- **`pagination.tsx`** - Page navigation controls
- **`menubar.tsx`** - Menu bar component

### Feedback Components
- **`alert.tsx`** - Alert messages with variants
- **`badge.tsx`** - Status badges and labels
- **`progress.tsx`** - Progress bars and indicators
- **`skeleton.tsx`** - Loading skeleton placeholders
- **`sonner.tsx`** - Toast notification system

### Data Display
- **`table.tsx`** - Data table with sorting and filtering
- **`avatar.tsx`** - User avatar with fallback
- **`separator.tsx`** - Visual separators and dividers
- **`aspect-ratio.tsx`** - Aspect ratio container
- **`carousel.tsx`** - Image/content carousel

### Overlay Components
- **`popover.tsx`** - Popover content overlay
- **`tooltip.tsx`** - Tooltip with positioning
- **`hover-card.tsx`** - Hover-triggered card
- **`context-menu.tsx`** - Right-click context menu
- **`dropdown-menu.tsx`** - Dropdown menu component
- **`alert-dialog.tsx`** - Alert confirmation dialog

### Input Components
- **`input-otp.tsx`** - OTP input with individual digits
- **`slider.tsx`** - Range slider input
- **`switch.tsx`** - Toggle switch component
- **`toggle.tsx`** - Toggle button component
- **`toggle-group.tsx`** - Toggle button group
- **`calendar.tsx`** - Date picker calendar
- **`command.tsx`** - Command palette/search

### Utility Components
- **`scroll-area.tsx`** - Custom scrollable area
- **`resizable.tsx`** - Resizable panels
- **`sidebar.tsx`** - Sidebar navigation
- **`chart.tsx`** - Chart components integration
- **`utils.ts`** - Utility functions (cn, etc.)
- **`use-mobile.ts`** - Mobile detection hook

---

## 🎯 Component Usage Guidelines

### Best Practices:
1. **TypeScript Interfaces**: Always define comprehensive interfaces for component props
2. **Error Handling**: Include proper error boundaries and fallback states
3. **Loading States**: Provide loading indicators for all async operations
4. **Responsive Design**: Ensure components work seamlessly on all screen sizes
5. **Accessibility**: Include proper ARIA labels, keyboard navigation, and screen reader support
6. **Performance**: Use React.memo for expensive components and optimize re-renders
7. **Consistency**: Follow the established design system and component patterns
8. **Documentation**: Keep component documentation updated with changes

### Common Patterns:
- **Form Components**: Use controlled inputs with comprehensive validation
- **Modal Components**: Include proper focus management and escape key handling
- **List Components**: Implement virtualization for large datasets when needed
- **Image Components**: Always include fallbacks and lazy loading
- **API Components**: Handle loading, error, and success states consistently
- **State Management**: Use appropriate state management patterns (local state, context, etc.)

### File Organization:
- **Component Files**: Use PascalCase naming (e.g., `UserProfile.tsx`)
- **Props Interfaces**: Define interfaces with descriptive names (e.g., `UserProfileProps`)
- **Dependencies**: Import dependencies in logical order (React, third-party, local)
- **Exports**: Use named exports for components and utilities

### Testing Considerations:
- **Component Testing**: Test component behavior, props, and user interactions
- **Accessibility Testing**: Verify keyboard navigation and screen reader compatibility
- **Responsive Testing**: Test components across different screen sizes
- **Integration Testing**: Test component integration with APIs and other components

---

*This component guide is maintained alongside the codebase and should be updated when components are added, modified, or removed. Last updated: January 2025*