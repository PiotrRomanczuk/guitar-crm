# CRUD Implementation Checklist

## Overview

This checklist ensures every entity follows the standardized **role-based architecture** with consistent patterns across Admin, Teacher, and Student access levels.

**Use this checklist for:** Songs, Lessons, Assignments, Progress Tracking, or any new entity.

---

## 📋 Complete Implementation Checklist

### Phase 1: Database Layer (30 min)

#### 1.1 Create Migration File
- [ ] Create `supabase/migrations/YYYYMMDDHHMMSS_create_[entity]s.sql`
- [ ] Define table with required columns:
  - [ ] `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - [ ] `student_id UUID NOT NULL REFERENCES profiles(user_id)` ← **REQUIRED for role filtering**
  - [ ] Entity-specific fields
  - [ ] `created_at TIMESTAMPTZ DEFAULT NOW()`
  - [ ] `updated_at TIMESTAMPTZ DEFAULT NOW()`

#### 1.2 Add Indexes
- [ ] Create index on `student_id`: `CREATE INDEX idx_[entity]s_student_id ON [entity]s(student_id);`
- [ ] Create indexes on frequently queried fields
- [ ] Create indexes for sorting columns

#### 1.3 Enable Row Level Security
- [ ] `ALTER TABLE [entity]s ENABLE ROW LEVEL SECURITY;`

#### 1.4 Create RLS Policies (Standard for ALL entities)
- [ ] **Admin policy**: `CREATE POLICY "Admins can view all [entity]s" ON [entity]s FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true));`
- [ ] **Teacher SELECT policy**: Teachers see their students' entities via lessons join
- [ ] **Student SELECT policy**: `CREATE POLICY "Students can view their own [entity]s" ON [entity]s FOR SELECT TO authenticated USING (student_id = auth.uid());`
- [ ] **Mutation policy**: Admins and teachers can INSERT/UPDATE/DELETE
- [ ] Test policies in Supabase Studio

#### 1.5 Generate Types
- [ ] Run: `supabase gen types typescript --local > types/database.types.generated.ts`
- [ ] Verify new types are exported

---

### Phase 2: Schema Layer (30 min)

#### 2.1 Create Schema File
- [ ] Create `schemas/[Entity]Schema.ts`

#### 2.2 Define Core Schemas
- [ ] **Base Schema**: Full entity with all fields (including id, timestamps)
- [ ] **Input Schema**: For creating (required fields only, no id/timestamps)
- [ ] **Update Schema**: Partial input + required id
- [ ] **Filter Schema**: Query parameters (level, status, search, etc.)
- [ ] **Sort Schema**: Sorting fields and direction
- [ ] **With Relations Schema**: Extended with joined data if needed

#### 2.3 Export Types
- [ ] Export all schema types: `export type [Entity] = z.infer<typeof [Entity]Schema>;`
- [ ] Export from `schemas/index.ts`

#### 2.4 Add Tests
- [ ] Create `__tests__/schemas/[Entity]Schema.test.ts`
- [ ] Test valid input passes validation
- [ ] Test invalid input fails validation
- [ ] Test edge cases (empty strings, wrong types, etc.)
- [ ] Run: `npm run tdd`

---

### Phase 3: API Layer - Handlers (45 min)

#### 3.1 Create Handlers File
- [ ] Create `app/api/[entity]/handlers.ts`

#### 3.2 Define Interfaces
- [ ] `[Entity]QueryParams` interface
- [ ] `[Entity]Response` interface
- [ ] `[Entity]Error` interface
- [ ] `[Entity]Result` type (union)

#### 3.3 Implement GET Handler with Role Logic
- [ ] Auth check: `if (!user) return { error: 'Unauthorized', status: 401 };`
- [ ] **Admin logic**: No filtering (see all)
- [ ] **Teacher logic**: Filter by their students via lessons table
- [ ] **Student logic**: Filter by `student_id = user.id`
- [ ] Apply additional filters (level, search, etc.)
- [ ] Apply sorting and pagination
- [ ] Return data with count

#### 3.4 Implement CREATE Handler with Permissions
- [ ] Auth check
- [ ] **Permission check**: Only admins and teachers can create
- [ ] **Teacher ownership check**: Can only create for their students
- [ ] Zod validation
- [ ] Insert into database
- [ ] Return created entity or error

#### 3.5 Implement UPDATE Handler with Permissions
- [ ] Auth check
- [ ] Permission check (admin/teacher only)
- [ ] **Ownership check**: Teachers can only update their students' entities
- [ ] Zod validation (optional: use Update schema)
- [ ] Update in database
- [ ] Return updated entity

#### 3.6 Implement DELETE Handler with Permissions
- [ ] Auth check
- [ ] Permission check (admin/teacher only)
- [ ] **Ownership check**: Teachers can only delete their students' entities
- [ ] Delete from database
- [ ] Return success response

#### 3.7 Create Permission Helpers
- [ ] `canMutate(profile)` - checks if admin or teacher
- [ ] `canViewAll(profile)` - checks if admin
- [ ] `teacherOwnsStudent(supabase, teacherId, studentId)` - async check
- [ ] `getTeacherStudentIds(supabase, teacherId)` - get student list

#### 3.8 Add Handler Tests
- [ ] Create `__tests__/api/[entity]/handlers.test.ts`
- [ ] Test each role's access (admin, teacher, student)
- [ ] Test permission boundaries
- [ ] Test validation errors

---

### Phase 4: API Layer - Routes (60 min)

#### 4.1 Main Route File
- [ ] Create `app/api/[entity]/route.ts`
- [ ] Import handlers
- [ ] Create `getUserProfile` helper function
- [ ] Implement GET with auth + profile fetch + handler call
- [ ] Implement POST with auth + profile fetch + handler call
- [ ] Implement PUT with auth + profile fetch + handler call
- [ ] Implement DELETE with auth + profile fetch + handler call
- [ ] Use consistent error responses (401, 403, 404, 422, 500)

#### 4.2 Single Item Route
- [ ] Create `app/api/[entity]/[id]/route.ts`
- [ ] Implement GET for single item with role checks
- [ ] Verify user can access this specific item

#### 4.3 Admin/Teacher Route
- [ ] Create `app/api/[entity]/admin-[entity]s/route.ts`
- [ ] Verify admin or teacher role
- [ ] Return all entities (with teacher filtering if applicable)
- [ ] Support optional filters (level, search, etc.)

#### 4.4 Teacher-Specific Route (if needed)
- [ ] Create `app/api/[entity]/teacher-[entity]s/route.ts`
- [ ] Verify teacher role
- [ ] Get teacher's student IDs
- [ ] Return entities for those students only

#### 4.5 Student Route
- [ ] Create `app/api/[entity]/student-[entity]s/route.ts`
- [ ] Verify student role
- [ ] Verify user is requesting their own data
- [ ] Return entities assigned to this student

#### 4.6 Test Routes
- [ ] Test with admin user (should see all)
- [ ] Test with teacher user (should see their students' entities)
- [ ] Test with student user (should see only assigned entities)
- [ ] Test unauthorized access (should return 401)
- [ ] Test wrong role (should return 403)

---

### Phase 5: Component Layer - Admin (60 min)

#### 5.1 Create Admin Directory
- [ ] Create `components/admin/[entity]/`
- [ ] Create `components/admin/[entity]/index.ts` for re-exports

#### 5.2 Admin List Hook
- [ ] Create `components/admin/[entity]/use[Entity]List.ts`
- [ ] Use `useAuth()` hook
- [ ] Fetch from `/api/[entity]/admin-[entity]s`
- [ ] Handle loading, error, empty states
- [ ] Return `refresh` function
- [ ] Support filters (level, search, etc.)

#### 5.3 Admin List Component
- [ ] Create `components/admin/[entity]/[Entity]List.tsx`
- [ ] Use `use[Entity]List` hook
- [ ] Create sub-components:
  - [ ] `[Entity]List.Header.tsx` - title, actions, create button
  - [ ] `[Entity]List.Filter.tsx` - filter controls
  - [ ] `[Entity]List.Table.tsx` - data table with actions
  - [ ] `[Entity]List.Empty.tsx` - empty state
- [ ] Handle loading state (skeleton loader)
- [ ] Handle error state (with retry button)
- [ ] Mobile-first responsive design
- [ ] Dark mode support

#### 5.4 Admin Form Component
- [ ] Create `components/admin/[entity]/[Entity]Form.tsx`
- [ ] Support create and edit modes
- [ ] Zod validation before submit
- [ ] Create sub-components:
  - [ ] `[Entity]Form.Fields.tsx` - form fields
  - [ ] `[Entity]Form.Actions.tsx` - submit/cancel buttons
- [ ] Handle loading/error states
- [ ] Redirect after success

#### 5.5 Admin Detail Component (if needed)
- [ ] Create `components/admin/[entity]/[Entity]Detail.tsx`
- [ ] Fetch single item
- [ ] Display all fields
- [ ] Add edit/delete actions

---

### Phase 6: Component Layer - Teacher (60 min)

#### 6.1 Create Teacher Directory
- [ ] Create `components/teacher/[entity]/`
- [ ] Create `components/teacher/[entity]/index.ts`

#### 6.2 Teacher List Hook
- [ ] Create `components/teacher/[entity]/use[Entity]List.ts`
- [ ] Fetch from `/api/[entity]/teacher-[entity]s`
- [ ] Filter to teacher's students only
- [ ] Similar structure to admin hook

#### 6.3 Teacher List Component
- [ ] Create `components/teacher/[entity]/[Entity]List.tsx`
- [ ] Similar to admin but filtered
- [ ] Add student selector if creating new
- [ ] Sub-components for decomposition

#### 6.4 Teacher Form Component
- [ ] Create `components/teacher/[entity]/[Entity]Form.tsx`
- [ ] Limit to teacher's students
- [ ] Add student selector
- [ ] Validation for ownership

---

### Phase 7: Component Layer - Student (45 min)

#### 7.1 Create Student Directory
- [ ] Create `components/student/[entity]/`
- [ ] Create `components/student/[entity]/index.ts`

#### 7.2 Student List Hook
- [ ] Create `components/student/[entity]/use[Entity]List.ts`
- [ ] Fetch from `/api/[entity]/student-[entity]s`
- [ ] Read-only access

#### 7.3 Student List Component
- [ ] Create `components/student/[entity]/[Entity]List.tsx`
- [ ] Card-based layout (more visual)
- [ ] No edit/delete actions
- [ ] Sub-components:
  - [ ] `[Entity]List.Card.tsx` - card display
  - [ ] `[Entity]List.Grid.tsx` - grid layout

#### 7.4 Student Detail Component
- [ ] Create `components/student/[entity]/[Entity]Detail.tsx`
- [ ] Read-only view
- [ ] Show all relevant information
- [ ] No edit actions

---

### Phase 8: Page Layer (45 min)

#### 8.1 Admin Pages
- [ ] Create `app/admin/[entity]/page.tsx` - list page
- [ ] Create `app/admin/[entity]/[id]/page.tsx` - detail page
- [ ] Create `app/admin/[entity]/[id]/edit/page.tsx` - edit page
- [ ] Create `app/admin/[entity]/new/page.tsx` - create page
- [ ] Wrap with `ProtectedRoute` (admin only)

#### 8.2 Teacher Pages
- [ ] Create `app/teacher/[entity]/page.tsx` - list page
- [ ] Create `app/teacher/[entity]/[id]/page.tsx` - detail page
- [ ] Create `app/teacher/[entity]/[id]/edit/page.tsx` - edit page
- [ ] Create `app/teacher/[entity]/new/page.tsx` - create page
- [ ] Wrap with `ProtectedRoute` (teacher only)

#### 8.3 Student Pages
- [ ] Create `app/student/[entity]/page.tsx` - list page (read-only)
- [ ] Create `app/student/[entity]/[id]/page.tsx` - detail page (read-only)
- [ ] Wrap with `ProtectedRoute` (student only)

---

### Phase 9: Testing (90 min)

#### 9.1 Schema Tests
- [ ] Valid data passes
- [ ] Invalid data fails
- [ ] Edge cases handled
- [ ] Run: `npm test -- [Entity]Schema.test.ts`

#### 9.2 Handler Tests
- [ ] Admin can see all
- [ ] Teacher sees their students' entities
- [ ] Student sees only assigned
- [ ] Permission checks work
- [ ] Validation errors handled
- [ ] Run: `npm test -- handlers.test.ts`

#### 9.3 Component Tests
- [ ] Admin list renders
- [ ] Teacher list renders with filters
- [ ] Student list renders read-only
- [ ] Forms submit correctly
- [ ] Error states display
- [ ] Loading states display
- [ ] Run: `npm test -- [Entity]List.test.tsx`

#### 9.4 Integration Tests
- [ ] End-to-end flow for each role
- [ ] Create → Read → Update → Delete for admin
- [ ] Create → Read → Update → Delete for teacher (their students)
- [ ] Read-only for student

#### 9.5 Run Quality Checks
- [ ] Run: `npm run quality`
- [ ] Fix any lint errors
- [ ] Fix any type errors
- [ ] Ensure test coverage > 70%

---

### Phase 10: Documentation & Cleanup (30 min)

#### 10.1 Update Documentation
- [ ] Add entity to schema README
- [ ] Update API documentation
- [ ] Add usage examples
- [ ] Update TODO.md if incomplete

#### 10.2 Code Review Checklist
- [ ] All files follow small component policy
- [ ] No console.log in production code
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] Mobile-first design implemented
- [ ] Dark mode support added
- [ ] Loading/error states handled
- [ ] All auth checks in place

#### 10.3 Git Workflow
- [ ] Create feature branch: `git checkout -b feature/[entity]-crud`
- [ ] Commit migrations: `git commit -m "feat: add [entity] database schema"`
- [ ] Commit schemas: `git commit -m "feat: add [entity] Zod schemas"`
- [ ] Commit API: `git commit -m "feat: add [entity] API routes with role-based access"`
- [ ] Commit components: `git commit -m "feat: add [entity] components for all roles"`
- [ ] Commit pages: `git commit -m "feat: add [entity] pages for all roles"`
- [ ] Commit tests: `git commit -m "test: add [entity] tests"`
- [ ] Push and create PR

---

## ⏱️ Time Estimates

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Database Layer | 30 min | 30 min |
| Schema Layer | 30 min | 60 min |
| API Handlers | 45 min | 105 min |
| API Routes | 60 min | 165 min |
| Admin Components | 60 min | 225 min |
| Teacher Components | 60 min | 285 min |
| Student Components | 45 min | 330 min |
| Pages | 45 min | 375 min |
| Testing | 90 min | 465 min |
| Documentation | 30 min | 495 min |
| **TOTAL** | **8.25 hours** | |

*First implementation may take longer. Subsequent entities should be faster with established patterns.*

---

## 🎯 Quick Validation

After implementation, verify:
- [ ] Admin can CRUD all entities
- [ ] Teacher can CRUD their students' entities only
- [ ] Student can READ their entities only
- [ ] Unauthorized users get 401
- [ ] Wrong roles get 403
- [ ] Invalid data gets 422
- [ ] Database errors return 500
- [ ] All tests pass
- [ ] Quality checks pass
- [ ] Mobile UI works
- [ ] Dark mode works

---

## 📚 Reference Documents

While implementing, refer to:
- **ROLE_BASED_ARCHITECTURE.md** - Visual diagrams and patterns
- **CRUD_STANDARDS.md** - Detailed implementation guide
- **CRUD_QUICK_REFERENCE.md** - Code templates
- **SONGS_CRUD_REVIEW.md** - Current implementation example

---

## 🚨 Common Mistakes to Avoid

1. ❌ Forgetting `student_id` column in table
2. ❌ Missing RLS policies for one or more roles
3. ❌ Not implementing role-based filtering in handlers
4. ❌ Forgetting to verify teacher ownership in mutations
5. ❌ Creating monolithic components (split into small pieces!)
6. ❌ Not using `useAuth()` hook
7. ❌ Hardcoding role checks instead of using helpers
8. ❌ Not handling loading/error/empty states
9. ❌ Skipping mobile-first design
10. ❌ Not writing tests before implementation (TDD!)

---

## ✅ Success Criteria

Your implementation is complete when:
1. All checkboxes above are checked
2. All three roles have working, tested flows
3. Quality checks pass without errors
4. Documentation is updated
5. PR is created and reviewable
6. You can demo each role's user journey

**Time to implement**: ~8 hours for complete, production-ready CRUD

**Confidence level**: Following this checklist ensures 100% compliance with role-based architecture standards.
