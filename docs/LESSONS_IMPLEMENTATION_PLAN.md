# Lessons Implementation Plan

## Current Status

### ✅ IMPLEMENTED

- **Database Schema**: `lessons` table with student_id, teacher_id, date, notes, lesson_teacher_number (auto-increment)
- **API Routes**:
  - `GET /api/lessons` - List lessons with role-based filtering
  - `POST /api/lessons` - Create lesson
  - Handlers structure in place
- **Pages**:
  - `/dashboard/lessons` - Lessons list page
  - `/dashboard/lessons/new` - Create lesson form
- **Components**:
  - `LessonForm` - Create lesson form
  - `LessonList` - Display lessons with filters
  - `LessonTable` - Table view of lessons
  - `useL​essonList` - Hook for lesson data
  - `useLessonForm` - Hook for form logic
- **Schemas**: LessonSchema validation in place

### ⏳ TODO - Priority Order

#### Phase 1: Core CRUD Operations (8 hours)

**Goal**: Get lessons CRUD fully working with E2E tests

1. **Verify POST /api/lessons endpoint** (1 hour)

   - [ ] Test create lesson API call
   - [ ] Verify validation working
   - [ ] Check response format

2. **Implement DELETE /api/lessons/[id] endpoint** (2 hours)

   - [ ] Add DELETE handler
   - [ ] Verify cascade cleanup (lesson_songs, tasks)
   - [ ] Add role-based authorization

3. **Implement PATCH /api/lessons/[id] endpoint** (2 hours)

   - [ ] Add PUT/PATCH handler
   - [ ] Validate update schema
   - [ ] Return updated lesson

4. **Create lesson detail page** (1 hour)

   - [ ] `/dashboard/lessons/[id]` page
   - [ ] Display lesson info with songs
   - [ ] Edit button that routes to edit page

5. **Create E2E test suite** (2 hours)
   - [ ] `cypress/e2e/admin/admin-lesson-journey.cy.ts`
   - [ ] Test: Create → List → Detail → Edit → Delete
   - [ ] Similar pattern to song tests

#### Phase 2: Lesson-Song Management (6 hours)

**Goal**: Enable assigning songs to lessons with progress tracking

1. **Implement lesson_songs assignment** (2 hours)

   - [ ] `/dashboard/lessons/[id]/songs` - song selection UI
   - [ ] API endpoint to add/remove songs from lesson
   - [ ] Display current songs in lesson detail

2. **Implement progress tracking** (2 hours)

   - [ ] Display lesson_songs with status badges
   - [ ] Add buttons to update song status
   - [ ] Real-time updates

3. **Add lesson-song E2E tests** (2 hours)
   - [ ] Test adding songs to lesson
   - [ ] Test updating song progress
   - [ ] Test removing songs

#### Phase 3: Task Management (8 hours)

**Goal**: Implement student task tracking for lessons

1. **Understand task_management table** (1 hour)

   - [ ] Review schema: task_id, student_id, lesson_id, etc.
   - [ ] Understand priority/status enum

2. **Create task API endpoints** (3 hours)

   - [ ] GET /api/tasks - List with filtering
   - [ ] POST /api/tasks - Create task
   - [ ] PUT /api/tasks/[id] - Update task
   - [ ] DELETE /api/tasks/[id] - Delete task

3. **Implement task UI** (3 hours)

   - [ ] Task list view
   - [ ] Task detail view
   - [ ] Task creation from lesson
   - [ ] Progress tracking UI

4. **Create task E2E tests** (1 hour)
   - [ ] Test task CRUD operations
   - [ ] Test task-lesson relationship

## Architecture Notes

### File Structure for Lessons

Following the component organization from songs:

```
components/lessons/
├── LessonList/              # List view
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Table.tsx
│   │   ├── Filter.tsx
│   │   └── Empty.tsx
│   ├── hooks/
│   │   └── useLessonList.ts
│   └── index.tsx
│
├── LessonForm/              # Create/edit form
│   ├── components/
│   │   ├── Fields.tsx
│   │   ├── ProfileSelect.tsx
│   │   └── Actions.tsx
│   ├── hooks/
│   │   └── useLessonForm.ts
│   └── index.tsx
│
├── LessonDetail/            # Detail view
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Songs.tsx
│   │   └── Actions.tsx
│   ├── hooks/
│   │   └── useLessonDetail.ts
│   └── index.tsx
│
├── hooks/                   # Shared hooks
│   ├── index.ts
│   ├── useLesson.ts
│   └── useLessonMutations.ts
│
├── types/
│   └── index.ts
│
├── services/
│   ├── lessonApi.ts
│   └── lessonQueries.ts
│
├── utils/
│   ├── formatters.ts
│   └── transformers.ts
│
└── tests/
    └── components (co-located)
```

### API Route Structure

```
app/api/lessons/
├── route.ts                 # GET, POST
├── handlers.ts              # Business logic
├── [id]/
│   ├── route.ts            # GET, PATCH, DELETE single lesson
│   └── songs/
│       └── route.ts        # Manage lesson songs
├── create/
│   └── route.ts            # Alternative create endpoint
└── schedule/
    └── route.ts            # Bulk schedule operations
```

## Testing Strategy

### Unit Tests

- Lesson schema validation
- Handler business logic
- Permission checking
- Status validation

### Integration Tests

- API endpoints with authentication
- Database operations (create, update, delete)
- Cascade deletions

### E2E Tests

- Full lesson CRUD workflow
- Role-based access control
- Lesson-song management
- Task creation from lessons

## Known Dependencies

1. **Profile/Role System**: Lessons uses teacher_id/student_id

   - Teacher can manage their own lessons
   - Admin can manage all lessons
   - Students can view assigned lessons

2. **Cascade Deletions**: Deleting lesson should:

   - Remove all lesson_songs records
   - Remove all task_management records
   - Remove all user_favorites references

3. **Auto-increment**: `lesson_teacher_number` should auto-increment per teacher-student pair

## Key Differences from Songs

| Aspect        | Songs                             | Lessons                           |
| ------------- | --------------------------------- | --------------------------------- |
| Creation      | Global (any teacher)              | Linked to teacher + student pair  |
| Deletion      | Soft delete with cascade          | Cascade to songs + tasks          |
| Permissions   | Teacher/Admin CRUD                | Teacher CRUD their own, Admin all |
| Relationships | Songs have lessons                | Lessons contain songs + tasks     |
| Status        | Song progress (to_learn→mastered) | Lesson complete/incomplete        |

## Next Steps

1. **Immediate**: Verify POST endpoint works with E2E test
2. **Day 1**: Implement DELETE endpoint + detail page
3. **Day 1**: Create full E2E test suite (admin-lesson-journey.cy.ts)
4. **Day 2**: Implement lesson-song management
5. **Day 3**: Implement task management

## References

- Songs implementation: `/components/songs/` (reference pattern)
- Lesson API handlers: `/app/api/lessons/handlers.ts` (existing business logic)
- Database schema: `supabase/migrations/` (see lesson-related tables)
