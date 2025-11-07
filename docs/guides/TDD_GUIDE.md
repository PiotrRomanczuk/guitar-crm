# Test-Driven Development (TDD) Guide

This project follows Test-Driven Development practices to ensure code quality, maintainability, and reliability.

## TDD Principles

### The Red-Green-Refactor Cycle

1. **🔴 RED**: Write a failing test first
2. **🟢 GREEN**: Write the minimal code to make the test pass
3. **🔵 REFACTOR**: Improve the code while keeping tests green

## Project Testing Setup

### Testing Framework

- **Jest**: JavaScript testing framework
- **TypeScript**: Full TypeScript support for tests
- **Zod**: Schema validation testing

### Test File Structure

```
__tests__/
├── components/
│   └── [ComponentName].test.tsx
├── schemas/
│   └── [SchemaName].test.ts
├── utils/
│   └── [UtilName].test.ts
├── hooks/
│   └── [HookName].test.ts
└── pages/
    └── [PageName].test.tsx
```

## TDD Workflow for New Features

### 1. Start a New Feature Branch

```bash
./scripts/new-feature.sh your-feature-name
```

### 2. Create Test File First

```bash
# For a component
touch __tests__/components/YourComponent.test.tsx

# For a utility function
touch __tests__/utils/yourUtil.test.ts

# For a schema
touch __tests__/schemas/YourSchema.test.ts
```

### 3. Write Failing Tests

```typescript
// Example: __tests__/utils/userValidation.test.ts
import { validateUser } from '../utils/userValidation';

describe('validateUser', () => {
	it('should return true for valid user data', () => {
		const validUser = {
			email: 'test@example.com',
			name: 'John Doe',
			role: 'student',
		};

		expect(validateUser(validUser)).toBe(true);
	});

	it('should return false for invalid email', () => {
		const invalidUser = {
			email: 'invalid-email',
			name: 'John Doe',
			role: 'student',
		};

		expect(validateUser(invalidUser)).toBe(false);
	});
});
```

### 4. Run Tests (Should Fail)

```bash
npm test
# or watch mode
npm test -- --watch
```

### 5. Write Minimal Implementation

```typescript
// utils/userValidation.ts
export function validateUser(user: any): boolean {
	// Minimal implementation to pass the test
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(user.email) && user.name && user.role;
}
```

### 6. Run Tests (Should Pass)

```bash
npm test
```

### 7. Refactor if Needed

Improve the code while keeping tests green.

## Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- UserSchema.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should validate email"
```

## Best Practices

### Test Naming Convention

- Use descriptive test names: `should return user when valid ID is provided`
- Group related tests with `describe` blocks
- Use `it` or `test` for individual test cases

### Test Structure (AAA Pattern)

```typescript
it('should calculate total price with tax', () => {
	// Arrange
	const price = 100;
	const taxRate = 0.1;

	// Act
	const result = calculateTotalWithTax(price, taxRate);

	// Assert
	expect(result).toBe(110);
});
```

### What to Test

- **Schema Validation**: Test Zod schemas with valid/invalid data
- **Component Behavior**: Test component rendering and user interactions
- **Utility Functions**: Test pure functions with various inputs
- **API Integration**: Test data fetching and error handling
- **Business Logic**: Test core application logic

### What NOT to Test

- Third-party library internals
- Simple getters/setters without logic
- Configuration files
- Exact styling (unless critical to functionality)

## Schema Testing Example

```typescript
// __tests__/schemas/UserSchema.test.ts
import { UserSchema } from '../../schemas/UserSchema';

describe('UserSchema', () => {
	it('should validate correct user data', () => {
		const validUser = {
			id: 1,
			email: 'test@example.com',
			name: 'John Doe',
			role: 'student',
			createdAt: new Date().toISOString(),
		};

		expect(() => UserSchema.parse(validUser)).not.toThrow();
	});

	it('should reject invalid email format', () => {
		const invalidUser = {
			id: 1,
			email: 'invalid-email',
			name: 'John Doe',
			role: 'student',
			createdAt: new Date().toISOString(),
		};

		expect(() => UserSchema.parse(invalidUser)).toThrow();
	});
});
```

## Component Testing Example

```typescript
// __tests__/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import UserCard from '../../components/UserCard';

describe('UserCard', () => {
	const mockUser = {
		id: 1,
		name: 'John Doe',
		email: 'john@example.com',
		role: 'student',
	};

	it('should render user information', () => {
		render(<UserCard user={mockUser} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
		expect(screen.getByText('student')).toBeInTheDocument();
	});
});
```

## Commit Message Convention

When following TDD, use these commit prefixes:

- `test: add tests for user validation`
- `feat: implement user validation (TDD)`
- `refactor: improve user validation logic`
- `fix: correct email validation regex`

## TDD Benefits in This Project

1. **Schema Validation**: Ensures Zod schemas work correctly
2. **Component Reliability**: UI components behave as expected
3. **Database Integration**: Supabase queries work correctly
4. **Business Logic**: Guitar lesson management logic is correct
5. **Regression Prevention**: Changes don't break existing features

## Getting Help

- Check existing tests in `__tests__/` for examples
- Run `npm test -- --help` for Jest options
- Refer to [Jest Documentation](https://jestjs.io/docs/getting-started)
- Check [Testing Library Documentation](https://testing-library.com/docs/) for React component testing

Remember: **Write tests first, then make them pass!** 🧪✅
