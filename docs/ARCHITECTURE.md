# Guitar CRM Architecture

## 🏗️ System Overview

Guitar CRM is a comprehensive student management system designed for guitar teachers. It uses a modern tech stack focused on type safety, performance, and developer experience.

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: TanStack Query (Server State), React Context (UI State)
- **Validation**: Zod
- **Testing**: Jest (Unit/Integration), Cypress (E2E)

---

## 🔐 Role-Based Access Control (RBAC)

The system implements a strict three-tier role system enforced at both the database level (RLS) and application level.

### Roles

1. **Admin**

   - Full system access
   - User management
   - System configuration
   - Can view/edit all data

2. **Teacher**

   - Manage their own students
   - Create/Edit lessons for their students
   - Manage their song library
   - Cannot access other teachers' data

3. **Student**

   - View assigned lessons
   - View assigned songs
   - Track progress
   - Read-only access to their own data

### Data Access Matrix

| Entity | Admin | Teacher | Student |
|--------|-------|---------|---------|
| **Users** | Full Access | View Students | View Self |
| **Lessons** | Full Access | CRUD (Own Students) | Read (Own) |
| **Songs** | Full Access | CRUD (Own Students) | Read (Assigned) |

---

## 🗄️ Database Schema

The database is hosted on Supabase and uses PostgreSQL. Key tables include:

- `profiles`: Extends Supabase Auth users with application-specific data (role, name).
- `lessons`: Stores lesson details, linked to student and teacher.
- `songs`: Song library, linked to teacher (owner) or system (public).
- `lesson_songs`: Junction table for songs assigned to lessons.
- `assignments`: Tasks assigned to students.

### Row Level Security (RLS)

All tables have RLS enabled. Policies enforce the role-based access described above.

- **Select**: Users can see their own data or data shared with them.
- **Insert/Update/Delete**: Only Admins or Teachers (for their students) can modify data.

---

## 🔄 State Management & Data Fetching

We use **TanStack Query** (React Query) for all server state management.

### Key Benefits

- Automatic caching and background refetching
- Built-in loading and error states
- Request deduplication
- Optimistic updates

### Implementation

- **Query Client**: Configured in `lib/query-client.ts` with default stale times.
- **API Client**: Centralized `apiClient` in `lib/api-client.ts` handles auth headers and error parsing.
- **Hooks**: Custom hooks (e.g., `useUsersList`, `useSongList`) encapsulate query logic.

### Pattern

```typescript
// Example Hook
export function useSongList() {
  return useQuery({
    queryKey: ['songs'],
    queryFn: () => apiClient.get('/api/songs')
  });
}
```

---

## 📂 Directory Structure

```text
app/
├── (auth)/              # Authentication routes (login, register)
├── (dashboard)/         # Protected dashboard routes
│   ├── admin/           # Admin-only pages
│   ├── teacher/         # Teacher-only pages
│   ├── student/         # Student-only pages
│   └── layout.tsx       # Dashboard shell
├── api/                 # API Route Handlers
└── layout.tsx           # Root layout
```

### Component Organization

- **`components/`**: Reusable UI components and feature-specific components.
- **`lib/`**: Utilities, API clients, configuration.
- **`schemas/`**: Zod schemas for validation (shared between frontend and backend).
- **`types/`**: TypeScript type definitions.

---

## 🚀 Migration Strategy

When migrating or restructuring:

1. **Plan**: Document the changes in a migration plan.
2. **Backup**: Ensure database backups are available.
3. **Implement**: Apply schema changes via Supabase migrations.
4. **Verify**: Run E2E tests to ensure no regression.
