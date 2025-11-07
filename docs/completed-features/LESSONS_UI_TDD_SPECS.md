# Lessons UI - TDD Test Specifications

**Status**: ✅ Complete - Ready for implementation  
**Created**: November 3, 2025  
**Purpose**: Define UI requirements through failing tests (Test-Driven Development)

---

## Overview

Three comprehensive TDD test suites that define the complete lessons UI requirements for all user roles. These tests **WILL FAIL** until the UI is implemented - this is intentional and follows proper TDD methodology.

### Test Files Created

1. **`cypress/e2e/lessons/admin-lessons.cy.ts`** - Admin complete CRUD (9 tests)
2. **`cypress/e2e/lessons/teacher-lessons.cy.ts`** - Teacher filtered CRUD (9 tests)
3. **`cypress/e2e/lessons/student-lessons.cy.ts`** - Student read-only view (10 tests)

**Total**: 28 TDD tests defining all UI requirements

---

## Admin Tests (9 tests)

### Routes to Implement

- `/lessons` - Full lessons list (all students/teachers)
- `/lessons/new` - Create lesson form
- `/lessons/[id]` - View/edit/delete lesson details

### Test Coverage

#### 1. List Page

```typescript
should display lessons list page with table
```

**Requirements**:

- Page title "Lessons"
- API call to fetch all lessons
- Table with columns: Student, Teacher, Date, Status, Actions
- "Create New Lesson" button

#### 2. Create Form Navigation

```typescript
should navigate to create lesson form
```

**Requirements**:

- Form with required fields: student dropdown, teacher dropdown, date
- Optional fields: time, title, notes
- Submit and cancel buttons

#### 3. Create Flow

```typescript
should create a new lesson successfully
```

**Requirements**:

- Form submission with validation
- POST API call with correct payload
- Redirect to details page
- Success message

#### 4. Details Page

```typescript
should display lesson details page
```

**Requirements**:

- Display lesson information
- Student and teacher information
- Action buttons: edit, delete, back

#### 5. Status Update

```typescript
should update lesson status
```

**Requirements**:

- Status dropdown with auto-save
- PATCH API call
- Updated status displayed

#### 6. Delete Flow

```typescript
should delete lesson with confirmation
```

**Requirements**:

- Delete button
- Confirmation dialog
- DELETE API call
- Redirect to list with success message

#### 7. Filter by Student

```typescript
should filter lessons by student
```

**Requirements**:

- Filter controls on list page
- Student dropdown filter
- Filtered API call

#### 8. Sort by Date

```typescript
should sort lessons by date
```

**Requirements**:

- Clickable date column header
- Sorted API call

#### 9. Form Validation

```typescript
should validate required fields
```

**Requirements**:

- Error messages for missing fields
- No API call with invalid data

---

## Teacher Tests (9 tests)

### Routes to Implement

- `/teacher/lessons` - Filtered list (teacher's students only)
- `/teacher/lessons/new` - Create form (filtered student dropdown)
- `/teacher/lessons/[id]` - View/edit/delete own lessons

### Test Coverage

#### 1. Filtered List

```typescript
should display lessons list filtered to teacher's students only
```

**Requirements**:

- API filtered by teacher ID
- Table WITHOUT "Teacher" column (always current teacher)
- Only shows lessons for teacher's assigned students

#### 2. Filtered Student Dropdown

```typescript
should show only assigned students in create form dropdown
```

**Requirements**:

- Student dropdown shows ONLY teacher's students
- NO "All Students" option (admin only)
- Teacher field NOT present (auto-filled)

#### 3. Create for Student

```typescript
should create lesson for assigned student
```

**Requirements**:

- Form submission auto-fills teacher_id
- Only assigned students selectable
- Success flow

#### 4. Edit Own Lesson

```typescript
should edit own lesson
```

**Requirements**:

- Can access own lesson details
- Edit button available
- Update API call

#### 5. Delete Own Lesson

```typescript
should delete own lesson
```

**Requirements**:

- Delete button with confirmation
- API call
- Redirect to teacher list

#### 6. Block Other Teachers

```typescript
should not access other teachers' lessons
```

**Requirements**:

- 404 or access denied for other teachers' lessons
- Proper error message

#### 7. Block Admin Routes

```typescript
should not access admin lessons routes
```

**Requirements**:

- `/admin/lessons` returns 403 or redirects
- Proper access control

#### 8. Filter by Status

```typescript
should filter lessons by status
```

**Requirements**:

- Status filter dropdown
- Filtered API call

#### 9. Validation

```typescript
should validate required fields in create form
```

**Requirements**:

- Student and date required
- Error messages

---

## Student Tests (10 tests)

### Routes to Implement

- `/student/lessons` - Read-only list of own lessons
- `/student/lessons/[id]` - Read-only details view
- `/student/dashboard` - Upcoming lessons widget

### Test Coverage

#### 1. Read-Only List

```typescript
should display read-only lessons list
```

**Requirements**:

- API filtered by student ID
- Table WITHOUT "Actions" column
- NO create button

#### 2. Block Create Route

```typescript
should block access to create lesson route
```

**Requirements**:

- `/student/lessons/new` shows 403 or redirects
- Forbidden message displayed

#### 3. Read-Only Details

```typescript
should display lesson details in read-only mode
```

**Requirements**:

- All form fields disabled
- NO edit button
- NO delete button

#### 4. Block Teacher Routes

```typescript
should not access teacher lessons routes
```

**Requirements**:

- `/teacher/lessons` returns 403 or redirects

#### 5. Block Admin Routes

```typescript
should not access admin lessons routes
```

**Requirements**:

- `/admin/lessons` returns 403 or redirects

#### 6. Dashboard Widget

```typescript
should display upcoming lessons on dashboard
```

**Requirements**:

- Upcoming lessons widget on dashboard
- Clickable to view details

#### 7. Filter by Status

```typescript
should filter lessons by status
```

**Requirements**:

- Status filter (view past/upcoming)
- Filtered API call

#### 8. Sort by Date

```typescript
should sort lessons by date
```

**Requirements**:

- Clickable date header
- Sorted API call

#### 9. Empty State

```typescript
should show empty state when no lessons
```

**Requirements**:

- Empty state message
- Helpful text ("No lessons scheduled yet")

#### 10. Block Edit Attempt

```typescript
should attempt to edit lesson and fail
```

**Requirements**:

- Direct URL to `/student/lessons/[id]/edit` fails
- Proper error or redirect

---

## Common Patterns Across All Roles

### Data Attributes Required

```typescript
// List pages
[data-testid="page-title"]
[data-testid="lessons-table"]
[data-testid="create-lesson-button"] // Admin/Teacher only
[data-testid="filter-status"]

// Forms
[data-testid="create-lesson-form"]
// Standard name attributes: student_id, teacher_id, date, start_time, title, notes

// Details pages
[data-testid="lesson-details"]
[data-testid="lesson-student"]
[data-testid="lesson-teacher"]
[data-testid="lesson-status-select"]
[data-testid="edit-lesson-button"] // Admin/Teacher only
[data-testid="delete-lesson-button"] // Admin/Teacher only
[data-testid="back-button"]

// Dialogs
[data-testid="confirm-dialog"]
[data-testid="confirm-delete-button"]

// States
[data-testid="empty-state"]
[data-testid="forbidden-message"]

// Dashboard
[data-testid="upcoming-lessons"]
[data-testid="lesson-item"]
```

### API Endpoints Expected

```typescript
// Read
GET /api/lessons              // Admin: all, Teacher: filtered, Student: filtered
GET /api/lessons/:id          // Role-based access

// Write (Admin/Teacher only)
POST /api/lessons             // Create
PATCH /api/lessons/:id        // Update
DELETE /api/lessons/:id       // Delete

// Role-specific
GET /api/teacher/lessons      // Teacher's lessons
GET /api/student/lessons      // Student's lessons
POST /api/teacher/lessons     // Teacher creates
```

### Role-Based URL Patterns

```typescript
// Admin
/lessons                      // List all
/lessons/new                  // Create
/lessons/:id                  // View/edit/delete

// Teacher
/teacher/lessons              // List own students' lessons
/teacher/lessons/new          // Create for own students
/teacher/lessons/:id          // View/edit/delete own lessons

// Student
/student/lessons              // List own lessons (read-only)
/student/lessons/:id          // View own lesson (read-only)
/student/dashboard            // Shows upcoming lessons
```

---

## Implementation Checklist

### Phase 1: Shared Components

- [ ] `LessonTable` component with role-based columns
- [ ] `LessonForm` component with role-based fields
- [ ] `LessonDetails` component with role-based actions
- [ ] `ConfirmDialog` component for delete confirmation
- [ ] `EmptyState` component for no lessons

### Phase 2: Admin Pages

- [ ] `/app/lessons/page.tsx` - Admin list
- [ ] `/app/lessons/new/page.tsx` - Admin create
- [ ] `/app/lessons/[id]/page.tsx` - Admin details/edit

### Phase 3: Teacher Pages

- [ ] `/app/teacher/lessons/page.tsx` - Teacher list
- [ ] `/app/teacher/lessons/new/page.tsx` - Teacher create
- [ ] `/app/teacher/lessons/[id]/page.tsx` - Teacher details/edit

### Phase 4: Student Pages

- [ ] `/app/student/lessons/page.tsx` - Student list (read-only)
- [ ] `/app/student/lessons/[id]/page.tsx` - Student details (read-only)
- [ ] `/app/student/dashboard/page.tsx` - Add upcoming lessons widget

### Phase 5: API Routes (if not exist)

- [ ] `/app/api/lessons/route.ts` - List/Create with role filtering
- [ ] `/app/api/lessons/[id]/route.ts` - Get/Update/Delete with role auth
- [ ] `/app/api/teacher/lessons/route.ts` - Teacher-specific endpoints
- [ ] `/app/api/student/lessons/route.ts` - Student-specific endpoints

### Phase 6: Access Control

- [ ] Middleware or route guards for role-based access
- [ ] API-level role validation
- [ ] UI-level role-based rendering

---

## Running the Tests

### Run All Lessons Tests

```bash
npx cypress run --spec "cypress/e2e/lessons/*.cy.ts"
```

### Run Individual Role Tests

```bash
# Admin tests
npx cypress run --spec "cypress/e2e/lessons/admin-lessons.cy.ts"

# Teacher tests
npx cypress run --spec "cypress/e2e/lessons/teacher-lessons.cy.ts"

# Student tests
npx cypress run --spec "cypress/e2e/lessons/student-lessons.cy.ts"
```

### Interactive Mode (Recommended)

```bash
npx cypress open
# Select E2E Testing → Chrome → Select test file
```

---

## Expected Test Results (Before Implementation)

### All Tests Should Fail With Clear Messages

**Example failure messages you should see**:

```
✗ should display lessons list page with table
  - Expected to find element: [data-testid="page-title"], but never found it

✗ should navigate to create lesson form
  - Expected pathname to be '/lessons/new', but found '/'

✗ should create a new lesson successfully
  - Expected to find element: [data-testid="create-lesson-form"], but never found it
```

These failures are **expected and correct**. They define what needs to be built.

---

## TDD Workflow

### Red-Green-Refactor Cycle

1. **🔴 RED**: Run tests - they fail (current state)
2. **🟢 GREEN**: Implement minimal code to pass tests
   - Start with admin list page
   - Add create form
   - Add details page
   - Repeat for teacher and student
3. **🔵 REFACTOR**: Improve code while keeping tests green
   - Extract shared components
   - Optimize performance
   - Improve styling

### Recommended Implementation Order

1. **Admin first** (9 tests)
   - Full CRUD, no filtering complexity
   - Establishes base components
2. **Teacher second** (9 tests)
   - Adds filtering logic
   - Adds role-based access control
3. **Student last** (10 tests)
   - Simplest (read-only)
   - Validates access control

---

## Success Criteria

### Tests Pass When:

- All 28 tests run without errors
- No test requires `.skip()` or modifications
- All data-testid attributes are in place
- All API calls return expected status codes
- All role-based access controls work correctly

### Implementation Complete When:

- ✅ All TDD tests pass
- ✅ Manual testing confirms functionality
- ✅ Role-based access control verified
- ✅ Mobile-responsive design implemented
- ✅ Dark mode support added
- ✅ Error handling and loading states work

---

## Related Documentation

- **API Tests**: `docs/completed-features/LESSONS_API_TESTS.md`
- **CRUD Standards**: `docs/architecture/CRUD_STANDARDS.md`
- **Role Architecture**: `docs/architecture/ROLE_BASED_ARCHITECTURE.md`
- **Implementation Checklist**: `docs/architecture/CRUD_IMPLEMENTATION_CHECKLIST.md`

---

## Notes

- Tests use existing API-only test helpers from `cypress/support/supabase.ts`
- Authentication handled by `signIn()` helper from `cypress/support/journeys.ts`
- API intercepts set up via `interceptLessonsApi()` helper
- Test accounts defined in `development_credentials.txt`

---

**Next Step**: Run the tests to see them fail, then start implementing the UI to make them pass! 🚀
