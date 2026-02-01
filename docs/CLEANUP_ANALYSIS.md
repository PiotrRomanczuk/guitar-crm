# Guitar CRM - Cleanup Analysis & Action Plan

**Date**: January 4, 2026  
**Branch**: `chore/cleanup-restructure`  
**Analyst**: GitHub Copilot

---

## 🔴 Critical Issues (Incompetence / Technical Debt)

### 1. Excessive Console Logging in Production Code ⚠️ HIGH PRIORITY

The middleware and many production files contain verbose `console.log` statements that should be removed or replaced with a proper logging system:

| File | Issue |
|------|-------|
| `middleware.ts` | 7 console.log statements for every request |
| `app/layout.tsx` | console.log in production layout |
| `app/dashboard/users/[id]/page.tsx` | 8 debug console.log statements logging potentially sensitive data |

**Risk**: Security (leaking internal data) and performance impact.

**Action**: Remove or replace with structured logging library (e.g., Pino).

---

### 2. Low Test Coverage (18.36%) ⚠️ HIGH PRIORITY

The coverage report shows only **18.36% line coverage**. Many critical API routes have 0% or <3% coverage.

| Metric | Value |
|--------|-------|
| Lines | 18.36% |
| Functions | 39.4% |
| Branches | 56.29% |

**Action**: Increase test coverage to at least 50% for critical paths.

---

### 3. Orphaned/Backup Files in Repository ⚠️ MEDIUM PRIORITY

`.bak` files committed to the repository:

- `app/api/lessons/route.old.ts.bak`
- `app/api/lessons/[id]/route.old.ts.bak`
- `scripts/database/backup/full-backup.sh.bak`
- `supabase/seed.sql.bak`

**Action**: Delete `.bak` files and add `*.bak` to `.gitignore`.

---

### 4. Inconsistent `z.any()` Usage in Schemas ⚠️ MEDIUM PRIORITY

The schemas use `z.any()` which defeats the purpose of validation:

```typescript
// schemas/SongSchema.ts line 116
songs: z.array(z.any()), // Allow any object for validation

// schemas/CommonSchema.ts lines 95, 100
data: z.any().optional(),
```

**Action**: Replace `z.any()` with proper typed schemas.

---

### 5. Deprecated `proxy.ts` Still Referenced ⚠️ LOW PRIORITY

The copilot-instructions explicitly state "DO NOT USE `proxy.ts`", but `docs/todos/MASTER_TODO.md` still references using it.

**Action**: Update documentation to remove proxy.ts references.

---

## 🟠 Over-Engineering / Unnecessary Complexity

### 1. Excessive Documentation Files (36 files in `/docs`)

Many appear to be implementation notes that should be in code comments or a wiki:

- `BEARER_TOKEN_IMPLEMENTATION.md`
- `BEARER_TOKEN_SETUP_COMPLETE.md`
- `BEARER_TOKEN_STATUS.md` (3 files for one feature!)
- `COMPONENT_RESTRUCTURE_PROPOSAL.md`
- `FRONTEND_NAVIGATION_ARCHITECTURE.md` + `FRONTEND_NAVIGATION_IMPLEMENTATION.md`

**Action**: Consolidate documentation from 36 → ~10 essential files.

---

### 2. Over-Segmented API Routes

The song API has 15 separate route folders:

```
/api/song/[id]/, /admin-favorites/, /admin-songs/, /bulk/, /create/, /export/, 
/favorites/, /search/, /stats/, /student-songs/, /update/, /user-songs/, /user-test-song/
```

**Action**: Consolidate routes (e.g., `/create/` and `/update/` → POST/PATCH on main route).

---

### 3. Duplicate API Route Patterns

Both `/api/song` and `/api/songs` exist. This is confusing and likely a refactoring artifact.

**Action**: Consolidate to single `/api/songs` pattern.

---

### 4. Over-Complex Next.js Config

`next.config.ts` includes custom socket-based Supabase detection at build time.

**Action**: Simplify with environment-based configuration.

---

### 5. Too Many Test Scripts (10 variations)

```json
"test", "test:watch", "test:coverage", "test:ci", "test:debug", 
"test:branch", "test:branch:watch", "test:branch:coverage", "test:categories", "tdd"
```

**Action**: Reduce to 3-4 essential test commands.

---

## 🟡 Code Quality Issues

### 1. `eslint-disable` and Type Bypasses

```typescript
// app/api/song/route.ts line 21
// eslint-disable-next-line @typescript-eslint/no-explicit-any
supabase: any,
```

**Action**: Replace `any` with proper types.

---

### 2. Commented-Out Code

Multiple files contain commented-out code:

- `app/layout.tsx`: `// console.log(user, isAdmin, isTeacher, isStudent);`
- `jest.setup.js`: Commented console override block

**Action**: Remove all commented-out code.

---

### 3. Magic Numbers/Strings

```typescript
// middleware.ts line 123 - undocumented regex
'/((?!api|_next/static|_next/image|favicon.ico|.*..*|sign-in|sign-up|forgot-password).*)'
```

**Action**: Extract to named constants with documentation.

---

### 4. Inconsistent Error Handling

Some functions throw errors with generic messages, others with detailed ones:

```typescript
throw new Error('Unauthorized');  // generic
throw new Error(`Failed to invite user: ${inviteError.message}`);  // detailed
```

**Action**: Standardize error messages with error codes.

---

### 5. Dashboard Data Fetching in Page Component

`app/dashboard/page.tsx` contains 6 parallel Supabase queries directly in the server component.

**Action**: Extract to dedicated data fetching function or server action.

---

## 📋 Action Plan (Priority Order)

### Phase 1: Immediate (Security & Cleanup)

- [x] **1.1** Replace console.log with logger in `middleware.ts` ✅
- [x] **1.2** Replace console.log with logger in `app/layout.tsx` ✅
- [x] **1.3** Replace console.log with logger in `app/dashboard/users/[id]/page.tsx` ✅
- [~] **1.4** Delete all `.bak` files ⏭️ SKIPPED - User preference to keep
- [x] **1.5** Add `*.bak` to `.gitignore` ✅

### Phase 2: Short-term (Code Quality)

- [x] **2.1** Consolidate `/api/song` and `/api/songs` routes ✅
  - Created `/api/song/[id]/lessons/route.ts`
  - Created `/api/song/[id]/assignments/route.ts`
  - Updated `lib/mutations/useSongMutations.ts`
  - Updated `components/songs/details/SongAssignments.tsx`
  - Updated `components/songs/details/SongLessons.tsx`
  - Updated `components/songs/details/Actions.tsx`
  - Deleted `/api/songs/` folder
- [x] **2.2** Replace `z.any()` with proper typed schemas ✅
  - `audio_files: z.record(z.string())` - URLs as values
  - `additional_data: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))`
  - `details: z.record(z.string())` - error details
  - `data: z.unknown()` - safer than z.any() for generics
  - `songs: z.array(z.record(z.unknown()))` - import validation
- [x] **2.3** Remove commented-out code ✅
  - `RequireRole.tsx`: Removed ~180 lines of dead code (250 → 47 lines)
  - `StudentDashboardClient.tsx`: Removed unused ProgressChart import
  - Kept intentional deprecation notes in `auth/index.ts` and `import-utils.ts`
- [~] **2.4** Fix `eslint-disable` occurrences ⏭️ DEFERRED
  - Most are intentional `@typescript-eslint/no-explicit-any` for Supabase types
  - Would require significant typing work with minimal benefit
  - Tracked for future TypeScript strictness improvements

### Phase 3: Medium-term (Architecture)

- [x] **3.1** Created structured logging library (`lib/logger.ts`) ✅
- [x] **3.2** Consolidate documentation ✅
  - Reduced from 39 → 19 files (51% reduction)
  - Deleted: outdated status reports, completed plans, todo folders
  - Merged: Bearer Token docs (3→1), UI docs (5→1), Navigation (2→1)
  - Updated README.md with new organized structure
- [ ] **3.3** Increase test coverage to 50%
- [x] **3.4** Simplify test script commands ✅
  - Removed 6 redundant test scripts (10 → 4 core scripts)
  - Kept: `test`, `test:watch`, `test:coverage`, `test:ci`

### Phase 4: Long-term (Refactoring)

- [ ] **4.1** Simplify next.config.ts
- [ ] **4.2** Standardize error handling patterns
- [ ] **4.3** Extract dashboard data fetching
- [x] **4.4** Document magic numbers/regex patterns ✅
  - Created `lib/constants.ts` with timing, pagination, validation constants
  - Added `API_ROUTES` object for consistent endpoint references
  - Updated components to use constants (BearerTokenCard example)

---

## Progress Tracking

| Phase | Task | Status | Date |
|-------|------|--------|------|
| 1.1 | Remove middleware console.log | ✅ Done (replaced with logger) | 2026-01-04 |
| 1.2 | Remove layout console.log | ✅ Done (replaced with logger) | 2026-01-04 |
| 1.3 | Remove user page console.log | ✅ Done (replaced with logger) | 2026-01-04 |
| 1.4 | Delete .bak files | ⏭️ Skipped (keep for reference) | 2026-01-04 |
| 1.5 | Update .gitignore | ✅ Done (added *.bak and *.old) | 2026-01-04 |

---

*This document should be updated as cleanup tasks are completed.*
