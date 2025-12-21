# Song Page Specification

This document provides a detailed specification of the Song Detail page (`/dashboard/songs/[id]`), including its component hierarchy, props, and data types. This is intended to guide AI-assisted UI generation.

## Page Overview

**Path**: `app/dashboard/songs/[id]/page.tsx`

The entry point for the song detail view. It handles:

1. Authentication check (`getUserWithRolesSSR`).
2. Role-based redirection (Students see `StudentSongDetailPageClient`).
3. Fetching initial data (Students list for Admins/Teachers).
4. Layout structure (Breadcrumbs, Main Content).

### Props

```typescript
interface SongPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

---

## Component Hierarchy

### 1. SongDetail (Server Component)

**Path**: `components/songs/details/index.tsx`

Fetches and displays the core song information.

**Props**:

```typescript
interface Props {
  songId: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
}
```

**Children**:

- `SongDetailHeader`
- `SongDetailActions`
- `SongDetailInfo`
- `YouTubeEmbed`
- `ImageGallery`

---

### 2. Child Components

#### A. SongDetailHeader

**Path**: `components/songs/details/Header.tsx`

Displays the song title and author.

**Props**:

```typescript
interface Props {
  title: string;
  author: string;
}
```

#### B. SongDetailActions

**Path**: `components/songs/details/Actions.tsx`

Provides administrative actions like Edit and Delete. Only visible to Admins/Teachers.

**Props**:

```typescript
interface Props {
  songId: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
}
```

#### C. SongDetailInfo

**Path**: `components/songs/details/Info.tsx`

Displays detailed metadata about the song (Difficulty, Key, Tempo, etc.) and the cover image.

**Props**:

```typescript
interface Props {
  song: Song; // See Data Types below
}
```

#### D. YouTubeEmbed

**Path**: `components/songs/details/YouTubeEmbed.tsx`

Embeds a YouTube video if a URL is provided.

**Props**:

```typescript
interface Props {
  url?: string | null;
}
```

#### E. ImageGallery

**Path**: `components/songs/details/ImageGallery.tsx`

Displays a grid of gallery images associated with the song.

**Props**:

```typescript
interface Props {
  images?: string[] | null;
}
```

#### F. SongLessons

**Path**: `components/songs/details/SongLessons.tsx`

Lists lessons where this song is used.

**Props**:

```typescript
interface Props {
  songId: string;
}
```

#### G. SongAssignments

**Path**: `components/songs/details/SongAssignments.tsx`

Lists assignments related to this song.

**Props**:

```typescript
interface Props {
  songId: string;
}
```

#### H. SongStudents

**Path**: `components/songs/details/SongStudents.tsx`

Displays a list of students interacting with this song, grouped by status (Mastered, In Progress, To Learn).

**Props**:

```typescript
interface Props {
  students: SongStudentItem[]; // See Data Types below
}
```

---

## Data Types

### 1. Song

Based on Supabase `songs` table.

```typescript
type Song = {
  id: string;
  title: string;
  author: string;
  short_title: string | null;
  
  // Metadata
  key: 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B' | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Ebm' | 'Em' | 'Fm' | 'F#m' | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bbm' | 'Bm';
  level: 'beginner' | 'intermediate' | 'advanced';
  tempo: number | null; // BPM
  time_signature: number | null;
  duration_ms: number | null;
  release_year: number | null;
  category: string | null;
  
  // Content
  chords: string | null;
  capo_fret: number | null;
  strumming_pattern: string | null;
  
  // Media & Links
  cover_image_url: string | null;
  gallery_images: string[] | null;
  youtube_url: string | null;
  spotify_link_url: string | null;
  ultimate_guitar_link: string;
  
  // System
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
```

### 2. SongStudentItem

Used in `SongStudents` component.

```typescript
type SongStudentItem = {
  studentId: string;
  name: string;
  status: 'to_learn' | 'started' | 'remembered' | 'with_author' | 'mastered';
  lastPlayed: string;
};
```

### 3. SongLesson (Internal)

Used in `SongLessons` component.

```typescript
interface SongLesson {
  id: string;
  lesson_teacher_number: number | null;
  scheduled_at: string | null;
  lesson_status: string | null;
  song_status: string | null;
  student_id: string;
  teacher_id: string;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  teacher: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}
```

### 4. SongAssignment (Internal)

Used in `SongAssignments` component.

```typescript
interface SongAssignment {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  student_id: string;
  lesson_id: string | null;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  lesson: {
    id: string;
    lesson_teacher_number: number;
  } | null;
}
```
