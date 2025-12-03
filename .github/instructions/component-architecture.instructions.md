# Component Architecture Standards

**Status**: Established via discovery Q&A  
**Last Updated**: October 26, 2025  
**Enforced By**: ESLint max file length, code review

---

## Purpose

Establish consistent patterns for decomposing UI into small, maintainable, composable components. This prevents monolithic components and ensures the codebase remains scalable as Guitar CRM grows.

---

## Core Principles

1. **Small Components Policy (MANDATORY)**: One responsibility per component/file
2. **Feature Folders**: Related components, hooks, and utilities live together
3. **Co-location**: Hooks and helpers stay with features, not scattered in global directories
4. **Composition Over Inheritance**: Build complex UI by composing small pieces
5. **Predictable File Structure**: Developers know where to find things

---

## File Organization Standard

### Feature Folder Structure

```
components/<domain>/<Feature>/
├── index.ts              # Re-exports (single entry point)
├── Feature.tsx           # Main composition component
├── Feature.Header.tsx    # Sub-component: header/title area
├── Feature.Item.tsx      # Sub-component: repeated item
├── Feature.List.tsx      # Sub-component: list container
├── Feature.Empty.tsx     # Sub-component: empty state
├── useFeature.ts         # Custom hook for feature logic
└── Feature.helpers.ts    # Pure utility functions

__tests__/
└── components/
    └── <domain>/
        └── Feature/
            ├── Feature.test.tsx
            ├── Feature.Item.test.tsx
            └── useFeature.test.ts
```

### Example: StudentLesson Feature

```
components/lessons/StudentLesson/
├── index.ts
├── StudentLesson.tsx          # Main container
├── StudentLesson.Header.tsx   # Lesson title + date
├── StudentLesson.SongList.tsx # List of songs in lesson
├── StudentLesson.Song.tsx     # Individual song row
├── StudentLesson.Empty.tsx    # "No songs" state
├── useStudentLesson.ts        # Fetch + state logic
└── studentLesson.helpers.ts   # Format dates, sort songs, etc.

__tests__/components/lessons/StudentLesson/
├── StudentLesson.test.tsx
├── StudentLesson.Song.test.tsx
└── useStudentLesson.test.ts
```

---

## Component Composition Pattern

### Main Composition Component (`Feature.tsx`)

Purpose: Orchestrate smaller components, manage layout.

```tsx
// components/lessons/StudentLesson/StudentLesson.tsx
import { StudentLesson } from './StudentLesson.types';
import { StudentLessonHeader } from './StudentLesson.Header';
import { StudentLessonSongList } from './StudentLesson.SongList';
import { StudentLessonEmpty } from './StudentLesson.Empty';

interface StudentLessonProps {
	lesson: StudentLesson;
	onSongSelect: (songId: string) => void;
}

export function StudentLesson({ lesson, onSongSelect }: StudentLessonProps) {
	return (
		<div className='space-y-4'>
			<StudentLessonHeader lesson={lesson} />
			{lesson.songs.length > 0 ? (
				<StudentLessonSongList songs={lesson.songs} onSelect={onSongSelect} />
			) : (
				<StudentLessonEmpty />
			)}
		</div>
	);
}
```

### Sub-component (`Feature.Item.tsx`)

Purpose: Render a single, focused UI piece. No business logic.

```tsx
// components/lessons/StudentLesson/StudentLesson.Song.tsx
import { LessonSong } from '@/schemas/LessonSchema';

interface StudentLessonSongProps {
	song: LessonSong;
	onSelect: (songId: string) => void;
	isSelected?: boolean;
}

export function StudentLessonSong({
	song,
	onSelect,
	isSelected = false,
}: StudentLessonSongProps) {
	return (
		<button
			onClick={() => onSelect(song.id)}
			className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors
        ${
					isSelected
						? 'bg-blue-500 text-white'
						: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
				}
      `}
		>
			<h4 className='font-medium text-xs sm:text-sm'>{song.title}</h4>
			<p className='text-xs text-gray-600 dark:text-gray-400'>{song.artist}</p>
		</button>
	);
}
```

### Empty State (`Feature.Empty.tsx`)

Purpose: Render UI when no data available.

```tsx
// components/lessons/StudentLesson/StudentLesson.Empty.tsx
export function StudentLessonEmpty() {
	return (
		<div className='text-center py-8 sm:py-12'>
			<p className='text-sm text-gray-500 dark:text-gray-400'>
				No songs assigned yet. Check back soon!
			</p>
		</div>
	);
}
```

### Re-exports (`index.ts`)

Purpose: Single entry point for imports.

```tsx
// components/lessons/StudentLesson/index.ts
export { StudentLesson } from './StudentLesson';
export { StudentLessonHeader } from './StudentLesson.Header';
export { StudentLessonSongList } from './StudentLesson.SongList';
export { StudentLessonSong } from './StudentLesson.Song';
export { StudentLessonEmpty } from './StudentLesson.Empty';

export { useStudentLesson } from './useStudentLesson';

export type { StudentLessonProps } from './StudentLesson';
```

---

## Hook Pattern (`useFeature.ts`)

Purpose: Encapsulate data fetching, state management, and side effects for a feature.

```tsx
// components/lessons/StudentLesson/useStudentLesson.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lesson, LessonSchema } from '@/schemas/LessonSchema';

export function useStudentLesson(studentId: string) {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				setIsLoading(true);
				const { data, error: dbError } = await supabase
					.from('lessons')
					.select('*')
					.eq('student_id', studentId)
					.order('created_at', { ascending: false });

				if (dbError) throw dbError;

				const validated = data.map((item) => LessonSchema.parse(item));
				setLessons(validated);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to fetch lessons'
				);
				setLessons([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLessons();
	}, [studentId]);

	return { lessons, isLoading, error };
}
```

---

## Helper Functions Pattern (`Feature.helpers.ts`)

Purpose: Pure utility functions with no side effects. Only export functions, no exports of data/constants.

```tsx
// components/lessons/StudentLesson/studentLesson.helpers.ts
import { Lesson } from '@/schemas/LessonSchema';

/**
 * Sort lessons by most recent first
 */
export function sortLessonsByDate(lessons: Lesson[]): Lesson[] {
	return [...lessons].sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
}

/**
 * Format lesson date for display
 * @param date ISO date string
 * @returns "Oct 26, 2025" format
 */
export function formatLessonDate(date: string): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

/**
 * Count completed songs in a lesson
 */
export function countCompletedSongs(lesson: Lesson): number {
	return lesson.songs?.filter((s) => s.status === 'mastered').length ?? 0;
}
```

---

## Size Constraints (ENFORCED)

These limits keep files focused:

- **Component file**: Max 200 LOC
- **Hook file**: Max 150 LOC
- **Helper file**: Max 100 LOC per function
- **Function body**: Max 50 LOC
- **Component nesting**: Max 3 levels deep (parent → item → detail)

**Enforcement**:

- ESLint rule: `max-lines`
- Code review: Will request decomposition if exceeded
- `npm run quality` warns on violations

**If you exceed limits**: Extract a new file/component, don't grow existing one.

---

## Naming Conventions

| Type           | Pattern                      | Example                    |
| -------------- | ---------------------------- | -------------------------- |
| Component file | PascalCase                   | `StudentLesson.tsx`        |
| Sub-component  | `ParentName.Section.tsx`     | `StudentLesson.Song.tsx`   |
| Hook file      | `use` + PascalCase           | `useStudentLesson.ts`      |
| Helper file    | `featureName.helpers.ts`     | `studentLesson.helpers.ts` |
| Test file      | Match source + `.test.ts(x)` | `StudentLesson.test.tsx`   |

---

## Import/Export Patterns

### ✅ DO: Import from feature index

```tsx
// Good: Clear entry point
import {
	StudentLesson,
	useStudentLesson,
} from '@/components/lessons/StudentLesson';
```

### ❌ DON'T: Import from sub-components directly

```tsx
// Bad: Breaks encapsulation
import { StudentLessonSong } from '@/components/lessons/StudentLesson/StudentLesson.Song';
```

### ✅ DO: Co-export types

```tsx
// components/lessons/StudentLesson/index.ts
export { StudentLesson } from './StudentLesson';
export type { StudentLessonProps } from './StudentLesson';
```

---

## Mobile-First Styling in Components

All components must follow mobile-first approach:

```tsx
// ✅ CORRECT: Default = mobile, scale up
className = 'text-xs px-3 py-2 sm:text-sm sm:px-4 md:text-base md:px-6';

// ❌ WRONG: Desktop-first
className = 'text-base px-6 py-4 sm:text-sm sm:px-3';
```

**Breakpoints** (Tailwind defaults):

- Base (mobile): 375px - 639px
- `sm:`: 640px - 767px
- `md:`: 768px - 1023px (tablets!)
- `lg:`: 1024px+

---

## Component Testing Pattern

Test sub-components in isolation:

```tsx
// __tests__/components/lessons/StudentLesson/StudentLesson.Song.test.tsx
import { render, screen } from '@testing-library/react';
import { StudentLessonSong } from '@/components/lessons/StudentLesson';

describe('StudentLessonSong', () => {
	it('renders song title and artist', () => {
		const mockSong = {
			id: '1',
			title: 'Wonderwall',
			artist: 'Oasis',
		};

		render(<StudentLessonSong song={mockSong} onSelect={jest.fn()} />);

		expect(screen.getByText('Wonderwall')).toBeInTheDocument();
		expect(screen.getByText('Oasis')).toBeInTheDocument();
	});

	it('calls onSelect when clicked', () => {
		const onSelect = jest.fn();
		const mockSong = { id: '1', title: 'Test', artist: 'Artist' };

		render(<StudentLessonSong song={mockSong} onSelect={onSelect} />);

		screen.getByRole('button').click();
		expect(onSelect).toHaveBeenCalledWith('1');
	});
});
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Monolithic Component

One 500-line component doing everything.

**Fix**: Extract sub-components for each section.

```tsx
// Before: One huge component
function StudentLesson() {
  // 500 lines of: header, list, items, empty state, pagination...
}

// After: Composed of smaller pieces
function StudentLesson() {
  return (
    <StudentLessonHeader />
    <StudentLessonSongList />
    <StudentLessonEmpty />
  );
}
```

### ❌ Mistake 2: Props Drilling

Passing data through 4+ component levels.

**Fix**: Use hooks at appropriate level, or refactor to reduce nesting.

```tsx
// Before: Props drilling
<StudentLesson lesson={lesson}>
	<StudentLessonList lessons={lesson.songs}>
		<StudentLessonSong song={song} onSelect={onSelect} />
	</StudentLessonList>
</StudentLesson>;

// After: Flatten or use hooks
function StudentLessonSong({ song }) {
	const { onSelect } = useStudentLessonContext(); // Get from context/hook
	return <button onClick={() => onSelect(song.id)}>{song.title}</button>;
}
```

### ❌ Mistake 3: Business Logic in Components

Fetch, validate, and format data inside component render.

**Fix**: Move to hook or helper.

```tsx
// Before: Mixed concerns
export function StudentLesson({ lesson }) {
  const songs = lesson.songs
    .filter((s) => s.status !== 'mastered')
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => ({ ...s, display: formatTitle(s.title) }));
  return <div>{songs.map(...)}</div>;
}

// After: Separated concerns
export function StudentLesson({ lesson }) {
  const processedSongs = processLessonSongs(lesson.songs);
  return <div>{processedSongs.map(...)}</div>;
}

// In helpers
export function processLessonSongs(songs: Song[]) {
  return songs
    .filter((s) => s.status !== 'mastered')
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => ({ ...s, display: formatTitle(s.title) }));
}
```

### ❌ Mistake 4: Global Hooks/Utils Directories

Putting feature-specific hooks in `hooks/` directory scattered globally.

**Fix**: Co-locate with feature.

```
// Before: Scattered
hooks/
  ├── useStudentLesson.ts
  ├── useTeacherDashboard.ts
  └── useSongList.ts

// After: Co-located
components/lessons/StudentLesson/
  └── useStudentLesson.ts
components/dashboard/TeacherDashboard/
  └── useTeacherDashboard.ts
```

---

## When to Create New Components

Create a new component when:

- ✅ It has a distinct responsibility
- ✅ It will be reused in 2+ places
- ✅ It has internal state or hooks
- ✅ Breaking it out keeps parent under 200 LOC

Don't create new component when:

- ❌ It's a one-line wrapper
- ❌ It's used only once and <20 LOC
- ❌ It's just a styling wrapper (use CSS class instead)

---

## Decomposition Checklist

Before opening a PR:

- [ ] No component file >200 LOC
- [ ] No function >50 LOC (except React components)
- [ ] Each component has one clear responsibility
- [ ] Sub-components are extracted and named
- [ ] Hooks are isolated in `useFeature.ts`
- [ ] Helpers are pure functions in `Feature.helpers.ts`
- [ ] Tests exist for components and hooks
- [ ] Mobile-first styling applied
- [ ] Dark mode styles included (`dark:` prefix)
- [ ] Accessibility attributes present (labels, roles, aria-\*)
- [ ] Imports use feature index, not sub-files

---

## Examples in Codebase

Reference these existing features:

- `components/navigation/Header/` - Header + sub-components
- `components/auth/SignIn/` - Form with validation
- `components/admin/TaskManagement/` - Complex list view

---

## Questions?

If you're unsure if a component is too large or should be decomposed, check:

1. File size (max 200 LOC)
2. Number of responsibilities (should be 1)
3. Test complexity (if test is >100 LOC, component probably too big)

If any of these fail, decompose.
