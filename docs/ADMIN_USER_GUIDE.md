# Admin User Guide

This guide details the features and workflows available to Administrators in the Guitar CRM application.
It includes tracking for mobile responsiveness, specifically targeting the **iPhone 17 Pro Max** resolution (approx. 430pt width).

## 1. Dashboard Overview (`/dashboard`)
The main landing page for administrators provides a high-level view of the system's status.
- **Key Metrics**: View total users, active students, teachers, and library stats.
- **Recent Activity**: See the latest actions performed in the system.
- **Quick Actions**: Fast access to common tasks like scheduling a lesson or adding a song.

### Mobile Experience (iPhone 17 Pro Max)
- [x] **Navigation**: Sidebar should collapse into a hamburger menu.
- [x] **Metrics Grid**: Stats cards should stack vertically (1 column).
- [x] **Recent Activity**: List items should remain readable without horizontal scrolling.
- [x] **Quick Actions**: Buttons should be easily tappable (min 44px height) and stack if necessary.

## 2. User Management (`/dashboard/users`)
Manage all users in the system (Students, Teachers, and other Admins).
- **List Users**: View a searchable and filterable list of all registered users.
- **User Details**: Click on a user to view their profile, contact info, and role.
- **Role Management**: Assign or revoke roles (Admin, Teacher, Student).
- **Invite/Create**: (If implemented) Invite new users to the platform.

### Mobile Experience (iPhone 17 Pro Max)
- [x] **User List**: Table should either scroll horizontally OR transform into a card-based layout for each user.
- [x] **Search/Filter**: Input fields and dropdowns should stack vertically and be full-width.
- [ ] **Modals/Drawers**: User details/edit forms should open in full-screen sheets or drawers.

## 3. Song Library (`/dashboard/songs`)
A central repository for all music resources.
- **Browse Library**: Search and filter songs by title, artist, difficulty, or key.
- **Add Songs**: Create new song entries with metadata (Title, Artist, Key, Level).
- **Edit Songs**: Update song details, including links to:
    - **Chords/Tabs**: Link to external resources (e.g., Ultimate Guitar).
    - **YouTube**: Link to video tutorials or performances.
    - **Audio Files**: Upload or link backing tracks.
    - **PDFs**: Attach sheet music or charts.
- **Delete Songs**: Remove songs from the library (soft delete).

### Mobile Experience (iPhone 17 Pro Max)
- [x] **Song List**: Should display essential info (Title, Artist) prominently; secondary info (Key, Level) can be smaller or hidden.
- [x] **Filters**: Filter bar should be collapsible or stack vertically.
- [ ] **Edit Form**: Long forms should be single-column. Rich text editors or complex inputs must be usable on touch.
- [ ] **Media Players**: YouTube embeds and audio players must resize to fit the screen width.

## 4. Lesson Management (`/dashboard/lessons`)
Comprehensive scheduling and lesson tracking.
- **Calendar/List View**: View scheduled lessons in a list or calendar format.
- **Schedule Lesson**: Create new lessons, assigning a Student and Teacher, date, and time.
- **Lesson Details**:
    - **Status**: Track status (Scheduled, Completed, Canceled).
    - **Notes**: Add private notes for the teacher or shared notes for the student.
    - **Repertoire**: Assign specific songs to a lesson plan.
- **Filtering**: Filter lessons by date range, student, or status.

### Mobile Experience (iPhone 17 Pro Max)
- [x] **Calendar**: Month view usually too cramped; should default to Agenda/List or Day view on mobile.
- [ ] **Booking Form**: Date/Time pickers must be native or touch-friendly.
- [x] **Lesson Card**: Details should be legible without zooming.

## 5. Assignments (`/dashboard/assignments`)
Manage homework and practice tasks for students.
- **Create Assignment**: Assign tasks to students, optionally linked to specific songs or lessons.
- **Track Progress**: Monitor completion status of assignments.
- **Review**: Provide feedback on completed assignments.

### Mobile Experience (iPhone 17 Pro Max)
- [x] **Assignment List**: Cards or list items with clear status indicators.
- [ ] **Creation Flow**: Multi-step selection (Student -> Song -> Due Date) should be easy to navigate on a small screen.

## 6. Analytics & Reporting
Deep dive into system usage and health.

### Song Statistics (`/dashboard/admin/stats/songs`)
- **Analytics Charts**: Visual breakdown of the library by Difficulty Level, Key, and Top Authors.
- **Database Health**: Monitor metadata quality.
    - **Coverage**: See percentages of songs with Chords, YouTube links, etc.
    - **Action Items**: List of songs missing specific metadata to help prioritize data entry.

### Lesson Statistics (`/dashboard/admin/stats/lessons`)
- **Trends**: View lesson volume over the last 12 months.
- **Breakdown**: See lessons by status (Scheduled vs. Completed) and monthly counts.

### Mobile Experience (iPhone 17 Pro Max)
- [ ] **Charts**: Graphs (Pie, Bar) must resize to fit width. Tooltips should activate on tap.
- [ ] **Data Tables**: "Database Health" tables should scroll horizontally or reflow.
- [ ] **Tabs**: Navigation tabs (Charts vs Health) should be easily tappable.

## 7. Settings (`/dashboard/settings`)
Configure personal and system-wide preferences.
- **Profile**: Update your own contact information.
- **Integrations**: Connect external services (e.g., Google Calendar for sync).
- **Theme**: Toggle between Light and Dark mode.

### Mobile Experience (iPhone 17 Pro Max)
- [ ] **Layout**: Settings categories should be a list; clicking one opens the specific settings page.
- [ ] **Toggles/Inputs**: All form controls must be large enough for touch interaction.

## Role-Based Access Control
- **Admins**: Have full access to all sections listed above.
- **Teachers**: (Currently share Admin view) Can manage students, lessons, and songs.
- **Students**: Have a restricted view, seeing only *their* lessons, assignments, and songs.
