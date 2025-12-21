# Student User Guide

This guide details the features and workflows available to Students in the Guitar CRM application.
It includes tracking for mobile responsiveness, specifically targeting the **iPhone 17** resolution (approx. 393pt width).

## 1. Dashboard Overview (`/dashboard`)
The personal command center for your learning journey.
- **Welcome**: Personalized greeting.
- **Key Stats**: Quick view of your progress (e.g., active lessons, songs learned).
- **Next Lesson**: Prominent display of your upcoming scheduled lesson.
- **Recent Activity**: Log of completed lessons and new songs.
- **Assignments**: Quick list of pending tasks.

### Mobile Experience (iPhone 17)
- [x] **Header**: Greeting text should wrap appropriately without overflowing.
- [x] **Stats Grid**: Cards should stack vertically (1 column) to fit the narrower 393pt width.
- [x] **Next Lesson Card**: Should be the focal point, with clear date/time and "Join" or "Details" button easily tappable.
- [x] **Layout**: The main grid (Songs vs Activity/Assignments) must stack into a single column flow.

## 2. My Lessons (`/dashboard/lessons`)
View your schedule and lesson history.
- **Upcoming Lessons**: See what's scheduled.
- **Lesson History**: Review past lessons and notes.
- **Lesson Details**:
    - **Notes**: Read feedback and notes from your teacher.
    - **Repertoire**: See which songs were worked on.

### Mobile Experience (iPhone 17)
- [x] **List View**: Preferred over calendar for small screens. Each lesson item should show Date, Time, and Teacher clearly.
- [x] **Detail View**: Notes and song lists should be readable without horizontal scrolling.
- [x] **Action Buttons**: "Join Video" (if applicable) must be a full-width, easily accessible button.

## 3. Assignments (`/dashboard/assignments`)
Track your homework and practice tasks.
- **Pending Tasks**: View assignments that need attention.
- **Assignment Details**:
    - **Instructions**: Read what needs to be practiced.
    - **Due Date**: Clear indication of deadlines.
    - **Linked Content**: Direct links to the relevant song or lesson.
- **Status**: Mark assignments as complete (if enabled).

### Mobile Experience (iPhone 17)
- [x] **Assignment Cards**: Should display Title, Due Date, and Status badge clearly.
- [x] **Status Indicators**: Color-coded badges (e.g., Red for Overdue) must be visible.
- [x] **Interaction**: Tapping an assignment should open details in a full-screen view or expanded card.

## 4. Song Library (`/dashboard/songs`)
Access your repertoire and learning materials.
- **My Songs**: Songs you are currently learning or have mastered.
- **Song Details**:
    - **Chords/Tabs**: View external resources.
    - **Media**: Watch YouTube videos or listen to audio tracks.
    - **PDFs**: View attached sheet music.

### Mobile Experience (iPhone 17)
- [x] **Song List**: Compact view showing Title and Artist. Secondary info should be hidden or minimal.
- [x] **Search**: Search bar should be full-width and easily accessible.
- [x] **Media Playback**: YouTube embeds must resize to 100% width. Audio players should be touch-friendly.
- [x] **PDF Viewer**: If viewing PDFs, they should support pinch-to-zoom or open in a native viewer.

## 5. Settings (`/dashboard/settings`)
Manage your personal preferences.
- **Profile**: Update your name and email visibility.
- **Appearance**: Switch between Light and Dark mode.
- **Notifications**: Configure email or push preferences.

### Mobile Experience (iPhone 17)
- [x] **Navigation**: Settings sections should be a vertical list.
- [x] **Controls**: Toggles and dropdowns must have a minimum touch target size (44x44pt).
- [x] **Forms**: Input fields should be full-width and use appropriate keyboard types (e.g., email).

## Responsiveness Checklist (iPhone 17 - 393pt)
Due to the narrower width compared to the Pro Max, special attention is needed for:
- [ ] **Padding**: Ensure side padding is sufficient (e.g., 16px) so content doesn't touch the edges.
- [ ] **Font Sizes**: Body text should be at least 16px for readability.
- [ ] **Flex Wraps**: Any row-based layouts (like button groups or metadata tags) must wrap correctly.
- [ ] **Touch Targets**: All interactive elements must be spaced correctly to avoid accidental taps.
