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
- [x] **Modals/Drawers**: User details/edit forms should open in full-screen sheets or drawers.

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
- [x] **Edit Form**: Long forms should be single-column. Rich text editors or complex inputs must be usable on touch.
- [x] **Media Players**: YouTube embeds and audio players must resize to fit the screen width.

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
- [x] **Booking Form**: Date/Time pickers must be native or touch-friendly.
- [x] **Lesson Card**: Details should be legible without zooming.

## 5. Assignments (`/dashboard/assignments`)
Manage homework and practice tasks for students.
- **Create Assignment**: Assign tasks to students, optionally linked to specific songs or lessons.
- **Track Progress**: Monitor completion status of assignments.
- **Review**: Provide feedback on completed assignments.

### Mobile Experience (iPhone 17 Pro Max)
- [x] **Assignment List**: Cards or list items with clear status indicators.
- [x] **Creation Flow**: Multi-step selection (Student -> Song -> Due Date) should be easy to navigate on a small screen.

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
- [x] **Charts**: Graphs (Pie, Bar) must resize to fit width. Tooltips should activate on tap.
- [x] **Data Tables**: "Database Health" tables should scroll horizontally or reflow.
- [x] **Tabs**: Navigation tabs (Charts vs Health) should be easily tappable.

## 7. Settings (`/dashboard/settings`)
Configure personal and system-wide preferences.
- **Profile**: Update your own contact information.
- **Integrations**: Connect external services (e.g., Google Calendar for sync).
- **Theme**: Toggle between Light and Dark mode.

### Mobile Experience (iPhone 17 Pro Max)
- [x] **Layout**: Settings categories should be a list; clicking one opens the specific settings page.
- [x] **Toggles/Inputs**: All form controls must be large enough for touch interaction.

## Role-Based Access Control
- **Admins**: Have full access to all sections listed above.
- **Teachers**: (Currently share Admin view) Can manage students, lessons, and songs.
- **Students**: Have a restricted view, seeing only *their* lessons, assignments, and songs.
# Admin & Teacher Journey Guide

This guide outlines the recommended workflow for administrators and teachers to successfully manage the Guitar CRM application.

## Phase 1: Content & Library Building (Teacher Focus)

Before scheduling lessons, you need a library of materials to teach.

### 1. Build the Song Library (`/dashboard/songs`)

* **Add Songs:** Click "Add Song" to populate your database.
* **Details:** Include Title, Artist, Key, and Difficulty Level (Beginner, Intermediate, Advanced).
* **Resources:** Attach links to chords, audio files, or Ultimate Guitar tabs.
* *Goal:* Create a diverse library so you can easily assign material during lessons.

## Phase 2: Daily Operations (Teacher Workflow)

This is your day-to-day workflow for managing students.

### 1. Schedule Lessons (`/dashboard/lessons`)

* **Create Lesson:** Use the "New Lesson" button for manual scheduling.
* **Select Student:** Choose from your active student list.
* **Set Date/Time:** Schedule the session.
* **Lesson Numbering:** The system automatically tracks lesson numbers per student (e.g., "Lesson #5 with John").

### 2. Google Calendar Sync (`/dashboard/lessons/import`)

* **Import Tool:** Use the "Import from Google Calendar" feature to sync your existing schedule.
* **Smart Matching:** The system automatically matches events to students by email.
* **Shadow Profiles:** If a student doesn't exist yet, a "shadow profile" is created automatically. When they eventually sign up, their lesson history will be waiting for them.

### 3. Conducting a Lesson

* **Lesson Notes:** Open the lesson detail view during the session. Record notes on what was covered.
* **Assign Songs:** Use the "Songs" tab in the lesson detail to link specific songs from your library to this lesson.
* **Track Progress:** Mark songs as "In Progress" or "Completed" as the student masters them.

### 4. Assign Homework (`/dashboard/assignments`)

* **Create Assignment:** Create specific tasks (e.g., "Practice C Major Scale", "Learn Intro to Wonderwall").
* **Set Due Date:** Give students a target date.
* **Priority:** Mark urgent tasks with High Priority.
* **Link to Lesson:** Optionally link the assignment to a specific lesson for context.

## Phase 3: Monitoring & Growth

### 1. Track Student Progress

* View the **Student Dashboard** (if you have a student view) or individual student profiles to see their completed lessons and assignments.
* Monitor overdue assignments in the Assignments list (highlighted in red).

### 2. Maintenance

* **Archive Users:** Deactivate students who have stopped taking lessons to keep your active list clean.
* **Update Songs:** Regularly refine song data with better tabs or new resources.

## Phase 4: System Setup & Onboarding (Admin Focus)

Your first goal is to populate the system with the necessary people and permissions.

### 1. Access the Admin Dashboard

* Navigate to `/dashboard` to see the system overview (Total Users, Teachers, Students, Songs).
* Use the **Quick Actions** cards for fast navigation.

### 2. User Management (`/dashboard/users`)

* **Create Teachers:** Create accounts for your staff. Ensure you toggle the `isTeacher` role flag.
* **Create Students:** Create accounts for your students. Ensure you toggle the `isStudent` role flag.
* *Tip:* Use the "Recent Users" section on the dashboard to verify new registrations.

### 3. System Configuration (`/dashboard/settings`)

* Verify your own profile settings.
* (Future) Configure system-wide settings as they become available.

## Summary Checklist for Success

* [ ] **Admin:** Are all my teachers and students created with correct roles?
* [ ] **Library:** Do I have at least 10-20 common songs added with keys and difficulty?
* [ ] **Schedule:** Are next week's lessons scheduled in the system?
* [ ] **Assignments:** Does every active student have at least one open assignment?
