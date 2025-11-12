# Testing Standards

**Status**: Established via discovery Q&A (Q8, Q24)  
**Last Updated**: October 26, 2025  
**Enforced By**: Jest config, code review, coverage threshold (70%)

---

## Purpose

Establish testing patterns that ensure code quality while supporting rapid development. Uses test-driven development (TDD) workflow with a 70/20/10 testing pyramid distribution.

---

## Core Principles

1. **TDD First**: Write tests before implementation
2. **Pyramid Distribution**: 70% unit, 20% integration, 10% E2E
3. **Fast Feedback**: Unit tests run in <1 second
4. **Real Flows**: Integration tests cover actual user workflows
5. **Critical Only**: E2E tests for essential user journeys

---

## Testing Pyramid (70/20/10)

```
        E2E (10%)
      Integration (20%)
    Unit Tests (70%)
```

### 70% Unit Tests

- Schemas and validation (Zod)
- Components with mocked props
- Utility functions
- Hooks (isolated)

### 20% Integration Tests

- Component + data fetching (React Testing Library)
- Form submission + validation
- Supabase mocks
- Multi-component workflows

### 10% E2E Tests (Cypress)

- Critical user journeys
- Sign-up → Create lesson → Save progress
- Real browser, real backend (staging only)

---

## Unit Tests: Schemas (Zod)

```typescript
// __tests__/schemas/SongSchema.test.ts
import { SongInputSchema, SongUpdateSchema } from '@/schemas/SongSchema';

describe('SongInputSchema', () => {
	it('should validate a valid song input', () => {
		const validSong = {
			title: 'Wonderwall',
			author: 'Oasis',
			level: 'intermediate',
			key: 'Em',
			ultimate_guitar_link: 'https://www.ultimate-guitar.com/tab/...',
		};

		expect(() => SongInputSchema.parse(validSong)).not.toThrow();
	});

	it('should reject song input with missing title', () => {
		const invalidSong = {
			author: 'Oasis',
			level: 'intermediate',
			key: 'Em',
			ultimate_guitar_link: 'https://...',
		};

		expect(() => SongInputSchema.parse(invalidSong)).toThrow(
			/title is required/i
		);
	});

	it('should reject title longer than 200 characters', () => {
		const invalidSong = {
			title: 'a'.repeat(201),
			author: 'Oasis',
			level: 'intermediate',
			key: 'Em',
			ultimate_guitar_link: 'https://...',
		};

		expect(() => SongInputSchema.parse(invalidSong)).toThrow(
			/must be under 200 characters/i
		);
	});

	it('should validate optional chords field', () => {
		const songWithChords = {
			title: 'Song',
			author: 'Artist',
			level: 'beginner',
			key: 'C',
			ultimate_guitar_link: 'https://...',
			chords: 'Em7 - Am7 - D',
		};

		const result = SongInputSchema.parse(songWithChords);
		expect(result.chords).toBe('Em7 - Am7 - D');
	});

	it('should reject invalid difficulty level', () => {
		expect(() =>
			SongInputSchema.parse({
				title: 'Song',
				author: 'Artist',
				level: 'invalid_level',
				key: 'C',
				ultimate_guitar_link: 'https://...',
			})
		).toThrow();
	});

	it('should reject invalid music key', () => {
		expect(() =>
			SongInputSchema.parse({
				title: 'Song',
				author: 'Artist',
				level: 'beginner',
				key: 'H', // Invalid key
				ultimate_guitar_link: 'https://...',
			})
		).toThrow();
	});

	it('should reject invalid ultimate guitar URL', () => {
		expect(() =>
			SongInputSchema.parse({
				title: 'Song',
				author: 'Artist',
				level: 'beginner',
				key: 'C',
				ultimate_guitar_link: 'not-a-url',
			})
		).toThrow(/valid URL/i);
	});
});

describe('SongUpdateSchema', () => {
	it('should require an id', () => {
		expect(() =>
			SongUpdateSchema.parse({
				title: 'Updated Title',
			})
		).toThrow(/id/i);
	});

	it('should allow partial updates', () => {
		const update = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			title: 'New Title',
		};

		const result = SongUpdateSchema.parse(update);
		expect(result.title).toBe('New Title');
		expect(result.author).toBeUndefined(); // Optional in update
	});
});
```

---

## Unit Tests: Components

```typescript
// __tests__/components/lessons/StudentLesson/StudentLesson.Song.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentLessonSong } from '@/components/lessons/StudentLesson';
import { LessonSong } from '@/schemas/LessonSchema';

describe('StudentLessonSong', () => {
	const mockSong: LessonSong = {
		id: '1',
		title: 'Wonderwall',
		artist: 'Oasis',
		status: 'to_learn',
	};

	it('should render song title and artist', () => {
		render(<StudentLessonSong song={mockSong} onSelect={jest.fn()} />);

		expect(screen.getByText('Wonderwall')).toBeInTheDocument();
		expect(screen.getByText('Oasis')).toBeInTheDocument();
	});

	it('should call onSelect with song id when clicked', async () => {
		const onSelect = jest.fn();
		render(<StudentLessonSong song={mockSong} onSelect={onSelect} />);

		await userEvent.click(screen.getByRole('button'));
		expect(onSelect).toHaveBeenCalledWith('1');
	});

	it('should display selected state styling', () => {
		render(
			<StudentLessonSong
				song={mockSong}
				onSelect={jest.fn()}
				isSelected={true}
			/>
		);

		const button = screen.getByRole('button');
		expect(button).toHaveClass('bg-blue-500');
	});

	it('should have accessible button', () => {
		render(<StudentLessonSong song={mockSong} onSelect={jest.fn()} />);

		const button = screen.getByRole('button');
		expect(button).toHaveAccessibleName(/wonderwall/i);
	});
});
```

---

## Unit Tests: Utilities

```typescript
// __tests__/utils/dateUtils.test.ts
import { formatLessonDate, isLessonOverdue } from '@/lib/dateUtils';

describe('formatLessonDate', () => {
	it('should format ISO date to readable format', () => {
		const result = formatLessonDate('2025-10-26');
		expect(result).toBe('Oct 26, 2025');
	});

	it('should handle various date formats', () => {
		const result = formatLessonDate('2025-12-31');
		expect(result).toBe('Dec 31, 2025');
	});
});

describe('isLessonOverdue', () => {
	it('should return true for past dates', () => {
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 1);
		expect(isLessonOverdue(pastDate.toISOString())).toBe(true);
	});

	it('should return false for future dates', () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		expect(isLessonOverdue(futureDate.toISOString())).toBe(false);
	});
});
```

---

## Integration Tests: Components + Data

```typescript
// __tests__/components/lessons/StudentLesson/StudentLesson.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentLessonClient } from '@/components/lessons/StudentLesson';
import { Lesson } from '@/schemas/LessonSchema';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
	supabase: {
		channel: jest.fn(() => ({
			on: jest.fn(() => ({
				subscribe: jest.fn(),
			})),
		})),
		removeChannel: jest.fn(),
	},
}));

describe('StudentLessonClient Integration', () => {
	const mockLessons: Lesson[] = [
		{
			id: '1',
			title: 'Lesson 1',
			songs: [
				{ id: 's1', title: 'Song 1', status: 'to_learn' },
				{ id: 's2', title: 'Song 2', status: 'mastered' },
			],
			created_at: '2025-10-26',
		},
		{
			id: '2',
			title: 'Lesson 2',
			songs: [],
			created_at: '2025-10-25',
		},
	];

	it('should display initial lessons', () => {
		render(<StudentLessonClient initialLessons={mockLessons} />);

		expect(screen.getByText('Lesson 1')).toBeInTheDocument();
		expect(screen.getByText('Lesson 2')).toBeInTheDocument();
	});

	it('should filter lessons by search term', async () => {
		render(<StudentLessonClient initialLessons={mockLessons} />);

		const searchInput = screen.getByPlaceholderText(/search/i);
		await userEvent.type(searchInput, 'Lesson 1');

		expect(screen.getByText('Lesson 1')).toBeInTheDocument();
		expect(screen.queryByText('Lesson 2')).not.toBeInTheDocument();
	});

	it('should sort by title', async () => {
		render(<StudentLessonClient initialLessons={mockLessons} />);

		const sortSelect = screen.getByDisplayValue(/by date/i);
		await userEvent.selectOption(sortSelect, 'By Title');

		const lessons = screen.getAllByRole('heading');
		expect(lessons[0]).toHaveTextContent('Lesson 1');
		expect(lessons[1]).toHaveTextContent('Lesson 2');
	});
});
```

---

## Integration Tests: Forms

```typescript
// __tests__/components/lessons/CreateLessonForm.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateLessonForm } from '@/components/lessons/CreateLessonForm';

describe('CreateLessonForm Integration', () => {
	it('should show title error on blur if empty', async () => {
		render(<CreateLessonForm />);

		const titleInput = screen.getByLabelText(/title/i);
		await userEvent.click(titleInput);
		titleInput.blur();

		await waitFor(() => {
			expect(screen.getByText(/title is required/i)).toBeInTheDocument();
		});
	});

	it('should clear error when user types', async () => {
		render(<CreateLessonForm />);

		const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
		await userEvent.click(titleInput);
		titleInput.blur();

		await waitFor(() => {
			expect(screen.getByText(/title is required/i)).toBeInTheDocument();
		});

		await userEvent.type(titleInput, 'My Lesson');

		await waitFor(() => {
			expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
		});
	});

	it('should submit valid form successfully', async () => {
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ id: '1' }),
			})
		);

		render(<CreateLessonForm />);

		await userEvent.type(screen.getByLabelText(/title/i), 'My Lesson');
		await userEvent.type(screen.getByLabelText(/date/i), '2025-10-26');

		await userEvent.click(screen.getByRole('button', { name: /create/i }));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				'/api/lessons',
				expect.objectContaining({
					method: 'POST',
				})
			);
		});
	});
});
```

---

## E2E Tests: Critical Flows (Cypress)

```typescript
// cypress/e2e/lessons.cy.ts
describe('Student Lesson Flow', () => {
	beforeEach(() => {
		cy.login();
		cy.visit('/lessons');
	});

	it('should create a new lesson and mark song as mastered', () => {
		// Create lesson
		cy.contains('button', 'New Lesson').click();
		cy.get('input[name="title"]').type('Guitar Basics');
		cy.get('input[name="date"]').type('2025-10-26');
		cy.contains('button', 'Create').click();

		cy.contains('Guitar Basics').should('be.visible');

		// Add song
		cy.contains('button', 'Add Song').click();
		cy.get('select[name="songId"]').select('Wonderwall');
		cy.contains('button', 'Add').click();

		// Mark as mastered
		cy.contains('Wonderwall')
			.parent()
			.contains('button', 'Mark as Mastered')
			.click();

		cy.contains('Mastered').should('be.visible');
	});
});
```

---

## Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- SongSchema.test.ts

# Watch mode (TDD)
npm run tdd

# Coverage report
npm test -- --coverage

# E2E tests
npm run cypress:open
```

---

## Coverage Targets

**Thresholds** (enforced):

- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

**Prioritize coverage for**:

1. Schemas (Zod) - 100%
2. Business logic - 80%+
3. Components - 70%+
4. Utils - 70%+
5. UI only - No coverage required

---

## Common Mistakes & Fixes

### ❌ Testing Implementation Details

```tsx
// Before: Testing internal state
it('should set state correctly', () => {
	const { result } = renderHook(() => useForm());
	act(() => {
		result.current.setError('email is required');
	});
	expect(result.current.errors.email).toBe('email is required');
});

// After: Testing user behavior
it('should show error when email is invalid', async () => {
	render(<Form />);
	await userEvent.type(screen.getByLabelText(/email/i), 'invalid');
	screen.getByLabelText(/email/i).blur();
	expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

### ❌ Too Many Mocks

```tsx
// Before: Mocking everything
jest.mock('@/lib/supabase');
jest.mock('@/lib/errors');
jest.mock('@/schemas/SongSchema');

// After: Only mock external deps, test real logic
jest.mock('@/lib/supabase'); // OK
// Don't mock internal code
```

---

## Checklist Before Committing

- [ ] All new code has tests
- [ ] Tests pass locally (`npm test`)
- [ ] Coverage >= 70% (`npm test -- --coverage`)
- [ ] No `console.log` in tests
- [ ] Async tests use `waitFor`
- [ ] Mocks only for external services
- [ ] User interactions via `userEvent`, not `fireEvent`
- [ ] Accessibility tested (`screen.getByRole`)
- [ ] No implementation details tested

---

## Resources

- Jest docs: https://jestjs.io
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Cypress: https://docs.cypress.io
- TDD Guide: `docs/TDD_GUIDE.md`
