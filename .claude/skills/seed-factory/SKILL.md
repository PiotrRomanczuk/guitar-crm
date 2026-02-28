---
name: seed-factory
description: Generate realistic, interconnected seed data for the Strummy database using scenario presets. Use when setting up demo environments, testing edge cases, populating local dev, or creating student progression data.
---

# Seed Factory

## Overview

Generate realistic, interconnected seed data for Strummy's Supabase database. Supports scenario presets (fresh, demo, edge, student-journey) with configurable parameters. Data respects all foreign key relationships and uses real guitar teaching content.

**Data chain**: profiles -> songs -> lessons -> lesson_songs -> assignments

## Usage

```
/seed-factory fresh                           # Minimal: 1 teacher, 3 students, 10 songs
/seed-factory demo                            # Rich: 2 teachers, 10 students, 50 songs, 100 lessons
/seed-factory edge                            # Edge cases: empty states, max data, boundaries
/seed-factory student-journey                 # 1 student with full to_learn -> mastered arc
/seed-factory demo --students 20 --density dense --range 6months
/seed-factory cleanup                         # Delete all seeded data
```

## Scenario Presets

### fresh

Minimal data for a clean development environment.

| Entity | Count | Details |
|---|---|---|
| Teachers | 1 | Sarah Mitchell (sarah@strummy.app) |
| Students | 3 | Realistic names and emails |
| Songs | 10 | Mix of beginner/intermediate classics |
| Lessons | 6 | 2 per student (1 completed, 1 scheduled) |
| Lesson songs | 8 | 1-2 songs per completed lesson |
| Assignments | 3 | 1 per student, all `not_started` |

### demo

Rich data suitable for demonstrations and screenshots.

| Entity | Count | Details |
|---|---|---|
| Teachers | 2 | Sarah Mitchell + David Chen |
| Students | 10 | Spread across both teachers (6/4 split) |
| Songs | 50 | Full range: beginner to advanced |
| Lessons | 100 | Mix of completed, scheduled, cancelled, rescheduled |
| Lesson songs | 200 | Progression visible per student |
| Assignments | 40 | Mix of completed, in_progress, not_started, overdue |
| Practice records | 60 | Tied to assignments |

### edge

Data designed to test boundary conditions and empty states.

| Scenario | What it creates |
|---|---|
| Empty student | 1 student with 0 lessons, 0 assignments |
| Max lessons student | 1 student with 52 lessons (1 year of weekly) |
| All statuses | Songs in every status: to_learn, started, remembered, mastered |
| Overdue everything | 1 student with 5 overdue assignments |
| Cancelled streak | 1 student with 5 cancelled lessons in a row |
| Future-heavy | 1 student with 10 scheduled lessons, 0 completed |
| Same-day lessons | 2 lessons for same student on same day (conflict) |

### student-journey

One student's complete progression over 20 weekly lessons.

| Phase | Lessons | Songs | Status Progression |
|---|---|---|---|
| Weeks 1-5 | Basic chords | Wonderwall, Brown Eyed Girl | to_learn -> started |
| Weeks 6-10 | Strumming patterns | + Wish You Were Here | started -> remembered |
| Weeks 11-15 | Fingerpicking intro | + Blackbird, Nothing Else Matters | remembered -> mastered (early songs) |
| Weeks 16-20 | Performance prep | + Hotel California | Full cycle visible |

Each lesson includes realistic teacher notes documenting progress.

## Parameters

| Parameter | Values | Default | Description |
|---|---|---|---|
| `--students` | 1-50 | Preset default | Override student count |
| `--density` | sparse, normal, dense | normal | Lesson frequency |
| `--range` | 1month, 3months, 6months, 1year | 3months | Time range for historical data |
| `--output` | execute, sql | execute | Execute via MCP or generate SQL file |
| `--target` | local, remote | local | Which Supabase instance to target |

Density mapping:
- **sparse**: 1 lesson every 2 weeks per student
- **normal**: 1 lesson per week per student
- **dense**: 2 lessons per week per student

## Execution Steps

### Phase 1: Validate Environment

Check which execution method is available:

1. **Supabase MCP** (`mcp__supabase__execute_sql`): Preferred, executes directly
2. **SQL file output**: Generates a `.sql` file for manual execution

For local target, verify local Supabase is running:
```bash
curl -s http://127.0.0.1:54321/rest/v1/ -H "apikey: <anon-key>" | head -1
```

### Phase 2: Cleanup Existing Seed Data

Always clean up before seeding to avoid duplicates. Delete in reverse FK order:

```sql
-- Delete in dependency order (children first)
DELETE FROM lesson_songs WHERE lesson_id IN (
  SELECT id FROM lessons WHERE teacher_id IN (
    SELECT id FROM profiles WHERE email LIKE '%@strummy.app'
  )
);
DELETE FROM assignments WHERE teacher_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@strummy.app'
);
DELETE FROM lessons WHERE teacher_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@strummy.app'
);
-- Songs are shared, only delete seed-specific ones
DELETE FROM songs WHERE title IN ('Seed: ...') OR created_by IN (
  SELECT id FROM profiles WHERE email LIKE '%@strummy.app'
);
-- Profiles last (but keep auth.users -- use Supabase admin API for that)
DELETE FROM profiles WHERE email LIKE '%@strummy.app';
```

Seed data uses `@strummy.app` email domain for easy identification and cleanup.

### Phase 3: Generate Data

Build the data graph respecting FK relationships:

#### 3a. Profiles

Generate teacher and student profiles. Use `@strummy.app` emails.

```sql
INSERT INTO profiles (id, email, full_name, is_teacher, is_student, is_admin, is_development)
VALUES
  (gen_random_uuid(), 'sarah@strummy.app', 'Sarah Mitchell', true, false, false, true),
  (gen_random_uuid(), 'emma@strummy.app', 'Emma Johnson', false, true, false, true);
```

For auth.users, use Supabase admin API or note that profiles-only insertion works for most testing (auth is separate).

#### 3b. Songs

Use real guitar songs with accurate metadata (title, author, level, key). Core set: Wonderwall, Wish You Were Here, Hotel California, Blackbird, Nothing Else Matters, Stairway to Heaven, Brown Eyed Girl, Knockin on Heavens Door, Hallelujah, Tears in Heaven. Extended pool (demo/edge) adds 40 more across beginner/intermediate/advanced levels. Reference `scripts/database/seeding/import-100-classics.ts` for full catalog.

#### 3c. Lessons

Generate lessons with realistic scheduling:

```sql
INSERT INTO lessons (teacher_id, student_id, lesson_teacher_number, status, scheduled_at, notes)
VALUES
  (:teacher_id, :student_id, 1, 'COMPLETED',
   NOW() - INTERVAL '8 weeks',
   'First session: G, C, D open chords. Focus on clean shapes before transitions.');
```

Lesson statuses: `SCHEDULED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`

Status distribution for demo preset:
- 70% COMPLETED (past dates)
- 15% SCHEDULED (future dates)
- 10% CANCELLED (past dates, with cancellation reason)
- 5% RESCHEDULED (past dates, with new date)

#### 3d. Lesson Songs

Link songs to lessons with progression tracking:

```sql
INSERT INTO lesson_songs (lesson_id, song_id, status, notes)
VALUES
  (:lesson_id, :song_id, 'started', 'Working on chord transitions in verse');
```

Song statuses: `to_learn`, `started`, `remembered`, `mastered`

Progression rule: status advances by at most 1 step per lesson for the same song.

#### 3e. Assignments

Generate assignments with realistic due dates and descriptions:

```sql
INSERT INTO assignments (teacher_id, student_id, title, description, status, due_date)
VALUES
  (:teacher_id, :student_id,
   'Wonderwall chord transitions',
   'Practice G to Cadd9 to Dsus4 transitions for 20 minutes daily. Use metronome at 60 BPM.',
   'in_progress',
   NOW() + INTERVAL '5 days');
```

Assignment statuses: `not_started`, `in_progress`, `completed`

### Phase 4: Execute or Export

**Execute mode** (default): Run SQL via Supabase MCP:

```
mcp__supabase__execute_sql({ sql: "<generated SQL>" })
```

Split into batches of 50 rows per INSERT to avoid timeouts.

**SQL mode**: Write to file:

```bash
# Output to scripts/database/seeding/generated/seed-<preset>-<timestamp>.sql
```

### Phase 5: Verify

After execution, run verification queries:

```sql
SELECT
  (SELECT COUNT(*) FROM profiles WHERE email LIKE '%@strummy.app') AS profiles,
  (SELECT COUNT(*) FROM lessons l JOIN profiles p ON l.teacher_id = p.id
   WHERE p.email LIKE '%@strummy.app') AS lessons,
  (SELECT COUNT(*) FROM assignments a JOIN profiles p ON a.teacher_id = p.id
   WHERE p.email LIKE '%@strummy.app') AS assignments;
```

Print summary:

```
Seed complete (demo preset):
  Profiles:     12 (2 teachers, 10 students)
  Songs:        50
  Lessons:      100
  Lesson songs: 200
  Assignments:  40

  Login: sarah@strummy.app / Demo2024!
```

## Cleanup

Delete all seed data (identified by `@strummy.app` email domain):

```
/seed-factory cleanup
```

Deletes in reverse FK order. Prompts for confirmation before executing against remote.

## Key Project Files

| File | Role |
|---|---|
| `scripts/database/seeding/demo/seed-demo.ts` | Reference implementation for demo data |
| `scripts/database/seeding/test/seed-test-*.ts` | Test seed scripts (5 files) |
| `scripts/database/seeding/seed-songs.ts` | Song seeding from legacy JSON |
| `scripts/database/seeding/import-100-classics.ts` | 100 guitar classics dataset |
| `scripts/database/seeding/local/seed-assignments.ts` | Assignment seeding |
| `supabase/migrations/` | Database schema (FK constraints) |

## Realistic Content Templates

Use guitar-specific language for notes and assignments. Reference `scripts/database/seeding/demo/seed-demo.ts` for established patterns including teacher notes (chord transitions, strumming patterns, fingerpicking, performance prep) and assignment descriptions (metronome practice, recording tasks, backing track exercises).

## Error Handling

| Situation | Action |
|---|---|
| Supabase MCP unavailable | Fall back to SQL file output |
| Local Supabase not running | Print setup instructions: `npx supabase start` |
| FK constraint violation | Log the failing row, continue with remaining data |
| Duplicate email (profile exists) | Upsert on conflict, log as "existing" |
| Remote target without confirmation | Require explicit `--confirm-remote` flag |

## Examples

- `/seed-factory fresh` -- Clean local dev with 4 profiles, 10 songs, 6 lessons
- `/seed-factory demo --output sql` -- Generate SQL file at `scripts/database/seeding/generated/`
- `/seed-factory edge` -- Boundary testing: empty states, max data, conflicts
- `/seed-factory cleanup` -- Remove all `@strummy.app` seed data
