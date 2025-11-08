# Role-Based CRUD Architecture - Visual Guide

## 🏗️ Three-Tier Role System

```
┌─────────────────────────────────────────────────────────────┐
│                         ADMIN ROLE                          │
│  ✅ Full Access to Everything                               │
│  ✅ All CRUD operations on all entities                     │
│  ✅ User management                                          │
│  ✅ System configuration                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        TEACHER ROLE                         │
│  ✅ View/Edit their students' entities                      │
│  ✅ Create new entities for their students                  │
│  ✅ Delete entities they created                            │
│  ❌ Cannot see other teachers' students                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        STUDENT ROLE                         │
│  ✅ View entities assigned to them                          │
│  ❌ Cannot create, update, or delete                        │
│  ❌ Cannot see other students' entities                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Access Matrix

### Songs Entity Example

| User Type   | View All                 | View Single            | Create | Update                  | Delete                  |
| ----------- | ------------------------ | ---------------------- | ------ | ----------------------- | ----------------------- |
| **Admin**   | ✅ All songs             | ✅ Any song            | ✅ Yes | ✅ Any song             | ✅ Any song             |
| **Teacher** | ✅ Their students' songs | ✅ If their student's  | ✅ Yes | ✅ Their students' only | ✅ Their students' only |
| **Student** | ✅ Assigned songs only   | ✅ If assigned to them | ❌ No  | ❌ No                   | ❌ No                   |

### Lessons Entity Example

| User Type   | View All         | View Single      | Create                | Update           | Delete           |
| ----------- | ---------------- | ---------------- | --------------------- | ---------------- | ---------------- |
| **Admin**   | ✅ All lessons   | ✅ Any lesson    | ✅ Yes                | ✅ Any lesson    | ✅ Any lesson    |
| **Teacher** | ✅ Their lessons | ✅ Their lessons | ✅ For their students | ✅ Their lessons | ✅ Their lessons |
| **Student** | ✅ Their lessons | ✅ Their lessons | ❌ No                 | ❌ No            | ❌ No            |

---

## 🗂️ Directory Structure by Role

```
app/
├── admin/                       🔴 ADMIN ONLY
│   ├── page.tsx                # Admin dashboard
│   ├── songs/
│   │   ├── page.tsx           # Full song management
│   │   ├── [id]/edit/         # Edit any song
│   │   └── new/               # Create song
│   ├── lessons/               # Full lesson management
│   ├── students/              # All students
│   └── users/                 # User management
│
├── teacher/                     🟡 TEACHER ONLY
│   ├── page.tsx                # Teacher dashboard
│   ├── songs/
│   │   ├── page.tsx           # Their students' songs
│   │   ├── [id]/edit/         # Edit their students' songs
│   │   └── new/               # Create songs for students
│   ├── lessons/
│   │   ├── page.tsx           # Their lessons
│   │   └── [id]/edit/         # Edit their lessons
│   └── students/
│       └── page.tsx           # Only their students
│
└── student/                     🟢 STUDENT ONLY
    ├── page.tsx                # Student dashboard
    ├── songs/
    │   ├── page.tsx           # Assigned songs (read-only)
    │   └── [id]/              # Song detail (read-only)
    ├── lessons/
    │   ├── page.tsx           # Their lessons (read-only)
    │   └── [id]/              # Lesson detail (read-only)
    └── progress/
        └── page.tsx           # Progress tracking
```

---

## 🔀 API Route Flow

### Request Flow by Role

```
User Request → Authentication → Role Check → Route Handler
                     ↓              ↓             ↓
                   User ID      Profile Fetch   Role-based
                                (is_admin,      Filtering
                                is_teacher,
                                is_student)
```

### Example: GET /api/songs

```typescript
// 1. All roles hit same endpoint
GET /api/songs

// 2. Handler applies role-based filtering
if (is_admin) {
  → Return ALL songs
} else if (is_teacher) {
  → Return songs of teacher's students only
} else if (is_student) {
  → Return songs assigned to this student only
}

// 3. Response customized per role
Admin    → [song1, song2, song3, song4, song5, ...]
Teacher  → [song1, song3, song5] (only their students')
Student  → [song3] (only assigned to them)
```

### Role-Specific Endpoints

```
API Structure:
/api/songs/
├── route.ts                    # Smart routing (all roles)
├── handlers.ts                 # Role-aware business logic
├── admin-songs/route.ts        # Admin/Teacher optimized
├── teacher-songs/route.ts      # Teacher-specific queries
└── student-songs/route.ts      # Student-specific queries

Frontend Hook Routing:
const endpoint = isAdmin || isTeacher
  ? '/api/songs/admin-songs'
  : '/api/songs/student-songs';
```

---

## 🎯 Component Structure by Role

### Separate Components Per Role

```
components/
├── admin/songs/
│   ├── SongList.tsx           # Full management UI
│   ├── SongForm.tsx           # All fields editable
│   ├── SongTable.tsx          # With edit/delete actions
│   └── SongFilters.tsx        # Advanced filters
│
├── teacher/songs/
│   ├── SongList.tsx           # Filtered to their students
│   ├── SongForm.tsx           # Limited fields
│   ├── SongTable.tsx          # With edit/delete (their songs)
│   └── StudentSelector.tsx    # Pick from their students
│
└── student/songs/
    ├── SongList.tsx           # Read-only card view
    ├── SongCard.tsx           # Display only
    └── SongDetail.tsx         # View details, no edit
```

### Component Reusability Strategy

```
Shared: Low-level UI components (buttons, inputs, cards)
  ↓
Role-Specific: Business logic and layouts
  ↓
Benefits:
  ✅ Clear separation of concerns
  ✅ Independent evolution per role
  ✅ No complex conditional logic
  ✅ Better TypeScript types
  ✅ Easier testing
```

---

## 🔐 Permission Validation Pattern

### In Every Handler

```typescript
// Step 1: Auth check
if (!user) return { error: 'Unauthorized', status: 401 };

// Step 2: Profile check
const profile = await getUserProfile(supabase, user.id);
if (!profile) return { error: 'Profile not found', status: 404 };

// Step 3: Role-based logic
if (profile.is_admin) {
  // Full access
} else if (profile.is_teacher) {
  // Limited to their students
  const studentIds = await getTeacherStudentIds(supabase, user.id);
  query = query.in('student_id', studentIds);
} else if (profile.is_student) {
  // Limited to their own data
  query = query.eq('student_id', user.id);
} else {
  return { error: 'Invalid role', status: 403 };
}

// Step 4: Execute query with applied filters
```

### Permission Helper Functions

```typescript
// Reusable across all entities
export function canViewAll(profile: UserProfile): boolean {
  return profile.is_admin;
}

export function canMutate(profile: UserProfile): boolean {
  return profile.is_admin || profile.is_teacher;
}

export async function canAccessEntity(
  supabase: SupabaseClient,
  user: User,
  profile: UserProfile,
  entityStudentId: string
): Promise<boolean> {
  if (profile.is_admin) return true;
  if (profile.is_student) return user.id === entityStudentId;
  if (profile.is_teacher) {
    return await teacherOwnsStudent(supabase, user.id, entityStudentId);
  }
  return false;
}
```

---

## 📝 Implementation Checklist

### For Every New Entity:

#### Database Layer

- [ ] Create table with `student_id` column
- [ ] Add RLS policies for each role
- [ ] Create indexes for role-based queries

#### API Layer

- [ ] Main route with role-aware handlers
- [ ] Admin/teacher route for full access
- [ ] Teacher route for filtered access
- [ ] Student route for personal access
- [ ] Apply role checks in ALL handlers

#### Component Layer

- [ ] Admin components in `components/admin/[entity]/`
- [ ] Teacher components in `components/teacher/[entity]/`
- [ ] Student components in `components/student/[entity]/`
- [ ] Hooks use `useAuth()` for role detection
- [ ] Route to correct endpoint based on role

#### Page Layer

- [ ] Admin pages in `app/admin/[entity]/`
- [ ] Teacher pages in `app/teacher/[entity]/`
- [ ] Student pages in `app/student/[entity]/`

#### Testing

- [ ] Test each role's access patterns
- [ ] Test permission boundaries
- [ ] Test role transitions
- [ ] Test unauthorized access attempts

---

## 🎨 UI/UX Differences by Role

### Admin Dashboard

```
┌─────────────────────────────────────┐
│ Admin Dashboard                     │
├─────────────────────────────────────┤
│ Total Songs: 150                    │
│ Total Lessons: 87                   │
│ Active Teachers: 12                 │
│ Active Students: 45                 │
│                                     │
│ [Manage Songs]  [Manage Users]      │
│ [View Reports]  [System Settings]   │
└─────────────────────────────────────┘
```

### Teacher Dashboard

```
┌─────────────────────────────────────┐
│ Teacher Dashboard                   │
├─────────────────────────────────────┤
│ My Students: 8                      │
│ Active Lessons: 12                  │
│ Songs Taught: 23                    │
│                                     │
│ [My Students]   [My Lessons]        │
│ [Assign Songs]  [Create Lesson]     │
└─────────────────────────────────────┘
```

### Student Dashboard

```
┌─────────────────────────────────────┐
│ Student Dashboard                   │
├─────────────────────────────────────┤
│ Next Lesson: Tomorrow 3pm           │
│ Songs to Learn: 5                   │
│ Progress: 67%                       │
│                                     │
│ [My Songs]      [My Lessons]        │
│ [Practice Log]  [Progress]          │
└─────────────────────────────────────┘
```

---

## 🚀 Benefits of Role-First Architecture

### Maintainability

✅ Each role has dedicated, focused code
✅ Changes to admin UI don't affect student UI
✅ Clear ownership and responsibility

### Security

✅ Role boundaries explicit in code structure
✅ Harder to accidentally expose data
✅ Easy to audit access patterns

### Scalability

✅ Easy to add role-specific features
✅ Independent testing per role
✅ Can optimize queries per role

### Developer Experience

✅ No complex conditionals in components
✅ TypeScript types per role
✅ Clear navigation in codebase

### Trade-offs

⚠️ Some component duplication (acceptable)
⚠️ More files to maintain
✅ But: Clarity > DRY for role-based logic
