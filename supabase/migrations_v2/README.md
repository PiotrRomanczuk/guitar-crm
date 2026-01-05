# Consolidated Migrations (v2)

This folder contains a **clean, consolidated** version of the database migrations.

## Purpose

The original `migrations/` folder accumulated 58 migration files over time with many:
- Incremental column additions
- Bug fixes
- Policy corrections
- Schema restructuring

This `migrations_v2/` folder consolidates everything into **28 clean migration files** that create the same final database state.

## Migration Files

| # | File | Purpose |
|---|------|---------|
| 001 | `001_drop_all.sql` | Drop all existing objects |
| 002 | `002_create_enums.sql` | All enum types |
| 003 | `003_create_functions.sql` | All utility functions |
| 004 | `004_create_profiles_table.sql` | Profiles table |
| 005 | `005_create_user_roles_table.sql` | User roles table |
| 006 | `006_create_songs_table.sql` | Songs table (complete) |
| 007 | `007_create_lessons_table.sql` | Lessons table |
| 008 | `008_create_lesson_songs_table.sql` | Lesson-songs junction |
| 009 | `009_create_assignments_table.sql` | Assignments table |
| 010 | `010_create_assignment_templates_table.sql` | Assignment templates |
| 011 | `011_create_api_keys_table.sql` | API keys for bearer auth |
| 012 | `012_create_user_integrations_table.sql` | OAuth integrations |
| 013 | `013_create_webhook_subscriptions_table.sql` | Webhook subscriptions |
| 014 | `014_create_practice_sessions_table.sql` | Practice sessions |
| 015 | `015_create_song_status_history_table.sql` | Song status history |
| 016 | `016_create_views.sql` | All views |
| 017 | `017_create_triggers.sql` | All triggers |
| 018 | `018_enable_rls.sql` | Enable RLS on all tables |
| 019 | `019_rls_profiles.sql` | Profiles RLS policies |
| 020 | `020_rls_user_roles.sql` | User roles RLS policies |
| 021 | `021_rls_songs.sql` | Songs RLS policies |
| 022 | `022_rls_lessons.sql` | Lessons RLS policies |
| 023 | `023_rls_lesson_songs.sql` | Lesson songs RLS policies |
| 024 | `024_rls_assignments.sql` | Assignments RLS policies |
| 025 | `025_rls_other_tables.sql` | RLS for remaining tables |
| 026 | `026_storage_policies.sql` | Storage bucket policies |
| 027 | `027_handle_new_user_trigger.sql` | Auth user trigger |
| 028 | `028_seed_initial_data.sql` | Seed data |

## Usage

### For Fresh Database

To use these consolidated migrations for a fresh database:

1. Back up the original migrations folder:
   ```bash
   mv supabase/migrations supabase/migrations_backup
   mv supabase/migrations_v2 supabase/migrations
   ```

2. Reset your local database:
   ```bash
   npx supabase db reset
   ```

### For Existing Databases

**DO NOT replace migrations on existing databases!** The original migrations have already been applied and are tracked in the `supabase_migrations` table.

## What Was Consolidated

### Removed/Consolidated Files

- **11 bug fix migrations** - Fixes incorporated into base files
- **8 column-addition migrations** - Columns added to original table definitions  
- **6 superseded RLS migrations** - Replaced by final versions
- **2 legacy table migrations** - `task_management` renamed to `assignments`

### Kept Items (But Unused)

The following items exist in the current database but are **unused**:
- `task_priority` enum - Legacy from task_management, not used in assignments
- `task_status` enum - Legacy from task_management, not used in assignments

These were intentionally left out of the consolidated migrations but exist in production.

## Comparison

| Metric | Original | Consolidated |
|--------|----------|--------------|
| Total files | 58 | 28 |
| Lines of SQL | ~3000 | ~1200 |
| Bug fix files | 11 | 0 |
| Policy rewrites | 8+ | 0 |

## Testing

Before switching to consolidated migrations:

1. Apply to a fresh local database
2. Run the test suite
3. Compare schema dump with original:
   ```bash
   npx supabase db dump --local --schema public > schema_v2.sql
   ```
