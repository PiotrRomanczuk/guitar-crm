#!/bin/bash

# Script to seed remote Supabase database from backup
# Usage: ./seed-remote-db.sh

set -e

echo "🚀 Remote Database Seeding Script"
echo "=================================="
echo ""

# Check if we have the backup file
BACKUP_FILE="supabase/backups/backup-2025-10-27_09-49-48/remote-db.sql"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found at $BACKUP_FILE"
    exit 1
fi

echo "✅ Found backup file: $BACKUP_FILE"
echo ""

# Check for required environment variables
if [ -z "$REMOTE_DB_URL" ]; then
    echo "⚠️  REMOTE_DB_URL not set"
    echo ""
    echo "Please provide your Supabase database connection string."
    echo "You can find it in your Supabase project settings:"
    echo "  1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database"
    echo "  2. Copy the 'Connection string' under 'Connection pooling'"
    echo "  3. Make sure to use 'Transaction' mode"
    echo ""
    read -p "Enter your Supabase database URL: " REMOTE_DB_URL
    
    if [ -z "$REMOTE_DB_URL" ]; then
        echo "❌ Database URL is required"
        exit 1
    fi
fi

echo "📊 Database URL configured"
echo ""

# Confirm before proceeding
echo "⚠️  WARNING: This will modify your remote database!"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🔄 Starting database seeding..."
echo ""

# Option 1: Using psql (if available)
if command -v psql &> /dev/null; then
    echo "Using psql to import data..."
    psql "$REMOTE_DB_URL" < "$BACKUP_FILE"
    echo "✅ Data imported successfully using psql"
else
    echo "❌ psql not found. Please install PostgreSQL client tools."
    echo ""
    echo "Installation instructions:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    echo "Or you can use the Supabase CLI:"
    echo "  npx supabase db push --db-url=\"$REMOTE_DB_URL\""
    exit 1
fi

echo ""
echo "🎉 Remote database seeding completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Update your .env.local with remote credentials:"
echo "     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo "  2. Test the connection: npm run dev"
echo ""
