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

# Check assignments
echo -e "\n${YELLOW}Checking assignments:${NC}"
ASSIGNMENTS_COUNT=$(run_query "SELECT COUNT(*) FROM public.assignments;")
echo "Total assignments: $ASSIGNMENTS_COUNT"

# Check assignment distribution by status
echo "Assignment status distribution:"
run_query "SELECT status, COUNT(*) FROM public.assignments GROUP BY status ORDER BY status;"

# Check average practice minutes by level
echo -e "\n${YELLOW}Average practice minutes by song level:${NC}"
run_query "
    SELECT s.level, 
           ROUND(AVG(a.practice_minutes)) as avg_minutes,
           COUNT(*) as assignment_count
    FROM public.assignments a
    JOIN public.songs s ON s.id = a.song_id
    GROUP BY s.level
    ORDER BY 
        CASE 
            WHEN s.level = 'beginner' THEN 1
            WHEN s.level = 'intermediate' THEN 2
            WHEN s.level = 'advanced' THEN 3
        END;
"

# Check assignments without feedback
PENDING_REVIEW=$(run_query "
    SELECT COUNT(*) 
    FROM public.assignments 
    WHERE status = 'completed' 
    AND (feedback IS NULL OR reviewed_at IS NULL);
")
if [ "$PENDING_REVIEW" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $PENDING_REVIEW completed assignments pending review${NC}"
fi

# Check for assignments without due dates
NO_DUE_DATE=$(run_query "SELECT COUNT(*) FROM public.assignments WHERE due_date IS NULL;")
if [ "$NO_DUE_DATE" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $NO_DUE_DATE assignments missing due dates${NC}"
fi

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

# Check for any critical issues
if [ "$REAL_EMAILS" -gt 0 ] || [ "$ORPHANED_LESSON_SONGS" -gt 0 ]; then
    echo -e "\n${RED}⚠️  CRITICAL ISSUES FOUND${NC}"
    echo "Please review the warnings above"
    exit 1
else
    echo -e "\n${GREEN}✅ DATABASE QUALITY CHECK PASSED${NC}"
fi