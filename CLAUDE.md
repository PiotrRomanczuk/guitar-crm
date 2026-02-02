# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strummy is a student management system for guitar teachers built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL, Auth, RLS).

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

# Cypress E2E
npm run cypress:open     # Interactive mode
npm run cypress:run      # Headless
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
- **AI**: OpenRouter (cloud) and Ollama (local) via abstraction layer in `/lib/ai`
- **Testing**: Jest (70% unit), Cypress (E2E)

### Directory Structure
- `/app` - Next.js App Router pages, API routes, Server Actions
- `/components` - React components organized by domain (lessons, songs, users, etc.)
- `/lib` - Business logic: `/lib/ai` (AI providers), `/lib/services`, `/lib/supabase`
- `/schemas` - Zod validation schemas
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations

### Role-Based Access Control
Three roles enforced via Supabase RLS: **Admin**, **Teacher**, **Student**. Currently teacher dashboard displays admin view (owner is only teacher).

### Database Connection
Supports dual connections: local Supabase (`127.0.0.1:54321`) for development, remote for production. Configured via `NEXT_PUBLIC_SUPABASE_LOCAL_*` and `NEXT_PUBLIC_SUPABASE_REMOTE_*` env vars.

## Code Conventions

### Component Organization
Domain components use this structure:
```
components/<domain>/<Feature>/
├── index.ts              # Re-exports
├── Feature.tsx           # Main component
├── Feature.Header.tsx    # Sub-components use Parent.Section.tsx naming
├── useFeature.ts         # Custom hook
└── feature.helpers.ts    # Pure utility functions
```

### Naming
- **Components/Types**: PascalCase (`StudentLesson.tsx`)
- **Functions/Variables**: camelCase (`fetchLessons()`)
- **Booleans**: `is/has/can` prefix (`isLoading`)
- **Hooks**: `use` prefix (`useStudentLesson`)
- **Sub-components**: `Parent.Section.tsx` (`StudentLesson.Song.tsx`)

### Size Limits (Enforced)
- Component file: Max 200 LOC
- Hook file: Max 150 LOC
- Function body: Max 50 LOC

### UI Components
Always check shadcn/ui first (`npx shadcn@latest add [component]`). Extend existing components rather than building from scratch.

### Form Validation
- Validate on blur, not on every keystroke
- Use Zod schemas from `/schemas`
- Clear errors when user starts typing

### Styling
Mobile-first with Tailwind breakpoints. Always include `dark:` variants.

## Testing

**TDD workflow**: Write failing test → Implement → Refactor

**Pyramid**: 70% unit (Jest), 20% integration, 10% E2E (Cypress)

**Coverage threshold**: 70% minimum

Tests live in `/__tests__` mirroring source structure.

## Deployment

- **`main` branch** → Preview/Staging (Vercel)
- **`production` branch** → Production (Vercel)

Merge to `main` first, verify on Preview, then merge to `production` to release.

## Dev Credentials (Local Only)
```
Admin: p.romanczuk@gmail.com / test123_admin
Teacher: teacher@example.com / test123_teacher
Student: student@example.com / test123_student
```
Seed with: `npm run seed`
