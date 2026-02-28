---
name: migration-gate
description: Preview, validate, and dry-run Supabase database migrations before production. Use when reviewing pending migrations, checking for anti-patterns, generating rollback scripts, or validating schema changes before merge.
---

# Migration Gate

## Overview

Safety net for database migrations. Validates SQL for anti-patterns, previews schema diffs, generates rollback scripts, and enforces a pre-merge checklist. Catches issues that `continue-on-error: true` in CI silently lets through.

## Usage

When invoked, ask for the action:

1. **preview** -- show pending migrations not yet applied
2. **validate** -- check SQL files for anti-patterns
3. **dry-run** -- test migration on a dev branch
4. **rollback-gen** -- generate rollback SQL for a migration
5. **checklist** -- run full pre-merge validation

Default: run `validate` on any new/modified migration files.

## Execution Steps

### Action: Preview

List migrations and their apply status:

```bash
# List all migration files
ls -la supabase/migrations/*.sql | wc -l

# List applied migrations via Supabase MCP
mcp__supabase__list_migrations()

# Find unapplied migrations
# Compare file list vs applied list
```

Show table:

| File | Status | Size | Description |
|------|--------|------|-------------|
| 044_song_video_production_quality.sql | Applied | 2.1KB | Add production quality fields |
| 20260214000001_auth_lockout.sql | Pending | 4.3KB | Auth lockout and deletion |

### Action: Validate

Scan migration SQL for anti-patterns:

#### Critical Anti-Patterns (block merge)

```
Pattern: DROP TABLE without IF EXISTS
Grep:    DROP TABLE(?!\s+IF\s+EXISTS)
Risk:    Fails if table doesn't exist, breaks idempotency

Pattern: DROP COLUMN without backup
Grep:    ALTER TABLE.*DROP COLUMN
Risk:    Irreversible data loss

Pattern: NOT NULL without DEFAULT on existing table
Grep:    ADD COLUMN.*NOT NULL(?!.*DEFAULT)
Risk:    Fails on tables with existing rows

Pattern: New table without RLS
Check:   CREATE TABLE without matching ALTER TABLE.*ENABLE ROW LEVEL SECURITY
Risk:    Security gap -- all tables must have RLS
```

#### Warning Anti-Patterns (flag for review)

```
Pattern: CREATE INDEX without CONCURRENTLY
Risk:    Locks table during index creation

Pattern: ALTER TYPE on column with data
Risk:    May fail or lose data depending on cast

Pattern: TRUNCATE or DELETE without WHERE
Risk:    Full table wipe

Pattern: Hardcoded UUIDs or IDs
Risk:    Environment-specific, breaks on other instances

Pattern: Missing IF NOT EXISTS on CREATE
Risk:    Non-idempotent, fails on re-run
```

#### Validation Script

```bash
# For each migration file:
FILE="supabase/migrations/<name>.sql"

# Check for DROP TABLE without IF EXISTS
grep -n "DROP TABLE" "$FILE" | grep -v "IF EXISTS"

# Check for new tables without RLS
TABLES=$(grep -oP "CREATE TABLE(?:\s+IF NOT EXISTS)?\s+\K\S+" "$FILE")
for TABLE in $TABLES; do
  grep -q "ENABLE ROW LEVEL SECURITY" "$FILE" && echo "OK: $TABLE has RLS" || echo "MISSING RLS: $TABLE"
done

# Check for NOT NULL without DEFAULT
grep -n "ADD COLUMN.*NOT NULL" "$FILE" | grep -v "DEFAULT"

# Check for destructive operations
grep -n "DROP COLUMN\|TRUNCATE\|DELETE FROM" "$FILE"
```

### Action: Dry-Run

Test migration on a Supabase dev branch:

```bash
# Create dev branch
mcp__supabase__create_branch(name="migration-test-<timestamp>")

# Apply migration
mcp__supabase__apply_migration(name="<migration_name>", query="<sql>")

# Run advisors to check for issues
mcp__supabase__get_advisors(type="security")
mcp__supabase__get_advisors(type="performance")

# Clean up
mcp__supabase__delete_branch(branch_id="<id>")
```

### Action: Rollback Generation

For each DDL statement, generate the reverse:

| Forward | Rollback |
|---------|----------|
| `CREATE TABLE foo (...)` | `DROP TABLE IF EXISTS foo;` |
| `ALTER TABLE foo ADD COLUMN bar ...` | `ALTER TABLE foo DROP COLUMN IF EXISTS bar;` |
| `CREATE INDEX idx ON foo (bar)` | `DROP INDEX IF EXISTS idx;` |
| `ALTER TABLE foo ENABLE RLS` | `ALTER TABLE foo DISABLE ROW LEVEL SECURITY;` |
| `CREATE POLICY p ON foo ...` | `DROP POLICY IF EXISTS p ON foo;` |
| `CREATE OR REPLACE FUNCTION f()` | `DROP FUNCTION IF EXISTS f();` |
| `CREATE TRIGGER t ON foo` | `DROP TRIGGER IF EXISTS t ON foo;` |

Output rollback as a new SQL file with `_rollback` suffix.

### Action: Checklist

Run full pre-merge validation:

```markdown
## Migration Pre-Merge Checklist

- [ ] **Idempotent**: All CREATE use IF NOT EXISTS, all DROP use IF EXISTS
- [ ] **RLS enabled**: Every new table has ENABLE ROW LEVEL SECURITY
- [ ] **RLS policies**: Every new table has at least one policy per role
- [ ] **Indexes**: Foreign keys have corresponding indexes
- [ ] **No data loss**: No DROP COLUMN or type changes without migration plan
- [ ] **Rollback ready**: Rollback script generated and reviewed
- [ ] **Tested on branch**: Dry-run passed on Supabase dev branch
- [ ] **Advisors clean**: No new security or performance warnings
- [ ] **Size reasonable**: Migration under 500 lines (split if larger)
- [ ] **Naming correct**: Timestamp format YYYYMMDDHHMMSS_description.sql
```

## Output Format

```markdown
# Migration Gate Report

## Files Analyzed
- `20260228120000_add_feature.sql` (127 lines)

## Validation Results

### Critical (must fix)
- **Line 15**: `DROP TABLE students` -- missing `IF EXISTS`
- **Line 42**: `CREATE TABLE new_feature` -- missing RLS

### Warnings (review recommended)
- **Line 28**: `CREATE INDEX` -- consider CONCURRENTLY for zero-downtime
- **Line 55**: Hardcoded UUID `'abc-123'` -- use generated ID

### Passed
- No NOT NULL without DEFAULT
- No TRUNCATE/DELETE without WHERE
- All foreign keys have indexes

## Rollback Script Generated
See: `supabase/migrations/20260228120000_add_feature_rollback.sql`

## Checklist: 8/10 passing
```

## Migration Naming Convention

```
# Numbered (legacy, 001-044)
001_extensions.sql

# Timestamp (current standard)
20260228120000_descriptive_name.sql
#  YYYY MM DD HH MM SS
```

## Error Handling

- **No migration files found**: check `supabase/migrations/` path
- **Supabase MCP unavailable**: run validation only (skip dry-run)
- **Branch creation fails**: report error, suggest manual testing

## Examples

**Input**: "Validate my new migration before I merge"

**Input**: "Generate rollback for the latest migration"

**Input**: "Run the full pre-merge checklist for migration 045"

**Input**: "Dry-run the pending migrations on a test branch"

## Key Files

- Migrations: `supabase/migrations/`
- RLS policies: `supabase/migrations/022_rls_policies.sql`
- CI pipeline: `.github/workflows/ci-cd.yml`
- Migration assistant skill: `.claude/skills/supabase-migration-assistant/`
