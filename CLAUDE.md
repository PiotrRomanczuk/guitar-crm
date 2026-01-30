# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guitar CRM is a student management system for guitar teachers built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL, Auth, RLS).

## Commands

### Development
```bash
npm run dev              # Start dev server (uses nodemon)
npm run build            # Production build
npm run lint             # Run ESLint
npm run quality          # Full quality check (lint + types + tests)
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
npm run test:admin       # Admin-specific E2E tests
npm run test:e2e:all     # All E2E tests

# AI & Integration tests
npm run test:ai          # Test AI providers
npm run test:ai:check    # Quick AI availability check
npm run test:spotify     # Test Spotify integration
```

### Database
```bash
npm run setup:db         # Set up Supabase database
npm run seed             # Add sample data
npm run db:inspect       # Inspect database
npm run db:refresh       # Refresh database (reset + seed)
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

### AI Provider System

Located in `/lib/ai/`. Uses factory pattern with auto-selection:

- **OpenRouter**: Cloud provider, requires `OPENROUTER_API_KEY`
- **Ollama**: Local provider at `http://localhost:11434`
- **Auto mode**: Tries Ollama first, falls back to OpenRouter

Agent registry in `/lib/ai/registry/` manages specialized AI agents (analytics, content, communication).

### API Route Patterns

API routes extract business logic into `handlers.ts` files for testability:

```text
app/api/[resource]/
├── route.ts         # HTTP handlers (GET, POST, etc.)
└── handlers.ts      # Extracted business logic (testable)
```

External API (`/app/api/external/`) uses bearer token auth from `api_keys` table.

### History Tracking

Database triggers automatically track changes to `assignment_history`, `lesson_history`, and `song_status_history` tables.

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

## Standards

### 1. UI/UX Patterns

| Area | Standard |
|------|----------|
| **Loading States** | Skeletons for lists/tables, Spinners for button actions |
| **Error Display** | Toast notifications for async operations, inline `<Alert>` for form validation |
| **Confirmations** | Use shadcn `AlertDialog` for all delete/destructive actions |
| **Breadcrumbs** | Show on all dashboard pages for consistent navigation |
| **Empty States** | Illustration + heading + CTA with responsive images |

### 2. Validation & Error Handling

| Area | Standard |
|------|----------|
| **Zod Usage** | Always use `safeParse()` - never throw, handle errors explicitly |
| **Client Validation** | Validate on blur + full validation on submit |
| **API Error Format** | `{ error: string, message: string, details?: object }` |
| **Error Boundaries** | Add `error.tsx` files to major route segments |

### 3. Data Flow & State Management

| Area | Standard |
|------|----------|
| **Data Fetching** | TanStack Query for all data loading (migrate manual fetch patterns) |
| **Mutations** | Server Actions for create/update/delete with `revalidatePath()` |
| **Reads** | API Routes for complex queries and data fetching |
| **Optimistic Updates** | Implement for status changes, toggles, and common actions |
| **Cache Invalidation** | `invalidateQueries()` for TanStack Query, `revalidatePath()` for Server Actions |

### 4. Code Organization

| Area | Standard |
|------|----------|
| **API Handlers** | Always extract business logic to `handlers.ts` for testability |
| **Response Validation** | Zod validation for external/critical endpoints only |
| **Component Structure** | `components/<domain>/{actions,details,form,hooks,list}/` |
| **Hook Files** | `useFeatureName.ts` in `hooks/` folder within domain |

### 5. Testing & TypeScript

| Area | Standard |
|------|----------|
| **Component Testing** | Testing Library with userEvent for behavior testing |
| **Mocking Strategy** | Mock at boundaries (fetch, Supabase client), test internal logic directly |
| **TypeScript** | Strict mode with `no-explicit-any` enforced |
| **Type Locations** | Shared types in `/types/`, component-specific types co-located |

### 6. Forms & Authentication

| Area | Standard |
|------|----------|
| **Form Management** | `react-hook-form` with `zodResolver` for all forms |
| **Auth Checks** | `useAuth()` hook returning `{ isAdmin, isTeacher, isStudent }` |
| **Database Errors** | Map Supabase error codes to user-friendly messages |
| **Error Utility** | Create `/lib/api/errors.ts` for centralized error handling |

### 7. Styling & Accessibility

| Area | Standard |
|------|----------|
| **Status Colors** | Semantic: green=success, red=error, yellow=warning, blue=info |
| **Dark Mode** | Required `dark:` variants for all components |
| **Accessibility** | WCAG 2.1 AA compliance (ARIA labels, keyboard nav, contrast) |
| **Images** | Always use `next/image` for optimization |

### 8. Domain-Specific Rules

| Area | Standard |
|------|----------|
| **Song Progress** | Linear only: to_learn → started → remembered → mastered (no backwards) |
| **Lesson Cancellation** | 24-hour minimum notice required |
| **Recurring Lessons** | Generate individual lesson records from schedule template |
| **Spotify Integration** | Optional with auto-match suggestions for enrichment |

### 9. Logging & Documentation

| Area | Standard |
|------|----------|
| **Logging** | Structured with `[Module]` prefix, Sentry for errors |
| **Comments** | Only for non-obvious logic (explain "why" not "what") |
| **Changelog** | Maintain `CHANGELOG.md` with conventional commits |

### 10. Form Standards

**Structure:**
```tsx
<Card>
  <CardContent className="p-6">
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <Alert variant="destructive">...</Alert>}
      {/* Fields */}
      <FormActions />
    </form>
  </CardContent>
</Card>
```

| Area | Standard |
|------|----------|
| **Wrapper** | Always use shadcn `Card` + `CardContent` with `p-6` padding |
| **Spacing** | `space-y-6` between field groups, `space-y-2` within fields |
| **Components** | Use shadcn/ui exclusively: `Input`, `Select`, `Textarea`, `Label`, `Checkbox` |
| **Labels** | Above input with `<Label>`, required indicator: `<span className="text-destructive ml-1">*</span>` |
| **Errors (field)** | Below input: `<p className="text-sm text-destructive">{error}</p>` |
| **Errors (form)** | Top of form: `<Alert variant="destructive">` |
| **Validation** | On blur (mark touched) + on submit (validate all) |
| **Loading** | Icon + text: `<Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...` |
| **Button Layout** | `flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border` |
| **Submit Button** | Primary action, `disabled={isLoading}` |
| **Cancel Button** | `variant="outline"`, use `router.back()` or explicit path |
| **Responsive** | `text-sm`, inputs `p-3`, grid `grid-cols-1 sm:grid-cols-2` for related fields |
| **Dark Mode** | All inputs/labels must have `dark:` variants |
| **Accessibility** | `htmlFor` on labels, `aria-invalid` on error fields, `aria-describedby` for errors |

### 11. Table Standards

**Structure:**
```tsx
<div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
  {/* Mobile Cards */}
  <div className="md:hidden space-y-3 p-4">
    {items.map(item => <MobileCard key={item.id} />)}
  </div>
  {/* Desktop Table */}
  <div className="hidden md:block overflow-x-auto">
    <Table className="min-w-[600px]">...</Table>
  </div>
  {/* Empty/Loading States */}
</div>
```

| Area | Standard |
|------|----------|
| **Container** | `bg-card rounded-xl border border-border shadow-sm overflow-hidden` |
| **Component** | Use shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` |
| **Mobile View** | Cards at `md:hidden`, switch to table at `hidden md:block` |
| **Mobile Cards** | `rounded-lg border p-4 space-y-3` with status badge top-right |
| **Row Hover** | `hover:bg-muted/50 transition-colors` |
| **Header** | `hover:bg-transparent` to prevent hover effect |
| **Loading** | Skeleton rows matching table structure (not spinner) |
| **Empty State** | Icon + heading + message + optional CTA button, centered |
| **Status Badges** | shadcn `Badge` with semantic colors, right-aligned column |
| **Actions** | Ghost buttons with icons, text labels on desktop, icon-only on mobile |
| **Delete Confirm** | Always use `AlertDialog`, never browser `confirm()` |
| **Pagination** | shadcn `Pagination` component if >20 items |
| **Column Alignment** | Left (text), right (numbers/actions), center (status badges) |
| **Truncation** | `truncate` for long text, `line-clamp-1` for descriptions |
| **Min Width** | `min-w-[600px]` wrapper for horizontal scroll on small screens |
| **Clickable Rows** | `cursor-pointer` + `onClick`, use `stopPropagation` on action buttons |

**Status Colors (centralized in `/lib/utils/statusColors.ts`):**
```
completed/success/mastered: green-500
pending/scheduled/to_learn: yellow-500
in_progress/started: primary (blue)
cancelled/error/overdue: destructive (red)
rescheduled/special: purple-500
```

## Dev Credentials (Local Only)
```
Admin: p.romanczuk@gmail.com / test123_admin
Teacher: teacher@example.com / test123_teacher
Student: student@example.com / test123_student
```
Seed with: `npm run seed`
