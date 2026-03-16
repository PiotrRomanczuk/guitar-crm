# Mobile Redesign — Implementation Progress

> **Last updated**: 2026-03-16
> **Base branch**: `main` (all feature specs + design system merged)
> **Implementation**: one branch per wave (see branch names below)

## Required Reading (BEFORE writing any code)

1. **[V2_DESIGN_SYSTEM.md](./V2_DESIGN_SYSTEM.md)** — spacing, tokens, patterns, animations, component structure
2. **Feature spec** (01-19) — routes, components, data contracts, pain points
3. **[`docs/UI_STANDARDS.md`](../UI_STANDARDS.md)** — general UI conventions
4. **[`lib/animations/variants.ts`]** — Framer Motion presets (use these, don't create new ones)

## Protocol

- Before starting a task, mark it `WIP (@agent-name)`
- When done, mark it `[x]`
- If blocked, mark it `BLOCKED (@agent-name) reason: ...`
- Always check this file before picking a task — skip anything marked WIP or BLOCKED

---

## Wave 1: Foundation (Sequential — blocks all other waves)

> **Branch**: `feature/STRUM-v2-foundation`
> **Depends on**: Nothing
> **Blocks**: Waves 2-5

### Step 2: v1/v2 Toggle System
- [ ] Add `strummy-ui-version` cookie utility (`lib/ui-version.ts`) — read/write cookie, default `v1`
- [ ] Modify `app/dashboard/layout.tsx` — pass UI version to AppShell
- [ ] Modify `components/layout/AppShell.tsx` — conditionally render v1 or v2 shell
- [ ] Add `useUIVersion()` hook for client components to check version
- [ ] Add server-side `getUIVersion()` helper for RSC pages

### Step 3: v2 Directory Structure
- [ ] Create `components/v2/` directory tree mirroring domains
- [ ] Create `components/v2/primitives/MobilePageShell.tsx` — page header + scroll + safe area
- [ ] Move `components/shared/StepWizardForm.tsx` → `components/v2/primitives/StepWizardForm.tsx` (already exists, extend if needed)
- [ ] Create `components/v2/primitives/SwipeableListItem.tsx` — list row with swipe actions
- [ ] Create `components/v2/primitives/BottomActionSheet.tsx` — extends existing Drawer
- [ ] Create `components/v2/primitives/CollapsibleFilterBar.tsx` — horizontal scroll filter chips
- [ ] Create `components/v2/primitives/FloatingActionButton.tsx` — primary creation FAB
- [ ] Create `components/v2/primitives/FullScreenSearchPicker.tsx` — mobile search overlay
- [ ] Create `components/v2/primitives/index.ts` — barrel exports

### Step 3b: v2 Component Architecture Pattern
- [ ] Create `hooks/use-ui-version.ts` — `useUIVersion()` hook
- [ ] Create `components/v2/primitives/withLayoutMode.tsx` — mobile/desktop switching HOC/pattern
- [ ] Verify `useLayoutMode()` and `useKeyboardViewport()` work with v2 shell
- [ ] Add v2 toggle to Settings page (`components/settings/`) — "Try new mobile UI" switch

---

## Wave 2: Navigation + Dashboard + Quick Wins (4 agents parallel)

> **Depends on**: Wave 1 complete
> **Blocks**: Wave 3 (features depend on nav shell)

### Agent 1 — Navigation Shell
> **Branch**: `feature/STRUM-v2-nav-shell`

- [ ] Create `components/v2/navigation/AppShell.tsx` — v2 mobile shell
- [ ] Create `components/v2/navigation/AppShell.Desktop.tsx` — v2 desktop shell
- [ ] Create `components/v2/navigation/MobileBottomNav.tsx` — redesigned bottom nav
- [ ] Create `components/v2/navigation/MobileMoreMenu.tsx` — redesigned more menu
- [ ] Create `components/v2/navigation/Header.tsx` — v2 header
- [ ] Wire v2 shell into `AppShell.tsx` via cookie toggle
- [ ] Test at 390px, 768px, 1440px
- [ ] Dark mode verified

### Agent 2 — Teacher Dashboard
> **Branch**: `feature/STRUM-v2-teacher-dashboard`
> **Spec**: [01-dashboard.md](./01-dashboard.md)

- [ ] Create `components/v2/dashboard/TeacherDashboard.tsx` — mobile card stack
- [ ] Create `components/v2/dashboard/TeacherDashboard.Desktop.tsx` — desktop grid
- [ ] Create `components/v2/dashboard/widgets/AgendaWidget.tsx`
- [ ] Create `components/v2/dashboard/widgets/StatsWidget.tsx`
- [ ] Create `components/v2/dashboard/widgets/AttentionWidget.tsx`
- [ ] Create `components/v2/dashboard/widgets/QuickActions.tsx` — FAB + action sheet
- [ ] Wire into dashboard page with cookie check
- [ ] Reuse `getTeacherDashboardData()` server action (no backend changes)
- [ ] Test Teacher role at 390px, 768px, 1440px

### Agent 3 — Student Dashboard + Song of the Week
> **Branch**: `feature/STRUM-v2-student-dashboard`
> **Specs**: [01-dashboard.md](./01-dashboard.md), [18-song-of-the-week.md](./18-song-of-the-week.md)

- [ ] Create `components/v2/dashboard/StudentDashboard.tsx` — mobile card layout
- [ ] Create `components/v2/dashboard/StudentDashboard.Desktop.tsx`
- [ ] Create `components/v2/song-of-the-week/SOTWCard.tsx` — prominent mobile card
- [ ] Create `components/v2/song-of-the-week/SOTWPicker.tsx` — full-screen picker (admin)
- [ ] Wire into dashboard page with cookie check
- [ ] Reuse `getStudentDashboardData()` and `getCurrentSongOfTheWeek()` (no backend changes)
- [ ] Test Student role at 390px, 768px, 1440px

### Agent 4 — Onboarding + Settings Toggle
> **Branch**: `feature/STRUM-v2-onboarding`
> **Specs**: [19-onboarding.md](./19-onboarding.md), [09-profile-settings.md](./09-profile-settings.md)

- [ ] Create `components/v2/onboarding/Onboarding.tsx` — full-screen step wizard
- [ ] Create `components/v2/onboarding/StepRole.tsx` — large card role selection
- [ ] Create `components/v2/onboarding/StepSkillLevel.tsx` — visual skill picker
- [ ] Create `components/v2/onboarding/StepGoals.tsx` — chip-based goals
- [ ] Create `components/v2/onboarding/StepWelcome.tsx` — welcome animation
- [ ] Create `components/v2/settings/UIVersionToggle.tsx` — v1/v2 switch in settings
- [ ] Reuse `completeOnboarding()` server action
- [ ] Test at 390px

---

## Wave 3: Tier 1 Features (4 agents parallel)

> **Depends on**: Wave 2 (nav shell must be merged)
> **Blocks**: Wave 4

### Agent 1 — Lessons
> **Branch**: `feature/STRUM-v2-lessons`
> **Spec**: [02-lessons.md](./02-lessons.md)

- [ ] Create `components/v2/lessons/LessonList.tsx` — card-based list
- [ ] Create `components/v2/lessons/LessonList.Desktop.tsx` — table view
- [ ] Create `components/v2/lessons/LessonDetail.tsx` — mobile detail
- [ ] Create `components/v2/lessons/LessonForm.tsx` — step wizard (Student → Songs → Schedule → Notes)
- [ ] Create `components/v2/lessons/LiveLesson.tsx` — mobile live mode
- [ ] Create `components/v2/lessons/LiveLesson.Desktop.tsx` — desktop live mode
- [ ] Wire into lesson pages with cookie check
- [ ] Reuse all existing hooks: `useLessonList`, `useLessonForm`, `useSongs`, `useProfiles`
- [ ] Test CRUD at 390px, 768px, 1440px as Teacher and Student

### Agent 2 — Songs
> **Branch**: `feature/STRUM-v2-songs`
> **Spec**: [03-songs.md](./03-songs.md)

- [ ] Create `components/v2/songs/SongList.tsx` — enhanced mobile cards + filter chips
- [ ] Create `components/v2/songs/SongList.Desktop.tsx` — desktop table
- [ ] Create `components/v2/songs/SongDetail.tsx` — tabbed mobile detail
- [ ] Create `components/v2/songs/SongDetail.Desktop.tsx` — side-panel detail
- [ ] Create `components/v2/songs/SongForm.tsx` — generalized from MobileSongForm
- [ ] Create `components/v2/songs/LyricsViewer.tsx` — mobile chord/lyric display
- [ ] Create `components/v2/songs/VideoPlayer.tsx` — responsive video
- [ ] Wire into song pages with cookie check
- [ ] Reuse all hooks: `useSongList`, `useSongMutation`, `useSongDetail`, etc.
- [ ] Test CRUD at 390px, 768px, 1440px as Teacher and Student

### Agent 3 — Assignments + Repertoire
> **Branch**: `feature/STRUM-v2-assignments-repertoire`
> **Specs**: [04-assignments.md](./04-assignments.md), [05-student-repertoire.md](./05-student-repertoire.md)

- [ ] Create `components/v2/assignments/AssignmentList.tsx` — card list with urgency
- [ ] Create `components/v2/assignments/AssignmentList.Desktop.tsx`
- [ ] Create `components/v2/assignments/AssignmentDetail.tsx` — mobile detail
- [ ] Create `components/v2/assignments/AssignmentForm.tsx` — step wizard
- [ ] Create `components/v2/assignments/TemplateList.tsx` — template cards
- [ ] Create `components/v2/repertoire/RepertoireList.tsx` — priority sections
- [ ] Create `components/v2/repertoire/RepertoireCard.tsx` — rich card
- [ ] Create `components/v2/repertoire/SelfRating.tsx` — 48px touch stars
- [ ] Create `components/v2/repertoire/AddSongSheet.tsx` — bottom sheet
- [ ] Wire into pages with cookie check
- [ ] Test CRUD at 390px as Teacher and Student

### Agent 4 — Users/Students
> **Branch**: `feature/STRUM-v2-users`
> **Spec**: [06-users-students.md](./06-users-students.md)

- [ ] Create `components/v2/users/UserList.tsx` — card-based student list
- [ ] Create `components/v2/users/UserList.Desktop.tsx` — desktop table
- [ ] Create `components/v2/users/UserDetail.tsx` — swipeable tab detail
- [ ] Create `components/v2/users/UserDetail.Desktop.tsx` — multi-panel
- [ ] Create `components/v2/users/UserForm.tsx` — step wizard
- [ ] Create `components/v2/users/InviteFlow.tsx` — simplified mobile invite
- [ ] Wire into user pages with cookie check
- [ ] Reuse `useUsersList`, `useUserFormState` hooks
- [ ] Test CRUD at 390px as Teacher/Admin

---

## Wave 4: Tier 2-3 Features (4 agents parallel)

> **Depends on**: Wave 3 complete

### Agent 1 — Calendar + Notifications
> **Branch**: `feature/STRUM-v2-calendar-notifications`
> **Specs**: [07-calendar.md](./07-calendar.md), [08-notifications.md](./08-notifications.md)

- [ ] Create `components/v2/calendar/Calendar.tsx` — agenda default on mobile
- [ ] Create `components/v2/calendar/AgendaView.tsx` — list-based agenda
- [ ] Create `components/v2/calendar/WeekStrip.tsx` — horizontal week selector
- [ ] Create `components/v2/calendar/EventSheet.tsx` — bottom sheet
- [ ] Create `components/v2/notifications/NotificationCenter.tsx` — grouped, swipeable
- [ ] Create `components/v2/notifications/NotificationItem.tsx` — swipeable row
- [ ] Create `components/v2/notifications/NotificationBell.tsx` — enhanced bell
- [ ] Test at 390px

### Agent 2 — Profile/Settings + Theory
> **Branch**: `feature/STRUM-v2-settings-theory`
> **Specs**: [09-profile-settings.md](./09-profile-settings.md), [10-theory-courses.md](./10-theory-courses.md)

- [ ] Create `components/v2/settings/Settings.tsx` — grouped iOS-style
- [ ] Create `components/v2/profile/Profile.tsx` — mobile profile editor
- [ ] Create `components/v2/theory/CourseList.tsx` — course cards
- [ ] Create `components/v2/theory/ChapterReader.tsx` — mobile reader
- [ ] Create `components/v2/theory/CourseForm.tsx` — step wizard
- [ ] Test at 390px

### Agent 3 — Statistics + Health + Cohorts
> **Branch**: `feature/STRUM-v2-analytics`
> **Specs**: [14-statistics.md](./14-statistics.md), [13-student-health.md](./13-student-health.md), [12-cohorts.md](./12-cohorts.md)

- [ ] Create `components/v2/stats/StatsOverview.tsx` — KPI cards + chart carousel
- [ ] Create `components/v2/stats/ChartCarousel.tsx` — swipeable charts
- [ ] Create `components/v2/stats/StudentStats.tsx` — progress ring
- [ ] Create `components/v2/health/HealthDashboard.tsx` — card-based at-risk list
- [ ] Create `components/v2/health/HealthCard.tsx` — student health card
- [ ] Create `components/v2/cohorts/CohortDashboard.tsx` — sparkline cards
- [ ] Test at 390px

### Agent 4 — Admin Tools + Skills
> **Branch**: `feature/STRUM-v2-admin`
> **Specs**: [15-admin-tools.md](./15-admin-tools.md), [11-skills.md](./11-skills.md)

- [x] Create `components/v2/admin/AdminDashboard.tsx` — status cards
- [x] Create `components/v2/admin/HealthCheck.tsx` — service status
- [x] Create `components/v2/admin/SpotifyQueue.tsx` — swipeable queue
- [x] Create `components/v2/admin/LogViewer.tsx` — mobile log display
- [x] Create `components/v2/skills/SkillBrowser.tsx` — chip-based browser
- [x] Test at 390px

---

## Wave 5: Specialized + Cleanup (4 agents parallel)

> **Depends on**: Wave 4 complete

### Agent 1 — Interactive Fretboard
> **Branch**: `feature/STRUM-v2-fretboard`
> **Spec**: [16-fretboard.md](./16-fretboard.md)

- [ ] Create `components/v2/fretboard/Fretboard.tsx` — touch-optimized, pinch-zoom
- [ ] Create `components/v2/fretboard/Controls.tsx` — bottom sheet controls
- [ ] Create `components/v2/fretboard/TrainingMode.tsx` — large touch targets
- [ ] Landscape mode detection and hint
- [ ] Region focus: 5-7 frets visible, swipe to scroll
- [ ] Test on real iOS device (AudioContext)

### Agent 2 — AI Assistant
> **Branch**: `feature/STRUM-v2-ai`
> **Spec**: [17-ai-assistant.md](./17-ai-assistant.md)

- [ ] Create `components/v2/ai/AIChat.tsx` — mobile chat with auto-grow input
- [ ] Create `components/v2/ai/AIHistory.tsx` — card-based history
- [ ] Create `components/v2/ai/StreamingMessage.tsx` — optimized renderer
- [ ] Test streaming on mobile

### Agent 3 — Playwright Regression Tests
> **Branch**: `feature/STRUM-v2-e2e`

- [ ] Add Playwright spec: v2 toggle works (set cookie → see v2 UI)
- [ ] Add Playwright spec: Teacher dashboard at iPhone 12 viewport
- [ ] Add Playwright spec: Student dashboard at iPhone 12 viewport
- [ ] Add Playwright spec: Lesson CRUD at iPhone 12 viewport
- [ ] Add Playwright spec: Song CRUD at iPhone 12 viewport
- [ ] Verify v1 still works when cookie is `v1` or unset

### Agent 4 — v1 Cleanup + Final Polish
> **Branch**: `feature/STRUM-v2-cleanup`

- [ ] Remove v1/v2 toggle — make v2 default
- [ ] Delete deprecated v1 components listed in each spec
- [ ] Rename `components/v2/` → `components/` (or update imports)
- [ ] Update `docs/mobile-redesign/README.md` status column to reflect completion
- [ ] Full responsive audit: 390px, 768px, 1024px, 1920px

---

## Verification Checklist (Per Feature)

Run this checklist before marking any feature as complete:

- [ ] Tested at 390px (iPhone 15 Pro)
- [ ] Tested at 768px (iPad)
- [ ] Tested at 1024px (iPad landscape)
- [ ] Tested at 1920px (desktop)
- [ ] All CRUD operations work
- [ ] Tested as Teacher role
- [ ] Tested as Student role
- [ ] Tested as Admin role (where applicable)
- [ ] Dark mode verified
- [ ] 44px minimum touch targets
- [ ] iOS keyboard doesn't obscure inputs
- [ ] v2 shows same data as v1 (same server actions/hooks)
- [ ] No `any` types introduced
- [ ] All files < 200 LOC
