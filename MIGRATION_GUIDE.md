# Database Migration Guide: Neon to Supabase

This guide will help you migrate your AgriLink database from Neon to Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js Dependencies**: Install the required packages
3. **Database Access**: Ensure you have access to both your Neon and Supabase databases

## Step 1: Install Required Dependencies

```bash
npm install pg
```

## Step 2: Set Up Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `agrilink-nextjs` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

## Step 3: Get Supabase Connection Details

From your Supabase project dashboard:

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string** → **URI**
3. Copy the connection string (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

Also note down:
- **Project URL**: `https://[PROJECT-REF].supabase.co`
- **API Keys**: Go to **Settings** → **API** to get:
  - `anon` key (public)
  - `service_role` key (private)

## Step 4: Set Up Environment Variables

Run the setup script to create environment templates:

```bash
node setup-supabase-env.js
```

This will create `.env.local` (or `.env.supabase` if `.env.local` already exists) with template values.

Update the file with your actual values:

```env
# Neon Database (source) - your existing database
NEON_DATABASE_URL="postgresql://username:password@your-neon-hostname/database?sslmode=require"

# Supabase Database (target) - your new database
SUPABASE_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# Supabase Project Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Optional: Update your main DATABASE_URL for gradual migration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

## Step 5: Run the Migration

Execute the migration script:

```bash
node migrate-to-supabase.js
```

This script will:
1. ✅ Connect to both databases
2. 📋 Export your current schema from Neon
3. 📊 Export all data from Neon
4. 🏗️ Create the schema in Supabase
5. 🔗 Set up foreign keys and constraints
6. 📥 Import all data to Supabase
7. 🔍 Verify the migration was successful

## Step 6: Update Your Application Configuration

### Option A: Complete Switch (Recommended for Production)

Update your `drizzle.config.json`:

```json
{
  "dialect": "postgresql",
  "schema": "./src/lib/db/schema.ts",
  "out": "./drizzle",
  "dbCredentials": {
    "url": "env(SUPABASE_DATABASE_URL)"
  }
}
```

Or use the Supabase-specific config:

```bash
cp drizzle.config.supabase.json drizzle.config.json
```

### Option B: Gradual Migration (For Testing)

Keep your existing configuration and update the `DATABASE_URL` environment variable to point to Supabase for testing.

## Step 7: Test Your Application

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test key functionality**:
   - User registration and login
   - Product creation and listing
   - Chat functionality
   - Offer system

3. **Run database operations**:
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Push schema changes
   npm run db:push
   
   # Open Drizzle Studio
   npm run db:studio
   ```

## Step 8: Update Deployment Configuration

If you're using Vercel or another deployment platform:

1. Update your environment variables in the deployment dashboard
2. Replace `DATABASE_URL` with your Supabase connection string
3. Add the new Supabase environment variables
4. Redeploy your application

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Ensure your Supabase project is fully initialized
   - Check that your connection string is correct
   - Verify your IP is not blocked by Supabase

2. **Foreign Key Constraint Errors**
   - The migration script handles this by importing tables in the correct order
   - If you encounter issues, check that all referenced tables exist

3. **Data Type Mismatches**
   - The script maps common PostgreSQL types
   - Check the `schema-export.json` file if you need to adjust mappings

4. **Permission Errors**
   - Ensure your Supabase database user has the necessary permissions
   - Check that the connection string uses the correct credentials

### Verification Steps

After migration, verify your data:

```sql
-- Check table counts
SELECT 
  schemaname,
  tablename,
  n_tup_ins as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check foreign key relationships
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
```

## Benefits of Supabase

- **Built-in Authentication**: User management and JWT tokens
- **Real-time Subscriptions**: WebSocket connections for live updates
- **Row Level Security**: Fine-grained access control
- **Dashboard**: Visual database management
- **Edge Functions**: Serverless functions at the edge
- **Storage**: File storage with CDN

## Next Steps

1. **Enable Row Level Security (RLS)** for better data protection
2. **Set up Supabase Auth** to replace custom authentication
3. **Implement Real-time subscriptions** for chat and notifications
4. **Use Supabase Storage** for file uploads
5. **Add Edge Functions** for server-side logic

## Support

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Community**: https://github.com/supabase/supabase/discussions
- **Migration Issues**: Check the generated log files and error messages

---

**Note**: Always backup your data before running migrations. Test the migration in a development environment first.
