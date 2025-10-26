# Guitar CRM - AI Development Guide

## Project Overview

Guitar CRM is a Next.js 16 + TypeScript application for guitar teachers to manage students, lessons, songs, and progress tracking. It uses Supabase (PostgreSQL) for backend/auth and follows strict Test-Driven Development (TDD) practices.

**Status**: ~45% complete - Foundation and core schemas implemented. Auth, UI, and lesson management pending.

## Architecture & Stack

### Core Technologies

- **Frontend**: Next.js 16.0.0 (App Router), React 19.2.0, Tailwind CSS 4.0
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Validation**: Zod schemas for all entities (`schemas/` directory)
- **Testing**: Jest + React Testing Library (strict TDD workflow)
- **Deployment**: Vercel (auto-deploy from `main` branch)

### Database Schema

Core entities: `profiles` (users with role flags), `songs`, `lessons`, `lesson_songs`, `task_management`, `user_favorites`

- Users have multiple role flags: `isAdmin`, `isTeacher`, `isStudent` (not mutually exclusive)
- Lessons link students + teachers and auto-increment `lesson_teacher_number` per teacher-student pair
- Songs have `level` (beginner/intermediate/advanced) and `key` (musical keys) enums
- Lesson songs track progress: to_learn → started → remembered → with_author → mastered

### Type Safety Strategy

1. **Database types**: Generated in `types/database.types.generated.ts` and `types/database.types.ts`
2. **Zod schemas**: Validation + input/update/filter schemas in `schemas/` (SongSchema, LessonSchema, TaskSchema, etc.)
3. **Type exports**: Helper types in `lib/supabase.ts` (`Tables<'songs'>`, `InsertTables<'lessons'>`, etc.)
4. **Pattern**: Always use Zod for runtime validation, TypeScript for compile-time safety

## Critical Development Workflows

### TDD Workflow (MANDATORY)

This project strictly follows Test-Driven Development. **Write tests before implementation.**

```bash
# Starting new feature
npm run new-feature feature-name  # Creates branch + shows TDD reminder
npm run tdd                         # Watch mode with coverage

# TDD cycle: 🔴 Red → 🟢 Green → 🔵 Refactor
```

**Test file locations**:

- Components: `__tests__/components/ComponentName.test.tsx`
- Schemas: `__tests__/schemas/SchemaName.test.ts`
- Utils: `__tests__/utils/utilName.test.ts`

**Schema testing pattern** (see `__tests__/schemas/SongSchema.test.ts`):

```typescript
describe('SongInputSchema', () => {
  it('should validate a valid song input', () => {
    const validSong = { title: 'Song', author: 'Artist', level: 'intermediate', key: 'C', ultimate_guitar_link: 'https://...' };
    expect(() => SongInputSchema.parse(validSong)).not.toThrow();
  });

  it('should reject song input with missing title', () => {
    expect(() => SongInputSchema.parse({ author: 'Artist', ... })).toThrow();
  });
});
```

### Database Development

```bash
# Local Supabase setup (requires Docker Desktop running)
npm run setup:db     # Start Supabase stack
npm run seed         # Populate with sample data
npm run backup       # Create anonymized backup (excludes PII)

# Supabase runs on:
# - Database: localhost:54322
# - API: localhost:54321
# - Studio: localhost:54323
```

**Migration pattern**: Migrations in `supabase/migrations/` with timestamp prefixes (e.g., `20251026111826_baseline.sql`)

### Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run quality      # Pre-commit checks (lint, types, tests, TODOs)
npm run deploy:check # Production readiness validation
npm run dev:server start all  # Start Next.js + Supabase together
```

## Project Conventions

### Schema Patterns

All entities follow this structure in `schemas/`:

- **Base schema**: Full validation (`SongSchema`)
- **Input schema**: For creating new records (`SongInputSchema`)
- **Update schema**: Partial updates with required ID (`SongUpdateSchema`)
- **Filter/Sort schemas**: Query parameter validation (`SongFilterSchema`, `SongSortSchema`)
- **With relations**: Extended schemas with joined data (`SongWithLessonsSchema`)

Example from `schemas/SongSchema.ts`:

```typescript
export const SongInputSchema = z.object({
	title: z.string().min(1, 'Title is required').max(200),
	author: z.string().min(1, 'Author is required'),
	level: DifficultyLevelEnum, // From CommonSchema
	key: MusicKeyEnum,
	ultimate_guitar_link: URLField,
	chords: z.string().optional(),
});
```

### Small Components Policy (MANDATORY)

Always split UI and logic into the smallest reasonable, composable pieces. Avoid monolithic components and files.

- Prefer multiple focused components over one large component
- Extract presentational pieces (pure UI) from containers (data/side-effects)
- Co-locate tiny helpers/hooks next to their usage (`useX.ts`, `X.helpers.ts`)
- Keep files short and focused: one responsibility per file
- Co-locate tests with the same name under `__tests__/components/...`

Recommended structure for new UI work:

- `components/<domain>/<Feature>/`
  - `index.ts` — re-exports
  - `Feature.tsx` — thin composition component
  - `Feature.Header.tsx`, `Feature.Item.tsx`, `Feature.Empty.tsx` — small UI units
  - `useFeature.ts` — hook for local state/effects
  - `Feature.helpers.ts` — pure helpers (pure functions only)

Enforcement:

- ESLint enforces max file length and function length in app/lib/components
- Quality script warns on oversized files
- PRs should prefer decomposition commits over growing a single file

### Common Enums & Patterns

Import shared validation from `schemas/CommonSchema.ts`:

- `DifficultyLevelEnum`: beginner | intermediate | advanced
- `MusicKeyEnum`: All musical keys (C, C#, D, ..., Bm)
- `URLField`, `EmailField`, `UUIDField`: Pre-configured validators
- Utility functions: `validateUUID()`, `validateEmail()`, `validateDate()`

### Supabase Client Usage

Import from `lib/supabase.ts`:

```typescript
import { supabase, Tables, InsertTables } from '@/lib/supabase';

// Type-safe queries
const { data, error } = await supabase
	.from('songs')
	.select('*')
	.eq('level', 'intermediate');

// Type: Song[] (from Tables<'songs'>)
```

**Mock client fallback**: Supabase client returns mock in build/test when env vars missing (prevents build failures)

### File Organization

- `/app`: Next.js App Router pages (minimal, mostly layout)
- `/components`: React components (none implemented yet)
  - Follow the Small Components Policy; split views into small composables
- `/lib`: Utilities, Supabase client config
- `/schemas`: Zod validation (comprehensive, well-documented)
- `/types`: TypeScript definitions + generated DB types
- `/supabase`: Migrations, seeds, backups
- `/scripts`: Automation scripts (setup, TDD reminders, quality checks)
- `/__tests__`: Test files mirroring source structure

### User Roles & Permissions

Users can have **multiple roles simultaneously** (flags, not enums):

- Admin: `isAdmin=true` - Full system access, task management
- Teacher: `isTeacher=true` - Student/lesson/song management
- Student: `isStudent=true` - View assigned lessons/songs

**Important**: Don't treat roles as mutually exclusive. Teachers can also be students.

## Code Quality Standards

### Linting & Formatting

- ESLint config: `eslint.config.mjs`
- No console.log in production code (caught by pre-commit)
- TypeScript strict mode enforced

### Testing Requirements

- Coverage thresholds: 70% branches/functions/lines/statements
- Watch plugins disabled due to version conflicts
- All schemas must have tests covering valid/invalid cases

### Git Workflow

```bash
git checkout -b feature/feature-name  # Feature branches
npm run pre-commit                     # Manual pre-commit check
# Git hooks can be set up: echo '#!/bin/sh\n./scripts/pre-commit.sh' > .git/hooks/pre-commit
```

## Environment Setup

### Required Environment Variables

Create `.env.local` (gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321  # Or production URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin operations
```

### First-Time Setup

```bash
npm run setup        # Install deps, create env template
npm run setup:db     # Start Supabase (Docker required)
npm run seed         # Add sample data
npm run dev          # Start development
```

## Implementation Guidelines

### When Adding New Features

1. **Create test file first** in `__tests__/` matching source path
2. **Write failing tests** for expected behavior
3. **Run `npm run tdd`** to start watch mode
4. **Implement minimal code** to pass tests
5. **Refactor** while keeping tests green
6. **Run `npm run quality`** before committing
7. Split any large component into smaller ones before opening a PR

### When Creating New Schemas

1. Define in `schemas/` using common patterns from `CommonSchema.ts`
2. Export base, input, update, filter schemas
3. Create test file in `__tests__/schemas/` with valid/invalid cases
4. Update `schemas/index.ts` exports
5. Add usage examples to `schemas/README.md`

### When Modifying Database

1. Create migration in `supabase/migrations/` with timestamp prefix
2. Update types: `supabase gen types typescript --local > types/database.types.generated.ts`
3. Update corresponding Zod schemas if needed
4. Test migration locally before deploying

### When Building UI Components

1. Write component tests first (React Testing Library)
2. Use Tailwind CSS classes (config in `postcss.config.mjs`)
3. Follow accessibility best practices
4. Create stories/examples if complex
5. Decompose aggressively: keep files <300 LOC and functions <80 LOC

## Key Constraints & Gotchas

- **No authentication implemented yet** - Skip auth checks in early development
- **Supabase RLS enabled** on profiles/tasks - Account for in tests
- **Lesson numbering is automatic** - Don't manually set `lesson_teacher_number`
- **Song status is enum** - Must use exact values: to_learn, started, remembered, with_author, mastered
- **Ultimate Guitar links required** - All songs must have this field
- **Test watch plugins disabled** - Known Jest version conflict, functionality still works

## Documentation Resources

- **TDD Guide**: `docs/TDD_GUIDE.md` - Comprehensive testing practices
- **Scripts Guide**: `scripts/README.md` - All automation commands explained
- **Schema Docs**: `schemas/README.md` - Validation patterns + examples
- **Project Overview**: `PROJECT_OVERVIEW.md` - Architecture deep dive
- **TODO System**: `docs/todos/` - Phased development roadmap

## Common Tasks Quick Reference

```bash
# Create new feature with TDD workflow
npm run new-feature my-feature && npm run tdd

# Run specific test file
npm test -- SongSchema.test.ts

# Check code quality before commit
npm run quality

# Start full dev environment
npm run dev:server start all

# Create database backup (anonymized)
npm run backup

# Production deployment check
npm run deploy:check

# View Supabase Studio
# Open http://localhost:54323 after npm run setup:db
```

## When In Doubt

1. **Check existing patterns** in `schemas/` and `__tests__/schemas/` - well-established
2. **Run `npm run quality`** frequently to catch issues early
3. **Follow TDD strictly** - This project has strong testing culture
4. **Reference `scripts/README.md`** for workflow commands
5. **Look at TODO.md** for planned features and context
