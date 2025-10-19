# AgriLink Database Schema Documentation

**Generated on:** 2025-10-18T12:00:00.123Z
**Total Tables:** 26

## addresses

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| locationId | uuid | Yes | - | |
| addressLine1 | text | No | - | |
| addressLine2 | text | Yes | - | |
| phoneNumber | text | Yes | - | |
| addressType | text | Yes | 'home' | |
| isDefault | boolean | Yes | false | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id
- locationId → locations.id

---

## business_details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| businessName | text | Yes | - | |
| businessDescription | text | Yes | - | |
| businessHours | text | Yes | - | |
| businessLicenseNumber | text | Yes | - | |
| specialties | ARRAY | Yes | - | |
| policies | jsonb | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id

---

## categories

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| name | text | No | - | |

---

## conversations

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| productId | uuid | No | - | |
| buyerId | uuid | No | - | |
| sellerId | uuid | No | - | |
| lastMessage | text | Yes | - | |
| lastMessageTime | timestamp with time zone | Yes | - | |
| unreadCount | integer(32) | Yes | 0 | |
| isActive | boolean | Yes | true | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- productId → products.id
- buyerId → users.id
- sellerId → users.id

---

## delivery_options

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| name | text | No | - | |

---

## email_management

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| pendingEmail | text | Yes | - | |
| emailVerificationToken | text | Yes | - | |
| emailVerificationExpires | timestamp with time zone | Yes | - | |
| passwordResetToken | text | Yes | - | |
| passwordResetExpires | timestamp with time zone | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id

---

## locations

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| region | text | No | - | |
| city | text | No | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

---

## messages

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| conversationId | uuid | No | - | |
| senderId | uuid | No | - | |
| content | text | No | - | |
| messageType | text | Yes | 'text' | |
| isRead | boolean | Yes | false | |
| createdAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- conversationId → conversations.id
- senderId → users.id

---

## offer_reviews

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| offerId | uuid | No | - | |
| reviewerId | uuid | No | - | |
| revieweeId | uuid | No | - | |
| rating | integer(32) | No | - | |
| comment | text | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- offerId → offers.id
- reviewerId → users.id
- revieweeId → users.id

---

## offer_timeline

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| offerId | uuid | No | - | |
| eventType | text | No | - | |
| eventDescription | text | No | - | |
| eventData | jsonb | Yes | - | |
| userId | uuid | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- offerId → offers.id
- userId → users.id
- userId → users.id

---

## offers

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| productId | uuid | No | - | |
| buyerId | uuid | No | - | |
| sellerId | uuid | No | - | |
| offerPrice | numeric(12,2) | No | - | |
| quantity | integer(32) | No | 1 | |
| message | text | Yes | - | |
| status | text | Yes | 'pending' | |
| statusId | uuid | Yes | - | |
| expiresAt | timestamp with time zone | Yes | - | |
| deliveryAddress | jsonb | Yes | - | |
| deliveryOptions | ARRAY | Yes | - | |
| deliveryOptionIds | ARRAY | Yes | - | |
| paymentTerms | ARRAY | Yes | - | |
| paymentTermIds | ARRAY | Yes | - | |
| conversationId | uuid | Yes | - | |
| cancelledBy | uuid | Yes | - | |
| cancellationReason | text | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- productId → products.id
- buyerId → users.id
- sellerId → users.id
- statusId → status_types.id
- conversationId → conversations.id
- cancelledBy → users.id

---

## payment_terms

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| name | text | No | - | |

---

## product_images

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| productId | uuid | No | - | |
| imageData | text | No | - | |
| isPrimary | boolean | Yes | false | |
| createdAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- productId → products.id

---

## products

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| sellerId | uuid | No | - | |
| categoryId | uuid | No | - | |
| locationId | uuid | Yes | - | |
| name | text | No | - | |
| description | text | Yes | - | |
| price | numeric(12,2) | No | - | |
| availableStock | text | Yes | - | |
| minimumOrder | text | No | - | |
| deliveryOptions | ARRAY | No | - | |
| paymentTerms | ARRAY | No | - | |
| sellerType | text | Yes | - | |
| sellerName | text | Yes | - | |
| additionalNotes | text | Yes | - | |
| isActive | boolean | Yes | true | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |
| quantity | integer(32) | Yes | - | |
| quantityUnit | text | Yes | - | |
| packaging | text | Yes | - | |

**Foreign Keys:**
- sellerId → users.id
- categoryId → categories.id
- locationId → locations.id

---

## saved_products

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| productId | uuid | No | - | |
| savedDate | timestamp with time zone | Yes | now() | |
| priceWhenSaved | numeric(12,2) | Yes | - | |
| alerts | jsonb | Yes | '{"priceAlert": false, "stockAlert": false}' | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id
- productId → products.id

---

## seller_custom_delivery_options

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| seller_id | uuid | No | - | |
| name | text | No | - | |
| description | text | Yes | - | |
| is_active | boolean | Yes | true | |
| created_at | timestamp with time zone | Yes | now() | |
| updated_at | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- seller_id → users.id

---

## seller_custom_payment_terms

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| seller_id | uuid | No | - | |
| name | text | No | - | |
| description | text | Yes | - | |
| is_active | boolean | Yes | true | |
| created_at | timestamp with time zone | Yes | now() | |
| updated_at | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- seller_id → users.id

---

## status_types

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| name | text | No | - | |

---

## user_business

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| businessId | uuid | No | - | |
| createdAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id
- businessId → business_details.id

---

## user_profiles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| locationId | uuid | Yes | - | |
| phone | text | Yes | - | |
| profileImage | text | Yes | - | |
| storefrontImage | text | Yes | - | |
| website | text | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |
| specialties | ARRAY | Yes | '{}' | |

**Foreign Keys:**
- userId → users.id
- locationId → locations.id

---

## user_ratings

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| rating | numeric(3,2) | Yes | 0 | |
| totalReviews | integer(32) | Yes | 0 | |
| responseTime | text | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id

---

## user_social

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| facebook | text | Yes | - | |
| instagram | text | Yes | - | |
| twitter | text | Yes | - | |
| linkedin | text | Yes | - | |
| telegram | text | Yes | - | |
| whatsapp | text | Yes | - | |
| tiktok | text | Yes | - | |
| website | text | Yes | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id

---

## user_verification

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| verified | boolean | Yes | false | |
| phoneVerified | boolean | Yes | false | |
| verificationStatus | text | Yes | 'not_started' | |
| verificationSubmitted | boolean | Yes | false | |
| verificationDocuments | jsonb | Yes | - | |
| businessDetailsCompleted | boolean | Yes | false | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |
| rejectedDocuments | jsonb | Yes | - | |

**Foreign Keys:**
- userId → users.id

---

## users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| email | text | No | - | |
| name | text | No | - | |
| passwordHash | text | No | - | |
| emailVerified | boolean | Yes | false | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |
| userType | character varying(50) | No | - | |
| accountType | character varying(50) | No | - | |
| emailVerificationToken | text | Yes | - | |
| emailVerificationExpires | timestamp with time zone | Yes | - | |
| pendingEmail | text | Yes | - | |

---

## verification_codes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| phone | text | No | - | |
| code | text | Yes | - | |
| expiresAt | timestamp with time zone | No | - | |
| createdAt | timestamp with time zone | Yes | now() | |
| verificationId | text | Yes | - | |
| verified | boolean | Yes | false | |
| verifiedAt | timestamp with time zone | Yes | - | |
| attempts | integer(32) | Yes | 0 | |

**Foreign Keys:**
- userId → users.id

---

## verification_requests

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | |
| userId | uuid | No | - | |
| userEmail | text | No | - | |
| userName | text | No | - | |
| userType | text | No | - | |
| accountType | text | No | - | |
| businessName | text | Yes | - | |
| businessDescription | text | Yes | - | |
| businessLicenseNumber | text | Yes | - | |
| verificationDocuments | jsonb | Yes | - | |
| status | text | Yes | 'pending' | |
| submittedAt | timestamp with time zone | Yes | now() | |
| reviewedAt | timestamp with time zone | Yes | - | |
| reviewedBy | uuid | Yes | - | |
| reviewNotes | text | Yes | - | |
| requestType | text | Yes | 'standard' | |
| businessInfo | jsonb | Yes | - | |
| phoneVerified | boolean | Yes | false | |
| createdAt | timestamp with time zone | Yes | now() | |
| updatedAt | timestamp with time zone | Yes | now() | |

**Foreign Keys:**
- userId → users.id
- reviewedBy → users.id

---

