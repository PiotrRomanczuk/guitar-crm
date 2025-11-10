#!/bin/bash

# Apply all pending migrations sequentially
# Stops on first error to allow investigation

set -e

MIGRATIONS_DIR="supabase/migrations"
DB_HOST="${DB_HOST:=127.0.0.1}"
DB_PORT="${DB_PORT:=54322}"
DB_USER="${DB_USER:=postgres}"
DB_NAME="${DB_NAME:=postgres}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo -e "${RED}Error: Migrations directory not found: $MIGRATIONS_DIR${NC}"
  exit 1
fi

echo -e "${BLUE}🔧 Applying database migrations...${NC}"
echo "   Host: $DB_HOST:$DB_PORT"
echo ""

TOTAL=0
FAILED=0
SKIPPED=0

for migration_file in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$migration_file" ] || continue
  
  filename=$(basename "$migration_file")
  ((TOTAL++))
  
  echo -n "  [$TOTAL] $filename ... "
  
  # Run migration and capture output
  output=$(PGPASSWORD=postgres psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$migration_file" 2>&1 || true)
  
  # Check for actual errors (not just warnings/notices about existing objects)
  error_count=$(echo "$output" | grep -c "^ERROR:" || true)
  
  if [ "$error_count" -gt 0 ]; then
    # Check if these are "already exists" errors (non-fatal for idempotency)
    if echo "$output" | grep -q "already exists"; then
      echo -e "${YELLOW}⚠ already applied${NC}"
      ((SKIPPED++))
    else
      echo -e "${RED}✗ FAILED${NC}"
      echo ""
      echo "Error output:"
      echo "$output" | grep "^ERROR:" | head -5
      echo ""
      ((FAILED++))
      # Don't exit on this error - continue to show all failures
    fi
  else
    # Check for successful operations
    if echo "$output" | grep -qE "^CREATE|^ALTER|^DROP|^GRANT|^COMMENT"; then
      echo -e "${GREEN}✓ applied${NC}"
    else
      echo -e "${YELLOW}⚠ no changes${NC}"
      ((SKIPPED++))
    fi
  fi
done

echo ""
echo "════════════════════════════════════════"
echo -e "Results: ${GREEN}$((TOTAL - FAILED - SKIPPED)) applied${NC}, ${YELLOW}$SKIPPED skipped${NC}"

if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}$FAILED migrations failed${NC}"
  exit 1
else
  echo -e "${GREEN}✓ All migrations processed successfully!${NC}"
  exit 0
fi
