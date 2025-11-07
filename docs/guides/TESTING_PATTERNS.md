# Testing Patterns Guide

## Overview

This guide documents best practices for testing components that fetch data from APIs, ensuring tests properly validate real-world behavior rather than just passing with mocked data.

## Problem: Tests Pass But Production Fails

### Common Issue

Tests that mock `global.fetch` with simple responses can pass while the production code fails because:

1. Mocks don't match the actual API contract
2. Role-based endpoints aren't properly tested
3. Authentication context isn't validated
4. Response structure doesn't match real API

### Example: SongList Component

**Before (Inadequate Test):**

```typescript
it('should display songs', async () => {
	const mockSongs = [{ id: '1', title: 'Song' }];

	// ❌ Generic mock - doesn't validate:
	// - Which endpoint is called
	// - Role-based routing
	// - userId parameter
	// - Response structure
	global.fetch = jest.fn().mockResolvedValue({
		ok: true,
		json: async () => mockSongs,
	});

	render(<SongList />);

	await waitFor(() => {
		expect(screen.getByText('Song')).toBeInTheDocument();
	});
});
```

**After (Comprehensive Test):**

```typescript
it('should display songs for teacher users with correct endpoint', async () => {
	// ✅ Set up proper auth context
	mockUseAuth.mockReturnValue({
		user: { id: 'test-teacher-id' },
		isTeacher: true,
		isAdmin: false,
		isStudent: false,
		loading: false,
	});

	// ✅ Complete song data matching API contract
	const mockSongs: SongWithStatus[] = [
		{
			id: '1',
			title: 'Wonderwall',
			author: 'Oasis',
			level: 'beginner',
			key: 'C',
			created_at: new Date().toISOString(),
			ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/...',
			chords: 'Em7 G Dsus4 A7sus4',
		},
	];

	global.fetch = jest.fn().mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => mockSongs,
	});

	render(<SongList />);

	await waitFor(() => {
		expect(screen.getByText('Wonderwall')).toBeInTheDocument();
	});

	// ✅ Verify correct role-based endpoint
	expect(global.fetch).toHaveBeenCalledWith(
		expect.stringContaining('/api/song/admin-songs?userId=test-teacher-id')
	);

	// ✅ Console log validation
	console.log('✅ Teacher view: All songs rendered successfully', {
		songsCount: mockSongs.length,
		songs: mockSongs.map((s) => ({
			title: s.title,
			author: s.author,
			level: s.level,
		})),
		endpoint: '/api/song/admin-songs',
		userId: 'test-teacher-id',
	});
});
```

## Best Practices

### 1. Mock Authentication Context Properly

```typescript
// Mock useAuth with flexible return values
const mockUseAuth = jest.fn();
jest.mock('@/components/auth/AuthProvider', () => ({
	AuthProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
	// Default mock: teacher role
	mockUseAuth.mockReturnValue({
		user: { id: 'test-teacher-id' },
		isTeacher: true,
		isAdmin: false,
		isStudent: false,
		loading: false,
	});
});
```

### 2. Test All Role Scenarios

```typescript
describe('Role-Based Endpoint Selection', () => {
	it('should use admin-songs endpoint for teachers', async () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'teacher-id' },
			isTeacher: true,
			isAdmin: false,
			isStudent: false,
			loading: false,
		});

		// ... render and assertions

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/song/admin-songs?userId=teacher-id')
		);
	});

	it('should use admin-songs endpoint for admins', async () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'admin-id' },
			isTeacher: false,
			isAdmin: true,
			isStudent: false,
			loading: false,
		});

		// ... render and assertions

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/song/admin-songs?userId=admin-id')
		);
	});

	it('should use student-songs endpoint for students', async () => {
		mockUseAuth.mockReturnValue({
			user: { id: 'student-id' },
			isTeacher: false,
			isAdmin: false,
			isStudent: true,
			loading: false,
		});

		// ... render and assertions

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/song/student-songs?userId=student-id')
		);
	});
});
```

### 3. Use Complete Type Definitions

```typescript
import type { SongWithStatus } from '@/components/songs/useSongList';

// ✅ Use actual types from your code
const mockSongs: SongWithStatus[] = [
	{
		id: '1',
		title: 'Wonderwall',
		author: 'Oasis',
		level: 'beginner',
		key: 'C',
		status: 'started', // For student view
		created_at: new Date().toISOString(),
		ultimate_guitar_link: 'https://...',
		chords: 'Em7 G Dsus4 A7sus4',
	},
];
```

### 4. Verify Endpoint Calls

```typescript
// Verify the exact endpoint and parameters
expect(global.fetch).toHaveBeenCalledWith(
	expect.stringContaining('/api/song/admin-songs?userId=test-teacher-id')
);

// Verify it was called exactly once
expect(global.fetch).toHaveBeenCalledTimes(1);
```

### 5. Console Log Validation

```typescript
// Log all expected objects to verify test assertions
console.log('✅ Teacher view: All songs rendered successfully', {
	songsCount: mockSongs.length,
	songs: mockSongs.map((s) => ({
		title: s.title,
		author: s.author,
		level: s.level,
	})),
	endpoint: '/api/song/admin-songs',
	userId: 'test-teacher-id',
});
```

### 6. Test Error Scenarios

```typescript
it('should display error when user is not authenticated', async () => {
	mockUseAuth.mockReturnValue({
		user: null,
		isTeacher: false,
		isAdmin: false,
		isStudent: false,
		loading: false,
	});

	render(<SongList />);

	await waitFor(() => {
		expect(screen.getByText(/not authenticated/i)).toBeInTheDocument();
	});

	console.log('✅ Auth error: Not authenticated message displayed');
});

it('should display error message on fetch failure', async () => {
	const errorMessage = 'Failed to fetch songs';
	global.fetch = jest.fn().mockResolvedValueOnce({
		ok: false,
		status: 500,
		json: async () => ({ error: errorMessage }),
	});

	render(<SongList />);

	await waitFor(() => {
		expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
	});

	console.log('✅ Error state: Error message displayed correctly', {
		endpoint: '/api/song/admin-songs',
		errorMessage,
	});
});
```

## Checklist for New API-Based Component Tests

- [ ] Mock `useAuth` with flexible `mockUseAuth.mockReturnValue()`
- [ ] Test all role scenarios (admin, teacher, student)
- [ ] Use complete type definitions matching API contract
- [ ] Verify correct role-based endpoints are called
- [ ] Verify userId is passed correctly
- [ ] Test loading state
- [ ] Test error states (network error, auth error, API error)
- [ ] Test empty state
- [ ] Test successful data display
- [ ] Add console.log validation for all scenarios
- [ ] Match response structure to actual API routes
- [ ] Test any filter/sort parameters

## Anti-Patterns to Avoid

❌ **Generic fetch mocks that don't validate endpoints:**

```typescript
global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
```

❌ **Incomplete data structures:**

```typescript
const mockSongs = [{ id: '1', title: 'Song' }]; // Missing required fields
```

❌ **Not testing role-based behavior:**

```typescript
// Only testing one role scenario
```

❌ **Not verifying which endpoint was called:**

```typescript
// No expect(global.fetch).toHaveBeenCalledWith(...)
```

❌ **Not testing auth failures:**

```typescript
// Only testing happy path
```

## Application to Other Components

Apply this same pattern to:

- ✅ **SongList** - Completed with role-based endpoint tests
- **LessonList** - TODO: Add role-based endpoint validation
- **StudentList** - TODO: Add role-based endpoint validation
- **TaskList** - TODO: Add role-based endpoint validation
- **AssignmentList** - TODO: Add role-based endpoint validation
- Any component that fetches from role-based API endpoints

## Real API Contract Reference

When creating tests, always refer to the actual API routes:

- `/app/api/song/admin-songs/route.ts` - Teachers/admins see all songs
- `/app/api/song/student-songs/route.ts` - Students see assigned songs with status
- Similar patterns for other entities

## Summary

**Key Principle:** Tests should validate the same contract and behavior that production code uses, not just pass with minimal mocking.

**Result:** Tests catch real issues like:

- Wrong endpoint selection
- Missing authentication
- Incorrect response structures
- Role-based access control failures

**Before:** 4 simple tests that all passed but didn't catch production issues
**After:** 8 comprehensive tests that validate real API contract and catch production issues
