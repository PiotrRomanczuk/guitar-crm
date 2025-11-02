#!/bin/bash

# Master Test Data Seeding Script
# Seeds all test data in correct order: users -> songs -> lessons -> lesson-songs

set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "🌱 MASTER TEST DATA SEEDING"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase is running
echo "📡 Checking Supabase status..."
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Supabase is not running${NC}"
    echo "Please start Supabase first: npm run setup:db"
    exit 1
fi
echo -e "${GREEN}✅ Supabase is running${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Step 1: Seed test users (if not already done)
echo "👥 Step 1/4: Checking test users..."
USER_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@example.com';" | tr -d ' ')

if [ "$USER_COUNT" -lt 3 ]; then
    echo -e "${YELLOW}⚠️  Insufficient test users (found $USER_COUNT, need at least 3)${NC}"
    echo "Creating test users..."
    ts-node "$SCRIPT_DIR/seed-dev-users.ts"
    echo -e "${GREEN}✅ Test users created${NC}"
else
    echo -e "${GREEN}✅ Test users already exist ($USER_COUNT users)${NC}"
fi
echo ""

# Step 2: Seed test songs
echo "🎸 Step 2/4: Seeding test songs..."
ts-node "$SCRIPT_DIR/seed-test-songs.ts"
echo ""

# Step 3: Seed test lessons
echo "📚 Step 3/4: Seeding test lessons..."
ts-node "$SCRIPT_DIR/seed-test-lessons.ts"
echo ""

# Step 4: Seed test lesson-songs
echo "🎵 Step 4/4: Seeding test lesson-songs..."
ts-node "$SCRIPT_DIR/seed-test-lesson-songs.ts"
echo ""

# Final summary
echo "═══════════════════════════════"
echo "📊 FINAL DATABASE SUMMARY"
echo "═══════════════════════════════"
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres << 'EOL'
SELECT 
    'Users' as entity, 
    COUNT(*)::text as count 
FROM auth.users WHERE email LIKE '%@example.com'
UNION ALL
SELECT 'Profiles', COUNT(*)::text FROM public.profiles
UNION ALL
SELECT 'Songs', COUNT(*)::text FROM public.songs
UNION ALL
SELECT 'Lessons', COUNT(*)::text FROM public.lessons
UNION ALL
SELECT 'Lesson-Songs', COUNT(*)::text FROM public.lesson_songs;
EOL

echo ""
echo -e "${GREEN}✅ ALL TEST DATA SEEDED SUCCESSFULLY!${NC}"
echo ""
echo "🎯 You can now:"
echo "• Test the application with complete test data"
echo "• Run database quality checks: ./scripts/database/check-db-quality.sh"
echo "• Run quality checks: npm run quality"
echo "• Access Supabase Studio: http://localhost:54323"
echo ""
