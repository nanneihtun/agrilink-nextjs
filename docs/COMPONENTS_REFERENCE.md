# 🧩 AgriLink Components Reference

*Quick reference guide for all components organized by category with brief descriptions*

---

## 🏗️ **CORE LAYOUT**
- `AppHeader.tsx` - Main navigation header with user menu
- `AppFooter.tsx` - Footer with links and company info

---

## 🔐 **AUTHENTICATION**
- `Login.tsx` - User login form with validation
- `Register.tsx` - Multi-step registration (user type, location, etc.)
- `ForgotPassword.tsx` - Password reset request form
- `OTPVerification.tsx` - 6-digit OTP input for phone verification
- `PhoneVerification.tsx` - Phone number verification with SMS
- `PhoneVerificationStatus.tsx` - Display phone verification status
- `BasicOTPInput.tsx` - Basic OTP input component

---

## 📦 **PRODUCT MANAGEMENT**
- `SimplifiedProductForm.tsx` - Create/edit product form with image upload
- `ProductDetails.tsx` - Product detail page with gallery and seller info
- `ProductCard.tsx` - Product card for marketplace listings
- `ProductCardSkeleton.tsx` - Loading skeleton for product cards
- `ImageUpload.tsx` - Image upload with drag-drop and base64 conversion
- `SimpleProductCard.tsx` - Compact product card for dense listings

---

## 👤 **USER PROFILES**
- `Profile.tsx` - User profile management with image upload
- `UserProfile.tsx` - Public user profile view
- `EditProfile.tsx` - Dedicated profile editing form
- `UserBadgeSystem.tsx` - User type and verification badges
- `SellerStorefront.tsx` - Seller storefront with product listings

---

## 🛒 **MARKETPLACE**
- `MarketplacePage.tsx` - Main marketplace with search and filters
- `MarketplaceHero.tsx` - Hero section with search and categories
- `SearchFilters.tsx` - Search and filter controls
- `SimpleSearch.tsx` - Simple search input with icon
- `PriceComparison.tsx` - Price comparison tool across sellers

---

## 💬 **CHAT & MESSAGING**
- `ChatInterface.tsx` - Real-time chat with file sharing
- `Messages.tsx` - Conversation list and management
- `SimpleChatModal.tsx` - Quick chat popup modal

---

## 🤝 **OFFER & REVIEW MANAGEMENT**
- `SimpleOfferModal.tsx` - Create/manage offers with delivery options
- `OfferCardCompact.tsx` - Compact offer display card
- `OfferStatusManager.tsx` - Offer status management and timeline
- `ReviewSection.tsx` - Display and manage reviews
- `ReviewSliderModal.tsx` - Review popup modal with slider for large review sets

---

## 👑 **ADMIN**
- `AdminDashboard.tsx` - Admin system overview and statistics
- `AdminVerificationPanel.tsx` - User verification management

---

## 🎨 **UI COMPONENTS**
- `LoadingSpinner.tsx` - Loading spinner for async operations
- `Pagination.tsx` - Pagination controls for large datasets
- `ErrorBoundary.tsx` - Error boundary for React error handling

---

## 🔧 **UTILITY COMPONENTS**
- `AccountTypeVerification.tsx` - Multi-step account verification process
- `AddressManagement.tsx` - User address management system
- `CountryCodeSelector.tsx` - Country code selector for phone numbers
- `EmailEditModal.tsx` - Modal for editing email addresses
- `EmailVerificationPrompt.tsx` - Email verification status and prompt
- `ContactUsPage.tsx` - Contact form and company information
- `FAQ.tsx` - Expandable FAQ with search functionality
- `AboutUs.tsx` - Company information and team details
- `UserMenuWithSupport.tsx` - User menu with profile and support
- `FreshDashboard.tsx` - Modern dashboard design
- `BuyerDashboard.tsx` - Dashboard specifically for buyers

---

## 🎨 **UI LIBRARY (shadcn/ui)**
*Located in `src/components/ui/`*

### **Form Components**
- `button.tsx` - Button with variants (primary, secondary, ghost)
- `input.tsx` - Text input with validation states
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown select with search
- `checkbox.tsx` - Checkbox with indeterminate state
- `radio-group.tsx` - Radio button group
- `form.tsx` - Form wrapper with validation

### **Layout Components**
- `card.tsx` - Card container with header/content/footer
- `dialog.tsx` - Modal dialog with overlay
- `sheet.tsx` - Side panel/sheet component
- `drawer.tsx` - Mobile drawer component
- `tabs.tsx` - Tab navigation component
- `accordion.tsx` - Collapsible content sections

### **Navigation Components**
- `navigation-menu.tsx` - Main navigation menu
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Page navigation controls
- `menubar.tsx` - Menu bar component

### **Feedback Components**
- `alert.tsx` - Alert messages with variants
- `badge.tsx` - Status badges and labels
- `progress.tsx` - Progress bars and indicators
- `skeleton.tsx` - Loading skeleton placeholders
- `sonner.tsx` - Toast notification system

### **Data Display**
- `table.tsx` - Data table with sorting/filtering
- `avatar.tsx` - User avatar with fallback
- `separator.tsx` - Visual separators and dividers
- `aspect-ratio.tsx` - Aspect ratio container
- `carousel.tsx` - Image/content carousel

### **Overlay Components**
- `popover.tsx` - Popover content overlay
- `tooltip.tsx` - Tooltip with positioning
- `hover-card.tsx` - Hover-triggered card
- `context-menu.tsx` - Right-click context menu
- `dropdown-menu.tsx` - Dropdown menu component
- `alert-dialog.tsx` - Alert confirmation dialog

### **Input Components**
- `input-otp.tsx` - OTP input with individual digits
- `slider.tsx` - Range slider input
- `switch.tsx` - Toggle switch component
- `toggle.tsx` - Toggle button component
- `calendar.tsx` - Date picker calendar
- `command.tsx` - Command palette/search

### **Utility Components**
- `scroll-area.tsx` - Custom scrollable area
- `resizable.tsx` - Resizable panels
- `sidebar.tsx` - Sidebar navigation
- `chart.tsx` - Chart components integration
- `utils.ts` - Utility functions (cn, etc.)
- `use-mobile.ts` - Mobile detection hook

---

## 📁 **SPECIAL FOLDERS**
- `figma/` - Contains `ImageWithFallback.tsx` (image component with error handling)

---

## 📊 **COMPONENT STATS**
- **Main Components**: 42
- **UI Library Components**: 48
- **Total Components**: 90
- **Categories**: 11 main categories

---

*This reference provides a quick overview of all components organized by functionality. Each component includes a brief description of its purpose and key features.*

**Recent Updates**: Cleaned up unused components and consolidated functionality. Removed 20+ unused components including debug panels, duplicate modals, and test components for better maintainability.
