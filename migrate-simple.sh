#!/bin/bash

# Simple Database Migration Script using pg_dump and psql
# This is more reliable than the Node.js approach

echo "🚀 Starting Neon to Supabase migration using pg_dump..."

# Load environment variables
source .env.supabase

# Check if required tools are installed
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump not found. Please install PostgreSQL client tools."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client tools."
    exit 1
fi

echo "✅ PostgreSQL tools found"

# Export database schema and data
echo "📊 Exporting database from Neon..."
pg_dump "$NEON_DATABASE_URL" \
    --clean \
    --if-exists \
    --quote-all-identifiers \
    --no-owner \
    --no-privileges \
    --verbose \
    > dump.sql

if [ $? -eq 0 ]; then
    echo "✅ Database exported to dump.sql"
else
    echo "❌ Failed to export database"
    exit 1
fi

# Import to Supabase
echo "📥 Importing database to Supabase..."
psql -d "$SUPABASE_DATABASE_URL" -f dump.sql

if [ $? -eq 0 ]; then
    echo "✅ Database imported to Supabase successfully!"
    echo "🎉 Migration completed!"
else
    echo "❌ Failed to import database"
    exit 1
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f dump.sql

echo "✨ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test your application with the new Supabase database"
echo "2. Update your .env.local DATABASE_URL to point to Supabase"
echo "3. Update your deployment configuration"
