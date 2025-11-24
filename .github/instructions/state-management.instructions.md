# State Management & Data Flow Standards

**Status**: Established via discovery Q&A (Q3, Q4, Q20)  
**Last Updated**: October 26, 2025  
**Enforced By**: Code review, architecture discussions

---

## Purpose

Establish clear patterns for managing state across the application. Ensures predictable data flow, prevents prop drilling, and makes state responsibilities explicit.

---

## Core Principles

1. **Server State First**: Fetch in Server Components, avoid storing in React state when possible
2. **Client State Local**: Keep component state close to where it's used
3. **Real-Time When Critical**: Use Supabase subscriptions for lesson updates
4. **Event-Based Invalidation**: Refetch after mutations, don't poll
5. **No Redux/Complex Libraries**: Use React Context + hooks + Server Components

---

## State Management Hierarchy

```
┌─────────────────────────────────────┐
│  Server State (Supabase)            │
│  - Source of truth                  │
│  - Fetched in Server Components     │
│  - Real-time subscriptions for      │
│    critical data (lessons)          │
└─────────────────────────────────────┘
         ↓ Pass as props
┌─────────────────────────────────────┐
│  Page-Level React State             │
│  - Search/filter params             │
│  - UI preferences (sort, view mode) │
│  - Temporary form state             │
└─────────────────────────────────────┘
         ↓ Pass via Context or props
┌─────────────────────────────────────┐
│  Component-Level State              │
│  - Hover states                     │
│  - Modal open/close                 │
│  - Expanded/collapsed sections      │
└─────────────────────────────────────┘
```

---

## Pattern 1: Server State (Source of Truth)

### Server Component: Fetch Data

```tsx
// app/lessons/page.tsx (Server Component)
import { supabase } from '@/lib/supabase';
import { LessonSchema } from '@/schemas/LessonSchema';
import { StudentLessonsClient } from './StudentLessons.client';

export default async function StudentLessonsPage() {
	try {
		// Fetch base data on server
		const { data, error } = await supabase
			.from('lessons')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;

		// Validate
		const lessons = data.map((item) => LessonSchema.parse(item));

		// Pass to client
		return <StudentLessonsClient initialLessons={lessons} />;
	} catch (err) {
		return <div>Error loading lessons</div>;
	}
}
```

### Client Component: Add Interactivity

```tsx
// app/lessons/StudentLessons.client.tsx
'use client';

import { useState, useMemo } from 'react';
import { Lesson } from '@/schemas/LessonSchema';
import { useStudentLessonsSubscription } from './useStudentLessonsSubscription';

interface StudentLessonsClientProps {
	initialLessons: Lesson[];
}

export function StudentLessonsClient({
	initialLessons,
}: StudentLessonsClientProps) {
	// Local UI state (NOT server state)
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

	// Real-time updates for critical data
	const liveUpdatedLessons = useStudentLessonsSubscription(initialLessons);

	// Derived state (computed from server state + filters)
	const displayLessons = useMemo(() => {
		let filtered = liveUpdatedLessons;

		// Apply search
		if (searchTerm) {
			filtered = filtered.filter((l) =>
				l.title.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply sort
		if (sortBy === 'title') {
			filtered.sort((a, b) => a.title.localeCompare(b.title));
		} else {
			filtered.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		}

		return filtered;
	}, [liveUpdatedLessons, searchTerm, sortBy]);

	return (
		<div className='space-y-4'>
			{/* Controls (UI state) */}
			<div className='flex gap-4'>
				<input
					type='search'
					placeholder='Search lessons...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='flex-1 px-3 py-2 border rounded-lg'
				/>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
					className='px-3 py-2 border rounded-lg'
				>
					<option value='date'>By Date</option>
					<option value='title'>By Title</option>
				</select>
				<button
					onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
					className='px-3 py-2 bg-blue-500 text-white rounded-lg'
				>
					{viewMode === 'list' ? '☰' : '⊟'}
				</button>
			</div>

			{/* Display (computed from server state + UI state) */}
			<LessonList lessons={displayLessons} viewMode={viewMode} />
		</div>
	);
}
```

**Key Point**: `displayLessons` is **computed**, not stored. It derives from `liveUpdatedLessons` + filters. This prevents state drift.

---

## Pattern 2: Real-Time Subscriptions (Critical Data)

Use for data that changes frequently during active user sessions:

```tsx
// hooks/useStudentLessonsSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lesson, LessonSchema } from '@/schemas/LessonSchema';

/**
 * Subscribe to real-time lesson updates
 * Returns live-updated lessons while component mounted
 */
export function useStudentLessonsSubscription(initialLessons: Lesson[]) {
	const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

	useEffect(() => {
		// Subscribe to all changes
		const channel = supabase
			.channel('lessons-updates')
			.on(
				'postgres_changes',
				{
					event: '*', // INSERT, UPDATE, DELETE
					schema: 'public',
					table: 'lessons',
				},
				(payload) => {
					if (payload.eventType === 'INSERT') {
						const newLesson = LessonSchema.parse(payload.new);
						setLessons((prev) => [newLesson, ...prev]);
					}

					if (payload.eventType === 'UPDATE') {
						const updatedLesson = LessonSchema.parse(payload.new);
						setLessons((prev) =>
							prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
						);
					}

					if (payload.eventType === 'DELETE') {
						setLessons((prev) => prev.filter((l) => l.id !== payload.old.id));
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	return lessons;
}
```

**When to use**:

- ✅ Lesson progress (teacher needs to see updates during lesson)
- ✅ Student status changes
- ✅ Real-time collaborations

**NOT for**:

- ❌ Song library (static, low change frequency)
- ❌ Instrument list (reference data)

---

## Pattern 3: Context for Page-Level State

Use when multiple nested components need same state:

```tsx
// contexts/StudentLessonContext.ts
import { createContext, useContext, ReactNode } from 'react';
import { Lesson } from '@/schemas/LessonSchema';

interface StudentLessonContextType {
	selectedLessonId: string | null;
	setSelectedLessonId: (id: string | null) => void;
}

const StudentLessonContext = createContext<
	StudentLessonContextType | undefined
>(undefined);

export function StudentLessonProvider({ children }: { children: ReactNode }) {
	const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

	return (
		<StudentLessonContext.Provider
			value={{ selectedLessonId, setSelectedLessonId }}
		>
			{children}
		</StudentLessonContext.Provider>
	);
}

export function useStudentLessonContext() {
	const context = useContext(StudentLessonContext);
	if (!context) {
		throw new Error(
			'useStudentLessonContext must be used within StudentLessonProvider'
		);
	}
	return context;
}
```

**Usage**:

```tsx
// app/lessons/page.tsx
export default function StudentLessonsPage() {
	return (
		<StudentLessonProvider>
			<StudentLessonsClient />
		</StudentLessonProvider>
	);
}

// components/lessons/StudentLesson.tsx
export function StudentLesson() {
	const { selectedLessonId, setSelectedLessonId } = useStudentLessonContext();
	// No prop drilling needed
}
```

**When to use**:

- ✅ Selected item across multiple components
- ✅ Modal/dialog state
- ✅ Filter preferences for a feature

**NOT for**:

- ❌ Data that changes frequently (use subscriptions)
- ❌ Global state (use Server Components + props)

---

## Pattern 4: Event-Based Invalidation

When user creates/updates data, refetch related queries:

```tsx
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		},
	},
});
```

```tsx
// actions/createLesson.ts (Server Action)
import { supabase } from '@/lib/supabase';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { queryClient } from '@/lib/queryClient';

export async function createLesson(input: LessonInput) {
	try {
		// Validate
		const validated = LessonInputSchema.parse(input);

		// Create
		const { data, error } = await supabase
			.from('lessons')
			.insert(validated)
			.select()
			.single();

		if (error) throw error;

		// INVALIDATE: Refetch related queries
		queryClient.invalidateQueries({
			queryKey: ['lessons'],
			refetchType: 'all',
		});

		// Also invalidate if you have student-specific lessons
		queryClient.invalidateQueries({
			queryKey: ['lessons', validated.studentId],
		});

		return data;
	} catch (err) {
		throw err;
	}
}
```

**Benefits**:

- ✅ Data always fresh after mutations
- ✅ No manual state updates
- ✅ Single source of truth

---

## Pattern 5: Optimistic Updates (Advanced)

Show changes immediately before server confirms:

```tsx
'use client';

import { useState } from 'react';
import { Lesson, LessonSchema } from '@/schemas/LessonSchema';
import * as Sentry from '@sentry/nextjs';

export function LessonSongStatus({ lessonId, songId, initialStatus }: Props) {
	const [status, setStatus] = useState(initialStatus);
	const [isPending, setIsPending] = useState(false);

	async function updateStatus(newStatus: string) {
		const previousStatus = status;

		// Optimistic update (show immediately)
		setStatus(newStatus);
		setIsPending(true);

		try {
			// Update on server
			const response = await fetch(`/api/lessons/${lessonId}/songs/${songId}`, {
				method: 'PATCH',
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				// Revert on error
				setStatus(previousStatus);
				throw new Error('Failed to update');
			}

			// Success - keep optimistic state
		} catch (err) {
			setStatus(previousStatus);
			Sentry.captureException(err);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<button onClick={() => updateStatus('mastered')} disabled={isPending}>
			Mark as Mastered
		</button>
	);
}
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Storing Server Data in State

```tsx
// Before: Duplicating server state
function LessonList() {
	const [lessons, setLessons] = useState([]);
	useEffect(() => {
		supabase
			.from('lessons')
			.select('*')
			.then((data) => setLessons(data));
	}, []);
}

// After: Use Server Component for fetch
export default async function LessonList() {
	const lessons = await supabase.from('lessons').select('*');
	return <LessonListClient initialLessons={lessons} />;
}
```

### ❌ Mistake 2: Prop Drilling Through Many Layers

```tsx
// Before: Props go down 4+ levels
<Lessons lessons={lessons}>
  <LessonList lessons={lessons}>
    <LessonItem lesson={lesson}>
      <LessonDetail lesson={lesson} />
    </LessonItem>
  </LessonList>
</Lessons>

// After: Use Context
<LessonProvider lessons={lessons}>
  <LessonList />
</LessonProvider>
```

### ❌ Mistake 3: Polling Everything

```tsx
// Before: Constant refetching
useEffect(() => {
	const interval = setInterval(() => refetch(), 5000);
	return () => clearInterval(interval);
}, []);

// After: Real-time for critical data
const lessons = useStudentLessonsSubscription(initialLessons);
```

### ❌ Mistake 4: Not Invalidating After Mutations

```tsx
// Before: Data gets stale
async function createLesson(data) {
	await fetch('/api/lessons', { method: 'POST', body: JSON.stringify(data) });
	// User sees old list!
}

// After: Invalidate cache
async function createLesson(data) {
	await fetch('/api/lessons', { method: 'POST', body: JSON.stringify(data) });
	queryClient.invalidateQueries({ queryKey: ['lessons'] });
}
```

---

## Decision Tree

When you need state, ask:

```
Does data come from database?
├─ YES: Can it be fetched in a Server Component?
│  ├─ YES: Fetch in Server Component, pass as props
│  └─ NO: Fetch in useEffect, but still validate + invalidate
├─ NO: Does multiple components need it?
│  ├─ YES: Is it page-level or feature-level?
│  │  ├─ PAGE: Use Context
│  │  └─ FEATURE: Use custom hook
│  └─ NO: Use component local state
```

---

## State Management Checklist

- [ ] Server data fetched in Server Components when possible
- [ ] Real-time subscriptions only for critical data
- [ ] Context used for page-level state, not global
- [ ] No props drilled more than 2-3 levels
- [ ] Mutations trigger `queryClient.invalidateQueries`
- [ ] Optimistic updates have rollback on error
- [ ] No `useState` for server data
- [ ] All state changes tested
- [ ] No circular dependencies in Context

---

## Resources

- API & Data Fetching: `.github/api-data-fetching.instructions.md`
- Component Architecture: `.github/component-architecture.instructions.md`
- React docs on Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
