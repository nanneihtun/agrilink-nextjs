# AWS RDS PostgreSQL Import Guide

## 📋 What You Have

✅ **Complete Database Export**: `agrilink-database-export-2025-10-08.sql` (17MB)
- **16 Tables**: All schema and data included
- **133 INSERT Statements**: All your data is preserved
- **10 Functions**: Database functions included
- **AWS RDS Compatible**: Ready to import

## 🚀 Steps to Import to AWS RDS

### 1. Create AWS RDS PostgreSQL Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier agrilink-marketplace \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

### 2. Download the Export File

The file `agrilink-database-export-2025-10-08.sql` contains:
- ✅ **Complete Schema**: All tables, constraints, indexes
- ✅ **All Data**: Users, products, offers, reviews, conversations
- ✅ **Functions**: Database functions and procedures
- ✅ **Extensions**: UUID and crypto extensions

### 3. Import to AWS RDS

```bash
# Connect to your AWS RDS instance
psql -h your-rds-endpoint.amazonaws.com -U postgres -d postgres

# Or import directly from file
psql -h your-rds-endpoint.amazonaws.com -U postgres -d postgres -f agrilink-database-export-2025-10-08.sql
```

### 4. Update Your Application

Update your `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@your-rds-endpoint.amazonaws.com:5432/postgres"
```

## 📊 What's Included in the Export

### Tables (16 total):
- `users` - User accounts and authentication
- `user_profiles` - User profile information
- `user_verification` - Verification status
- `user_ratings` - User ratings and reviews
- `user_addresses` - User delivery addresses
- `user_social` - Social media links
- `business_details` - Business information
- `products` - Product listings
- `product_pricing` - Product pricing
- `product_images` - Product images
- `product_inventory` - Inventory management
- `product_delivery` - Delivery options
- `conversations` - Chat conversations
- `messages` - Chat messages
- `offers` - Trading offers
- `offer_reviews` - Offer reviews

### Data Included:
- ✅ **All Users**: Complete user accounts with profiles
- ✅ **All Products**: Product listings with images and pricing
- ✅ **All Conversations**: Chat history and messages
- ✅ **All Offers**: Trading offers and reviews
- ✅ **All Reviews**: User and offer reviews

## 🔧 AWS RDS Configuration Recommendations

### Instance Size:
- **Development**: `db.t3.micro` (1 vCPU, 1GB RAM)
- **Production**: `db.t3.small` or `db.t3.medium`

### Storage:
- **Type**: `gp2` (General Purpose SSD)
- **Size**: Start with 20GB, auto-scaling enabled

### Security:
- ✅ **VPC**: Use private subnets
- ✅ **Security Groups**: Restrict access to your application servers
- ✅ **Encryption**: Enable at-rest encryption
- ✅ **Backup**: 7-day retention period

### Performance:
- ✅ **Multi-AZ**: For production (high availability)
- ✅ **Read Replicas**: For read-heavy workloads
- ✅ **Parameter Groups**: Optimize for your workload

## 🚨 Important Notes

1. **Password Security**: Use a strong password for the master user
2. **Network Security**: Configure security groups properly
3. **Backup Strategy**: Enable automated backups
4. **Monitoring**: Set up CloudWatch monitoring
5. **Cost Optimization**: Use reserved instances for production

## 📞 Support

If you need help with the AWS setup, the export file is complete and ready to use. Just follow the steps above to get your database running on AWS RDS!

## 🔄 Migration Checklist

- [ ] Create AWS RDS PostgreSQL instance
- [ ] Download `agrilink-database-export-2025-10-08.sql`
- [ ] Import the SQL file to RDS
- [ ] Update application `DATABASE_URL`
- [ ] Test application connectivity
- [ ] Verify all data is present
- [ ] Set up monitoring and backups
