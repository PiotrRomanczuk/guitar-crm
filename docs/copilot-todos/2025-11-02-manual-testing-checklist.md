# Manual Testing Checklist - November 2, 2025

## Testing Environment

- **Date**: November 2, 2025
- **Branch**: feature/phase-1-2-completion
- **Testing Role**: Admin User (p.romanczuk@gmail.com / test123_admin)

## Pre-Testing Setup

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Sign In as Admin**
   - Navigate to: http://localhost:3000/sign-in
   - Email: p.romanczuk@gmail.com
   - Password: test123_admin
   - Verify successful login and redirect to dashboard

## Page-by-Page Testing

### ✅ 1. Home/Dashboard Page (/)

**URL**: http://localhost:3000/

**What to Check**:

- [ ] Dashboard header displays with correct user email
- [ ] Role badges show "Admin, Teacher" correctly
- [ ] Four stat cards display with correct icons and values:
  - [ ] Total Users count
  - [ ] Teachers count
  - [ ] Students count
  - [ ] Songs count
- [ ] Dashboard cards visible:
  - [ ] Admin Dashboard card (⚙️)
  - [ ] User Management card (👥)
  - [ ] Songs Library card (🎵)
  - [ ] My Profile card (👤)
  - [ ] Settings card (⚙️)
- [ ] Quick Actions section shows:
  - [ ] Create New User button
  - [ ] Add New Song button
- [ ] Mobile responsiveness (resize to 375px width)
- [ ] Dark mode toggle works

**Expected Issues**: None expected

---

### ✅ 2. Admin Dashboard (/admin)

**URL**: http://localhost:3000/admin

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "⚙️ Admin Dashboard"
- [ ] Stats display correctly (4 cards):
  - [ ] Total Users
  - [ ] Teachers
  - [ ] Students
  - [ ] Songs
- [ ] Admin Actions grid (6 cards):
  - [ ] User Management (links to /admin/users) ✅
  - [ ] System Settings ⚠️ NOT IMPLEMENTED
  - [ ] Reports & Analytics ⚠️ NOT IMPLEMENTED
  - [ ] Database Management ⚠️ NOT IMPLEMENTED
  - [ ] Activity Logs ⚠️ NOT IMPLEMENTED
  - [ ] Security & Permissions ⚠️ NOT IMPLEMENTED
- [ ] Recent Activity section shows placeholder
- [ ] Debug View Selector section:
  - [ ] Admin View button (active)
  - [ ] Teacher View (Debug) button
  - [ ] Student View (Debug) button
  - [ ] Switch between views and verify UI changes
- [ ] Mobile responsiveness

**Known Issues**:

- 5 out of 6 admin action cards link to unimplemented pages
- Recent Activity section is placeholder only

---

### ✅ 3. User Management (/admin/users)

**URL**: http://localhost:3000/admin/users

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "👥 User Management"
- [ ] User list displays with all columns:
  - [ ] Name
  - [ ] Email
  - [ ] Roles (badges)
  - [ ] Status
  - [ ] Actions (Edit/Delete buttons)
- [ ] "Create User" button visible and clickable
- [ ] Search functionality:
  - [ ] Search by name
  - [ ] Search by email
  - [ ] Results filter correctly
- [ ] Click "Create User":
  - [ ] Modal opens with form
  - [ ] Form has all fields (firstName, lastName, email, roles)
  - [ ] Can cancel or submit
- [ ] Click "Edit" on a user:
  - [ ] Modal opens with pre-filled form
  - [ ] Can modify user data
  - [ ] Can save changes
- [ ] Click "Delete" on a user:
  - [ ] Confirmation dialog appears
  - [ ] Can confirm or cancel
  - [ ] User is soft-deleted (isActive = false)
- [ ] User count shows correct number
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected (fully implemented)

---

### ✅ 4. Songs List (/songs)

**URL**: http://localhost:3000/songs

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "🎵 Songs Library"
- [ ] Filter by level dropdown:
  - [ ] All Levels (default)
  - [ ] Beginner
  - [ ] Intermediate
  - [ ] Advanced
  - [ ] Filtering works correctly
- [ ] "Add New Song" button visible
- [ ] Songs table displays with columns:
  - [ ] Title
  - [ ] Author
  - [ ] Level (colored badge)
  - [ ] Key
  - [ ] Actions (View/Edit/Delete)
- [ ] Click "View" on a song → navigates to /songs/[id]
- [ ] Click "Edit" on a song → navigates to /songs/[id]/edit
- [ ] Click "Delete" on a song → shows confirmation, deletes
- [ ] Empty state shows when no songs (if applicable)
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected (fully implemented)

---

### ✅ 5. Song Detail (/songs/[id])

**URL**: http://localhost:3000/songs/[id] (pick any song ID)

**What to Check**:

- [ ] Page loads without errors
- [ ] Song details display:
  - [ ] Title
  - [ ] Author
  - [ ] Level badge
  - [ ] Key
  - [ ] Ultimate Guitar link (clickable)
  - [ ] Chords (if available)
- [ ] "Edit Song" button visible
- [ ] "Back to Songs" button works
- [ ] Ultimate Guitar link opens in new tab
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected

---

### ✅ 6. Create Song (/songs/new)

**URL**: http://localhost:3000/songs/new

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "Add New Song"
- [ ] Form fields present:
  - [ ] Title (required)
  - [ ] Author (required)
  - [ ] Level dropdown (required)
  - [ ] Key dropdown (required)
  - [ ] Ultimate Guitar Link (required, URL validation)
  - [ ] Chords (optional, textarea)
- [ ] Validation works:
  - [ ] Cannot submit empty required fields
  - [ ] Ultimate Guitar link must be valid URL
  - [ ] Error messages display correctly
- [ ] "Create Song" button submits
- [ ] "Cancel" button navigates back
- [ ] Success creates song and redirects
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected

---

### ✅ 7. Edit Song (/songs/[id]/edit)

**URL**: http://localhost:3000/songs/[id]/edit (pick any song ID)

**What to Check**:

- [ ] Page loads without errors
- [ ] Form pre-filled with song data
- [ ] All fields editable
- [ ] Validation works same as create
- [ ] "Update Song" button saves changes
- [ ] "Cancel" button navigates back
- [ ] Success updates song and redirects
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected

---

### ✅ 8. Profile Page (/profile)

**URL**: http://localhost:3000/profile

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "👤 Your Profile"
- [ ] User email displays (read-only)
- [ ] Form fields present:
  - [ ] First Name
  - [ ] Last Name
  - [ ] Bio (textarea)
  - [ ] Phone Number
- [ ] Fields pre-filled with current data
- [ ] Can edit and save changes
- [ ] Success message shows after save
- [ ] Error handling works
- [ ] "Cancel" button works
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected

---

### ✅ 9. Settings Page (/settings)

**URL**: http://localhost:3000/settings

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "⚙️ Settings"
- [ ] Three sections visible:
  - **Notifications**:
    - [ ] Email notifications toggle
    - [ ] Push notifications toggle
    - [ ] Lesson reminders toggle
  - **Appearance**:
    - [ ] Theme dropdown (Light/Dark/System)
    - [ ] Language dropdown
    - [ ] Font size dropdown
  - **Privacy**:
    - [ ] Profile visibility toggle
    - [ ] Show progress to others toggle
- [ ] Changes are tracked (buttons enable when changed)
- [ ] "Save Changes" button works
- [ ] "Reset to Defaults" button works
- [ ] "Cancel" button works
- [ ] Success message after save
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**: None expected

---

### ⚠️ 10. Teacher Dashboard (/teacher)

**URL**: http://localhost:3000/teacher

**What to Check**:

- [ ] Page loads without errors
- [ ] Header shows "👨‍🏫 Teacher Dashboard"
- [ ] Stats cards display:
  - [ ] My Students
  - [ ] Active Lessons
  - [ ] Songs Library
  - [ ] Student Progress
- [ ] Component sections:
  - [ ] TeacherStudentsList
  - [ ] TeacherLessonSchedule
  - [ ] TeacherRecentLessons
- [ ] Check if components show real data or placeholders
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**:

- Stats may show 0 if no lessons/students created yet
- Components may be placeholders (need to check implementation)

---

### ⚠️ 11. Student Dashboard (/student)

**URL**: http://localhost:3000/student

**What to Check**:

- [ ] Page loads without errors (admin can access)
- [ ] Header shows "🎵 Your Learning Dashboard"
- [ ] Stats cards display:
  - [ ] My Teacher
  - [ ] Lessons Done
  - [ ] Songs Learning
  - [ ] Progress
- [ ] Component sections:
  - [ ] StudentUpcomingLessons
  - [ ] StudentRecentLessons
  - [ ] StudentProgressOverview
- [ ] Check if components show real data or placeholders
- [ ] Mobile responsiveness
- [ ] Dark mode

**Expected Issues**:

- Stats may show 0 if admin user has no student lessons
- Components may be placeholders (need to check implementation)

---

## Navigation Testing

### ✅ Header Navigation

**What to Check**:

- [ ] Logo "🎸 Guitar CRM" navigates to /
- [ ] Desktop navigation visible on wide screens
- [ ] Mobile menu button appears on small screens
- [ ] Navigation items show correctly for admin:
  - [ ] Home
  - [ ] Admin
  - [ ] User Management
  - [ ] Songs
  - [ ] Students ⚠️ (route may not exist)
  - [ ] Lessons ⚠️ (route may not exist)
  - [ ] Profile
  - [ ] Settings
- [ ] Role badges display in header (Admin, Teacher)
- [ ] Sign Out button works
- [ ] Mobile menu opens/closes properly
- [ ] Active page highlighting works

**Known Issues**:

- /students and /lessons routes referenced in RoleBasedNav but may not be implemented
- /my-lessons and /progress routes for students may not be implemented

---

## Cross-Cutting Concerns

### Dark Mode

**What to Check**:

- [ ] Can toggle dark mode from settings
- [ ] Dark mode persists across page navigation
- [ ] All pages support dark mode properly
- [ ] No styling issues in dark mode
- [ ] Text remains readable

### Mobile Responsiveness

**Test at these breakpoints**:

- [ ] 375px (iPhone SE)
- [ ] 425px (small mobile)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)

**What to Check**:

- [ ] Layout adapts properly
- [ ] Touch targets are minimum 44x44px
- [ ] Text is readable
- [ ] No horizontal scrolling
- [ ] Mobile menu works
- [ ] Forms are usable

### Loading States

**What to Check**:

- [ ] Loading spinners show when fetching data
- [ ] Skeleton screens where appropriate
- [ ] No flash of wrong content
- [ ] Loading states are visually consistent

### Error Handling

**What to Check**:

- [ ] API errors display user-friendly messages
- [ ] Network errors handled gracefully
- [ ] Form validation errors are clear
- [ ] 404 pages (if implemented)
- [ ] Error boundaries catch component errors

---

## API Testing

### Dashboard Stats API

**Endpoint**: GET /api/dashboard/stats

**What to Check**:

- [ ] Returns correct stats for admin role
- [ ] Returns correct stats for teacher role (when testing teacher)
- [ ] Returns correct stats for student role (when testing student)
- [ ] Handles unauthenticated requests

### Songs API

**Endpoints**:

- GET /api/song
- POST /api/song/create
- GET /api/song/[id]
- PUT /api/song/update
- DELETE /api/song/[id]

**What to Check**:

- [ ] CRUD operations work
- [ ] Filtering works
- [ ] Search works
- [ ] Auth required
- [ ] Role-based access control

---

## Known Missing Features

### ❌ Not Implemented (High Priority)

1. **Lessons Management**

   - No /lessons route
   - No lesson CRUD operations
   - Lessons table exists in DB but no UI

2. **Student Management**

   - No /students route mentioned in nav but not implemented
   - No student assignment to teachers
   - No student-teacher relationship management

3. **Admin Action Pages**

   - /admin/settings - Not implemented
   - /admin/reports - Not implemented
   - /admin/database - Not implemented
   - /admin/logs - Not implemented
   - /admin/security - Not implemented

4. **Student Routes**

   - /my-lessons - Referenced in nav but not implemented
   - /progress - Referenced in nav but not implemented

5. **Teacher Features**
   - Student assignment
   - Lesson planning
   - Progress tracking
   - Grade management

### ⚠️ Partially Implemented (Medium Priority)

1. **Teacher Dashboard Components**

   - TeacherStudentsList - needs verification
   - TeacherLessonSchedule - needs verification
   - TeacherRecentLessons - needs verification

2. **Student Dashboard Components**

   - StudentUpcomingLessons - needs verification
   - StudentRecentLessons - needs verification
   - StudentProgressOverview - needs verification

3. **Recent Activity**
   - Placeholder only on admin dashboard

### ✅ Fully Implemented

1. Authentication (sign in, sign up, forgot password)
2. User Management (admin)
3. Songs CRUD (all roles)
4. Profile Management
5. Settings Management
6. Role-based access control
7. Mobile-first responsive design
8. Dark mode support

---

## Test Results Summary

**Date Tested**: ********\_********

**Tester**: ********\_********

**Overall Status**:

- [ ] Pass
- [ ] Pass with Minor Issues
- [ ] Fail

**Critical Issues Found**: ********************\_\_\_********************

**Non-Critical Issues Found**: ********************\_\_\_********************

**Notes**: ********************\_\_\_********************

---

## Next Steps After Testing

1. Document all bugs found
2. Prioritize issues (Critical, High, Medium, Low)
3. Create GitHub issues for each bug
4. Update project roadmap
5. Plan next sprint based on findings
