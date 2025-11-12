# API & Data Fetching Standards

**Status**: Established via discovery Q&A (Q4, Q16, Q20)  
**Last Updated**: October 26, 2025  
**Enforced By**: Code review, Sentry monitoring

---

## Purpose

Establish consistent patterns for fetching, validating, caching, and updating data from Supabase. This ensures reliable, efficient data flow and predictable error handling across the app.

---

## Core Principles

1. **Server-First by Default**: Fetch in Server Components when possible
2. **Client Refinement**: Add filtering/sorting on client only when needed
3. **Real-Time for Critical Data**: Use Supabase subscriptions for lesson updates
4. **Event-Based Invalidation**: Refetch after mutations, not on timers
5. **Structured Error Handling**: Type-safe error objects with clear codes

---

## Data Fetching Architecture

### Pattern: Hybrid (Server + Client Refinement)

This is your standard approach:

```
Server Component (fetch base data)
    ↓
Client Component (add search/filter/sort)
    ↓
Hooks (subscribe to real-time updates if needed)
```

### 1. Server Component: Initial Data Fetch

Purpose: Fetch and validate data at the page level.

```tsx
// app/lessons/[studentId]/page.tsx
import { supabase } from '@/lib/supabase';
import { LessonSchema } from '@/schemas/LessonSchema';
import { StudentLessonClient } from './StudentLesson.client';

export default async function StudentLessonPage({
	params,
}: {
	params: { studentId: string };
}) {
	try {
		// Fetch base data
		const { data, error } = await supabase
			.from('lessons')
			.select('*')
			.eq('student_id', params.studentId)
			.order('created_at', { ascending: false });

		if (error) throw error;

		// Validate at boundary
		const lessons = data.map((item) => LessonSchema.parse(item));

		// Pass to client component
		return (
			<StudentLessonClient
				initialLessons={lessons}
				studentId={params.studentId}
			/>
		);
	} catch (err) {
		// Handle error at page level
		return <div>Error loading lessons: {err.message}</div>;
	}
}
```

### 2. Client Component: Refinement + Real-Time

Purpose: Add local filtering, sorting, real-time updates.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/schemas/LessonSchema';
import { useStudentLessonSubscription } from './useStudentLessonSubscription';
import { filterAndSortLessons } from './studentLesson.helpers';

interface StudentLessonClientProps {
	initialLessons: Lesson[];
	studentId: string;
}

export function StudentLessonClient({
	initialLessons,
	studentId,
}: StudentLessonClientProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

	// Real-time updates for critical data
	const liveUpdatedLessons = useStudentLessonSubscription(
		studentId,
		initialLessons
	);

	// Client-side refinement (instant feedback, no server trip)
	const displayLessons = filterAndSortLessons(liveUpdatedLessons, {
		searchTerm,
		sortBy,
	});

	return (
		<div>
			<input
				placeholder='Search lessons...'
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<select
				value={sortBy}
				onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
			>
				<option value='date'>By Date</option>
				<option value='title'>By Title</option>
			</select>
			<LessonList lessons={displayLessons} />
		</div>
	);
}
```

### 3. Hook: Real-Time Subscriptions

Purpose: Subscribe to Supabase real-time updates for critical data.

```tsx
// useStudentLessonSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lesson } from '@/schemas/LessonSchema';

export function useStudentLessonSubscription(
	studentId: string,
	initialLessons: Lesson[]
) {
	const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

	useEffect(() => {
		// Subscribe to real-time changes
		const channel = supabase
			.channel(`lessons:${studentId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'lessons',
					filter: `student_id=eq.${studentId}`,
				},
				(payload) => {
					setLessons((prev) => {
						if (payload.eventType === 'DELETE') {
							return prev.filter((l) => l.id !== payload.old.id);
						}
						if (payload.eventType === 'INSERT') {
							return [payload.new as Lesson, ...prev];
						}
						if (payload.eventType === 'UPDATE') {
							return prev.map((l) =>
								l.id === payload.new.id ? (payload.new as Lesson) : l
							);
						}
						return prev;
					});
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [studentId]);

	return lessons;
}
```

---

## Cache Invalidation Strategy

### Real-Time Data (Critical)

**Use**: Supabase Realtime subscriptions  
**When**: Lesson progress, student status, assignments  
**Example**:

```tsx
const liveUpdatedLessons = useStudentLessonSubscription(
	studentId,
	initialLessons
);
```

### Event-Based Data (Important)

**Use**: Manual invalidation after mutations  
**When**: Creating/updating songs, assigning tasks  
**Example**:

```tsx
async function createNewSong(songData: SongInput) {
	try {
		// Create
		const { data, error } = await supabase
			.from('songs')
			.insert(songData)
			.select();
		if (error) throw error;

		// Invalidate related queries
		await queryClient.invalidateQueries({
			queryKey: ['songs'],
			refetchType: 'all',
		});

		return data[0];
	} catch (err) {
		// Error handling
	}
}
```

### Static Data (Low Priority)

**Use**: Time-based cache (5-10 minutes)  
**When**: Teacher's song library, static list of instruments  
**Example**:

```tsx
// Refetch every 10 minutes
const TEN_MINUTES = 10 * 60 * 1000;
useEffect(() => {
	const interval = setInterval(() => refetch(), TEN_MINUTES);
	return () => clearInterval(interval);
}, []);
```

---

## Error Handling Pattern

### Structured Error Objects

All errors should follow this format:

```typescript
// types/errors.ts
export interface AppError {
	type:
		| 'AUTHORIZATION'
		| 'VALIDATION'
		| 'NOT_FOUND'
		| 'CONFLICT'
		| 'SERVER_ERROR'
		| 'NETWORK_ERROR';
	message: string;
	statusCode: number;
	details?: Record<string, unknown>;
	timestamp: string;
}
```

### Error Creation Utility

```typescript
// lib/errors.ts
export function createAppError(
	type: AppError['type'],
	message: string,
	statusCode: number,
	details?: Record<string, unknown>
): AppError {
	return {
		type,
		message,
		statusCode,
		details,
		timestamp: new Date().toISOString(),
	};
}

// Usage in Server Component
const { data, error } = await supabase
	.from('lessons')
	.select('*')
	.eq('id', lessonId);

if (error) {
	const appError = createAppError(
		error.code === 'PGRST116' ? 'NOT_FOUND' : 'SERVER_ERROR',
		error.message,
		error.code === 'PGRST116' ? 404 : 500,
		{ originalCode: error.code }
	);
	throw appError;
}
```

### Error Handling in Components

```tsx
// In error.tsx (Next.js error boundary)
'use client';

import { AppError } from '@/types/errors';

export default function Error({ error }: { error: AppError }) {
	if (error.type === 'NOT_FOUND') {
		return <div>Lesson not found. Please check the URL.</div>;
	}
	if (error.type === 'AUTHORIZATION') {
		return <div>You don't have permission to view this lesson.</div>;
	}
	return <div>Something went wrong. Please try again later.</div>;
}
```

### Error Logging with Sentry

```tsx
// In Server Component or API route
import * as Sentry from '@sentry/nextjs';

try {
	const { data, error } = await supabase.from('lessons').select('*');
	if (error) throw error;
} catch (err) {
	Sentry.captureException(err, {
		tags: {
			feature: 'lesson-management',
			action: 'fetch-lessons',
		},
		extra: {
			userId: session?.user.id,
			timestamp: new Date().toISOString(),
		},
	});
	throw err;
}
```

---

## Data Transformation Pipeline

All data should follow this flow:

```
Supabase (raw data)
    ↓
Schema Validation (Zod)
    ↓
Type Casting (TypeScript)
    ↓
Business Logic (helpers)
    ↓
Component Display
```

### Example: Full Pipeline

```tsx
// 1. Fetch from Supabase
const { data: rawLessons, error } = await supabase
	.from('lessons')
	.select('*, songs(*)'); // Include relations

if (error) throw createAppError('SERVER_ERROR', error.message, 500);

// 2. Validate with Zod
const lessons = rawLessons.map((item) => LessonWithSongsSchema.parse(item));

// 3. Business logic transformation
const processedLessons = lessons.map((lesson) => ({
	...lesson,
	songCount: lesson.songs.length,
	completionRate: calculateCompletionRate(lesson.songs),
	displayDate: formatLessonDate(lesson.created_at),
}));

// 4. Pass to component
return <LessonList lessons={processedLessons} />;
```

---

## Loading States

### Server Component Loading

Use Suspense + Skeleton:

```tsx
// app/lessons/[studentId]/page.tsx
import { Suspense } from 'react';
import { StudentLessonSkeleton } from './StudentLesson.skeleton';
import { StudentLessonContent } from './StudentLesson.content';

export default function StudentLessonPage() {
	return (
		<Suspense fallback={<StudentLessonSkeleton />}>
			<StudentLessonContent />
		</Suspense>
	);
}
```

### Client Component Loading

```tsx
'use client';

export function StudentLessonClient({ initialLessons }: Props) {
	const [lessons, setLessons] = useState(initialLessons);
	const [isLoading, setIsLoading] = useState(false);

	async function refetch() {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.from('lessons').select('*');
			if (error) throw error;
			setLessons(data.map((item) => LessonSchema.parse(item)));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{isLoading && <Skeleton />}
			{!isLoading && <LessonList lessons={lessons} />}
			<button onClick={refetch}>Refresh</button>
		</>
	);
}
```

---

## Mutation Pattern (Create/Update/Delete)

### Standard Mutation

```tsx
async function updateLessonProgress(
	lessonId: string,
	songId: string,
	newStatus: LessonSongStatus
): Promise<LessonSong> {
	try {
		// Validate input
		const validated = LessonSongStatusSchema.parse(newStatus);

		// Perform mutation
		const { data, error } = await supabase
			.from('lesson_songs')
			.update({ status: validated })
			.eq('lesson_id', lessonId)
			.eq('song_id', songId)
			.select()
			.single();

		if (error) {
			throw createAppError(
				error.code === 'PGRST116' ? 'NOT_FOUND' : 'SERVER_ERROR',
				error.message,
				404
			);
		}

		// Validate response
		const result = LessonSongSchema.parse(data);

		// Invalidate cache
		await queryClient.invalidateQueries({
			queryKey: ['lessons', lessonId],
		});

		// Log to Sentry
		Sentry.captureMessage(`Updated lesson song status to ${validated}`, 'info');

		return result;
	} catch (err) {
		Sentry.captureException(err);
		throw err;
	}
}
```

---

## Query Patterns

### Single Record

```tsx
const { data, error } = await supabase
	.from('lessons')
	.select('*')
	.eq('id', lessonId)
	.single(); // Expect exactly one row
```

### Multiple Records with Relations

```tsx
const { data, error } = await supabase
	.from('lessons')
	.select('*, songs(id, title, artist), teacher:teacher_id(name)')
	.eq('student_id', studentId);
```

### With Filtering

```tsx
const { data, error } = await supabase
	.from('lessons')
	.select('*')
	.eq('student_id', studentId)
	.gte('created_at', oneMonthAgo)
	.order('created_at', { ascending: false })
	.limit(10);
```

### Count Records

```tsx
const { count, error } = await supabase
	.from('lessons')
	.select('*', { count: 'exact', head: true })
	.eq('student_id', studentId);
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Fetching in Multiple Places

Same data fetched in component + hook + service.

**Fix**: Centralize in one hook, reuse.

```tsx
// Before: Scattered fetches
function StudentLessonPage() {
	const [lessons1, setLessons1] = useState();
	useEffect(() => {
		supabase.from('lessons').select('*'); // Fetch 1
	}, []);
}

function StudentLessonClient() {
	useEffect(() => {
		supabase.from('lessons').select('*'); // Fetch 2 (duplicate!)
	}, []);
}

// After: Centralized
function useStudentLessons(studentId: string) {
	const [lessons, setLessons] = useState();
	useEffect(() => {
		supabase.from('lessons').select('*').eq('student_id', studentId);
	}, [studentId]);
	return lessons;
}
```

### ❌ Mistake 2: No Error Handling

Ignoring error responses from Supabase.

**Fix**: Always check for errors.

```tsx
// Before: No error handling
const { data } = await supabase.from('lessons').select('*');
setLessons(data); // Could be null!

// After: Proper error handling
const { data, error } = await supabase.from('lessons').select('*');
if (error) {
	const appError = createAppError('SERVER_ERROR', error.message, 500);
	throw appError;
}
setLessons(data);
```

### ❌ Mistake 3: Polling Everything

Using interval-based refetch for all data.

**Fix**: Use Realtime for critical, polling for static.

```tsx
// Before: Constant polling (battery drain)
setInterval(() => {
	supabase.from('lessons').select('*');
}, 5000);

// After: Smart caching
// Real-time for lesson progress
const lessons = useStudentLessonSubscription(studentId);

// Static cache for song library
const songs = useSongLibrary(); // 10 min cache
```

### ❌ Mistake 4: Not Validating at Boundaries

Trusting Supabase types without validation.

**Fix**: Always parse with Zod.

```tsx
// Before: No validation
const lesson = await supabase.from('lessons').select('*').single();
return lesson; // Could be missing fields!

// After: Validated
const { data, error } = await supabase.from('lessons').select('*').single();
if (error) throw error;
const validated = LessonSchema.parse(data);
return validated;
```

---

## Performance Considerations

### Select Only Needed Columns

```tsx
// Before: Fetch all columns
const { data } = await supabase.from('lessons').select('*');

// After: Select only what you need
const { data } = await supabase.from('lessons').select('id, title, created_at');
```

### Limit Results

```tsx
// Before: No limit (could be thousands)
const { data } = await supabase.from('songs').select('*');

// After: Paginated
const { data } = await supabase
	.from('songs')
	.select('*')
	.range(0, 24) // First 25 items
	.order('created_at', { ascending: false });
```

### Use RLS (Row-Level Security)

Supabase automatically filters by user. Trust it:

```tsx
// No need to add user_id filter - RLS handles it
const { data } = await supabase.from('lessons').select('*'); // Only your lessons returned
```

---

## Testing Data Fetching

### Mock Supabase in Tests

```tsx
import { supabase } from '@/lib/supabase';
jest.mock('@/lib/supabase');

describe('useStudentLessons', () => {
	it('fetches and validates lessons', async () => {
		const mockLessons = [
			{ id: '1', title: 'Lesson 1', student_id: 'student-1' },
		];

		(supabase.from as jest.Mock).mockReturnValue({
			select: jest.fn().mockReturnValue({
				eq: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
			}),
		});

		const { result } = renderHook(() => useStudentLessons('student-1'));
		await waitFor(() => {
			expect(result.current.lessons).toEqual(mockLessons);
		});
	});
});
```

---

## Checklist Before Committing

- [ ] Data validated with Zod at boundaries
- [ ] Errors handled and logged to Sentry
- [ ] Real-time for critical data, events for mutations
- [ ] Loading states show skeletons (not spinners)
- [ ] No console.log in production code
- [ ] Tests mock Supabase correctly
- [ ] Only needed columns selected from DB
- [ ] Results limited/paginated
- [ ] Mobile performance considered (minimal payloads)

---

## Resources

- Supabase docs: https://supabase.com/docs/reference/javascript
- Zod validation: https://zod.dev
- Error handling guide: `.github/error-handling-logging.instructions.md`
- Testing guide: `.github/testing-standards.instructions.md`
