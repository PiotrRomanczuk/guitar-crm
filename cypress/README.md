# Cypress E2E Testing

## Available Test Suites

### Admin Tests (Fully Implemented)

- **admin-sign-in.cy.ts** - Admin authentication & access control (2 tests)
- **admin-dashboard.cy.ts** - Dashboard features & navigation (4 tests)
- **admin-songs.cy.ts** - Complete songs CRUD operations (6 tests)

**Status**: ✅ All 12 tests passing | Runtime: ~45 seconds

### Other Test Suites (To Be Implemented)

- Teacher management tests
- Student management tests
- User role workflows
- Authentication flows (sign up, forgot password)
- Smoke tests for critical paths

## Running Tests

### Quick Commands

Run all admin E2E tests:

```bash
npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"
```

Run specific test file:

```bash
npm run e2e -- --spec "cypress/e2e/admin/admin-songs.cy.ts"
```

Open Cypress UI (interactive mode):

```bash
npm run e2e:open
```

Run with headed browser (visual debugging):

```bash
npm run e2e -- --headed --spec "cypress/e2e/admin/**/*.cy.ts"
```

## Prerequisites

Before running E2E tests, ensure:

1. **Supabase is running**:

   ```bash
   npm run setup:db
   ```

2. **Database is seeded**:

   ```bash
   npm run seed
   ```

3. **Development server is running**:

   ```bash
   npm run dev
   ```

## Test Structure

Each test file follows this pattern:

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

## Debugging Tests

### Open Cypress UI

```bash
npm run e2e:open
```

### View Screenshots

Failed tests automatically save screenshots to `cypress/screenshots/`.

### Enable Debug Mode

Add `cy.debug()` in your test:

```typescript
cy.get('[data-testid="element"]').debug().click();
```

## Troubleshooting

### Tests Failing

- Ensure development server is running: `npm run dev`
- Re-seed database: `npm run seed`
- Clear Cypress cache: `npx cypress cache clear`

### Authentication Issues

- Verify `.env.local` has correct Supabase credentials
- Check test user exists: `p.romanczuk@gmail.com`

### Timeout Errors

Increase timeout in tests:

```typescript
cy.get('element', { timeout: 10000 }).should('be.visible');
```

### Flaky Tests

- Use proper assertions instead of `cy.wait(1000)`
- Add `.should('be.visible')` before interactions
- Use `cy.intercept()` to wait for API calls
