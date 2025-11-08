# Role Journeys Map (for Cypress E2E)

Purpose: document all core navigation paths and expected successful routes per role to guide writing stable Cypress journeys. This is source-of-truth for what we cover in E2E. Keep it short, current, and strictly tied to implemented UI.

## Test Users (local dev)

Use the accounts listed in `.archive/development_credentials.txt` (do not commit passwords). Roles:

- Admin User — Admin & Teacher
- Test Teacher — Teacher
- Test Student — Student

## Route Inventory

### Public / Auth

- /sign-in — Sign In page
- /sign-up — Sign Up page
- /forgot-password — Password reset page

### Shared (Authenticated)

- / — Home (landing/dashboard shell)
- /songs — Songs List
- /songs/new — Create Song (visibility/permission depends on role)
- /songs/:id — Song Details (dynamic)

#### Lessons (Planned; wire up once UI ships)

- /lessons — Lessons List
- /lessons/new — Create Lesson
- /lessons/:id — Lesson Details (dynamic)

#### Assignments / Tasks (Planned)

- /assignments — Assignments List
- /assignments/new — Create Assignment
- /assignments/:id — Assignment Details (dynamic)

### Role Dashboards

- /admin — Admin Dashboard
- /admin/users — Admin Users
- /admin/students — Student Management (Planned; may be covered by Users with role filters)
- /teacher — Teacher Dashboard
- /teacher/students — Teacher's Students (Planned)
- /student — Student Dashboard

### Dev-only

- /debug-auth — Auth debug helper (local/dev only)

> Notes:
>
> - Lessons and Assignments features are in progress. Add assertions once UI is available.
> - Student management under Admin may reuse `/admin/users` with role filters, or a dedicated `/admin/students` when implemented.

## Journeys Overview

Each journey is a linear happy path covering navigation, permissions, and 1–2 CRUD touchpoints. Guard-rails validate access control (e.g., student cannot reach admin pages).

### Admin Journey

- Sign in via /sign-in (Admin user)
- Expect redirect to /admin
- Navigate to /admin/users → verify users table renders
- Navigate to /songs → verify list renders
- Navigate to /songs/new → create a song (minimal required fields)
- After save → expect redirect to /songs/:id → details visible
- Navigate Home → / → page renders
- Access control: visiting /teacher or /student is allowed but may redirect; visiting /sign-in should redirect back when already authenticated

Lessons (Planned)

- Navigate to /lessons → verify list renders
- Go to /lessons/new → create a lesson (student + teacher + datetime)
- After save → expect redirect to /lessons/:id → details visible

Assignments (Planned)

- Navigate to /assignments → verify list renders
- Go to /assignments/new → create an assignment (title + due date)
- After save → expect redirect to /assignments/:id → details visible

Student Management

- Navigate to /admin/users (or /admin/students) → verify list renders
- Filter by role=student → table updates
- Edit a student (role flags or profile fields) → expect success toast and updated row

Assertions

- URLs match each step
- Primary page headings or test IDs exist (e.g., songs list, users list)
- Network calls resolve (assert 2xx and expected payload shape where practical)

### Teacher Journey

- Sign in via /sign-in (Teacher user)
- Expect redirect to /teacher
- Navigate to /songs → verify list renders
- Navigate to /songs/new → create a song
- After save → expect redirect to /songs/:id → details visible
- Access control: navigating to /admin should be blocked (redirect or 403 UI)

Lessons (Planned)

- Navigate to /lessons → verify only own students' lessons render
- Go to /lessons/new → create a lesson for a selected student
- After save → expect redirect to /lessons/:id

Assignments (Planned)

- Navigate to /assignments → verify list renders (own students scope)
- Go to /assignments/new → create assignment for a student
- After save → expect redirect to /assignments/:id

Student Management (Planned)

- Navigate to /teacher/students → verify list of assigned students
- Open a student details view (if available) → verify lessons/assignments counts

Assertions

- URLs match each step
- Songs creation is permitted
- Admin area access blocked

### Student Journey

- Sign in via /sign-in (Student user)
- Expect redirect to /student
- Navigate to /songs → verify list renders
- Attempt to visit /songs/new → expect blocked (redirect or 403 UI)
- Navigate to a specific /songs/:id (from list) → details visible (read-only)
- Access control: navigating to /admin and /teacher should be blocked

Lessons (Planned)

- Navigate to /lessons → verify only own lessons are shown
- Open /lessons/:id → details read-only

Assignments (Planned)

- Navigate to /assignments → verify only own assignments are shown
- Open /assignments/:id → details read-only; update status if allowed (TBD)

Assertions

- URLs match each step
- Create page is not accessible
- Details page is readable

## Data and Intercepts

- Prefer `cy.intercept('GET', '/api/**')` to wait for list/detail loads
- For create/update flows, intercept `POST/PUT/DELETE` and assert 2xx
- Make tests idempotent: create entities with a unique suffix; cleanup if DELETE is available

## Page Selectors (conventions)

- Use `data-testid` for stable selectors on key elements:
  - `data-testid="page-title"`
  - `data-testid="songs-table"`
  - `data-testid="create-song-form"`
  - `data-testid="save-button"`
  - `data-testid="forbidden-message"`
  - `data-testid="lessons-table"`
  - `data-testid="create-lesson-form"`
  - `data-testid="assignments-table"`
  - `data-testid="create-assignment-form"`
  - `data-testid="students-table"`

> If missing, add small `data-testid` attributes near the UI under test. Keep them minimal and semantic.

## Future Additions (TODO)

- Lessons routes once UI is live: `/lessons`, `/lessons/new`, `/lessons/:id`
- Assignments routes: `/assignments`, `/assignments/new`, `/assignments/:id`
- Student management pages:
  - Admin: `/admin/students` (or reuse `/admin/users` with role filters)
  - Teacher: `/teacher/students`
- Role nuances (Admin-as-Teacher flows) if applicable
- Error-state journeys (network failure, 403 banners) — optional extended coverage
