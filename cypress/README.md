# Cypress E2E Testing

## Available Test Suites

- **admin-journey.cy.ts** - Admin user workflow testing
- **teacher-journey.cy.ts** - Teacher user workflow testing
- **student-journey.cy.ts** - Student user workflow testing
- **user-journeys.cy.ts** - All user role workflows combined
- **auth.cy.ts** - Authentication flows (sign in, sign up, forgot password)
- **smoke.cy.ts** - Basic smoke tests for critical paths

## Running Tests

### Interactive Test Selection (Recommended)

Run the interactive menu to choose which test to run:

```bash
npm run e2e:select
```

This will:

- Show you all available tests
- Let you choose which test to run
- Automatically check if services are running
- Offer to start services if needed
- Option to run all tests or open Cypress UI

### Quick Commands

Run all E2E tests (with auto-start of services):

```bash
npm run e2e:db
```

Run all E2E tests (requires services running):

```bash
npm run e2e
```

Open Cypress UI (interactive mode):

```bash
npm run e2e:open
```

Run specific test file:

```bash
npx cypress run --spec "cypress/e2e/admin-journey.cy.ts"
```

### Prerequisites

Before running E2E tests, ensure:

1. **Supabase is running**:

   ```bash
   npm run setup:db
   ```

2. **Test user is seeded**:

   ```bash
   npm run seed:test-user
   ```

3. **Development server** (the interactive script can start this for you):
   ```bash
   npm run dev
   ```

## Test Structure

Each test suite follows this pattern:

```typescript
describe('Feature Name', () => {
	beforeEach(() => {
		// Setup: Navigate to page, authenticate, etc.
	});

	it('should do something specific', () => {
		// Arrange: Set up test conditions
		// Act: Perform actions
		// Assert: Verify results
	});
});
```

## Writing New Tests

### Best Practices

1. **Use data-testid attributes** for reliable selectors:

   ```tsx
   <button data-testid='submit-button'>Submit</button>
   ```

   ```typescript
   cy.get('[data-testid="submit-button"]').click();
   ```

2. **Keep tests isolated** - Each test should be independent

3. **Use descriptive names** - Test names should clearly describe what they test

4. **Clean up after tests** - Reset state when needed

5. **Wait for elements properly**:
   ```typescript
   cy.get('[data-testid="element"]').should('be.visible');
   ```

### Adding a New Test

1. Create test file in `cypress/e2e/`:

   ```bash
   touch cypress/e2e/my-feature.cy.ts
   ```

2. Add test structure:

   ```typescript
   describe('My Feature', () => {
   	beforeEach(() => {
   		cy.visit('/my-feature');
   	});

   	it('should perform expected behavior', () => {
   		// Test implementation
   	});
   });
   ```

3. Run via interactive script:
   ```bash
   npm run e2e:select
   ```

## Debugging Tests

### Open Cypress UI

Best for debugging individual tests:

```bash
npm run e2e:select
# Choose option 00 for Cypress UI
```

### View Screenshots

Failed tests automatically save screenshots to:

```
cypress/screenshots/
```

### View Videos

Test runs record videos to:

```
cypress/videos/
```

### Enable Debug Mode

Add `cy.debug()` in your test:

```typescript
cy.get('[data-testid="element"]').debug().click();
```

## Continuous Integration

E2E tests are intentionally **excluded** from the quality check script (`npm run quality`) because they take too long for pre-commit checks.

Run E2E tests separately before creating PRs:

```bash
npm run e2e:select
# Choose option 0 to run all tests
```

## Configuration

Cypress configuration is in `cypress.config.ts`:

- Base URL: `http://localhost:3000`
- Video recording: Enabled
- Screenshot on failure: Enabled
- Viewport: 1280x720

## Troubleshooting

### Tests Failing to Connect

- Ensure development server is running on `http://localhost:3000`
- Check Supabase is running on `http://127.0.0.1:54321`

### Authentication Issues

- Re-seed test user: `npm run seed:test-user`
- Check `.env.local` has correct Supabase credentials

### Timeout Errors

- Increase timeout in test: `cy.get('element', { timeout: 10000 })`
- Check network tab in Cypress UI for slow requests

### Flaky Tests

- Add proper waits: `.should('be.visible')` before interactions
- Use `cy.intercept()` to wait for API calls
- Avoid using `cy.wait(1000)` - use proper assertions instead
