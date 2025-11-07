#!/bin/bash

# Interactive script to seed remote Supabase database
# Handles both SQL backup restoration and JSON data seeding

set -e

echo "🚀 Guitar CRM - Remote Database Seeding"
echo "========================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo ""
    echo "Install it with: npm install -g supabase"
    echo "Or: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check for Supabase project link
if [ ! -f ".git/config" ] || ! grep -q "supabase" ".git/config" 2>/dev/null; then
    echo "📋 First-time setup required"
    echo ""
    echo "To seed the remote database, you need to:"
    echo "  1. Link this project to your Supabase project"
    echo "  2. Have your database connection string ready"
    echo ""
    read -p "Do you want to link to your Supabase project now? (yes/no): " link_now
    
    if [ "$link_now" = "yes" ]; then
        echo ""
        echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        echo "Find your project ref at: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general"
        exit 0
    fi
fi

echo "📦 Available seeding options:"
echo ""
echo "  1. Push SQL schema and migrations (recommended for first-time)"
echo "  2. Seed sample data from JSON backups"
echo "  3. Both (full setup)"
echo ""
read -p "Select option (1-3): " option

case $option in
    1)
        echo ""
        echo "🔄 Pushing schema and migrations to remote database..."
        echo ""
        echo "This will apply all migrations from supabase/migrations/"
        echo ""
        read -p "Continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            supabase db push
            echo "✅ Schema pushed successfully"
        fi
        ;;
    2)
        echo ""
        echo "🔄 Seeding sample data..."
        echo ""
        echo "⚠️  Note: This requires the schema to already exist in remote DB"
        echo ""
        read -p "Continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            # Run seed.sql if it exists
            if [ -f "supabase/seed.sql" ]; then
                echo "Running seed.sql..."
                supabase db push --include-seed
                echo "✅ Seed data imported"
            else
                echo "❌ supabase/seed.sql not found"
            fi
        fi
        ;;
    3)
        echo ""
        echo "🔄 Running full database setup..."
        echo ""
        read -p "This will push schema AND seed data. Continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Step 1: Pushing migrations..."
            supabase db push
            
            echo ""
            echo "Step 2: Seeding data..."
            if [ -f "supabase/seed.sql" ]; then
                supabase db push --include-seed
            fi
            
            echo "✅ Full setup completed"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Remote database seeding completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env.local with your remote Supabase credentials"
echo "  2. Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
echo "  3. Test connection: npm run dev"
echo ""
echo "Example .env.local configuration:"
echo "  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo ""
