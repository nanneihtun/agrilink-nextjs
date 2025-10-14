-- ============================================================================
-- DATABASE BACKUP - Created: 2025-10-14T06:39:51.485Z
-- Purpose: Backup before applying database indexes
-- Database: postgresql://****@ep-bold-night-agqqousj-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
-- ============================================================================

-- Table: business_details
-- Structure: 9 columns

-- ERROR backing up business_details: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: conversations
-- Structure: 10 columns

-- ERROR backing up conversations: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: messages
-- Structure: 7 columns

-- ERROR backing up messages: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: offer_reviews
-- Structure: 8 columns

-- ERROR backing up offer_reviews: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: offers
-- Structure: 29 columns

-- ERROR backing up offers: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: product_delivery
-- Structure: 10 columns

-- ERROR backing up product_delivery: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: product_images
-- Structure: 5 columns

-- ERROR backing up product_images: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: product_inventory
-- Structure: 7 columns

-- ERROR backing up product_inventory: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: product_pricing
-- Structure: 8 columns

-- ERROR backing up product_pricing: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: products
-- Structure: 9 columns

-- ERROR backing up products: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: saved_products
-- Structure: 8 columns

-- ERROR backing up saved_products: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: user_addresses
-- Structure: 16 columns

-- ERROR backing up user_addresses: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: user_profiles
-- Structure: 10 columns

-- ERROR backing up user_profiles: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: user_ratings
-- Structure: 9 columns

-- ERROR backing up user_ratings: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: user_social
-- Structure: 9 columns

-- ERROR backing up user_social: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: user_verification
-- Structure: 10 columns

-- ERROR backing up user_verification: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: users
-- Structure: 23 columns

-- ERROR backing up users: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- Table: verification_requests
-- Structure: 20 columns

-- ERROR backing up verification_requests: This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).

-- ============================================================================
-- CURRENT INDEXES (before optimization)
-- ============================================================================

-- conversations_pkey ON conversations
-- CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id)

-- messages_pkey ON messages
-- CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id)

-- idx_offers_buyer_id ON offers
-- CREATE INDEX idx_offers_buyer_id ON public.offers USING btree ("buyerId")

-- idx_offers_conversation_id ON offers
-- CREATE INDEX idx_offers_conversation_id ON public.offers USING btree ("conversationId")

-- idx_offers_created_at ON offers
-- CREATE INDEX idx_offers_created_at ON public.offers USING btree ("createdAt")

-- idx_offers_product_id ON offers
-- CREATE INDEX idx_offers_product_id ON public.offers USING btree ("productId")

-- idx_offers_seller_id ON offers
-- CREATE INDEX idx_offers_seller_id ON public.offers USING btree ("sellerId")

-- idx_offers_status ON offers
-- CREATE INDEX idx_offers_status ON public.offers USING btree (status)

-- offers_pkey ON offers
-- CREATE UNIQUE INDEX offers_pkey ON public.offers USING btree (id)

-- product_pricing_pkey ON product_pricing
-- CREATE UNIQUE INDEX product_pricing_pkey ON public.product_pricing USING btree (id)

-- product_pricing_productId_key ON product_pricing
-- CREATE UNIQUE INDEX "product_pricing_productId_key" ON public.product_pricing USING btree ("productId")

-- products_pkey ON products
-- CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id)

-- user_profiles_pkey ON user_profiles
-- CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id)

-- user_profiles_userId_key ON user_profiles
-- CREATE UNIQUE INDEX "user_profiles_userId_key" ON public.user_profiles USING btree ("userId")

-- user_ratings_pkey ON user_ratings
-- CREATE UNIQUE INDEX user_ratings_pkey ON public.user_ratings USING btree (id)

-- user_ratings_userId_key ON user_ratings
-- CREATE UNIQUE INDEX "user_ratings_userId_key" ON public.user_ratings USING btree ("userId")

-- user_verification_pkey ON user_verification
-- CREATE UNIQUE INDEX user_verification_pkey ON public.user_verification USING btree (id)

-- user_verification_userId_key ON user_verification
-- CREATE UNIQUE INDEX "user_verification_userId_key" ON public.user_verification USING btree ("userId")

-- idx_users_email ON users
-- CREATE INDEX idx_users_email ON public.users USING btree (email)

-- users_email_key ON users
-- CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)

-- users_pkey ON users
-- CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)

