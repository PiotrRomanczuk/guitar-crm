# Pre-Commit Quality Check Issues - November 6, 2025

## Overview

Enhanced pre-commit script to mirror GitHub Actions CI/CD pipeline. Running quality checks revealed 82 ESLint issues (19 errors, 63 warnings) and 8 test failures that need to be addressed.

## Critical Issues (Block Commit)

### 1. TypeScript Parsing Errors (2 files)

**Impact**: Build fails, blocks all development

- `components/auth/RequireRole.tsx:222` - Missing closing brace

**Action**: Fix syntax errors immediately

### 2. ESLint Errors (19 total)

#### File Length Violations (2 files)

- `app/api/lessons/handlers.ts` - 313 lines (max 300)
- `app/api/song/route.ts` - 303 lines (max 300)

**Action**: Extract handlers to separate files

#### CommonJS Import Violations (8 errors in 2 files)

- `scripts/database/seed-users-fixed.js` - 4 require() statements
- `scripts/database/seed-users.js` - 4 require() statements

**Action**: Convert to ES6 imports or add ESLint exception for Node scripts

#### Parsing Errors (2 files)

- Same as TypeScript parsing errors above

### 3. Test Failures (8 tests in 1 suite)

**File**: `__tests__/api/lessons/handlers.test.ts`

All failures related to permission/authentication:

- `validateMutationPermission` - Returns false for admin/teacher (expects true)
- `getLessonsHandler` - Query destructuring error (undefined)
- `createLessonHandler` - Returns 403 instead of 201
- `updateLessonHandler` - Returns 403 instead of 200
- `deleteLessonHandler` - Returns 403 instead of 200

**Root Cause**: Permission validation logic broken in handlers

## High Priority Warnings

### Function Complexity (26 functions exceed limit of 10)

**Extreme Complexity (>30):**

- `app/api/lessons/export/route.ts` GET - **43**
- `app/api/lessons/route.old.ts` GET - **46**

**Very High (20-30):**

- `app/api/lessons/analytics/route.ts` GET - 29
- `app/api/song/user-songs/route.ts` GET - 26
- `app/api/lessons/stats/route.ts` GET - 26
- `app/api/lessons/search/route.ts` GET - 25
- `app/api/song/search/route.ts` GET - 17
- `app/api/song/stats/route.ts` GET - 21
- `app/api/song/export/route.ts` GET - 22
- `app/api/dashboard/stats/route.ts` GET - 21

**High (15-20):**

- `app/api/lessons/bulk/route.ts` POST - 19
- `app/api/song/bulk/route.ts` POST - 19

**Action**: Extract complex logic to helper functions, reduce nesting

### Function Length Violations (6 functions exceed 120 lines)

- `app/api/song/user-songs/route.ts` GET - **201 lines**
- `app/admin/users/page.tsx` UsersPage - **179 lines**
- `app/api/lessons/analytics/route.ts` GET - 172 lines
- `app/api/lessons/route.old.ts` GET - 156 lines
- `app/api/song/bulk/route.ts` POST - 152 lines
- `app/api/lessons/export/route.ts` GET - 145 lines

**Action**: Split into smaller functions following Small Components Policy

### Nesting Depth Violations (5 occurrences)

Files with nesting > 4 levels:

- `app/api/lessons/bulk/route.ts` - lines 100, 220
- `app/api/lessons/export/route.ts` - lines 131, 140
- `app/api/song/bulk/route.ts` - lines 114, 137

**Action**: Extract nested logic to separate functions

## Medium Priority Issues

### Console.log Statements (Production Code)

- `app/api/lessons/handlers.ts` - lines 172, 174
- `lib/getUserWithRolesSSR.ts` - line 36

**Action**: Replace with `lib/logging.ts` structured logging

### Unused Variables (6 files)

- `cypress/e2e/admin-songs-crud.cy.ts` - createdSongId
- `scripts/database/create-test-users.ts` - supabaseAnonKey
- `scripts/database/seed-assignments.ts` - songsByLevel
- `app/sign-in/page.tsx` - useEffect import
- `components/landingPage/LandingPage.tsx` - SupabaseTest, FeaturesSection
- `set_passwords_from_file.js` - err

**Action**: Remove or use variables

### Component Complexity (4 components)

- `components/auth/ResetPasswordForm.tsx` - 11
- `components/auth/useSignUpLogic.ts` getValidationError - 11
- `components/dashboard/admin/UserForm.tsx` - 15
- `components/lessons/LessonTable.Row.tsx` - 13

**Action**: Extract helper functions, simplify logic

## Low Priority Issues

### Unused ESLint Directive

- `app/api/lessons/handlers.ts:158` - Unnecessary disable comment

### Unused Imports

- `app/api/lessons/route.old.ts` - getLessonsHandler, createLessonHandler

### Non-null Assertion Chain Warnings

- `app/api/lessons/[id]/route.old.ts` - lines 139, 174

## Configuration Issues

### Package.json Scripts

Current scripts point to wrong paths:

```json
"quality": "./scripts/quality-check.sh",      // ❌ Wrong
"pre-commit": "./scripts/pre-commit.sh"       // ❌ Wrong
```

Should be:

```json
"quality": "./scripts/ci/quality-check.sh",   // ✅ Correct
"pre-commit": "./scripts/ci/pre-commit.sh"    // ✅ Correct
```

## Implementation Plan

### Phase 1: Critical Fixes (Blocks Everything)

1. ✅ Fix TypeScript parsing errors (2 files)
2. ✅ Fix test failures (8 tests)
3. ✅ Fix package.json script paths

**Estimated Time**: 1-2 hours

### Phase 2: ESLint Errors

1. ✅ Split oversized files (2 files)
2. ✅ Convert CommonJS imports (2 files)
3. ✅ Verify build passes

**Estimated Time**: 2-3 hours

### Phase 3: High Complexity Functions

1. ✅ Refactor extreme complexity (2 functions, complexity >40)
2. ✅ Refactor very high complexity (8 functions, complexity 20-30)
3. ✅ Refactor high complexity (remaining 16 functions)

**Estimated Time**: 4-6 hours

### Phase 4: Function Length Issues

1. ✅ Split long functions (6 functions >120 lines)
2. ✅ Reduce nesting depth (5 occurrences)

**Estimated Time**: 2-3 hours

### Phase 5: Cleanup

1. ✅ Remove console.log statements
2. ✅ Remove unused variables/imports
3. ✅ Simplify component complexity
4. ✅ Remove unused ESLint directives

**Estimated Time**: 1-2 hours

### Phase 6: Verification

1. ✅ Run full test suite with coverage
2. ✅ Run build verification
3. ✅ Run database quality checks
4. ✅ Run security audit
5. ✅ Run final pre-commit validation

**Estimated Time**: 30-60 minutes

**Total Estimated Time**: 10-17 hours

## Success Criteria

### Pre-Commit Check Must Pass:

- ✅ Job 1: Lint & Type Check
  - ESLint: 0 errors, 0 warnings
  - TypeScript: No type errors
- ✅ Job 2: Unit & Integration Tests
  - All tests pass
  - Coverage ≥70% (statements, branches, functions, lines)
- ✅ Job 3: Build Application
  - Build succeeds
  - `.next` directory created
- ✅ Job 4: Database Quality
  - No orphaned records
  - No real emails in test data
  - Sufficient test data
- ✅ Job 5: Security Audit
  - No hardcoded secrets
  - No forbidden patterns
  - No moderate+ vulnerabilities

## Files to Modify

### Critical (17 files)

2. `components/auth/RequireRole.tsx`
3. `app/api/lessons/handlers.ts`
4. `app/api/song/route.ts`
5. `scripts/database/seed-users-fixed.js`
6. `scripts/database/seed-users.js`
7. `__tests__/api/lessons/handlers.test.ts`
8. `lib/getUserWithRolesSSR.ts`
9. `package.json`

### High Priority (12 files)

10. `app/api/lessons/export/route.ts`
11. `app/api/lessons/route.old.ts`
12. `app/api/lessons/analytics/route.ts`
13. `app/api/song/user-songs/route.ts`
14. `app/api/lessons/stats/route.ts`
15. `app/api/lessons/search/route.ts`
16. `app/api/lessons/bulk/route.ts`
17. `app/api/song/bulk/route.ts`
18. `app/admin/users/page.tsx`
19. `app/api/dashboard/stats/route.ts`
20. `app/api/song/export/route.ts`
21. `app/api/song/search/route.ts`

### Medium Priority (9 files)

22. `cypress/e2e/admin-songs-crud.cy.ts`
23. `scripts/database/create-test-users.ts`
24. `scripts/database/seed-assignments.ts`
25. `app/sign-in/page.tsx`
26. `components/landingPage/LandingPage.tsx`
27. `set_passwords_from_file.js`
28. `components/auth/ResetPasswordForm.tsx`
29. `components/auth/useSignUpLogic.ts`
30. `components/dashboard/admin/UserForm.tsx`

**Total: 30 files need modification**

## Quick Wins (Start Here)

1. **Fix package.json paths** (2 minutes)
2. **Remove unused imports/variables** (10 minutes)
3. **Remove console.log statements** (5 minutes)
4. **Fix TypeScript syntax errors** (15 minutes)
5. **Convert CommonJS imports** (15 minutes)

These quick wins eliminate 15+ issues in ~45 minutes.

## Notes

- Pre-commit script now mirrors CI/CD exactly
- All checks are enforced before commit
- Database checks require Supabase running
- E2E tests not included in pre-commit (too slow)
- Can bypass with `git commit --no-verify` but CI/CD will still fail

## Related Files

- **Pre-commit script**: `scripts/ci/pre-commit.sh`
- **Quality check script**: `scripts/ci/quality-check.sh`
- **Pre-commit guide**: `scripts/ci/PRE_COMMIT_GUIDE.md`
- **CI/CD workflow**: `.github/workflows/ci-cd.yml`
- **Todo list**: Using `manage_todo_list` tool

## Status

- ✅ Pre-commit script enhanced
- ✅ Issues identified and categorized
- ✅ Todo list created
- ⏳ Fixes pending (20 todos)
- ⏳ Verification pending

## Next Steps

1. Start with Quick Wins
2. Fix Critical Issues (Phase 1)
3. Work through phases 2-6
4. Run final validation
5. Commit when all checks pass
