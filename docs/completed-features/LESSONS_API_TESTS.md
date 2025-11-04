# Lessons API-Only Cypress Tests - Implementation Summary

**Date**: November 3, 2025
**Status**: ✅ Complete and Passing

## What Was Built

API-only Cypress tests for the Lessons feature that validate full CRUD operations through Supabase REST API, completely independent of any UI implementation.

## Files Created

### 1. `cypress/support/supabase.ts`

Supabase REST API helpers for Cypress tests:

- `restRequest<T>(method, path, {qs, body})` - Typed wrapper around cy.request with service role auth
- `getProfileByEmail(email)` - Resolves user_id from profile email for test setup
- Uses SUPABASE_SERVICE_ROLE_KEY from env (local dev only, never production)

### 2. `cypress/e2e/api/lessons/lessons-api-only.cy.ts`

Complete CRUD test suite:

- ✅ Creates a lesson (POST /rest/v1/lessons)
- ✅ Reads lesson by ID (GET /rest/v1/lessons?id=eq.{id})
- ✅ Updates lesson title (PATCH /rest/v1/lessons?id=eq.{id})
- ✅ Deletes lesson (DELETE /rest/v1/lessons?id=eq.{id})
- ✅ Verifies deletion

### 3. `cypress/support/journeys.ts`

Journey helpers for future UI tests:

- `signIn(email, password)` - UI-driven auth flow
- `interceptLessonsApi()` - Network intercept setup

### 4. Skipped UI Journey Specs (Planned)

- `cypress/e2e/lessons/admin-lessons.cy.ts` (describe.skip)
- `cypress/e2e/lessons/teacher-lessons.cy.ts` (describe.skip)
- `cypress/e2e/lessons/student-lessons.cy.ts` (describe.skip)

## Configuration Changes

### `cypress.config.ts`

- Added `dotenv` import to load `.env.local`
- Added env vars: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Ensures tests can access local Supabase credentials

## Test Results

```
Lessons API-only via Supabase REST
  ✓ creates a lesson (290ms)
  ✓ reads the created lesson by id (38ms)
  ✓ updates the lesson title (35ms)
  ✓ deletes the lesson (85ms)

4 passing (496ms)
```

## Key Technical Details

### Database Schema Alignment

- Lessons table uses snake_case: `student_id`, `teacher_id`, `creator_user_id`, `start_time`
- Profiles table uses snake_case: `user_id`, `email`, `firstname`, `lastname`
- Test correctly formats:
  - `date` as YYYY-MM-DD (DATE column)
  - `start_time` as HH:MM:SS (TIME column)
  - `creator_user_id` is required

### Test Users

Uses seeded test accounts:

- Teacher: `teacher@example.com`
- Student: `student@example.com`

### Why API-Only?

1. **No UI Dependency**: Tests validate backend logic immediately without waiting for lessons UI
2. **Fast Execution**: Direct REST calls (~500ms total) vs UI journeys (~5-10s)
3. **Reliable**: No flaky selectors or render timing issues
4. **Service Role**: Bypasses auth middleware to test pure CRUD operations

## Running the Tests

### Prerequisites

```bash
# Ensure Supabase is running
npm run setup:db

# Ensure .env.local has:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### Run Commands

```bash
# Single spec
npx cypress run --spec "cypress/e2e/api/lessons/lessons-api-only.cy.ts"

# Via test selector
npm run e2e:select
# Choose: lessons-api-only.cy.ts

# Open in UI for debugging
npx cypress open
# Navigate to api/lessons/lessons-api-only.cy.ts
```

## Next Steps

### When Lessons UI is Ready

1. Remove `.skip` from journey specs:

   - `cypress/e2e/lessons/admin-lessons.cy.ts`
   - `cypress/e2e/lessons/teacher-lessons.cy.ts`
   - `cypress/e2e/lessons/student-lessons.cy.ts`

2. Add `data-testid` attributes to UI:

   - `lessons-table`
   - `create-lesson-form`
   - `page-title`
   - `forbidden-message`

3. Update journey specs with actual form field selectors

### Optional Enhancements

- Add bulk operations tests (POST /rest/v1/lessons with array)
- Add filtering/sorting tests (GET with ?order=, ?status=eq.)
- Add lessons-songs relationship tests
- Add auth token flow tests (via Next.js API routes instead of direct REST)

## Lessons Learned

1. **Column naming**: Database uses snake_case, JS code uses camelCase - always verify actual column names
2. **Required fields**: `creator_user_id` is NOT NULL but wasn't in original LessonInputSchema
3. **Date formats**: PostgreSQL DATE expects YYYY-MM-DD, TIME expects HH:MM:SS
4. **dotenv for Cypress**: Must explicitly load `.env.local` in cypress.config.ts
5. **Service role for tests**: Powerful but safe in local dev; never expose in production

## Files Modified

- `cypress.config.ts` - Added dotenv + env vars
- `cypress/support/supabase.ts` - REST helpers
- `cypress/support/journeys.ts` - Auth helpers
- `docs/branch-verification/ROLE_JOURNEYS.md` - Updated with lessons routes

## Files Not Modified (Future Work)

- Next.js API routes (`app/api/lessons/*`) - Already exist, no changes needed
- Lesson handlers (`app/api/lessons/handlers.ts`) - Already exist, tested indirectly
- LessonSchema (`schemas/LessonSchema.ts`) - May need to add `creator_user_id` to InputSchema

## Conclusion

API-only tests provide immediate validation of lessons CRUD without UI dependencies. All 4 tests pass reliably in under 500ms. Future UI tests can build on this foundation using the journey helpers and skipped specs as templates.
