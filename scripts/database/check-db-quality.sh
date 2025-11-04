#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

echo -e "${BLUE}🔍 DATABASE QUALITY CHECK${NC}"
echo "======================"

# Check if Supabase is running
echo -e "\n${BLUE}📡 Checking Supabase status...${NC}"
supabase status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Supabase is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Supabase is running${NC}"

# Function to run SQL queries
run_query() {
    PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "$1"
}

# Check for test data integrity
echo -e "\n${BLUE}🔍 Checking test data integrity...${NC}"

# Check test users
echo -e "\n${YELLOW}Checking test users:${NC}"
TEST_USERS=$(run_query "SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@example.com';")
echo "Test users count: $TEST_USERS"

# Check real emails
echo -e "\n${YELLOW}Checking for real emails (should be 0):${NC}"
REAL_EMAILS=$(run_query "SELECT COUNT(*) FROM auth.users WHERE email NOT LIKE '%@example.com' AND email != 'p.romanczuk@gmail.com';")
if [ "$REAL_EMAILS" -gt 0 ]; then
    echo -e "${RED}⚠️  Found $REAL_EMAILS real email(s) in database${NC}"
    echo "Details:"
    run_query "SELECT email FROM auth.users WHERE email NOT LIKE '%@example.com' AND email != 'p.romanczuk@gmail.com';"
else
    echo -e "${GREEN}✅ No real emails found${NC}"
fi

# Check songs
echo -e "\n${YELLOW}Checking songs:${NC}"
SONGS_COUNT=$(run_query "SELECT COUNT(*) FROM public.songs;")
echo "Total songs: $SONGS_COUNT"

# Check song difficulties distribution
echo "Difficulty distribution:"
run_query "SELECT level, COUNT(*) FROM public.songs GROUP BY level ORDER BY level;"

# Check lessons
echo -e "\n${YELLOW}Checking lessons:${NC}"
LESSONS_COUNT=$(run_query "SELECT COUNT(*) FROM public.lessons;")
echo "Total lessons: $LESSONS_COUNT"

# Check lesson-songs relationships
echo -e "\n${YELLOW}Checking lesson-songs:${NC}"
LESSON_SONGS_COUNT=$(run_query "SELECT COUNT(*) FROM public.lesson_songs;")
echo "Total lesson-song associations: $LESSON_SONGS_COUNT"

# TODO: Add assignments table checks when implemented
# Current schema doesn't have assignments table yet

# Check for orphaned records
echo -e "\n${YELLOW}Checking for orphaned records:${NC}"
ORPHANED_LESSON_SONGS=$(run_query "
    SELECT COUNT(*) FROM public.lesson_songs ls 
    WHERE NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = ls.lesson_id) 
    OR NOT EXISTS (SELECT 1 FROM public.songs s WHERE s.id = ls.song_id);
")

if [ "$ORPHANED_LESSON_SONGS" -gt 0 ]; then
    echo -e "${RED}⚠️  Found $ORPHANED_LESSON_SONGS orphaned lesson-song record(s)${NC}"
else
    echo -e "${GREEN}✅ No orphaned lesson-song records${NC}"
fi

# Check profiles
echo -e "\n${YELLOW}Checking profiles:${NC}"
PROFILES_COUNT=$(run_query "SELECT COUNT(*) FROM public.profiles;")
echo "Total profiles: $PROFILES_COUNT"

# Check role distribution
echo "Role distribution:"
run_query "
    SELECT 
        SUM(CASE WHEN isadmin THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN isteacher THEN 1 ELSE 0 END) as teacher_count,
        SUM(CASE WHEN isstudent THEN 1 ELSE 0 END) as student_count
    FROM public.profiles;
"

# Final summary
echo -e "\n${BLUE}📊 DATABASE SUMMARY${NC}"
echo "======================"
echo "Test Users: $TEST_USERS"
echo "Songs: $SONGS_COUNT"
echo "Lessons: $LESSONS_COUNT"
echo "Lesson-Song Associations: $LESSON_SONGS_COUNT"
echo "Profiles: $PROFILES_COUNT"

# Track issues
ISSUES_FOUND=0

# Check for any critical issues
if [ "$REAL_EMAILS" -gt 0 ]; then
    echo -e "\n${RED}❌ CRITICAL: Real email addresses found in database${NC}"
    ISSUES_FOUND=1
fi

if [ "$ORPHANED_LESSON_SONGS" -gt 0 ]; then
    echo -e "\n${RED}❌ CRITICAL: Orphaned lesson-song records found${NC}"
    ISSUES_FOUND=1
fi

# Check for minimum test data requirements
if [ "$SONGS_COUNT" -lt 10 ]; then
    echo -e "\n${YELLOW}⚠️  WARNING: Insufficient test data - only $SONGS_COUNT songs (minimum 10 recommended)${NC}"
    echo "   Run: npm run seed"
    ISSUES_FOUND=1
fi

if [ "$TEST_USERS" -lt 3 ]; then
    echo -e "\n${YELLOW}⚠️  WARNING: Insufficient test users - only $TEST_USERS (minimum 3 recommended)${NC}"
    echo "   Need at least: 1 admin, 1 teacher, 1 student"
    ISSUES_FOUND=1
fi

if [ "$PROFILES_COUNT" -lt "$TEST_USERS" ]; then
    echo -e "\n${RED}❌ CRITICAL: Profiles count ($PROFILES_COUNT) less than users count ($TEST_USERS)${NC}"
    echo "   Some users don't have profiles"
    ISSUES_FOUND=1
fi

# Final verdict
echo ""
if [ "$ISSUES_FOUND" -eq 1 ]; then
    echo -e "${RED}❌ DATABASE QUALITY CHECK FAILED${NC}"
    echo "Please review the issues above before committing"
    exit 1
else
    echo -e "${GREEN}✅ DATABASE QUALITY CHECK PASSED${NC}"
    echo "Database contains sufficient test data and no critical issues"
fi