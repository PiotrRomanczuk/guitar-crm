# History Tracking System

## Overview

The Guitar CRM now includes comprehensive history tracking for assignments, lessons, and song learning progress. All changes are automatically recorded in dedicated history tables and can be viewed through timeline components.

## Database Tables

### 1. `assignment_history`
Tracks all changes to assignments including creation, status changes, updates, and deletions.

**Columns:**
- `id`: Unique identifier
- `assignment_id`: Reference to the assignment
- `changed_by`: User who made the change
- `change_type`: Type of change (created, status_changed, updated, deleted)
- `previous_data`: JSONB snapshot before change
- `new_data`: JSONB snapshot after change
- `changed_at`: Timestamp of the change
- `notes`: Optional notes about the change

### 2. `lesson_history`
Tracks all changes to lessons including creation, rescheduling, status changes, and cancellations.

**Columns:**
- `id`: Unique identifier
- `lesson_id`: Reference to the lesson
- `changed_by`: User who made the change
- `change_type`: Type of change (created, rescheduled, status_changed, updated, cancelled, completed)
- `previous_data`: JSONB snapshot before change
- `new_data`: JSONB snapshot after change
- `changed_at`: Timestamp of the change
- `notes`: Optional notes about the change

### 3. `song_status_history`
Tracks student progress through song learning statuses (to_learn → learning → learned → mastered).

**Columns:**
- `id`: Unique identifier
- `student_id`: Student whose progress changed
- `song_id`: Song being tracked
- `previous_status`: Status before change
- `new_status`: Status after change
- `changed_at`: Timestamp of the change
- `notes`: Optional notes about the change

## Automatic Tracking

Changes are automatically tracked through database triggers:

- **`trigger_track_assignment_changes`**: Fires on INSERT, UPDATE, DELETE of assignments
- **`trigger_track_lesson_changes`**: Fires on INSERT, UPDATE, DELETE of lessons
- **`trigger_track_song_status_changes`**: Fires on INSERT, UPDATE of lesson_songs.status

No manual intervention required - all changes are captured automatically!

## UI Components

### HistoryTimeline
A reusable component for displaying assignment and lesson history.

```tsx
import { HistoryTimeline } from '@/components/shared/HistoryTimeline';

<HistoryTimeline 
  recordId={assignmentId} 
  recordType="assignment"
  title="Assignment History"
/>
```

**Props:**
- `recordId`: ID of the record to show history for
- `recordType`: Either 'assignment' or 'lesson'
- `title`: Optional custom title

**Features:**
- Vertical timeline layout
- Color-coded change types
- Shows who made each change and when
- Displays detailed field-by-field changes
- Smart date formatting
- Scrollable area for long histories

### SongStatusHistory
Specialized component for song learning progress.

```tsx
import { SongStatusHistory } from '@/components/shared/SongStatusHistory';

// Show all status changes for a song
<SongStatusHistory songId={songId} title="Learning Progress" />

// Show all song progress for a student
<SongStatusHistory studentId={studentId} title="My Progress" />
```

**Props:**
- `songId`: Optional - filter by song
- `studentId`: Optional - filter by student
- `title`: Optional custom title

**Features:**
- Status progression visualization (to_learn → learning → learned → mastered)
- Color-coded status badges
- Shows student names when viewing by song
- Shows song titles when viewing by student
- Chronological timeline

## Where to Find It

### Assignment History
Visit any assignment detail page:
`/dashboard/assignments/[id]`

The history timeline appears in the right sidebar showing:
- When the assignment was created
- Status changes (not_started → in_progress → completed)
- Updates to title, description, or due date
- Who made each change

### Lesson History
Visit any lesson detail page:
`/dashboard/lessons/[id]`

The history timeline appears in the right sidebar showing:
- When the lesson was created
- Rescheduling events
- Status changes (scheduled → completed → cancelled)
- Updates to lesson details
- Who made each change

### Song Learning Progress
Visit any song detail page:
`/dashboard/songs/[id]`

The status history appears in the right sidebar showing:
- All students learning this song
- Their progress through learning stages
- Timeline of status changes

## Migrations

The history tracking system is implemented through these migrations:

1. `20260106000001_create_assignment_history_table.sql`
2. `20260106000002_create_lesson_history_table.sql`
3. `20260106000003_create_history_triggers.sql`

To apply migrations:
```bash
npx supabase db push
```

To reset local database (WARNING: deletes all data):
```bash
npx supabase db reset
```

## Security (RLS Policies)

- All authenticated users can **read** history (SELECT)
- Only admins can **manually insert** history records
- Triggers run as SECURITY DEFINER to automatically insert records

## Future Enhancements

Potential improvements:
- Export history to PDF/CSV
- Filter history by date range
- Filter by change type
- Filter by user who made the change
- Add manual notes/comments to history
- Undo functionality for recent changes
- Email notifications on important changes
- Comparison view showing before/after side-by-side
