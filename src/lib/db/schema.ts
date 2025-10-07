import { pgTable, uuid, text, boolean, timestamp, decimal, integer, varchar, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// CORE USERS TABLE (Essential user data only)
// ============================================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  userType: text('user_type').notNull(), // farmer, trader, buyer, admin
  accountType: text('account_type').notNull(), // individual, business
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// USER PROFILES TABLE (Profile information)
// ============================================================================
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  location: text('location').notNull(),
  phone: text('phone'),
  experience: text('experience'),
  profileImage: text('profile_image'),
  storefrontImage: text('storefront_image'),
  website: text('website'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// BUSINESS DETAILS TABLE (Business-specific information)
// ============================================================================
export const businessDetails = pgTable('business_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: text('business_name'),
  businessDescription: text('business_description'),
  businessHours: text('business_hours'),
  specialties: text('specialties').array(),
  policies: jsonb('policies'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// SOCIAL MEDIA TABLE (Social media links)
// ============================================================================
export const userSocial = pgTable('user_social', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  facebook: text('facebook'),
  instagram: text('instagram'),
  telegram: text('telegram'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// VERIFICATION TABLE (Verification status and documents)
// ============================================================================
export const userVerification = pgTable('user_verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  verified: boolean('verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  verificationStatus: text('verification_status').default('not_started'),
  verificationSubmitted: boolean('verification_submitted').default(false),
  verificationDocuments: jsonb('verification_documents'),
  businessDetailsCompleted: boolean('business_details_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// USER RATINGS TABLE (Ratings and certifications)
// ============================================================================
export const userRatings = pgTable('user_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  responseTime: text('response_time'),
  qualityCertifications: text('quality_certifications').array(),
  farmingMethods: text('farming_methods').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// CORE PRODUCTS TABLE (Essential product data only)
// ============================================================================
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// PRODUCT PRICING TABLE (Pricing information)
// ============================================================================
export const productPricing = pgTable('product_pricing', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  unit: text('unit').notNull(),
  priceChange: decimal('price_change', { precision: 5, scale: 2 }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// PRODUCT INVENTORY TABLE (Stock and quantity information)
// ============================================================================
export const productInventory = pgTable('product_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: text('quantity').notNull(),
  minimumOrder: text('minimum_order'),
  availableQuantity: text('available_quantity'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// PRODUCT IMAGES TABLE (Product images)
// ============================================================================
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// PRODUCT DELIVERY TABLE (Delivery and payment information)
// ============================================================================
export const productDelivery = pgTable('product_delivery', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  location: text('location').notNull(),
  sellerType: text('seller_type').notNull(), // farmer, trader
  sellerName: text('seller_name').notNull(),
  deliveryOptions: text('delivery_options').array(),
  paymentTerms: text('payment_terms').array(),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// CONVERSATIONS TABLE (Chat conversations)
// ============================================================================
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastMessage: text('last_message'),
  lastMessageTime: timestamp('last_message_time', { withTimezone: true }),
  unreadCount: integer('unread_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// MESSAGES TABLE (Chat messages)
// ============================================================================
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text'), // text, image, file, offer
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// RELATIONS (For efficient joins)
// ============================================================================
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  businessDetails: one(businessDetails, { fields: [users.id], references: [businessDetails.userId] }),
  social: one(userSocial, { fields: [users.id], references: [userSocial.userId] }),
  verification: one(userVerification, { fields: [users.id], references: [userVerification.userId] }),
  ratings: one(userRatings, { fields: [users.id], references: [userRatings.userId] }),
  products: many(products),
  conversationsAsBuyer: many(conversations, { relationName: 'buyer' }),
  conversationsAsSeller: many(conversations, { relationName: 'seller' }),
  messages: many(messages),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, { fields: [products.sellerId], references: [users.id] }),
  pricing: one(productPricing, { fields: [products.id], references: [productPricing.productId] }),
  inventory: one(productInventory, { fields: [products.id], references: [productInventory.productId] }),
  images: many(productImages),
  delivery: one(productDelivery, { fields: [products.id], references: [productDelivery.productId] }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  product: one(products, { fields: [conversations.productId], references: [products.id] }),
  buyer: one(users, { fields: [conversations.buyerId], references: [users.id], relationName: 'buyer' }),
  seller: one(users, { fields: [conversations.sellerId], references: [users.id], relationName: 'seller' }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// ============================================================================
// EXPORT TYPES
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type BusinessDetails = typeof businessDetails.$inferSelect;
export type NewBusinessDetails = typeof businessDetails.$inferInsert;
export type UserSocial = typeof userSocial.$inferSelect;
export type NewUserSocial = typeof userSocial.$inferInsert;
export type UserVerification = typeof userVerification.$inferSelect;
export type NewUserVerification = typeof userVerification.$inferInsert;
export type UserRatings = typeof userRatings.$inferSelect;
export type NewUserRatings = typeof userRatings.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductPricing = typeof productPricing.$inferSelect;
export type NewProductPricing = typeof productPricing.$inferInsert;
export type ProductInventory = typeof productInventory.$inferSelect;
export type NewProductInventory = typeof productInventory.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductDelivery = typeof productDelivery.$inferSelect;
export type NewProductDelivery = typeof productDelivery.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;