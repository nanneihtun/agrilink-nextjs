#!/bin/bash

# Database Backup Script using pg_dump
# Creates a complete backup before applying indexes

echo "📸 Creating Database Backup Before Optimization"
echo ""

# Load environment variables
source .env.local

# Create backup filename with timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="database-backup-before-indexes-${TIMESTAMP}.sql"

echo "📁 Backup file: ${BACKUP_FILE}"
echo "🔗 Database: $(echo $DATABASE_URL | sed 's/:\/\/.*@/:\/\/****@/')"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump not found. Please install PostgreSQL client tools."
    echo "💡 Run: brew install postgresql"
    exit 1
fi

echo "📊 Creating backup with pg_dump..."

# Create backup using pg_dump
pg_dump "$DATABASE_URL" \
    --verbose \
    --clean \
    --if-exists \
    --quote-all-identifiers \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database backup completed successfully!"
    echo "📁 Backup saved to: ${BACKUP_FILE}"
    echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    echo ""
    echo "🔍 Backup includes:"
    echo "  • Complete database schema"
    echo "  • All table data"
    echo "  • All indexes and constraints"
    echo "  • All functions and procedures"
    
    echo ""
    echo "💡 To restore from backup:"
    echo "  psql \"\$DATABASE_URL\" -f \"${BACKUP_FILE}\""
    
    echo ""
    echo "🎯 Backup is ready! You can now proceed with index optimization."
    
else
    echo ""
    echo "❌ Backup failed!"
    echo "💡 Check your DATABASE_URL and network connection"
    exit 1
fi
