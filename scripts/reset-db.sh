#!/bin/bash

# Script to reset local Supabase database to fresh state with seed data
# This ensures consistent data every time you start working

set -e

echo "🔄 Resetting Supabase database..."
echo ""

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321/rest/v1/ > /dev/null 2>&1; then
    echo "⚠️  Supabase is not running. Starting it first..."
    supabase start
    echo ""
fi

echo "🗑️  Dropping all tables and data..."
echo "📦 Running migrations..."
echo "🌱 Seeding database with fresh data..."
echo ""

# Reset database (drops all tables, runs migrations, runs seeds)
supabase db reset

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📊 Your database now has:"
echo "   - All tables created (from migrations)"
echo "   - Fresh seed data (from seed_sql/*.sql files)"
echo ""
echo "🔗 Access Supabase Studio: http://localhost:54323"
echo ""
