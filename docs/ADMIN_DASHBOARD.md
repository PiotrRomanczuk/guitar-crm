# Admin Dashboard Documentation

## Overview

The Admin Dashboard is the central hub for system administrators to manage Guitar CRM. It provides comprehensive insights into system metrics, user management, and administrative controls.

**Route**: `/dashboard` (automatically shown to admin users)

## Features

### 1. Dashboard Statistics

The dashboard displays real-time system metrics:

- **👥 Total Users**: Count of all users in the system
- **👨‍🏫 Teachers**: Count of users with teacher role
- **👨‍🎓 Students**: Count of users with student role
- **🎵 Songs**: Count of songs in the library

**Data Source**: Real-time queries from Supabase profiles and songs tables

### 2. Quick Actions

Admin users can quickly access key management areas:

#### Available Actions (Active)

- **User Management** (`/admin/users`) - Create, edit, and manage user accounts and roles

#### Coming Soon

- **System Settings** - Configure system-wide settings and preferences
- **Reports & Analytics** - View system usage and performance metrics
- **Database Management** - Backup, restore, and maintain database
- **Activity Logs** - Monitor system activity and user actions
- **Security & Permissions** - Manage RLS policies and access control

### 3. Recent Users

Displays the 5 most recently registered users:

- Full name
- Email address
- Registration date

## Architecture

### File Structure

```
components/dashboard/admin/
├── AdminDashboardClient.tsx          # Main client component (handles state/interaction)
├── AdminStatCard.tsx                 # Reusable stat card component
├── AdminActionCard.tsx               # Reusable action card component
└── index.ts                          # Exports

app/dashboard/
└── page.tsx                          # Server page component (fetches real stats)

app/api/dashboard/
└── stats/route.ts                    # Stats API endpoint (reusable by other dashboards)
```

### Data Flow

```
GET /dashboard
  ↓
app/dashboard/page.tsx (Server Component)
  ├─ Authenticate user (getUserWithRolesSSR)
  ├─ If not admin: show DashboardPageContent
  ├─ If admin: fetch stats from Supabase
  │  ├─ totalUsers
  │  ├─ totalTeachers
  │  ├─ totalStudents
  │  ├─ totalSongs
  │  ├─ totalLessons
  │  └─ recentUsers (last 5)
  └─ Render AdminDashboardClient with stats
       ↓
AdminDashboardClient.tsx (Client Component)
  ├─ QuickStats (displays 4 main metrics)
  ├─ AdminActions (quick access cards)
  ├─ RecentActivity (recent users table)
  └─ DebugViewSelector (for testing different roles)
```

### Component Hierarchy

```
AdminDashboardClient (Client, handles UI state)
├── DebugViewBanner
│   └── Shows debug mode warning
├── QuickStats
│   └── AdminStatCard (×4)
│       └── Displays icon, value, label
├── AdminActions
│   └── AdminActionCard (×6)
│       └── Icon, title, description, link
├── RecentActivity
│   └── Recent users table
└── DebugViewSelector
    └── Preview buttons for different roles
```

## Key Implementation Details

### 1. Type Safety

```typescript
interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalSongs: number;
    totalLessons: number;
    recentUsers: RecentUser[];
  };
}
```

### 2. Real-Time Data

Stats are fetched server-side on each dashboard load:

```typescript
const [
  { count: totalUsers },
  { count: totalTeachers },
  // ... other queries
] = await Promise.all([
  supabase.from('profiles').select('*', { count: 'exact', head: true }),
  supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_teacher', true),
  // ... other queries
]);
```

### 3. Responsive Design

- Mobile-first approach with Tailwind CSS
- Grid layouts adapt from 2-4 columns based on screen size
- Touch-friendly button sizes (minimum 44×44px)
- Dark mode support throughout

### 4. Debug Mode

Admin users can preview dashboards from different user perspectives:

- **Admin View**: Full system overview
- **Teacher View**: Teacher-specific metrics
- **Student View**: Student-specific metrics

This is useful for understanding the user experience from different roles.

## Usage

### For Admin Users

1. Log in with admin credentials
2. Navigate to `/dashboard` (automatically shown after login if admin)
3. View real-time system statistics
4. Click action cards to access management areas
5. Review recent user registrations

### For Developers

- The dashboard automatically detects admin users and shows appropriate UI
- Stats API (`/api/dashboard/stats`) can be reused for other views
- Debug view selector is useful for testing role-based UI changes
- All components are fully typed with TypeScript

## Testing

### E2E Tests

See `cypress/e2e/admin/admin-dashboard.cy.ts` for comprehensive test coverage:

- Display and visibility of dashboard elements
- Navigation to management areas
- Responsive behavior on different viewports
- Debug view switching

### Unit Tests

Component tests available in `__tests__/components/dashboard/admin/`

## Future Enhancements

### Phase 2 (Priority)

- [ ] User management interface (`/admin/users`)
- [ ] Advanced filtering and search
- [ ] CSV export of statistics
- [ ] Role-based dashboard customization

### Phase 3 (Enhancement)

- [ ] Real-time activity logs with filtering
- [ ] System health monitoring
- [ ] Performance analytics
- [ ] Backup/restore interface
- [ ] RLS policy management UI

### Phase 4 (Advanced)

- [ ] Custom dashboard widgets
- [ ] Scheduled reports
- [ ] System alerts and notifications
- [ ] API key management
- [ ] Audit trail visualization

## API Integration

### Stats Endpoint

```
GET /api/dashboard/stats

Response (Admin):
{
  role: "admin",
  stats: {
    totalUsers: 42,
    totalTeachers: 5,
    totalStudents: 35,
    totalSongs: 128
  }
}

Response (Teacher):
{
  role: "teacher",
  stats: {
    myStudents: 12,
    activeLessons: 3,
    songsLibrary: 128,
    studentProgress: 65
  }
}

Response (Student):
{
  role: "student",
  stats: {
    myTeacher: 1,
    lessonsDone: 24,
    songsLearning: 8,
    progress: 42
  }
}
```

## Security

- ✅ Admin-only access verified server-side
- ✅ Role-based authorization on each stat query
- ✅ No sensitive data exposed in stats
- ✅ Supabase RLS policies enforce row-level security
- ✅ All user data properly filtered by role

## Performance

- **Stats Loading**: Parallel queries using `Promise.all()` (~500-800ms)
- **Component Rendering**: Client-side, instant after initial load
- **Cache Strategy**: Fresh data on each page load (no stale data)
- **Database Indexes**: Indexed `is_teacher` and `is_student` columns for fast filtering

## Troubleshooting

### Dashboard Shows Error

1. Check Supabase connection
2. Verify user has admin role: `profiles.is_admin = true`
3. Check browser console for JavaScript errors

### Stats Show Zero

1. Verify profiles exist in database
2. Check role flags are set correctly
3. Look for Supabase query errors in server logs

### Recent Users Not Showing

1. Check if users exist in profiles table
2. Verify `full_name` and `email` fields are populated
3. Ensure `created_at` timestamps are valid

## Related Documentation

- [CRUD Standards](./CRUD_STANDARDS.md) - Admin CRUD operations
- [Role-Based Architecture](./ROLE_BASED_ARCHITECTURE.md) - User role system
- [Project Overview](./PROJECT_OVERVIEW.md) - General architecture
