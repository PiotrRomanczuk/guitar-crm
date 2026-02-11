# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Strummy is a student management system for guitar teachers built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL, Auth, RLS).

**Current Version**: 0.65.0

## Commands

### Development
```bash
npm run dev              # Start dev server (uses nodemon)
npm run build            # Production build
npm run lint             # Run ESLint
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm test -- --watch      # Watch mode
npm test -- SongSchema   # Run specific test file
npm run test:coverage    # With coverage report

# E2E
npm run cypress:open     # Cypress interactive
npm run cypress:run      # Cypress headless
npm run test:smoke       # Smoke tests only
npm run test:e2e:all     # All E2E tests
```

### Database
```bash
npm run setup:db         # Set up Supabase database
npm run seed             # Add sample data
npm run db:inspect       # Inspect database
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query
- **Backend**: Supabase (PostgreSQL with RLS), Server Actions
- **Validation**: Zod schemas in `/schemas`
- **AI**: OpenRouter (cloud) + Ollama (local) via `/lib/ai`
- **Testing**: Jest (unit), Cypress + Playwright (E2E)

### Directory Structure
- `/app` - Next.js App Router pages, API routes, Server Actions
- `/components` - React components organized by domain (lessons, songs, users)
- `/lib` - Business logic: `/lib/ai`, `/lib/services`, `/lib/supabase`
- `/schemas` - Zod validation schemas
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations

### Role-Based Access
Three roles via Supabase RLS: **Admin**, **Teacher**, **Student**. Teacher dashboard currently displays admin view (owner is only teacher).

### Database
Dual connections: local Supabase (`127.0.0.1:54321`) for dev, remote for production. Env vars: `NEXT_PUBLIC_SUPABASE_LOCAL_*` / `NEXT_PUBLIC_SUPABASE_REMOTE_*`.

## Code Conventions

### Component Organization
```
components/<domain>/<Feature>/
├── index.ts              # Re-exports
├── Feature.tsx           # Main component
├── Feature.Header.tsx    # Sub-components: Parent.Section.tsx
├── useFeature.ts         # Custom hook
└── feature.helpers.ts    # Pure utilities
```

### Naming
- **Components/Types**: PascalCase (`StudentLesson.tsx`)
- **Functions/Variables**: camelCase (`fetchLessons()`)
- **Booleans**: `is/has/can` prefix (`isLoading`)
- **Hooks**: `use` prefix (`useStudentLesson`)
- **Sub-components**: `Parent.Section.tsx`

### Size Limits (Enforced)
- Component file: Max 200 LOC
- Hook file: Max 150 LOC
- Function body: Max 50 LOC

### UI & Styling
- Use shadcn/ui first (`npx shadcn@latest add [component]`)
- Mobile-first with Tailwind breakpoints
- Always include `dark:` variants
- Validate forms on blur, use Zod from `/schemas`

## Testing

- **TDD**: Write failing test → Implement → Refactor
- **Pyramid**: 70% unit (Jest), 20% integration, 10% E2E
- **Coverage**: 70% minimum
- Tests in `/__tests__` mirroring source structure

## Git & Workflow

- All work tracked in Linear (ticket format: `STRUM-XXX`)
- Branch: `{type}/STRUM-XXX-description` (feature/, fix/, refactor/, test/, docs/, chore/)
- Commit: `type(scope): description [STRUM-XXX]`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`
- Version: patch (fixes), minor (features), major (breaking)
- Merge: Squash and Merge to `main`, then `main` → `production`

## Environments

- **`main`** → Preview (Vercel): `https://strummy-preview.vercel.app`
- **`production`** → Production (Vercel): `https://strummy.app`

## Dev Credentials (Local Only)
```
Admin:   p.romanczuk@gmail.com / test123_admin
Teacher: teacher@example.com / test123_teacher
Student: student@example.com / test123_student
```
Seed with: `npm run seed`
