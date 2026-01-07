# Database Migration Cleanup Analysis

> Generated: 2026-01-05
> Branch: `feature/database-migration-cleanup`

## Executive Summary

The current database has **58 migration files** that have accumulated over time with many incremental fixes, column additions, and policy updates. This document analyzes the current state and proposes a consolidated migration structure.

---

## Part 1: Current Database State

### Enums (7 types)

| Enum Name | Values |
|-----------|--------|
| `assignment_status` | `not_started`, `in_progress`, `completed`, `overdue`, `cancelled` |
| `difficulty_level` | `beginner`, `intermediate`, `advanced` |
| `lesson_song_status` | `to_learn`, `started`, `remembered`, `with_author`, `mastered` |
| `lesson_status` | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `RESCHEDULED` |
| `music_key` | `C`, `C#`, `Db`, `D`, `D#`, `Eb`, `E`, `F`, `F#`, `Gb`, `G`, `G#`, `Ab`, `A`, `A#`, `Bb`, `B`, `Cm`, `C#m`, `Dm`, `D#m`, `Ebm`, `Em`, `Fm`, `F#m`, `Gm`, `G#m`, `Am`, `A#m`, `Bbm`, `Bm` |
| `task_priority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` (⚠️ UNUSED - legacy from task_management) |
| `task_status` | `OPEN`, `IN_PROGRESS`, `PENDING_REVIEW`, `COMPLETED`, `CANCELLED`, `BLOCKED` (⚠️ UNUSED - legacy) |
| `user_role` | `admin`, `teacher`, `student` |

### Tables (12 tables)

#### 1. `profiles`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | YES | - | FK → auth.users |
| `email` | text | NO | - | UNIQUE, with email check constraint |
| `full_name` | text | YES | - | |
| `avatar_url` | text | YES | - | |
| `notes` | text | YES | - | |
| `phone` | text | YES | - | |
| `is_admin` | boolean | NO | false | |
| `is_teacher` | boolean | NO | false | |
| `is_student` | boolean | NO | false | |
| `is_development` | boolean | NO | false | |
| `is_active` | boolean | NO | true | |
| `is_shadow` | boolean | YES | false | Shadow users created by teachers |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

#### 2. `user_roles`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | - | FK → profiles.id |
| `role` | user_role | NO | - | |
| `assigned_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(user_id, role)

#### 3. `songs`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `title` | text | NO | - | |
| `author` | text | NO | - | |
| `level` | difficulty_level | NO | - | |
| `key` | music_key | NO | - | |
| `ultimate_guitar_link` | text | YES | - | Made optional |
| `chords` | text | YES | - | |
| `short_title` | varchar(50) | YES | - | Abbreviated title |
| `youtube_url` | text | YES | - | |
| `gallery_images` | text[] | YES | - | |
| `spotify_link_url` | text | YES | - | |
| `capo_fret` | integer | YES | - | 0-20 |
| `strumming_pattern` | text | YES | - | |
| `category` | text | YES | - | |
| `tempo` | integer | YES | - | BPM |
| `time_signature` | integer | YES | - | Numerator |
| `duration_ms` | integer | YES | - | |
| `release_year` | integer | YES | - | |
| `cover_image_url` | text | YES | - | |
| `audio_files` | jsonb | YES | {} | |
| `deleted_at` | timestamptz | YES | - | Soft delete |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

#### 4. `lessons`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `teacher_id` | uuid | NO | - | FK → profiles.id |
| `student_id` | uuid | NO | - | FK → profiles.id |
| `lesson_teacher_number` | integer | NO | - | Auto-set by trigger |
| `scheduled_at` | timestamptz | NO | - | |
| `status` | lesson_status | NO | SCHEDULED | |
| `notes` | text | YES | - | |
| `title` | text | YES | - | |
| `google_event_id` | text | YES | - | UNIQUE |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(teacher_id, student_id, lesson_teacher_number)

#### 5. `lesson_songs`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `lesson_id` | uuid | NO | - | FK → lessons.id |
| `song_id` | uuid | NO | - | FK → songs.id |
| `status` | lesson_song_status | NO | to_learn | |
| `notes` | text | YES | - | |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

**Constraints:** UNIQUE(lesson_id, song_id)

#### 6. `assignments`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `title` | text | NO | - | |
| `description` | text | YES | - | |
| `status` | assignment_status | NO | not_started | |
| `due_date` | timestamptz | YES | - | |
| `teacher_id` | uuid | NO | - | FK → profiles.id |
| `student_id` | uuid | NO | - | FK → profiles.id |
| `lesson_id` | uuid | YES | - | FK → lessons.id |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

#### 7. `assignment_templates`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `title` | text | NO | - | |
| `description` | text | YES | - | |
| `teacher_id` | uuid | NO | - | FK → profiles.id |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

#### 8. `api_keys`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | - | FK → auth.users |
| `name` | text | NO | - | |
| `key_hash` | text | NO | - | UNIQUE |
| `last_used_at` | timestamptz | YES | - | |
| `is_active` | boolean | NO | true | |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

#### 9. `user_integrations`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `user_id` | uuid | NO | - | PK (composite), FK → auth.users |
| `provider` | text | NO | - | PK (composite) |
| `access_token` | text | YES | - | |
| `refresh_token` | text | YES | - | |
| `expires_at` | bigint | YES | - | Timestamp in ms |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

#### 10. `webhook_subscriptions`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | - | FK → auth.users |
| `provider` | text | NO | - | |
| `channel_id` | text | NO | - | UNIQUE |
| `resource_id` | text | NO | - | |
| `expiration` | bigint | NO | - | |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

#### 11. `practice_sessions`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `student_id` | uuid | YES | - | FK → profiles.id |
| `song_id` | uuid | YES | - | FK → songs.id |
| `duration_minutes` | integer | NO | - | |
| `notes` | text | YES | - | |
| `created_at` | timestamptz | YES | now() | |
| `updated_at` | timestamptz | YES | now() | |

#### 12. `song_status_history` (⚠️ Not yet applied)
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `student_id` | uuid | NO | - | FK → auth.users |
| `song_id` | uuid | NO | - | FK → songs.id |
| `previous_status` | text | YES | - | |
| `new_status` | text | NO | - | |
| `changed_at` | timestamptz | YES | now() | |
| `notes` | text | YES | - | |
| `created_at` | timestamptz | YES | now() | |

### Views (4 views)

1. **`user_overview`** - Shows user info with role flags from user_roles
2. **`lesson_counts_per_teacher`** - Aggregates lessons by teacher
3. **`lesson_counts_per_student`** - Aggregates lessons by student
4. **`song_usage_stats`** - Shows how often each song is assigned

### Functions (10 functions)

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Trigger function for new auth.users - handles shadow user linking |
| `has_active_lesson_assignments(song_uuid)` | Checks if song has active lesson assignments |
| `has_role(_role)` | Checks if current user has a specific role |
| `is_admin()` | Checks if current user is admin (via user_roles) |
| `is_student()` | Checks if current user is student (via profiles) |
| `is_teacher()` | Checks if current user is teacher (via profiles) |
| `set_lesson_numbers()` | Auto-sets lesson_teacher_number on insert |
| `soft_delete_song_with_cascade(song_uuid, user_uuid)` | Soft deletes song with cascade |
| `sync_profile_roles()` | Syncs profile boolean flags to user_roles |
| `update_updated_at_column()` | Updates updated_at timestamp |

### Triggers (10 triggers)

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| `handle_updated_at` | user_integrations | BEFORE UPDATE | update_updated_at_column |
| `handle_updated_at` | webhook_subscriptions | BEFORE UPDATE | update_updated_at_column |
| `trigger_set_lesson_numbers` | lessons | BEFORE INSERT | set_lesson_numbers |
| `trigger_sync_profile_roles` | profiles | AFTER INSERT/UPDATE | sync_profile_roles |
| `trigger_update_updated_at` | assignments | BEFORE UPDATE | update_updated_at_column |
| `trigger_update_updated_at` | lesson_songs | BEFORE UPDATE | update_updated_at_column |
| `trigger_update_updated_at` | lessons | BEFORE UPDATE | update_updated_at_column |
| `trigger_update_updated_at` | profiles | BEFORE UPDATE | update_updated_at_column |
| `trigger_update_updated_at` | songs | BEFORE UPDATE | update_updated_at_column |
| `update_assignment_templates_updated_at` | assignment_templates | BEFORE UPDATE | update_updated_at_column |
| `update_profiles_updated_at` | profiles | BEFORE UPDATE | update_updated_at_column |

⚠️ Note: `profiles` has TWO update triggers doing the same thing (redundant)

### Indexes (18 indexes)

- `idx_api_keys_key_hash`, `idx_api_keys_user_id`
- `idx_lessons_google_event_id`
- `idx_profiles_user_id`
- `idx_songs_deleted_at`
- `lesson_songs_lesson_id_idx`, `lesson_songs_song_id_idx`
- `lessons_student_id_idx`, `lessons_teacher_id_idx`
- `practice_sessions_created_at_idx`, `practice_sessions_student_id_idx`
- `profiles_email_idx`
- `songs_author_idx`, `songs_title_idx`
- `user_roles_role_idx`, `user_roles_user_id_idx`

### RLS Policies

All tables have RLS enabled with comprehensive policies. See database dump for details.

---

## Part 2: Migration File Analysis

### Current Migration Files (58 total)

#### Category: Core Schema (13 files) ✅
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251107121000_drop_all.sql` | Drop everything | KEEP (first migration) |
| `20251107121500_create_enums.sql` | Create all enums | CONSOLIDATE |
| `20251107122000_create_profiles_table.sql` | Create profiles | CONSOLIDATE |
| `20251107122500_create_user_roles_table.sql` | Create user_roles | CONSOLIDATE |
| `20251107123000_create_songs_table.sql` | Create songs | CONSOLIDATE |
| `20251107123500_create_lessons_table.sql` | Create lessons | CONSOLIDATE |
| `20251107124000_create_lesson_songs_table.sql` | Create lesson_songs | CONSOLIDATE |
| `20251107124500_create_task_management_table.sql` | Create task_management | REMOVE (renamed) |
| `20251107125000_create_update_updated_at_column_function.sql` | Create function | CONSOLIDATE |
| `20251107125500_create_handle_new_user_function.sql` | Create function | CONSOLIDATE |
| `20251107130000_create_set_lesson_numbers_function.sql` | Create function | CONSOLIDATE |
| `20251107130500_create_triggers.sql` | Create triggers | CONSOLIDATE |
| `20251107131000_enable_rls_policies.sql` | Enable RLS | CONSOLIDATE |

#### Category: RLS Policies (6 files) ⚠️ Mostly Superseded
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251107131510_rls_profiles.sql` | Profiles RLS | SUPERSEDED |
| `20251107131520_rls_user_roles.sql` | User roles RLS | SUPERSEDED |
| `20251107131530_rls_songs.sql` | Songs RLS | SUPERSEDED |
| `20251107131540_rls_lessons.sql` | Lessons RLS | SUPERSEDED |
| `20251107131550_rls_lesson_songs.sql` | Lesson songs RLS | SUPERSEDED |
| `20251107131560_rls_task_management.sql` | Task mgmt RLS | REMOVE (table renamed) |

#### Category: Views & Seed Data (3 files) ✅
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251107132000_create_user_overview_view.sql` | User overview view | CONSOLIDATE |
| `20251107132500_create_reporting_views.sql` | Reporting views | CONSOLIDATE |
| `20251107133000_seed_initial_data.sql` | Seed data | KEEP SEPARATE |

#### Category: Schema Changes (11 files) 🔄 To Consolidate
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251108000000_rename_task_management_to_assignments.sql` | Rename table | CONSOLIDATE into assignments |
| `20251109195040_add_soft_delete_to_songs.sql` | Add deleted_at | CONSOLIDATE into songs |
| `20251109224158_add_short_title_to_songs.sql` | Add short_title | CONSOLIDATE into songs |
| `20251112000000_restructure_assignments_table.sql` | Restructure | CONSOLIDATE into assignments |
| `20251125120000_add_title_to_lessons.sql` | Add title | CONSOLIDATE into lessons |
| `20251126120000_add_google_event_id_to_lessons.sql` | Add google_event_id | CONSOLIDATE into lessons |
| `20251126120500_add_phone_to_profiles.sql` | Add phone | CONSOLIDATE into profiles |
| `20251127000001_add_shadow_user_flag.sql` | Add is_shadow | CONSOLIDATE into profiles |
| `20251212000001_add_youtube_and_gallery_to_songs.sql` | Add youtube/gallery | CONSOLIDATE into songs |
| `20251220000000_add_spotify_fields_to_songs.sql` | Add spotify fields | CONSOLIDATE into songs |
| `20251220000001_add_more_spotify_fields.sql` | Add more fields | CONSOLIDATE into songs |
| `20251220000002_add_cover_image_to_songs.sql` | Add cover_image | CONSOLIDATE into songs |
| `20251221000000_make_ultimate_guitar_link_optional.sql` | Make optional | CONSOLIDATE into songs |
| `20260104000000_add_song_metadata_columns.sql` | Add metadata | CONSOLIDATE into songs |

#### Category: New Tables (6 files) ✅ Keep
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251126000000_create_user_integrations_table.sql` | User integrations | CONSOLIDATE |
| `20251209000000_create_api_keys_table.sql` | API keys | CONSOLIDATE |
| `20251211000000_create_assignment_templates_table.sql` | Assignment templates | CONSOLIDATE |
| `20251212000000_create_webhook_subscriptions_table.sql` | Webhook subs | CONSOLIDATE |
| `20260105_practice_sessions.sql` | Practice sessions | CONSOLIDATE |
| `20260105_song_status_history.sql` | Song status history | KEEP (new) |

#### Category: Bug Fixes (10 files) ❌ Remove After Consolidation
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251109222242_fix_songs_insert_policy.sql` | Fix policy | REMOVE |
| `20251109223053_cleanup_duplicate_songs_policies.sql` | Cleanup | REMOVE |
| `20251127000000_fix_shadow_user_linking.sql` | Fix FK | REMOVE |
| `20251128000000_google_calendar_import.sql` | Mixed fix | REMOVE |
| `20251128120000_fix_profiles_schema.sql` | Fix schema | REMOVE |
| `20251128130000_fix_rls_recursion.sql` | Fix RLS | REMOVE |
| `20251128140000_fix_rls_recursion_v2.sql` | Fix RLS v2 | REMOVE |
| `20251208000003_fix_shadow_user_linking_v2.sql` | Fix linking | KEEP (final version) |
| `20251215000000_fix_auth_trigger.sql` | Fix trigger | REMOVE |

#### Category: Data Migrations (2 files) 🔄
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251125000000_migrate_roles_to_user_roles.sql` | Migrate roles | KEEP SEPARATE |
| `20251203000000_sync_user_roles.sql` | Sync roles | CONSOLIDATE |

#### Category: RLS Refinements (4 files) ✅ Final versions only
| File | Purpose | Keep/Consolidate |
|------|---------|------------------|
| `20251208000000_restrict_student_songs.sql` | Restrict songs | CONSOLIDATE |
| `20251208000001_restrict_student_lessons_assignments.sql` | Restrict lessons | CONSOLIDATE |
| `20251208000002_restrict_lesson_songs.sql` | Restrict lesson_songs | CONSOLIDATE |
| `20251219000000_add_storage_policy.sql` | Storage policy | KEEP SEPARATE |

---

## Part 3: Cleanup TODO List

### Phase 1: Create Consolidated Migration Structure

**Proposed new migration files:**

```
migrations_v2/
├── 001_drop_all.sql                    # Drop everything (from original)
├── 002_create_enums.sql                # All enums including assignment_status
├── 003_create_functions.sql            # All utility functions
├── 004_create_profiles_table.sql       # Complete profiles with all columns
├── 005_create_user_roles_table.sql     # User roles
├── 006_create_songs_table.sql          # Complete songs with all columns
├── 007_create_lessons_table.sql        # Complete lessons with all columns
├── 008_create_lesson_songs_table.sql   # Lesson songs junction
├── 009_create_assignments_table.sql    # Assignments (not task_management)
├── 010_create_assignment_templates_table.sql
├── 011_create_api_keys_table.sql
├── 012_create_user_integrations_table.sql
├── 013_create_webhook_subscriptions_table.sql
├── 014_create_practice_sessions_table.sql
├── 015_create_song_status_history_table.sql
├── 016_create_views.sql                # All views
├── 017_create_triggers.sql             # All triggers
├── 018_enable_rls.sql                  # Enable RLS on all tables
├── 019_rls_profiles.sql                # Final RLS for profiles
├── 020_rls_user_roles.sql              # Final RLS for user_roles
├── 021_rls_songs.sql                   # Final RLS for songs
├── 022_rls_lessons.sql                 # Final RLS for lessons
├── 023_rls_lesson_songs.sql            # Final RLS for lesson_songs
├── 024_rls_assignments.sql             # Final RLS for assignments
├── 025_rls_other_tables.sql            # RLS for remaining tables
├── 026_storage_policies.sql            # Storage bucket policies
├── 027_create_indexes.sql              # All indexes
├── 028_seed_initial_data.sql           # Seed data
└── 029_handle_new_user_trigger.sql     # Auth trigger (final version)
```

### Phase 2: Cleanup Items

- [ ] **Remove unused enums:** `task_priority`, `task_status`
- [ ] **Remove duplicate triggers:** `profiles` has two `updated_at` triggers
- [ ] **Consolidate songs columns:** 8+ migrations added columns one by one
- [ ] **Remove superseded policies:** Many policies were dropped and recreated
- [ ] **Fix inconsistent RLS checks:** Some use `has_role()`, some query profiles directly

### Phase 3: Testing

- [ ] Create new migrations folder `migrations_v2/`
- [ ] Reset local database
- [ ] Apply new migrations
- [ ] Run test suite
- [ ] Compare schema dump with original

---

## Part 4: Recommendations

### Immediate Actions

1. **Do NOT modify production migrations** - they are immutable history
2. **Create new consolidated migrations** in a separate folder for comparison
3. **Test thoroughly** before replacing

### Long-term Strategy

1. **For fresh deployments:** Use consolidated migrations
2. **For existing deployments:** Migrations already applied, no action needed
3. **Document the consolidation** for future reference

### Items to Remove/Cleanup

| Item | Type | Reason |
|------|------|--------|
| `task_priority` enum | Unused | Legacy from task_management |
| `task_status` enum | Unused | Legacy from task_management |
| `update_profiles_updated_at` trigger | Duplicate | Same as `trigger_update_updated_at` |
| `link_shadow_profile` function | Removed | Already dropped, but referenced in migrations |

---

## Part 5: File-by-File Cleanup Decisions

| # | Original File | Decision | Notes |
|---|---------------|----------|-------|
| 1 | 20251107121000_drop_all.sql | KEEP | Required first migration |
| 2 | 20251107121500_create_enums.sql | MERGE | Into 002_create_enums |
| 3 | 20251107122000_create_profiles_table.sql | MERGE | Into 004_create_profiles |
| 4 | 20251107122500_create_user_roles_table.sql | MERGE | Into 005_create_user_roles |
| 5 | 20251107123000_create_songs_table.sql | MERGE | Into 006_create_songs (with all columns) |
| 6 | 20251107123500_create_lessons_table.sql | MERGE | Into 007_create_lessons |
| 7 | 20251107124000_create_lesson_songs_table.sql | MERGE | Into 008_create_lesson_songs |
| 8 | 20251107124500_create_task_management_table.sql | DELETE | Renamed to assignments |
| 9 | 20251107125000_create_update_updated_at_column_function.sql | MERGE | Into 003_create_functions |
| 10 | 20251107125500_create_handle_new_user_function.sql | MERGE | Into 029_handle_new_user |
| 11 | 20251107130000_create_set_lesson_numbers_function.sql | MERGE | Into 003_create_functions |
| 12 | 20251107130500_create_triggers.sql | MERGE | Into 017_create_triggers |
| 13 | 20251107131000_enable_rls_policies.sql | MERGE | Into 018_enable_rls |
| 14 | 20251107131510_rls_profiles.sql | SUPERSEDED | Replaced by later migrations |
| 15 | 20251107131520_rls_user_roles.sql | SUPERSEDED | Replaced by fix_rls_recursion |
| 16 | 20251107131530_rls_songs.sql | SUPERSEDED | Replaced by restrict_student_songs |
| 17 | 20251107131540_rls_lessons.sql | SUPERSEDED | Replaced by restrict_student_lessons |
| 18 | 20251107131550_rls_lesson_songs.sql | SUPERSEDED | Replaced by restrict_lesson_songs |
| 19 | 20251107131560_rls_task_management.sql | DELETE | Table renamed |
| 20 | 20251107132000_create_user_overview_view.sql | MERGE | Into 016_create_views |
| 21 | 20251107132500_create_reporting_views.sql | MERGE | Into 016_create_views |
| 22 | 20251107133000_seed_initial_data.sql | KEEP | Seed data |
| 23 | 20251108000000_rename_task_management_to_assignments.sql | OBSOLETE | Assignments created directly |
| 24 | 20251109195040_add_soft_delete_to_songs.sql | MERGE | Into 006_create_songs |
| 25 | 20251109222242_fix_songs_insert_policy.sql | OBSOLETE | Fixed in later migration |
| 26 | 20251109223053_cleanup_duplicate_songs_policies.sql | OBSOLETE | Cleanup |
| 27 | 20251109224158_add_short_title_to_songs.sql | MERGE | Into 006_create_songs |
| 28 | 20251112000000_restructure_assignments_table.sql | MERGE | Into 009_create_assignments |
| 29 | 20251125000000_migrate_roles_to_user_roles.sql | KEEP | Data migration (for existing DBs) |
| 30 | 20251125120000_add_title_to_lessons.sql | MERGE | Into 007_create_lessons |
| 31 | 20251126000000_create_user_integrations_table.sql | MERGE | Into 012_create_user_integrations |
| 32 | 20251126120000_add_google_event_id_to_lessons.sql | MERGE | Into 007_create_lessons |
| 33 | 20251126120500_add_phone_to_profiles.sql | MERGE | Into 004_create_profiles |
| 34 | 20251127000000_fix_shadow_user_linking.sql | OBSOLETE | Fixed in v2 |
| 35 | 20251127000001_add_shadow_user_flag.sql | MERGE | Into 004_create_profiles |
| 36 | 20251128000000_google_calendar_import.sql | OBSOLETE | Superseded |
| 37 | 20251128120000_fix_profiles_schema.sql | OBSOLETE | Fixed |
| 38 | 20251128130000_fix_rls_recursion.sql | OBSOLETE | Fixed in v2 |
| 39 | 20251128140000_fix_rls_recursion_v2.sql | MERGE | Into 003_create_functions |
| 40 | 20251203000000_sync_user_roles.sql | MERGE | Into 017_create_triggers |
| 41 | 20251208000000_restrict_student_songs.sql | MERGE | Into 021_rls_songs |
| 42 | 20251208000001_restrict_student_lessons_assignments.sql | MERGE | Into 022_rls_lessons + 024_rls_assignments |
| 43 | 20251208000002_restrict_lesson_songs.sql | MERGE | Into 023_rls_lesson_songs |
| 44 | 20251208000003_fix_shadow_user_linking_v2.sql | MERGE | Into 029_handle_new_user |
| 45 | 20251209000000_create_api_keys_table.sql | MERGE | Into 011_create_api_keys |
| 46 | 20251211000000_create_assignment_templates_table.sql | MERGE | Into 010_create_assignment_templates |
| 47 | 20251212000000_create_webhook_subscriptions_table.sql | MERGE | Into 013_create_webhook_subscriptions |
| 48 | 20251212000001_add_youtube_and_gallery_to_songs.sql | MERGE | Into 006_create_songs |
| 49 | 20251215000000_fix_auth_trigger.sql | OBSOLETE | Fixed |
| 50 | 20251219000000_add_storage_policy.sql | KEEP | Storage policy |
| 51 | 20251220000000_add_spotify_fields_to_songs.sql | MERGE | Into 006_create_songs |
| 52 | 20251220000001_add_more_spotify_fields.sql | MERGE | Into 006_create_songs |
| 53 | 20251220000002_add_cover_image_to_songs.sql | MERGE | Into 006_create_songs |
| 54 | 20251221000000_make_ultimate_guitar_link_optional.sql | MERGE | Into 006_create_songs |
| 55 | 20260104000000_add_song_metadata_columns.sql | MERGE | Into 006_create_songs |
| 56 | 20260105_practice_sessions.sql | MERGE | Into 014_create_practice_sessions |
| 57 | 20260105_song_status_history.sql | MERGE | Into 015_create_song_status_history |

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| Keep as-is | 3 | drop_all, seed_data, storage_policy |
| Merge into consolidated | 44 | Combine into ~29 clean files |
| Delete (obsolete) | 11 | Bug fixes, superseded migrations |
| **Total Original** | **58** | |
| **Total Consolidated** | **~29** | **50% reduction** |
