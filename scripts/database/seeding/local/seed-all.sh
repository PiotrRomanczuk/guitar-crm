#!/bin/bash

# Development User Seeding Script
# Orchestrates all seeding operations for development environment
# Creates users, assigns roles, and seeds sample data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 DEVELOPMENT SEEDING - COMPLETE SETUP${NC}"
echo "=========================================="

# Step 1: Check Supabase
echo -e "\n${BLUE}Step 1: Checking Supabase...${NC}"
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Supabase is not running${NC}"
    echo "Start Supabase with: npm run setup:db"
    exit 1
fi
echo -e "${GREEN}✅ Supabase is running${NC}"

# Step 2: Create development users via API
echo -e "\n${BLUE}Step 2: Creating development users...${NC}"
cd "$PROJECT_ROOT"
if node "$SCRIPT_DIR/seed-dev-users-via-api.js"; then
    echo -e "${GREEN}✅ Users created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create users${NC}"
    exit 1
fi

# Step 3: Seed database with sample data
echo -e "\n${BLUE}Step 3: Seeding database with sample data...${NC}"
if bash "$SCRIPT_DIR/seed-db.sh"; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi

# Step 4: Display seeded users
echo -e "\n${BLUE}Step 4: Seeded Development Users${NC}"
echo "================================="
echo ""
echo -e "${YELLOW}Admin User (is_admin + is_teacher):${NC}"
echo "  Email: p.romanczuk@gmail.com"
echo "  Password: test123_admin"
echo ""
echo -e "${YELLOW}Teacher User (is_teacher):${NC}"
echo "  Email: teacher@example.com"
echo "  Password: test123_teacher"
echo ""
echo -e "${YELLOW}Student User (is_student):${NC}"
echo "  Email: student@example.com"
echo "  Password: test123_student"
echo ""
echo -e "${YELLOW}Additional Students:${NC}"
echo "  Email: teststudent1@example.com | Password: test123_student"
echo "  Email: teststudent2@example.com | Password: test123_student"
echo "  Email: teststudent3@example.com | Password: test123_student"
echo ""

# Step 5: Verify data integrity
echo -e "${BLUE}Step 5: Verifying data integrity...${NC}"
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres << 'SQL'
\echo 'Profiles with roles:'
SELECT email, is_admin, is_teacher, is_student FROM profiles ORDER BY email;
SQL

echo ""
echo -e "${GREEN}✅ All seeding complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "• Start the app: npm run dev"
echo "• Login with any of the credentials above"
echo "• Access Supabase Studio: http://localhost:54323"
echo ""
