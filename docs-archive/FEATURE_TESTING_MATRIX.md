# 🎸 Guitar CRM - Feature Testing Matrix

> **Comprehensive analysis of all features, current test coverage, and implementation plan**  
> Generated: January 5, 2026

---

## 📊 Executive Summary

| Metric | Current State | Target |
|--------|---------------|--------|
| **Jest Unit Tests** | 56 test files | 100-150 focused tests |
| **Cypress E2E Tests** | 8 test files | 80-120 tests |
| **Overall Coverage** | ~22% | 75%+ on business logic |
| **Test Categories** | Mixed | Layered (smoke/integration/feature/regression) |

---

## 🗂️ Feature Testing Matrix

### Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Fully tested |
| 🟡 | Partially tested |
| ❌ | Not tested |
| 🔄 | Needs refactoring |
| 📋 | Planned |

---

## 1. 🔐 Authentication & User Management

### Feature Overview
Core authentication using Supabase Auth with three-tier role architecture (Admin, Teacher, Student).

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Sign In (Email/Password)** | ✅ `SignInForm.test.tsx` | ✅ `auth-test.cy.ts` | ✅ | - | Fully covered |
| **Sign Up (Registration)** | ✅ `SignUpForm.test.tsx` | ❌ | 🟡 | P2 | Missing E2E test |
| **Google OAuth** | ✅ `google.test.ts` | ❌ | 🟡 | P2 | API tested, no E2E |
| **Password Reset** | ✅ `ForgotPasswordForm.test.tsx` | ❌ | ❌ | P1 | Missing E2E flow |
| **Reset Password** | ✅ `ResetPasswordForm.test.tsx` | ❌ | ❌ | P1 | Missing E2E flow |
| **Session Management** | ❌ | ❌ | ❌ | P2 | No tests |
| **Role-Based Access Control** | 🟡 `bearer-auth.test.ts` | 🟡 | 🟡 | P1 | Needs more coverage |
| **Middleware Protection** | ❌ | ❌ | ❌ | P1 | Critical security |
| **Shadow Users** | ❌ | ❌ | ❌ | P3 | Feature incomplete |

### Test Implementation Plan - Authentication

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Smoke | `auth-smoke.cy.ts` - Login/logout basic flow | 2h |
| 2 | E2E Integration | `auth-password-reset.cy.ts` - Full reset flow | 3h |
| 3 | E2E Integration | `auth-signup-flow.cy.ts` - Registration workflow | 2h |
| 4 | Unit | `middleware.test.ts` - Route protection tests | 2h |
| 5 | E2E Feature | `auth-role-switching.cy.ts` - Role-based access | 3h |

---

## 2. 📚 Lesson Management

### Feature Overview
Core feature for scheduling, tracking, and documenting lessons between teachers and students.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **List Lessons** | ✅ `LessonList.test.tsx` | ✅ `admin-lessons-workflow.cy.ts` | ✅ | - | Well covered |
| **Create Lesson** | ✅ `LessonForm.test.tsx` | ✅ `admin-lessons-workflow.cy.ts` | ✅ | - | Well covered |
| **Edit Lesson** | ✅ `LessonForm.test.tsx` | ✅ `admin-lessons-workflow.cy.ts` | ✅ | - | Well covered |
| **Delete Lesson** | ❌ | ✅ `admin-lessons-workflow.cy.ts` | 🟡 | P3 | Unit test missing |
| **Lesson Details View** | ❌ | 🟡 | ❌ | P2 | No dedicated tests |
| **Lesson API (GET)** | ✅ `route.test.ts` | - | ✅ | - | Well covered |
| **Lesson API (POST)** | ✅ `route.test.ts` | - | ✅ | - | Well covered |
| **Lesson API (PUT)** | ✅ `[id]/route.test.ts` | - | ✅ | - | Well covered |
| **Lesson API (DELETE)** | ✅ `[id]/route.test.ts` | - | ✅ | - | Well covered |
| **Lesson Search** | ✅ `search/route.test.ts` | ❌ | 🟡 | P2 | Missing E2E |
| **Bulk Operations** | ✅ `bulk/route.test.ts` | ❌ | 🟡 | P2 | Missing E2E |
| **Student Filtering** | ✅ `student-filtering.test.ts` | 🟡 `student-learning-journey.cy.ts` | 🟡 | P2 | Partially covered |
| **Lesson Status Updates** | ❌ | ❌ | ❌ | P2 | No tests |
| **Mark as Paid** | ❌ | ❌ | ❌ | P3 | Feature incomplete |
| **Recurring Lessons** | ❌ | ❌ | ❌ | P3 | Feature incomplete |

### Test Implementation Plan - Lessons

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Smoke | Add lesson CRUD to smoke tests | 1h |
| 2 | Unit | `LessonDetails.test.tsx` - Detail view component | 2h |
| 3 | E2E Integration | `lesson-search.cy.ts` - Search and filter | 2h |
| 4 | E2E Feature | `lesson-student-view.cy.ts` - Student perspective | 3h |
| 5 | Unit | `lesson-status.test.ts` - Status transitions | 2h |

---

## 3. 🎸 Song Library

### Feature Overview
Shared repository of songs that teachers can assign to students.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **List Songs** | ✅ `SongList.test.tsx` | ✅ `admin-songs-workflow.cy.ts` | ✅ | - | Well covered |
| **Create Song** | ✅ `SongForm.test.tsx` | ✅ `admin-songs-workflow.cy.ts` | ✅ | - | Well covered |
| **Edit Song** | ✅ `SongForm.test.tsx` | ✅ `admin-songs-workflow.cy.ts` | ✅ | - | Well covered |
| **Delete Song** | ❌ | ✅ `admin-songs-workflow.cy.ts` | 🟡 | P3 | Unit test missing |
| **Song Details View** | ✅ `page.test.tsx` | 🟡 | 🟡 | P2 | Partial coverage |
| **Song Schema Validation** | ✅ `SongSchema.test.ts` | - | ✅ | - | Well covered |
| **Song API (CRUD)** | ✅ `handlers.test.ts` | - | ✅ `integration.test.ts` | - | Well covered |
| **Song Search/Filter** | ❌ | ❌ | ❌ | P2 | No tests |
| **Spotify Integration** | ✅ `search/route.test.ts` | ❌ | 🟡 | P2 | API tested |
| **Spotify Sync** | ✅ `sync/route.test.ts` | ❌ | 🟡 | P2 | API tested |
| **Spotify Features** | ✅ `features/route.test.ts` | ❌ | 🟡 | P3 | API tested |
| **Tab/Audio Upload** | ❌ | ❌ | ❌ | P3 | Feature incomplete |
| **Song Analytics** | ❌ | ❌ | ❌ | P3 | No tests |
| **Student Song View** | ❌ | 🟡 `student-learning-journey.cy.ts` | ❌ | P2 | Partial E2E |

### Test Implementation Plan - Songs

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Smoke | Add song access to smoke tests | 1h |
| 2 | Unit | `SongSearch.test.tsx` - Search component | 2h |
| 3 | E2E Integration | `song-spotify-sync.cy.ts` - Spotify workflow | 3h |
| 4 | E2E Feature | `song-student-practice.cy.ts` - Student view | 2h |
| 5 | Unit | `song-analytics.test.ts` - Analytics service | 2h |

---

## 4. 📝 Assignments & Practice

### Feature Overview
Homework system for teachers to assign tasks and track student progress.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **List Assignments** | ✅ `AssignmentList.test.tsx` | ❌ | ❌ | P1 | Missing E2E |
| **Create Assignment** | ✅ `AssignmentForm.test.tsx` | ❌ | ❌ | P1 | Missing E2E |
| **Edit Assignment** | ✅ `AssignmentForm.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Delete Assignment** | ❌ | ❌ | ❌ | P2 | No tests |
| **Assignment Details** | ✅ `page.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Assignment Templates** | ❌ | ❌ | ❌ | P3 | No tests |
| **Student Assignment View** | ❌ | 🟡 `student-learning-journey.cy.ts` | ❌ | P1 | Critical gap |
| **Mark as Complete** | ❌ | ❌ | ❌ | P1 | Critical gap |
| **Teacher Feedback** | ❌ | ❌ | ❌ | P2 | No tests |

### Test Implementation Plan - Assignments

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Integration | `admin-assignments-workflow.cy.ts` - Full CRUD | 4h |
| 2 | E2E Feature | `student-assignment-completion.cy.ts` - Student flow | 3h |
| 3 | Unit | `assignment-status.test.ts` - Status transitions | 2h |
| 4 | E2E Integration | `assignment-feedback.cy.ts` - Feedback workflow | 2h |
| 5 | Unit | `assignment-templates.test.ts` - Template logic | 2h |

---

## 5. 👥 User Management

### Feature Overview
Admin capabilities to manage all users (teachers and students).

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **List Users** | ❌ | ✅ `admin-users-workflow.cy.ts` | 🟡 | P2 | Unit tests missing |
| **Create User** | ✅ `UserFormFields.test.tsx` | ✅ `admin-users-workflow.cy.ts` | ✅ | - | Well covered |
| **Edit User** | ✅ `UserFormFields.test.tsx` | ✅ `admin-users-workflow.cy.ts` | ✅ | - | Well covered |
| **Delete User** | ❌ | ✅ `admin-users-workflow.cy.ts` | 🟡 | P3 | Unit test missing |
| **User Details** | ✅ `page.test.tsx` | 🟡 | ❌ | P2 | Partial coverage |
| **User API (Admin)** | ✅ `route.test.ts` | - | ✅ | - | API tested |
| **Role Assignment** | ❌ | ❌ | ❌ | P2 | No tests |
| **User Activation/Deactivation** | ❌ | ❌ | ❌ | P2 | No tests |
| **User Search/Filter** | ❌ | 🟡 | ❌ | P2 | Partial coverage |

### Test Implementation Plan - Users

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | Unit | `UserList.test.tsx` - List component | 2h |
| 2 | E2E Integration | `user-role-management.cy.ts` - Role changes | 2h |
| 3 | Unit | `user-activation.test.ts` - Activation logic | 1h |
| 4 | E2E Feature | `user-search-filter.cy.ts` - Search workflow | 2h |

---

## 6. 👤 Profile Management

### Feature Overview
User profile viewing and editing capabilities.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **View Profile** | ✅ `ProfileComponents.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Edit Profile** | ✅ `ProfileFormFields.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Profile Picture Upload** | ❌ | ❌ | ❌ | P3 | No tests |
| **SSR User Roles** | ✅ `getUserWithRolesSSR.test.ts` | - | ✅ | - | Well covered |
| **Supabase Credentials** | ✅ `credentials.test.ts` | - | ✅ | - | Well covered |

### Test Implementation Plan - Profile

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Integration | `profile-update.cy.ts` - Profile editing | 2h |
| 2 | E2E Feature | `profile-picture.cy.ts` - Image upload | 2h |

---

## 7. ⚙️ Settings

### Feature Overview
Application and user settings management.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Settings Page** | ✅ `SettingsComponents.test.tsx` | ❌ | ❌ | P3 | Missing E2E |
| **Settings Hook** | ✅ `useSettings.test.tsx` | - | ✅ | - | Well covered |
| **Theme Settings** | ❌ | ❌ | ❌ | P3 | No tests |
| **Notification Settings** | ❌ | ❌ | ❌ | P3 | No tests |

### Test Implementation Plan - Settings

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Integration | `settings-update.cy.ts` - Settings changes | 2h |

---

## 8. 📊 Dashboard & Stats

### Feature Overview
Main dashboard with metrics, charts, and quick actions.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Dashboard Layout** | ✅ `Dashboard.test.tsx` | ✅ smoke tests | ✅ | - | Well covered |
| **Stats Grid** | ✅ `DashboardStatsGrid.test.tsx` | 🟡 | ✅ | - | Good coverage |
| **Song Stats Charts** | ✅ `SongStatsCharts.test.tsx` | ❌ | 🟡 | P3 | Missing E2E |
| **Lesson Stats Charts** | ✅ `LessonStatsCharts.test.tsx` | ❌ | 🟡 | P3 | Missing E2E |
| **Song Stats Table** | ✅ `SongStatsTable.test.tsx` | ❌ | 🟡 | P3 | Missing E2E |
| **Student Dashboard** | ❌ | 🟡 `student-learning-journey.cy.ts` | ❌ | P2 | Partial coverage |

### Test Implementation Plan - Dashboard

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Smoke | Verify dashboard loads with stats | 1h |
| 2 | E2E Feature | `student-dashboard.cy.ts` - Student view | 2h |

---

## 9. 📅 Calendar & Scheduling

### Feature Overview
Calendar view for lesson scheduling and Google Calendar integration.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Calendar Events List** | ✅ `CalendarEventsList.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Google Calendar Connect** | ✅ `ConnectGoogleButton.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Sync Calendar Modal** | ✅ `SyncCalendarModal.test.tsx` | ❌ | ❌ | P2 | Missing E2E |
| **Google Calendar Sync Service** | ❌ | ❌ | ❌ | P2 | Critical gap |
| **Calendar View** | ❌ | ❌ | ❌ | P2 | No tests |

### Test Implementation Plan - Calendar

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Integration | `calendar-view.cy.ts` - Calendar navigation | 3h |
| 2 | E2E Feature | `google-calendar-sync.cy.ts` - Sync workflow | 3h |
| 3 | Unit | `google-calendar-sync.test.ts` - Service logic | 3h |

---

## 10. 🧭 Navigation

### Feature Overview
Header, sidebar, and routing navigation.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Header** | ✅ `Header.test.tsx` | ❌ | 🟡 | P3 | Missing E2E |
| **Admin Navigation** | ❌ | ✅ `admin-navigation.cy.ts` | ✅ | - | E2E covered |
| **Mobile Navigation** | ❌ | ❌ | ❌ | P2 | Critical gap |
| **Breadcrumbs** | ❌ | ❌ | ❌ | P3 | No tests |

### Test Implementation Plan - Navigation

| Phase | Test Type | Tests to Create | Effort |
|-------|-----------|-----------------|--------|
| 1 | E2E Smoke | Navigation in smoke tests | Done |
| 2 | E2E Integration | `mobile-navigation.cy.ts` - Responsive nav | 2h |

---

## 11. 🎨 UI Components (Shared)

### Feature Overview
Reusable UI components from shadcn/ui and custom components.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Spinner** | ✅ `spinner.test.tsx` | - | - | - | Covered |
| **Skeleton** | ✅ `skeleton.test.tsx` | - | - | - | Covered |
| **Forms (Generic)** | 🟡 | 🟡 | - | P3 | Partial coverage |
| **Tables (Generic)** | ❌ | 🟡 | - | P3 | E2E covered |
| **Modals (Generic)** | ❌ | 🟡 | - | P3 | E2E covered |

---

## 12. 🔌 API & External Integrations

### Feature Overview
Backend APIs and third-party service integrations.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Lessons API** | ✅ Multiple tests | ✅ | ✅ | - | Well covered |
| **Song API** | ✅ Multiple tests | ✅ | ✅ | - | Well covered |
| **Admin API** | ✅ `route.test.ts` | 🟡 | ✅ | - | Good coverage |
| **Spotify API** | ✅ Multiple tests | ❌ | 🟡 | P2 | Missing E2E |
| **Google Auth API** | ✅ `google.test.ts` | ❌ | 🟡 | P2 | Missing E2E |
| **External API** | ❌ | ❌ | ❌ | P3 | No tests |
| **Webhooks** | ❌ | ❌ | ❌ | P3 | No tests |

---

## 13. 🗄️ Database & Scripts

### Feature Overview
Database utilities and maintenance scripts.

| Feature | Unit Tests | E2E Tests | Integration | Priority | Notes |
|---------|------------|-----------|-------------|----------|-------|
| **Shadow User Linking** | ✅ `shadow-user-linking.test.ts` | - | 🟡 | - | Tested |
| **Shadow Users** | ✅ `shadow-users.test.ts` | - | 🟡 | - | Tested |
| **Orphan Profile Cleanup** | ✅ `orphan-profile-cleanup.test.ts` | - | 🟡 | - | Tested |
| **Sync All Lessons** | ✅ `sync-all-lessons.test.ts` | - | 🟡 | - | Tested |
| **Backup to Drive** | ✅ `upload-to-drive.test.ts` | - | 🟡 | - | Tested |
| **Database Connection** | ❌ | - | ❌ | P3 | No tests |

---

## 📈 Priority Implementation Order

### 🔴 Phase 1: Critical Gaps (Week 1-2)

| # | Feature Area | Test Type | Test Name | Priority | Effort |
|---|--------------|-----------|-----------|----------|--------|
| 1 | Auth | E2E | Password reset flow | P1 | 3h |
| 2 | Auth | Unit | Middleware protection | P1 | 2h |
| 3 | Assignments | E2E | CRUD workflow | P1 | 4h |
| 4 | Assignments | E2E | Student completion flow | P1 | 3h |
| 5 | Auth | E2E | Role-based access | P1 | 3h |

**Week 1-2 Total: ~15 hours**

### 🟡 Phase 2: Important Features (Week 3-4)

| # | Feature Area | Test Type | Test Name | Priority | Effort |
|---|--------------|-----------|-----------|----------|--------|
| 6 | Auth | E2E | Sign up flow | P2 | 2h |
| 7 | Lessons | E2E | Search and filter | P2 | 2h |
| 8 | Lessons | E2E | Student view | P2 | 3h |
| 9 | Songs | E2E | Search and Spotify sync | P2 | 3h |
| 10 | Users | E2E | Role management | P2 | 2h |
| 11 | Profile | E2E | Profile editing | P2 | 2h |
| 12 | Calendar | E2E | Calendar view | P2 | 3h |
| 13 | Navigation | E2E | Mobile responsive | P2 | 2h |

**Week 3-4 Total: ~21 hours**

### 🟢 Phase 3: Nice-to-Have (Week 5-6)

| # | Feature Area | Test Type | Test Name | Priority | Effort |
|---|--------------|-----------|-----------|----------|--------|
| 14 | Settings | E2E | Settings updates | P3 | 2h |
| 15 | Dashboard | E2E | Stats visualization | P3 | 2h |
| 16 | Calendar | E2E | Google Calendar sync | P3 | 3h |
| 17 | Songs | Unit | Song analytics | P3 | 2h |
| 18 | Various | Unit | Delete operations | P3 | 2h |

**Week 5-6 Total: ~11 hours**

---

## 📊 Coverage Goals by Feature

| Feature Area | Current Unit | Target Unit | Current E2E | Target E2E |
|--------------|--------------|-------------|-------------|------------|
| Authentication | 70% | 90% | 30% | 80% |
| Lessons | 80% | 90% | 60% | 90% |
| Songs | 75% | 85% | 50% | 85% |
| Assignments | 40% | 80% | 0% | 80% |
| Users | 50% | 75% | 60% | 85% |
| Profile | 60% | 80% | 0% | 70% |
| Dashboard | 70% | 85% | 40% | 75% |
| Calendar | 50% | 75% | 0% | 70% |
| Navigation | 30% | 60% | 50% | 70% |

---

## 🎯 Quick Reference: What to Test Next

### If you're working on AUTHENTICATION:
1. `npm run test -- --testPathPattern="auth"` - Run existing auth unit tests
2. Next: Create `cypress/e2e/integration/auth-password-reset.cy.ts`

### If you're working on LESSONS:
1. `npm run test -- --testPathPattern="lessons"` - Run existing lesson tests
2. Next: Create `cypress/e2e/integration/lesson-search.cy.ts`

### If you're working on SONGS:
1. `npm run test -- --testPathPattern="song"` - Run existing song tests
2. Next: Create `cypress/e2e/integration/song-spotify-sync.cy.ts`

### If you're working on ASSIGNMENTS:
1. `npm run test -- --testPathPattern="assignment"` - Run existing tests
2. **CRITICAL**: Create `cypress/e2e/admin/admin-assignments-workflow.cy.ts`

### If you're working on USERS:
1. Existing E2E: `npm run cypress:run -- --spec "cypress/e2e/admin/admin-users-workflow.cy.ts"`
2. Next: Create `UserList.test.tsx` unit test

---

## 📁 Test File Location Guide

```
tests/
├── Unit Tests (Jest)
│   ├── components/**/*.test.tsx     # Component unit tests
│   ├── lib/**/*.test.ts             # Business logic tests
│   ├── app/api/**/*.test.ts         # API handler tests
│   └── schemas/**/*.test.ts         # Schema validation tests
│
├── E2E Tests (Cypress)
│   ├── cypress/e2e/smoke/           # Critical path (< 30s)
│   │   └── critical-path.cy.ts
│   ├── cypress/e2e/integration/     # Component workflows (2-4 min)
│   │   ├── auth-*.cy.ts
│   │   ├── lesson-*.cy.ts
│   │   └── song-*.cy.ts
│   ├── cypress/e2e/admin/           # Admin CRUD workflows
│   │   ├── admin-users-workflow.cy.ts
│   │   ├── admin-songs-workflow.cy.ts
│   │   └── admin-lessons-workflow.cy.ts
│   └── cypress/e2e/features/        # Complete user journeys
│       └── student-learning-journey.cy.ts
```

---

## ✅ Next Steps

1. **Immediate**: Run `npm run test:smoke` to verify smoke tests pass
2. **This Week**: Implement Phase 1 critical gap tests (Authentication & Assignments)
3. **Ongoing**: Use this matrix to guide test creation as you develop features
4. **Review**: Update this matrix as tests are added or features change

---

*Last Updated: January 5, 2026*
