# Admin E2E Test Fixes - TODO List

**Date**: November 9, 2025  
**Branch**: `feature/core-crud`  
**Commit**: `16f1c3a` (E2E tests committed, currently failing)

## 📊 Test Results Summary

**Overall**: 14 passing / 20 failing / 2 skipped (36 total tests)

| Test File                       | Pass | Fail | Skip | Status     |
| ------------------------------- | ---- | ---- | ---- | ---------- |
| admin-sign-in.cy.ts             | 6    | 0    | 0    | ✅ PASSING |
| admin-dashboard.cy.ts           | 4    | 10   | 0    | ❌ FAILING |
| admin-create-song-journey.cy.ts | 0    | 1    | 0    | ❌ FAILING |
| admin-song-edit.cy.ts           | 0    | 3    | 0    | ❌ FAILING |
| admin-song-delete.cy.ts         | 0    | 1    | 2    | ❌ FAILING |
| admin-song-delete-cascade.cy.ts | 3    | 3    | 0    | ❌ FAILING |
| admin-complete-journey.cy.ts    | 1    | 2    | 0    | ❌ FAILING |

---

## 🔴 Critical Issues (Blocking Multiple Tests)

### Issue #1: Dashboard Not Showing "Admin Dashboard" Text

**Priority**: 🔥 CRITICAL  
**Impact**: Blocks 10+ tests  
**Tests Affected**: All dashboard tests, complete journey tests

**Problem**:

- Tests expect to find "Admin Dashboard" text
- Current dashboard (`components/dashboard/Dashboard.tsx`) shows generic "Welcome to Dashboard"
- Admin-specific dashboard component exists (`AdminDashboardClient.tsx`) but not rendered

**Expected Behavior**:

```typescript
// When admin visits /dashboard, should show:
cy.contains('Admin Dashboard').should('be.visible');
cy.contains('System administration').should('be.visible');
```

**Current Behavior**:

```
GET /dashboard 200
AssertionError: Expected to find content: 'Admin Dashboard' but never did.
```

**Root Cause**:

- `app/dashboard/page.tsx` uses generic `DashboardPageContent` component
- `AdminDashboardClient` component is not used for admin users
- Need conditional rendering based on user role

**Fix Required**:

- [ ] **Update `app/dashboard/page.tsx`**:
  - Import and use `AdminDashboardClient` when `isAdmin === true`
  - Keep `DashboardPageContent` for non-admin users
  - Add proper conditional rendering

**Files to Modify**:

```typescript
// app/dashboard/page.tsx
import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { AdminDashboardClient } from '@/components/dashboard/admin/AdminDashboardClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export default async function DashboardPage() {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // FIX: Add conditional rendering for admin
  if (isAdmin) {
    // Fetch stats for admin dashboard
    const stats = await fetchAdminStats(); // Need to implement
    return <AdminDashboardClient stats={stats} />;
  }

  return (
    <DashboardPageContent
      email={user.email}
      isAdmin={isAdmin}
      isTeacher={isTeacher}
      isStudent={isStudent}
    />
  );
}
```

**Estimated Time**: 1-2 hours  
**Dependencies**: May need to create API endpoint for admin stats

---

### Issue #2: Song Creation API Returning 500 Error

**Priority**: 🔥 CRITICAL  
**Impact**: Blocks song creation, delete, and journey tests  
**Tests Affected**: `admin-create-song-journey`, `admin-song-delete`, `admin-complete-journey`

**Problem**:

```
POST /api/song 500 in 532ms
AssertionError: expected 500 to be one of [ 200, 201 ]
```

**Expected Behavior**:

```typescript
const song = {
  title: 'Test Song',
  author: 'Test Artist',
  level: 'intermediate',
  key: 'C',
  ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test-song',
};
// POST /api/song should return 200 or 201
```

**Current Behavior**:

- API returns 500 Internal Server Error
- Song creation fails in all tests

**Root Cause** (Need to investigate):

- Check server logs for actual error
- Possible issues:
  - Database connection problem
  - Missing required fields in validation
  - RLS policy blocking insertion
  - Schema mismatch

**Fix Required**:

- [ ] **Check terminal logs** during test run for actual error message
- [ ] **Verify song API handler**: `app/api/song/handlers.ts` - `createSongHandler()`
- [ ] **Check database constraints**: Ensure all required fields are provided
- [ ] **Verify RLS policies**: Ensure admin can insert songs
- [ ] **Test song creation manually**: Try creating song via API endpoint
- [ ] **Add better error logging**: Include actual error in response

**Investigation Steps**:

```bash
# 1. Check what error is actually returned
# Look at Next.js terminal output during test run

# 2. Test API directly
curl -X POST http://localhost:3000/api/song \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Song",
    "author": "Test Artist",
    "level": "intermediate",
    "key": "C",
    "ultimate_guitar_link": "https://tabs.ultimate-guitar.com/tab/test"
  }'

# 3. Check Supabase logs
npm run setup:db
# Check logs in Docker container
```

**Estimated Time**: 2-3 hours (including investigation)  
**Dependencies**: May need to fix RLS policies or schema

---

### Issue #3: Song Detail Page Not Passing Role Props

**Priority**: 🔥 CRITICAL  
**Impact**: Blocks all edit/delete button tests  
**Tests Affected**: `admin-song-edit`, `admin-song-delete`, `admin-song-delete-cascade`

**Problem**:

```
AssertionError: Expected to find element: `[data-testid="song-edit-button"]`, but never found it.
AssertionError: Expected to find element: `[data-testid="song-delete-button"]`, but never found it.
```

**Expected Behavior**:

- Admin users should see edit and delete buttons on song detail page
- Buttons should be rendered with `data-testid` attributes

**Current Behavior**:

- `SongDetail` component receives `isAdmin={false}` and `isTeacher={false}` by default
- `SongDetailActions` component checks `canManageSongs = isTeacher || isAdmin`
- Since both are false, buttons are not rendered (returns `null`)

**Root Cause**:

- `app/dashboard/songs/[id]/page.tsx` renders `<SongDetail songId={id} />`
- Does NOT pass `isAdmin` or `isTeacher` props
- `SongDetail` component defaults to `isAdmin={false}` and `isTeacher={false}`

**Fix Required**:

- [ ] **Update `app/dashboard/songs/[id]/page.tsx`**:

  ```typescript
  import { SongDetail } from '@/components/songs';
  import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
  import { redirect } from 'next/navigation';

  export default async function SongPage({ params }: SongPageProps) {
    const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
    if (!user) {
      redirect('/sign-in');
    }

    const { id } = await params;

    return (
      <div className="container mx-auto px-4 py-8">
        <SongDetail
          songId={id}
          isAdmin={isAdmin} // ADD THIS
          isTeacher={isTeacher} // ADD THIS
        />
      </div>
    );
  }
  ```

**Files to Modify**:

- `app/dashboard/songs/[id]/page.tsx`

**Estimated Time**: 15-30 minutes  
**Dependencies**: None

---

## 🟡 Medium Priority Issues

### Issue #4: Song Edit Page Route Not Found

**Priority**: MEDIUM  
**Impact**: Edit tests will fail after Issue #3 is fixed  
**Tests Affected**: `admin-song-edit`, `admin-complete-journey`

**Problem**:

- Tests try to navigate to `/songs/${songId}/edit`
- This route may not exist

**Expected Route**:

```
/dashboard/songs/[id]/edit
```

**Current Link** (in `SongDetail/Actions.tsx`):

```tsx
<Link href={`/songs/${songId}/edit`}>  // ❌ Wrong route
```

**Fix Required**:

- [ ] **Verify edit page exists**: Check if `app/dashboard/songs/[id]/edit/page.tsx` exists
- [ ] **Fix link if needed**: Update to `/dashboard/songs/${songId}/edit`
- [ ] **Ensure edit page passes role props**: Same as Issue #3

**Estimated Time**: 30 minutes  
**Dependencies**: Issue #3 must be fixed first

---

### Issue #5: Missing Confirmation Dialog for Delete

**Priority**: MEDIUM (Test handles this conditionally)  
**Impact**: Delete tests check for optional confirmation  
**Tests Affected**: `admin-song-delete`, `admin-complete-journey`

**Problem**:

- Tests check for confirmation dialog: `[data-testid="confirm-delete"]`
- No confirmation dialog currently implemented
- Delete happens immediately

**Current Test Code** (handles gracefully):

```typescript
cy.get('body').then(($body) => {
  if ($body.find('[data-testid="confirm-delete"]').length > 0) {
    cy.get('[data-testid="confirm-delete"]').click();
  }
});
```

**Fix Required** (Optional but recommended):

- [ ] **Add confirmation dialog component**:
  - Use existing `DeleteConfirmationDialog.tsx` component
  - Integrate with `SongDetail` component
  - Add `data-testid="confirm-delete"` and `data-testid="cancel-delete"`

**Files to Modify**:

- `components/songs/SongDetail/index.tsx`
- `components/songs/SongDetail/Actions.tsx`

**Estimated Time**: 1 hour  
**Dependencies**: None (tests work without it)

---

## 🟢 Low Priority Issues (Nice to Have)

### Issue #6: Admin Stats API Endpoint Missing

**Priority**: LOW  
**Impact**: Dashboard shows "0" for all stats  
**Tests Affected**: Dashboard tests (pass despite this)

**Problem**:

- `AdminDashboardClient` expects stats object
- No API endpoint to fetch actual stats
- Stats are hardcoded or show 0

**Fix Required**:

- [ ] Create `/api/dashboard/admin/stats` endpoint
- [ ] Return actual counts from database:
  - Total users
  - Total teachers
  - Total students
  - Total songs
- [ ] Update dashboard page to fetch and pass stats

**Estimated Time**: 1-2 hours  
**Dependencies**: Issue #1

---

### Issue #7: Test Data Cleanup

**Priority**: LOW  
**Impact**: Tests may create orphaned data  
**Tests Affected**: All tests that create data

**Problem**:

- Tests create songs with unique timestamps
- No cleanup in `afterEach` hooks
- Database accumulates test data

**Fix Required**:

- [ ] Add cleanup in test files:
  ```typescript
  afterEach(() => {
    // Delete songs created during test
    // Option 1: Track created IDs and delete
    // Option 2: Use test prefix and delete all matching
  });
  ```

**Estimated Time**: 1 hour  
**Dependencies**: None

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Required for Tests to Pass)

**Estimated Time**: 4-6 hours

- [ ] **Fix Issue #1**: Update dashboard to show admin content

  - [ ] Modify `app/dashboard/page.tsx`
  - [ ] Add conditional rendering for admin users
  - [ ] Create admin stats fetching (if needed)
  - [ ] Test: `npm run e2e -- --spec "cypress/e2e/admin/admin-dashboard.cy.ts"`

- [ ] **Fix Issue #2**: Debug song creation API

  - [ ] Check server logs for actual error
  - [ ] Fix song API handler or RLS policies
  - [ ] Test song creation manually
  - [ ] Test: `npm run e2e -- --spec "cypress/e2e/admin/admin-create-song-journey.cy.ts"`

- [ ] **Fix Issue #3**: Pass role props to SongDetail
  - [ ] Update `app/dashboard/songs/[id]/page.tsx`
  - [ ] Pass `isAdmin` and `isTeacher` props
  - [ ] Test: `npm run e2e -- --spec "cypress/e2e/admin/admin-song-edit.cy.ts"`

### Phase 2: Medium Priority Fixes

**Estimated Time**: 1-2 hours

- [ ] **Fix Issue #4**: Verify/fix song edit route

  - [ ] Check if edit page exists
  - [ ] Update link if needed
  - [ ] Test edit workflow

- [ ] **Fix Issue #5**: Add delete confirmation (optional)
  - [ ] Implement confirmation dialog
  - [ ] Add test IDs
  - [ ] Test delete workflow

### Phase 3: Low Priority Improvements

**Estimated Time**: 2-3 hours

- [ ] **Fix Issue #6**: Create admin stats API
- [ ] **Fix Issue #7**: Add test data cleanup

---

## 🧪 Testing Strategy

### After Each Fix:

```bash
# 1. Run specific test file
npm run e2e -- --spec "cypress/e2e/admin/admin-dashboard.cy.ts"

# 2. If passes, run all admin tests
npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"

# 3. Check screenshots for any failures
ls cypress/screenshots/admin/
```

### Debug Failed Tests:

```bash
# Run in interactive mode
npm run e2e:open

# Select specific test file
# Watch it run and see where it fails
```

### Manual Testing:

```bash
# 1. Start dev server
npm run dev

# 2. Login as admin
# Email: p.romanczuk@gmail.com
# Password: test123_admin

# 3. Test each flow manually:
# - Visit /dashboard (should see "Admin Dashboard")
# - Visit /dashboard/songs (should see songs list)
# - Click on a song (should see edit/delete buttons)
# - Create a new song (should work without errors)
```

---

## 📊 Expected Results After Fixes

### Test Results Target:

```
✔ admin-sign-in.cy.ts              6 passing
✔ admin-dashboard.cy.ts           14 passing
✔ admin-create-song-journey.cy.ts  1 passing
✔ admin-song-edit.cy.ts            3 passing
✔ admin-song-delete.cy.ts          3 passing
✔ admin-song-delete-cascade.cy.ts  6 passing
✔ admin-complete-journey.cy.ts     3 passing

Total: 36 passing / 0 failing
Duration: ~3-4 minutes
```

---

## 🔍 Investigation Notes

### Server Error Logs (To Check)

When running tests, check Next.js terminal for actual errors:

```
POST /api/song 500 in 532ms
[Error details should appear here]
```

### Common Causes of 500 Errors:

1. **Database Connection**: Supabase not running or env vars wrong
2. **RLS Policies**: User doesn't have permission to insert
3. **Schema Validation**: Zod schema mismatch with data
4. **Missing Fields**: Required field not provided
5. **Type Errors**: Data type mismatch (string vs number)

### Quick Debugging Commands:

```bash
# Check if Supabase is running
docker ps | grep supabase

# Restart Supabase if needed
npm run setup:db

# Check environment variables
cat .env.local

# Test API directly with curl
curl -X POST http://localhost:3000/api/song \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","author":"Test","level":"beginner","key":"C","ultimate_guitar_link":"https://test.com"}'
```

---

## 📅 Recommended Timeline

### Day 1 (3-4 hours):

- Fix Issue #1 (Dashboard rendering)
- Fix Issue #3 (Role props)
- Run dashboard and edit tests

### Day 2 (2-3 hours):

- Fix Issue #2 (Song creation API)
- Run all tests
- Verify success

### Day 3 (1-2 hours):

- Fix Issue #4 (Edit route)
- Add Issue #5 (Confirmation dialog)
- Final test run

**Total Estimated Time**: 6-9 hours

---

## ✅ Success Criteria

Tests are considered fixed when:

- [ ] All 36 tests pass consistently (100% pass rate)
- [ ] No screenshots in `cypress/screenshots/` after test run
- [ ] Tests run in < 5 minutes
- [ ] Manual testing confirms all flows work
- [ ] No console errors in browser during tests

---

## 📝 Notes

- Tests were designed based on expected behavior, not current implementation
- This is normal in TDD: write tests first, then implement features
- The test suite is comprehensive and will be valuable once fixes are applied
- Documentation is complete and accurate for the expected state

---

**Created**: November 9, 2025  
**Last Updated**: November 9, 2025 - 18:30  
**Status**: � IN PROGRESS - 24/36 tests passing (66.7%)

---

## 📈 Progress Update (November 9, 2025 - 18:30)

### ✅ Completed Fixes (Commit: 1b5e93e)

**Issue #3: Pass role props to SongDetail component** - ✅ FIXED
- Updated `app/dashboard/songs/[id]/page.tsx` to pass `isAdmin` and `isTeacher` props
- Edit/delete buttons now visible to admin users
- Resolved 9+ test failures

**Issue #1: Update dashboard routing** - ✅ FIXED
- Modified `app/dashboard/page.tsx` to conditionally render `AdminDashboardClient` for admins
- Dashboard now shows "Admin Dashboard" text correctly
- 12/14 dashboard tests passing
- Remaining 2 failures are test-specific issues (debug view selector, user management link)

**Issue #4: Fix song edit route** - ✅ FIXED
- Corrected link from `/songs/{id}/edit` to `/dashboard/songs/{id}/edit`
- Updated edit page to check both `isAdmin` and `isTeacher` permissions
- Navigation tests passing

**Database Seeding** - ✅ COMPLETED
- Ran `bash scripts/database/seeding/local/seed-all.sh`
- Created 6 test users including admin (p.romanczuk@gmail.com / test123_admin)
- Seeded 13 songs, 12 lessons, 29 lesson-songs, 22 assignments
- Authentication now working for all tests

### 📊 Current Test Results

**Overall**: 24 passing / 10 failing / 2 skipped (36 total)

| Test File | Status | Pass | Fail | Skip | Notes |
|-----------|--------|------|------|------|-------|
| admin-sign-in.cy.ts | ✅ | 6/6 | 0 | 0 | All authentication tests passing |
| admin-dashboard.cy.ts | 🟡 | 12/14 | 2 | 0 | Most dashboard tests working |
| admin-complete-journey.cy.ts | 🟡 | 2/3 | 1 | 0 | Session/navigation working |
| admin-song-delete-cascade.cy.ts | 🟡 | 3/6 | 3 | 0 | API deletion works, UI tests failing |
| admin-song-edit.cy.ts | 🟡 | 1/3 | 2 | 0 | React re-render issue |
| admin-create-song-journey.cy.ts | ❌ | 0/1 | 1 | 0 | Song creation 500 error |
| admin-song-delete.cy.ts | ❌ | 0/3 | 1 | 2 | Blocked by beforeEach 500 error |

### 🔴 Remaining Issues

**Issue #2: Song Creation API 500 Error** - �🔴 CRITICAL (Blocks 3+ tests)
```
POST /api/song 500 in 583ms
AssertionError: expected 500 to be one of [ 200, 201 ]
```

**Status**: Database migrations applied, seed data loaded, but API still returns 500.

**Next Steps**:
1. Check Next.js server logs during test run for actual error
2. Possible causes:
   - Zod validation failing on test data
   - RLS policy blocking insert despite admin role
   - Missing field in song creation payload
   - Database constraint violation

**Investigation Needed**:
```bash
# Check what error is actually returned
# Look at Next.js terminal during: npm run e2e -- --spec "cypress/e2e/admin/admin-create-song-journey.cy.ts"
```

**Issue #5: Delete Buttons Not Visible in Some Tests** - 🟡 MEDIUM
- Tests `admin-song-delete-cascade.cy.ts` expect delete buttons on song detail pages
- 3/6 tests failing with "Expected to find element: `[data-testid="song-delete-button"]`"
- Despite fix #3, some pages still not showing buttons
- May be timing issue or specific song IDs not loading correctly

**Issue #6: Edit Form Re-rendering** - 🟡 MEDIUM
- Edit tests failing with "element detached from DOM" errors
- React hydration/re-render causing input fields to disappear during `cy.clear()` and `cy.type()`
- Cypress can't interact with fields that re-render mid-command

**Suggested Fix**:
```typescript
// Break up command chains to allow for re-renders
cy.get('#title').as('titleInput');
cy.get('@titleInput').clear();
cy.get('@titleInput').type('New Title');
```

**Issue #7: Minor Dashboard Test Failures** - 🟢 LOW
1. **User Management Navigation**: Test expects link to `/admin/users` but component shows "Coming Soon"
2. **Debug View Selector**: Test expects "Student View" text after clicking button - may be timing issue

---

## 🎯 Next Actions (Priority Order)

### 1. Debug Song Creation API (CRITICAL - 2-3 hours)
- [ ] Run test with Next.js console visible to capture actual error
- [ ] Check Zod validation on incoming payload
- [ ] Verify RLS policies allow admin to insert
- [ ] Test API endpoint manually with curl
- [ ] Add detailed error logging to handlers.ts

### 2. Fix Delete Button Visibility (30 min)
- [ ] Check which song IDs cascade tests are using
- [ ] Verify those songs exist in seeded data
- [ ] Add wait/retry logic to tests if timing issue

### 3. Fix Edit Form Re-rendering (30 min)
- [ ] Update edit tests to break up command chains
- [ ] Add `cy.wait()` or retry logic for DOM stability
- [ ] Consider adding `key` prop to form inputs

### 4. Update Dashboard Tests (15 min)
- [ ] Skip or update "User Management" test (feature not implemented)
- [ ] Fix debug view selector timing

---

## 📝 Summary

**Improvements Made**:
- ✅ **+10 passing tests** (from 14 to 24)
- ✅ Dashboard now renders correctly for admins
- ✅ Edit/delete buttons visible when roles passed correctly
- ✅ Navigation between pages working
- ✅ Authentication fully functional

**Remaining Work**:
- 🔴 1 critical blocker (song creation API)
- 🟡 3 medium issues (delete buttons, form re-rendering, cascade tests)
- 🟢 2 low priority test adjustments

**Created**: November 9, 2025  
**Last Updated**: November 9, 2025 - 18:30  
**Status**: 🟡 IN PROGRESS - 24/36 tests passing (66.7%)
