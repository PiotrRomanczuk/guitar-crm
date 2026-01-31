# Figma User Flows & Prototyping Guide

This document outlines all user flows in Guitar CRM for creating interactive Figma prototypes. Use these flows to ensure designs cover all user journeys.

## Table of Contents

1. [Flow Diagram Standards](#flow-diagram-standards)
2. [Authentication Flows](#authentication-flows)
3. [Onboarding Flows](#onboarding-flows)
4. [Dashboard Flows](#dashboard-flows)
5. [Lesson Management Flows](#lesson-management-flows)
6. [Song Library Flows](#song-library-flows)
7. [Assignment Flows](#assignment-flows)
8. [User Management Flows](#user-management-flows)
9. [Settings Flows](#settings-flows)
10. [Prototyping Specifications](#prototyping-specifications)

---

## Flow Diagram Standards

### Naming Convention

```
[Role] - [Feature] - [Action] - [Variant]

Examples:
Teacher - Lesson - Create - Happy Path
Admin - User - Delete - Confirmation
Student - Assignment - View - Empty State
```

### Flow Symbols

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Screen/Frame |
| `-->` | Navigation (click) |
| `==>` | Form submission |
| `...` | Loading state |
| `(?)` | Decision point |
| `[!]` | Error state |
| `[x]` | End of flow |

### Frame Organization

```
Figma Page: User Flows
├── 01 - Authentication
│   ├── Sign In Flow
│   ├── Sign Up Flow
│   └── Password Reset Flow
├── 02 - Onboarding
│   ├── New User Setup
│   └── Profile Completion
├── 03 - Lessons
│   ├── Create Lesson
│   ├── Edit Lesson
│   └── Cancel Lesson
├── 04 - Songs
│   ├── Browse Songs
│   ├── Add Song
│   └── Spotify Search
├── 05 - Assignments
│   ├── Create Assignment
│   ├── Student View
│   └── Mark Complete
├── 06 - Users (Admin)
│   ├── View Users
│   ├── Create User
│   └── Edit Permissions
└── 07 - Settings
    ├── Profile Settings
    └── Integration Setup
```

---

## Authentication Flows

### Sign In Flow

**Entry Points:**
- Landing page "Sign In" button
- Direct URL `/sign-in`
- Expired session redirect

**Flow Diagram:**

```
[Landing Page]
    │
    ▼
[Sign In Page]
    │
    ├── Email input
    ├── Password input
    ├── "Remember me" checkbox
    ├── "Forgot password?" link
    └── "Sign up" link
    │
    ▼ (Submit)
    │
    ├── (?) Valid credentials
    │   │
    │   ├── Yes --> [Loading...] --> [Dashboard]
    │   │
    │   └── No --> [Sign In Page + Error Toast]
    │              "Invalid email or password"
    │
    └── (?) Account not verified
        │
        └── [Sign In Page + Warning]
            "Please verify your email"
```

**Screens to Design:**
1. Sign In - Default state
2. Sign In - Form filled
3. Sign In - Loading state
4. Sign In - Error state (invalid credentials)
5. Sign In - Error state (unverified email)

**Prototype Interactions:**
| Trigger | Action | Animation |
|---------|--------|-----------|
| Submit button click | Navigate to Loading | Instant |
| Loading complete | Navigate to Dashboard | Fade (300ms) |
| Error | Show toast | Slide up (200ms) |

### Sign Up Flow

**Flow Diagram:**

```
[Landing Page]
    │
    ▼
[Sign Up Page]
    │
    ├── Full name input
    ├── Email input
    ├── Password input
    ├── Confirm password input
    └── Role selection (if applicable)
    │
    ▼ (Submit)
    │
    ├── (?) Validation passes
    │   │
    │   ├── Yes --> [Loading...]
    │   │           │
    │   │           ▼
    │   │       [Email Sent Page]
    │   │       "Check your email to verify"
    │   │           │
    │   │           ▼ (Click email link)
    │   │       [Email Verified Page]
    │   │           │
    │   │           ▼
    │   │       [Onboarding] or [Dashboard]
    │   │
    │   └── No --> [Sign Up Page + Errors]
    │              - "Email already exists"
    │              - "Passwords don't match"
    │              - "Password too weak"
```

**Screens to Design:**
1. Sign Up - Default state
2. Sign Up - Form filled
3. Sign Up - Validation errors
4. Sign Up - Loading state
5. Email Sent confirmation
6. Email Verified success
7. Email Verification error

### Password Reset Flow

**Flow Diagram:**

```
[Sign In Page]
    │
    ▼ ("Forgot password?" click)
[Forgot Password Page]
    │
    ├── Email input
    │
    ▼ (Submit)
    │
[Email Sent Page]
"Password reset link sent"
    │
    ▼ (Click email link)
[Reset Password Page]
    │
    ├── New password input
    ├── Confirm password input
    │
    ▼ (Submit)
    │
[Password Changed Page]
"Your password has been updated"
    │
    ▼
[Sign In Page]
```

**Screens to Design:**
1. Forgot Password form
2. Reset link sent confirmation
3. Reset Password form
4. Password changed success
5. Reset link expired error

---

## Onboarding Flows

### New User Onboarding

**Target:** First-time users after sign up

**Flow Diagram:**

```
[Welcome Screen]
"Welcome to Guitar CRM!"
    │
    ▼ (Get Started)
[Step 1: Profile]
    │
    ├── Avatar upload
    ├── Display name
    ├── Bio (optional)
    │
    ▼ (Continue)
[Step 2: Preferences]
    │
    ├── Theme selection (Light/Dark)
    ├── Notification preferences
    │
    ▼ (Continue)
[Step 3: Connect Integrations] (optional)
    │
    ├── Google Calendar
    ├── Spotify
    │
    ▼ (Continue / Skip)
[Step 4: Tour]
    │
    ├── Product tour highlights
    │   - Dashboard overview
    │   - Create first lesson
    │   - Browse song library
    │
    ▼ (Finish)
[Dashboard]
```

**Screens to Design:**
1. Welcome screen
2. Profile setup (with avatar upload states)
3. Preferences selection
4. Integration connection
5. Product tour overlays (3-5 steps)
6. Onboarding complete

**Progress Indicator:**
```
●───●───○───○
1   2   3   4
```

---

## Dashboard Flows

### Teacher Dashboard

**Entry Point:** Successful login (Teacher role)

**Flow Diagram:**

```
[Teacher Dashboard]
    │
    ├── Stats Cards (5)
    │   ├── Total Students
    │   ├── Upcoming Lessons
    │   ├── Pending Assignments
    │   ├── Songs Assigned
    │   └── This Week's Hours
    │
    ├── Quick Actions
    │   ├── [Create Lesson] --> Lesson Creation Flow
    │   ├── [Add Assignment] --> Assignment Creation Flow
    │   └── [View Calendar] --> Calendar Page
    │
    ├── Upcoming Lessons (list)
    │   └── [Lesson Card] --> Lesson Detail
    │
    ├── Recent Activity
    │   └── Timeline of changes
    │
    └── Student Pipeline
        └── [Student Card] --> User Detail
```

**Screens to Design:**
1. Dashboard - Full data
2. Dashboard - Loading skeletons
3. Dashboard - Empty state (new user)
4. Dashboard - With notifications

### Admin Dashboard

**Additional Elements:**

```
[Admin Dashboard]
    │
    ├── System Health Card
    │   ├── Database status
    │   ├── API status
    │   └── Error count
    │
    ├── User Statistics
    │   ├── Total users by role
    │   └── Active users chart
    │
    └── Admin Quick Actions
        ├── [Manage Users] --> User Management
        ├── [View Logs] --> System Logs
        └── [Settings] --> Admin Settings
```

### Student Dashboard

**Flow Diagram:**

```
[Student Dashboard]
    │
    ├── My Progress Card
    │   ├── Lessons completed
    │   ├── Songs learned
    │   └── Practice streak
    │
    ├── Next Lesson
    │   └── [Lesson Card] --> Lesson Detail
    │
    ├── Current Assignments
    │   └── [Assignment Card] --> Assignment Detail
    │
    └── My Songs
        └── [Song Card] --> Song Detail
```

---

## Lesson Management Flows

### Create Lesson Flow

**Entry Points:**
- Dashboard quick action
- Lessons page "New Lesson" button
- Calendar "+" button

**Flow Diagram:**

```
[Lessons List Page]
    │
    ▼ (New Lesson button)
[Create Lesson Modal/Page]
    │
    ├── Student selection (dropdown)
    ├── Date picker
    ├── Time picker
    ├── Duration selection
    ├── Location/Type (In-person/Online)
    ├── Notes (optional)
    │
    ▼ (Save)
    │
    ├── (?) Validation passes
    │   │
    │   ├── Yes --> [Loading...]
    │   │           │
    │   │           ▼
    │   │       [Success Toast]
    │   │       "Lesson created"
    │   │           │
    │   │           ▼
    │   │       [Lessons List] (updated)
    │   │
    │   └── No --> [Form + Errors]
    │              - "Student required"
    │              - "Date conflicts with existing lesson"
```

**Screens to Design:**
1. Lessons list page
2. Create lesson modal - Empty
3. Create lesson modal - Filled
4. Create lesson modal - Validation errors
5. Create lesson modal - Loading
6. Success toast
7. Updated lessons list

### Edit Lesson Flow

**Flow Diagram:**

```
[Lesson Detail Page]
    │
    ▼ (Edit button)
[Edit Lesson Modal]
    │
    ├── Pre-filled form
    ├── Change history link
    │
    ▼ (Save Changes)
    │
[Confirmation Toast]
"Lesson updated"
    │
    ▼
[Lesson Detail] (refreshed)
```

### Cancel Lesson Flow

**Flow Diagram:**

```
[Lesson Detail Page]
    │
    ▼ (Cancel Lesson button)
[Confirmation Dialog]
"Are you sure you want to cancel this lesson?"
    │
    ├── [Cancel] --> [Lesson Detail] (no change)
    │
    └── [Confirm Cancel]
        │
        ▼
    [Notification Options Dialog]
    "Notify student?"
        │
        ├── [Yes, notify] --> Send notification
        └── [No, don't notify]
            │
            ▼
        [Lesson Detail] (status: Cancelled)
```

**Screens to Design:**
1. Lesson detail page
2. Cancel confirmation dialog
3. Notification options dialog
4. Lesson cancelled state

---

## Song Library Flows

### Browse Songs Flow

**Flow Diagram:**

```
[Songs Page]
    │
    ├── Search input
    ├── Filter dropdown (Genre, Difficulty, Status)
    ├── Sort dropdown (Name, Date Added, Popularity)
    │
    ├── Song Grid/List
    │   └── [Song Card]
    │       ├── Thumbnail
    │       ├── Title
    │       ├── Artist
    │       ├── Difficulty badge
    │       └── Quick actions
    │
    ▼ (Click song)
[Song Detail Page]
    │
    ├── Full details
    ├── Spotify embed (if linked)
    ├── Assignment history
    └── Actions
        ├── [Edit] --> Edit Song Modal
        ├── [Assign] --> Assignment Creation
        └── [Delete] --> Delete Confirmation
```

**Screens to Design:**
1. Songs page - Grid view
2. Songs page - List view
3. Songs page - With filters active
4. Songs page - Search results
5. Songs page - Empty state ("No songs found")
6. Songs page - Loading skeletons
7. Song detail page

### Add Song Flow (Manual)

**Flow Diagram:**

```
[Songs Page]
    │
    ▼ (Add Song button)
[Add Song Modal]
    │
    ├── Title input
    ├── Artist input
    ├── Genre selection
    ├── Difficulty selection
    ├── Spotify link (optional)
    ├── Notes/Description
    │
    ▼ (Save)
    │
[Songs Page] + [Success Toast]
```

### Spotify Search Flow

**Flow Diagram:**

```
[Songs Page]
    │
    ▼ (Add from Spotify button)
[Spotify Search Modal]
    │
    ├── Search input
    │
    ▼ (Type query)
[Search Results]
    │
    ├── Song result cards
    │   ├── Album art
    │   ├── Song name
    │   ├── Artist
    │   └── [Add] button
    │
    ▼ (Click Add)
[Confirm Import Modal]
    │
    ├── Pre-filled data from Spotify
    ├── Editable fields
    │
    ▼ (Confirm)
    │
[Songs Page] + [Success Toast]
"Song added from Spotify"
```

**Screens to Design:**
1. Spotify search modal - Empty
2. Spotify search modal - Loading
3. Spotify search modal - Results
4. Spotify search modal - No results
5. Confirm import modal

---

## Assignment Flows

### Create Assignment Flow

**Flow Diagram:**

```
[Assignments Page] or [Lesson Detail]
    │
    ▼ (Create Assignment)
[Create Assignment Modal/Page]
    │
    ├── Step 1: Basic Info
    │   ├── Title
    │   ├── Student selection
    │   ├── Due date
    │   └── Priority
    │
    ▼ (Next)
    │
    ├── Step 2: Select Songs
    │   ├── Search songs
    │   ├── Song list with checkboxes
    │   └── Selected songs summary
    │
    ▼ (Next)
    │
    ├── Step 3: Instructions
    │   ├── Practice notes
    │   ├── Goals
    │   └── Resources
    │
    ▼ (Create Assignment)
    │
[Assignments Page] + [Success Toast]
```

**Screens to Design:**
1. Create assignment - Step 1
2. Create assignment - Step 2 (song selection)
3. Create assignment - Step 3 (instructions)
4. Create assignment - Review before submit
5. Assignment created success

### Student Assignment View

**Flow Diagram:**

```
[Student Dashboard]
    │
    ▼ (Click assignment)
[Assignment Detail - Student View]
    │
    ├── Assignment header
    │   ├── Title
    │   ├── Due date
    │   └── Status badge
    │
    ├── Songs to practice
    │   └── [Song Card]
    │       ├── Song details
    │       ├── [Open in Spotify]
    │       └── Progress checkbox
    │
    ├── Teacher instructions
    │
    └── Actions
        ├── [Mark Complete] --> Confirmation
        └── [Add Practice Notes]
```

### Mark Assignment Complete

**Flow Diagram:**

```
[Assignment Detail]
    │
    ▼ (Mark Complete)
[Completion Dialog]
    │
    ├── Confirmation message
    ├── Optional: Add completion notes
    │
    ▼ (Confirm)
    │
[Assignment Detail] (Status: Completed)
    │
[Celebration Animation] (optional)
```

---

## User Management Flows

### View Users (Admin)

**Flow Diagram:**

```
[Users Page]
    │
    ├── Search input
    ├── Role filter
    ├── Status filter
    │
    ├── Users Table
    │   ├── Name
    │   ├── Email
    │   ├── Role
    │   ├── Status
    │   ├── Last Active
    │   └── Actions
    │
    ▼ (Click user row)
[User Detail Page]
    │
    ├── Profile info
    ├── Activity history
    ├── Assigned students/teachers
    └── Actions
        ├── [Edit] --> Edit User Modal
        ├── [Change Role] --> Role Change Dialog
        └── [Deactivate] --> Deactivation Dialog
```

### Create User (Admin)

**Flow Diagram:**

```
[Users Page]
    │
    ▼ (Add User)
[Create User Modal]
    │
    ├── Name
    ├── Email
    ├── Role selection
    ├── Send invite email checkbox
    │
    ▼ (Create)
    │
    ├── (?) Send invite
    │   │
    │   ├── Yes --> [Invite Sent Toast]
    │   │
    │   └── No --> [User Created Toast]
    │              "User created (not invited)"
    │
    ▼
[Users Page] (updated)
```

### Change User Role

**Flow Diagram:**

```
[User Detail Page]
    │
    ▼ (Change Role button)
[Role Change Dialog]
    │
    ├── Current role display
    ├── New role selection
    ├── Warning about permission changes
    │
    ▼ (Confirm Change)
    │
[Success Toast]
"User role updated"
```

---

## Settings Flows

### Profile Settings

**Flow Diagram:**

```
[Settings Page]
    │
    ▼ (Profile tab)
[Profile Settings]
    │
    ├── Avatar upload
    │   ├── [Change] --> File picker
    │   └── [Remove] --> Confirmation
    │
    ├── Display name
    ├── Email (read-only or change)
    ├── Bio
    │
    ▼ (Save Changes)
    │
[Success Toast]
"Profile updated"
```

### Integration Settings

**Flow Diagram:**

```
[Settings Page]
    │
    ▼ (Integrations tab)
[Integration Settings]
    │
    ├── Google Calendar
    │   ├── Status: Connected/Not Connected
    │   ├── [Connect] --> OAuth flow
    │   └── [Disconnect] --> Confirmation
    │
    ├── Spotify
    │   ├── Status: Connected/Not Connected
    │   ├── [Connect] --> OAuth flow
    │   └── [Disconnect] --> Confirmation
    │
    └── API Keys (Admin/Advanced)
        ├── [Generate New Key]
        └── [Revoke Key] --> Confirmation
```

**OAuth Connection Flow:**

```
[Integration Settings]
    │
    ▼ (Connect Google Calendar)
[OAuth Popup/Redirect]
    │
    ├── Google sign-in
    ├── Permission consent
    │
    ▼ (Authorize)
    │
[Redirect back]
    │
[Integration Settings]
├── Status: Connected
├── Last synced: Just now
└── [Success Toast]
```

---

## Prototyping Specifications

### Animation Timings

| Transition | Duration | Easing | Use Case |
|------------|----------|--------|----------|
| Page navigation | 300ms | ease-out | Between pages |
| Modal open | 200ms | ease-out | Dialog/sheet appear |
| Modal close | 150ms | ease-in | Dialog/sheet dismiss |
| Toast appear | 200ms | ease-out | Notifications |
| Toast dismiss | 150ms | ease-in | Auto-dismiss |
| Dropdown open | 150ms | ease-out | Menu expand |
| Hover state | 150ms | ease-in-out | Button/card hover |
| Loading spinner | infinite | linear | Loading states |

### Interaction Types

| Interaction | Trigger | Use Case |
|-------------|---------|----------|
| On Click | Mouse click/tap | Buttons, links, cards |
| On Hover | Mouse hover | Tooltips, previews |
| While Pressing | Mouse down | Button press effect |
| Key/Gamepad | Keyboard | Shortcuts, accessibility |
| After Delay | Time-based | Auto-advance, auto-dismiss |
| Mouse Enter/Leave | Mouse movement | Hover states |

### Smart Animate Properties

Use Smart Animate for smooth transitions between:
- Position changes
- Size changes
- Opacity changes
- Rotation changes

**Example:** Card hover effect
```
Default state:
- Scale: 100%
- Shadow: shadow-sm

Hover state:
- Scale: 102%
- Shadow: shadow-md
- Border: primary/30

Transition: Smart Animate, 150ms, ease-out
```

### Overlay Settings

| Overlay Type | Position | Background | Close On |
|--------------|----------|------------|----------|
| Modal | Center | Black 80% | Outside click, X button |
| Drawer | Bottom (mobile) | Black 50% | Swipe down, outside click |
| Dropdown | Below trigger | None | Outside click, selection |
| Tooltip | Near trigger | None | Mouse leave |
| Toast | Bottom-right | None | Auto (4s), X button |

### Flow Connectors

In Figma, use these connection patterns:

**Linear Flow:**
```
[Screen A] ──────> [Screen B] ──────> [Screen C]
```

**Branching Flow:**
```
              ┌──> [Success]
[Form] ──────>│
              └──> [Error]
```

**Looping Flow:**
```
[List] ──────> [Detail] ──────> [Edit] ──────┐
  ▲                                           │
  └───────────────────────────────────────────┘
```

### Prototype Checklist

For each user flow:

- [ ] All screens designed for primary breakpoint (Desktop)
- [ ] Mobile responsive versions created
- [ ] Loading states included
- [ ] Error states included
- [ ] Empty states included
- [ ] Success feedback included
- [ ] All interactions connected
- [ ] Animations specified
- [ ] Transitions are smooth
- [ ] Back navigation works
- [ ] Flow is testable end-to-end
