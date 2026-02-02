# Security Tests

This directory contains security-focused Playwright tests for the Strummy application.

## Overview

Security tests verify that multi-tenancy data isolation is properly enforced across different user roles, with special emphasis on teacher-to-teacher data segregation.

## Test Files

### `teacher-isolation.spec.ts`

**Purpose**: Verify that teachers can only access their own students and lessons, not data from other teachers.

**Critical Tests**:
1. **API Endpoint Isolation** - Verify API routes properly filter data by teacher
2. **Dashboard UI Isolation** - Verify frontend correctly displays only authorized data
3. **Cross-Teacher Operations** - Verify teachers cannot manipulate other teachers' data

**Known Vulnerabilities Documented**:

#### 🔴 CRITICAL: Student List API Vulnerability

**Location**: `/app/api/teacher/students/route.ts` (lines 27-31)

**Issue**: The endpoint returns ALL students without filtering by teacher ID.

```typescript
// VULNERABLE CODE:
const { data: students, error: studentsError } = await supabase
  .from('profiles')
  .select('id, full_name, user_roles!inner(role)')
  .eq('user_roles.role', 'student')  // ❌ No teacher_id filter!
  .order('full_name');
```

**Impact**:
- Teacher A can see all of Teacher B's students
- Violates multi-tenant data isolation
- Potential privacy/compliance issue (GDPR, FERPA, etc.)

**Fix Required**:
```typescript
// SECURE CODE (requires teacher-student relationship table):
const { data: students, error: studentsError } = await supabase
  .from('profiles')
  .select('id, full_name, user_roles!inner(role)')
  .eq('user_roles.role', 'student')
  .in('id', [/* student IDs from lessons where teacher_id = auth.uid() */])
  .order('full_name');
```

**Test Coverage**:
- `VULNERABILITY: /api/teacher/students returns ALL students without teacher filtering`
- This test currently EXPECTS the vulnerability (passes when vulnerability exists)
- Once fixed, update the test expectation to verify proper isolation

#### ✅ Lessons API - Properly Secured

**Location**: `/app/api/lessons/handlers.ts` (lines 94-106)

**Implementation**: Correctly filters lessons by teacher via `getTeacherStudentIds()`

```typescript
// SECURE CODE:
if (profile.isTeacher) {
  const studentIds = await getTeacherStudentIds(supabase, user.id);
  if (studentIds.length === 0) {
    return { lessons: [], count: 0, status: 200 };
  }
  const filteredQuery = dbQuery.in('student_id', studentIds);
  // ...
}
```

**RLS Policies**: Database Row-Level Security further enforces isolation:

```sql
-- From supabase/migrations/022_rls_policies.sql (lines 101-107)
CREATE POLICY lessons_select_teacher ON lessons
  FOR SELECT USING (teacher_id = auth.uid());
```

## Running Security Tests

```bash
# Run all security tests
npm run cypress:run -- --grep @security

# Run only teacher isolation tests
npx playwright test tests/e2e/security/teacher-isolation.spec.ts

# Run with UI for debugging
npx playwright test tests/e2e/security/teacher-isolation.spec.ts --ui

# Run specific test
npx playwright test tests/e2e/security/teacher-isolation.spec.ts -g "VULNERABILITY"
```

## Test Data Setup

Tests automatically create and clean up the following data:

- **2 Teachers**:
  - `security-test-teacher1@example.com`
  - `security-test-teacher2@example.com`

- **3 Students**:
  - Teacher 1: 2 students
  - Teacher 2: 1 student

- **2 Lessons**:
  - Teacher 1: 1 lesson with their student
  - Teacher 2: 1 lesson with their student

All test data is prefixed with `security-test-` and cleaned up after tests complete.

## Environment Requirements

Security tests require the Supabase service role key for test data setup:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Required for admin operations
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # Required for auth
NEXT_PUBLIC_SUPABASE_LOCAL_URL=http://127.0.0.1:54321  # Local Supabase
```

## Security Test Principles

1. **Least Privilege**: Users should only access data they own or are authorized to see
2. **Defense in Depth**: Security enforced at multiple layers (RLS, API, UI)
3. **Fail Secure**: Unauthorized access attempts should fail safely
4. **Audit Trail**: Security violations should be logged and observable

## Fixing the Vulnerability

To fix the student list vulnerability:

1. **Create Teacher-Student Relationship**:
   - Option A: Use existing `lessons` table (teacher_id + student_id relationships)
   - Option B: Create dedicated `teacher_students` junction table

2. **Update API Route** (`app/api/teacher/students/route.ts`):
   ```typescript
   // Get student IDs from lessons where teacher_id = current user
   const { data: lessonData } = await supabase
     .from('lessons')
     .select('student_id')
     .eq('teacher_id', user.id);

   const studentIds = Array.from(new Set(
     lessonData?.map(l => l.student_id) || []
   ));

   if (studentIds.length === 0) {
     return NextResponse.json({ students: [] });
   }

   // Now filter students by these IDs
   const { data: students } = await supabase
     .from('profiles')
     .select('id, full_name, user_roles!inner(role)')
     .eq('user_roles.role', 'student')
     .in('id', studentIds)  // ✅ Filter by teacher's students only
     .order('full_name');
   ```

3. **Update Test Expectations**:
   ```typescript
   // Change from:
   expect(hasTeacher2Student).toBe(true); // Documents the vulnerability

   // To:
   expect(hasTeacher2Student).toBe(false); // Expects proper isolation
   ```

4. **Verify Fix**:
   ```bash
   npx playwright test tests/e2e/security/teacher-isolation.spec.ts
   # All tests should pass
   ```

## Adding New Security Tests

When adding new security tests:

1. Follow existing patterns in `teacher-isolation.spec.ts`
2. Use descriptive test names that explain the security concern
3. Document any vulnerabilities found with severity level (🔴 Critical, 🟡 Medium, 🟢 Low)
4. Include fix suggestions in comments
5. Use `console.error()` for security breaches to make them visible in CI logs

## Related Documentation

- RLS Policies: `/supabase/migrations/022_rls_policies.sql`
- Lessons Handlers: `/app/api/lessons/handlers.ts`
- Teacher Students API: `/app/api/teacher/students/route.ts`
- Auth Fixtures: `/tests/fixtures/auth.fixture.ts`
