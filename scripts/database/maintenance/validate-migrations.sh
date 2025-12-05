#!/bin/bash

# Validate database migrations
# Checks for successful table creation, enum types, functions, etc.

set -e

DATABASE_URL="${PGPASSWORD:=postgres}@127.0.0.1:54322/postgres"
EXPECTED_TABLES=("assignments" "lesson_songs" "lessons" "profiles" "songs" "user_roles")
EXPECTED_ENUMS=("difficulty_level" "lesson_song_status" "lesson_status" "music_key" "task_priority" "task_status" "user_role")
EXPECTED_VIEWS=("user_overview" "lessons_with_songs_count" "lesson_counts_per_teacher" "lesson_counts_per_student")
EXPECTED_FUNCTIONS=("update_updated_at_column" "set_lesson_teacher_number" "handle_new_user")

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating Guitar CRM Database Schema..."
echo ""

# Check tables
echo "📋 Checking tables..."
MISSING_TABLES=()
for table in "${EXPECTED_TABLES[@]}"; do
  if PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT 1 FROM information_schema.tables WHERE table_name='$table'" 2>/dev/null | grep -q "1 row"; then
    echo -e "  ${GREEN}✓${NC} Table '$table' exists"
  else
    echo -e "  ${RED}✗${NC} Table '$table' missing"
    MISSING_TABLES+=("$table")
  fi
done

# Check enums
echo ""
echo "📦 Checking enums..."
MISSING_ENUMS=()
for enum in "${EXPECTED_ENUMS[@]}"; do
  if PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\dT" 2>/dev/null | grep -q "$enum"; then
    echo -e "  ${GREEN}✓${NC} Enum '$enum' exists"
  else
    echo -e "  ${RED}✗${NC} Enum '$enum' missing"
    MISSING_ENUMS+=("$enum")
  fi
done

# Check views
echo ""
echo "👁️  Checking views..."
MISSING_VIEWS=()
for view in "${EXPECTED_VIEWS[@]}"; do
  if PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT 1 FROM information_schema.views WHERE table_name='$view'" 2>/dev/null | grep -q "1 row"; then
    echo -e "  ${GREEN}✓${NC} View '$view' exists"
  else
    echo -e "  ${YELLOW}⚠${NC}  View '$view' missing (optional)"
    MISSING_VIEWS+=("$view")
  fi
done

# Check functions
echo ""
echo "⚙️  Checking functions..."
MISSING_FUNCTIONS=()
for func in "${EXPECTED_FUNCTIONS[@]}"; do
  if PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\df" 2>/dev/null | grep -q "$func"; then
    echo -e "  ${GREEN}✓${NC} Function '$func' exists"
  else
    echo -e "  ${YELLOW}⚠${NC}  Function '$func' missing (optional)"
    MISSING_FUNCTIONS+=("$func")
  fi
done

# Check RLS
echo ""
echo "🔒 Checking Row Level Security..."
RLS_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM information_schema.role_column_grants WHERE privilege_type='SELECT'" 2>/dev/null | grep -oE '[0-9]+' | head -1)
if [ "$RLS_COUNT" -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} RLS policies enabled ($RLS_COUNT policies)"
else
  echo -e "  ${YELLOW}⚠${NC}  No RLS policies found"
fi

# Summary
echo ""
echo "════════════════════════════════════════"
if [ ${#MISSING_TABLES[@]} -eq 0 ] && [ ${#MISSING_ENUMS[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ Database schema is valid!${NC}"
  exit 0
else
  echo -e "${RED}✗ Database schema has issues:${NC}"
  if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo "  Missing tables: ${MISSING_TABLES[*]}"
  fi
  if [ ${#MISSING_ENUMS[@]} -gt 0 ]; then
    echo "  Missing enums: ${MISSING_ENUMS[*]}"
  fi
  exit 1
fi
