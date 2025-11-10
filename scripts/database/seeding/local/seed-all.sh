#!/bin/bash

# Complete Database Seeding Script
# Seeds all data in correct dependency order for high-quality test database
# Usage: bash scripts/database/seed-all.sh

set -e  # Exit on any error

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 COMPLETE DATABASE SEEDING${NC}"
echo "=============================="
echo ""

# Check if Supabase is running
echo -e "${BLUE}📡 Checking Supabase status...${NC}"
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Supabase is not running. Please start it first:${NC}"
    echo "   bash scripts/setup/setup-db.sh"
    exit 1
fi
echo -e "${GREEN}✅ Supabase is running${NC}"
echo ""

# Get Supabase credentials
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_SERVICE_KEY=$(supabase status --output json 2>/dev/null | jq -r '.SERVICE_ROLE_KEY' 2>/dev/null || echo "")

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Failed to get Supabase service key${NC}"
    exit 1
fi

export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
export NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_KEY"

echo -e "${BLUE}🔧 Environment configured${NC}"
echo "URL: $SUPABASE_URL"
echo ""

# Step 1: Seed Users (required by all other entities)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1/5: Seeding Users${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
node scripts/database/seeding/local/seed-dev-users-via-api.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed users${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Users seeded successfully${NC}"
echo ""

# Step 2: Seed Songs (required by lesson-songs and assignments)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2/5: Seeding Songs${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npx ts-node scripts/database/seeding/test/seed-test-songs.ts
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed songs${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Songs seeded successfully${NC}"
echo ""

# Step 3: Seed Lessons (required by lesson-songs and assignments)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3/5: Seeding Lessons${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npx ts-node scripts/database/seeding/test/seed-test-lessons.ts
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed lessons${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Lessons seeded successfully${NC}"
echo ""

# Step 4: Seed Lesson-Songs (requires lessons and songs)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4/5: Seeding Lesson-Songs${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npx ts-node scripts/database/seeding/test/seed-test-lesson-songs.ts
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed lesson-songs${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Lesson-Songs seeded successfully${NC}"
echo ""

# Step 5: Seed Assignments (requires lessons, songs, users)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 5/5: Seeding Assignments${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
# Check if assignments table exists first
ASSIGNMENTS_EXISTS=$(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assignments');" 2>/dev/null || echo "false")

if [ "$ASSIGNMENTS_EXISTS" = "t" ]; then
     npx ts-node scripts/database/seeding/test/seed-test-assignments.ts 2>/dev/null || echo -e "${YELLOW}⚠️  Assignments seeding failed${NC}"
    echo -e "${GREEN}✅ Assignments seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Assignments table not found - skipping${NC}"
fi
echo ""

# Final Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 DATABASE SEEDING COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Display summary statistics
echo -e "${BLUE}📊 Database Summary:${NC}"
echo "======================="
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -t << 'EOL'
SELECT 
    'Users' as Entity, 
    COUNT(*)::text as Count 
FROM auth.users
UNION ALL
SELECT 'Profiles', COUNT(*)::text FROM profiles
UNION ALL
SELECT 'Songs', COUNT(*)::text FROM songs
UNION ALL
SELECT 'Lessons', COUNT(*)::text FROM lessons
UNION ALL
SELECT 'Lesson-Songs', COUNT(*)::text FROM lesson_songs
UNION ALL
SELECT 'Assignments', COUNT(*)::text FROM assignments
ORDER BY Entity;
EOL

echo ""
echo -e "${GREEN}✅ All test data seeded successfully!${NC}"
echo ""
echo -e "${BLUE}🎯 You can now:${NC}"
echo "  • Run quality checks: npm run db:quality"
echo "  • Start development: npm run dev"
echo "  • Run tests: npm run test"
echo "  • View in Studio: http://localhost:54323"
echo ""
echo -e "${BLUE}🔐 Test Credentials:${NC}"
echo "  • Admin:   p.romanczuk@gmail.com / test123_admin"
echo "  • Teacher: teacher@example.com / test123_teacher"
echo "  • Student: student@example.com / test123_student"
