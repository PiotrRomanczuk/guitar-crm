# Lesson E2E Tests

## Overview

Comprehensive E2E tests for the Lesson CRUD functionality across all three roles:

- **Admin**: Full CRUD access to all lessons
- **Teacher**: CRUD access to their own lessons only
- **Student**: Read-only access to assigned lessons

## Test Files

- `admin-lessons.cy.ts` - Admin role tests (full system access)
- `teacher-lessons.cy.ts` - Teacher role tests (filtered access)
- `student-lessons.cy.ts` - Student role tests (read-only)
- `teacher-lessons-simple.cy.ts` - Simplified smoke tests

## Prerequisites

### 1. Database Setup

The tests require a seeded local Supabase database with test users:

```bash
# Start Supabase (requires Docker Desktop running)
npm run setup:db

# Seed test users and data
npm run seed
```

### 2. Test Users

The following test accounts must exist in the database (see `supabase/seed_test_users.sql`):

| Email                   | Password          | Role    | User ID                                |
| ----------------------- | ----------------- | ------- | -------------------------------------- |
| `p.romanczuk@gmail.com` | `test123_admin`   | Admin   | `00000000-0000-0000-0000-000000000001` |
| `teacher@example.com`   | `test123_teacher` | Teacher | `00000000-0000-0000-0000-000000000002` |
| `student@example.com`   | `test123_student` | Student | `00000000-0000-0000-0000-000000000003` |

### 3. Running Application

Tests require the Next.js dev server to be running:

```bash
# In terminal 1
npm run dev

# In terminal 2 (for tests)
npm run cypress:open  # Interactive mode
# OR
npm run cypress:run   # Headless mode
```

## Running Tests

### Run All Lesson Tests

```bash
npx cypress run --spec "cypress/e2e/lessons/**/*.cy.ts"
```

### Run Specific Role Tests

```bash
# Admin tests
npx cypress run --spec "cypress/e2e/lessons/admin-lessons.cy.ts"

# Teacher tests
npx cypress run --spec "cypress/e2e/lessons/teacher-lessons.cy.ts"

# Student tests
npx cypress run --spec "cypress/e2e/lessons/student-lessons.cy.ts"
```

### Interactive Mode (Recommended for Development)

```bash
npx cypress open
```

Then select the test file you want to run from the UI.

## Test Coverage

### Admin Tests

- ✅ List view with all system lessons
- ✅ Create form with all teachers/students
- ✅ Create lesson successfully
- ✅ Detail page view
- ✅ Edit lesson
- ✅ Delete lesson with confirmation
- ✅ Error handling (non-existent lessons, API errors)

### Teacher Tests

- ✅ List view filtered to teacher's lessons
- ✅ Create form with teacher's students only
- ✅ Create lesson for assigned student
- ✅ Validate required fields
- ✅ Detail page for own lessons
- ✅ Edit own lesson
- ✅ Delete own lesson
- ✅ Access control (cannot access other teachers' lessons)
- ✅ Access control (cannot access admin routes)

### Student Tests

- ✅ Read-only list view
- ✅ Detail page (read-only)
- ✅ No create/edit/delete capabilities
- ✅ Access control (cannot access teacher routes)
- ✅ Access control (cannot access admin routes)
- ✅ Empty state handling
- ✅ Filter lessons by status
- ✅ Sort lessons by date

## Troubleshooting

### Tests Failing with "Expected to find element but never found it"

**Cause**: Pages aren't loading properly, usually due to authentication issues.

**Solutions**:

1. Verify test users exist in database: Run `npm run seed`
2. Check Supabase is running: `npm run setup:db`
3. Verify Next.js dev server is running: `npm run dev`
4. Check browser console in Cypress UI for actual errors

### Tests Failing with "401 Unauthorized"

**Cause**: Authentication cookies aren't being preserved between requests.

**Solutions**:

1. Ensure `beforeEach` hook is properly signing in
2. Check that sign-in redirects away from `/sign-in`
3. Verify test user passwords match seed data

### Tests Failing with "cy.wait() timed out"

**Cause**: API intercepts aren't matching actual requests.

**Solutions**:

1. Check API routes are correct (e.g., `/api/teacher/lessons` not `/api/lessons`)
2. Verify intercepts are set up before visiting pages
3. Check Network tab in Cypress UI to see actual API calls

### Pages Show "Forbidden" or "Unauthorized"

**Cause**: Role-based access control is working, but test user doesn't have the required role.

**Solutions**:

1. Check `profiles` table in Supabase has correct role flags (`isAdmin`, `isTeacher`, `isStudent`)
2. Re-run seed script: `npm run seed`
3. Verify user ID matches between `auth.users` and `profiles` tables

## Known Issues

1. **API Request Authentication**: `cy.request()` calls don't automatically include auth cookies
   - **Workaround**: Create resources through the UI rather than direct API calls
2. **Test Data Isolation**: Tests may interfere with each other if run in parallel

   - **Workaround**: Run tests sequentially or implement proper cleanup

3. **Flaky Tests**: Some tests may fail intermittently due to timing issues
   - **Workaround**: Increase timeouts or add explicit waits

## Future Improvements

- [ ] Implement proper test data isolation (create/cleanup per test)
- [ ] Add visual regression testing
- [ ] Add performance benchmarks
- [ ] Implement custom Cypress commands for common lesson operations
- [ ] Add test coverage reporting
- [ ] Implement parallel test execution safely
- [ ] Add API mocking for offline testing

## Contributing

When adding new lesson features:

1. Add corresponding `data-testid` attributes to UI elements
2. Write tests following existing patterns
3. Ensure tests pass locally before committing
4. Document any new test users or setup requirements
