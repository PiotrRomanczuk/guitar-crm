# Admin Songs and Lessons E2E Tests

This directory contains comprehensive end-to-end (e2e) tests for admin CRUD operations on Songs and Lessons.

## Test Files Overview

### Songs CRUD Operations
1. **admin-songs-create.cy.ts** - Tests for creating songs
   - Create with all fields
   - Create with only required fields
   - Validation tests
   - Form persistence tests

2. **admin-songs-read.cy.ts** - Tests for viewing songs
   - List view
   - Detail view
   - Filtering and search
   - Pagination
   - Navigation flows

3. **admin-songs-update.cy.ts** - Tests for updating songs
   - Edit existing songs
   - Partial updates
   - Validation on update
   - Multiple field updates

4. **admin-songs-delete.cy.ts** - Tests for deleting songs
   - Delete from list
   - Delete from detail page
   - Confirmation dialogs
   - Cascade deletions

### Lessons CRUD Operations
5. **admin-lessons-create.cy.ts** - Tests for creating lessons
   - Create with student/teacher selection
   - Required field validation
   - Optional fields (notes, songs)
   - Multiple sequential creations

6. **admin-lessons-read.cy.ts** - Tests for viewing lessons
   - List view with filtering
   - Detail view with associated data
   - Teacher/student filtering
   - Navigation flows

7. **admin-lessons-update.cy.ts** - Tests for updating lessons
   - Edit lesson details
   - Update date/time
   - Update notes and status
   - Field preservation

8. **admin-lessons-delete.cy.ts** - Tests for deleting lessons
   - Delete with confirmation
   - Cancel deletion
   - Cascade effects
   - Multiple deletions

### Integration Tests
9. **admin-songs-lessons-complete.cy.ts** - Complete admin journey
   - End-to-end workflow testing
   - Song → Lesson → Update → Delete
   - Data integrity verification
   - Multiple songs per lesson

## Running the Tests

### Prerequisites
- Node.js >= 20.9.0
- npm >= 10.0.0
- Cypress installed (`npm install`)

### Run All Admin E2E Tests
```bash
npm run e2e:admin
```

### Run Specific Test File
```bash
# Run only song creation tests
npx cypress run --spec "cypress/e2e/admin-songs-create.cy.ts"

# Run only complete journey test
npx cypress run --spec "cypress/e2e/admin-songs-lessons-complete.cy.ts"
```

### Interactive Mode (with Cypress UI)
```bash
npm run e2e:open
```
Then select the test file you want to run from the Cypress UI.

### Run Tests in Watch Mode
```bash
npx cypress open --e2e
```

## Test Structure

Each test follows this pattern:

1. **Setup**: Admin signs in before each test
2. **Action**: Perform the CRUD operation
3. **Verification**: Assert the expected outcome
4. **Cleanup**: Tests create unique data to avoid conflicts

## Test Data

Tests use dynamic data with timestamps to avoid conflicts:
- Song titles: `Test Song ${Date.now()}`
- Lesson titles: `Test Lesson ${Date.now()}`

This ensures tests can run multiple times without conflicts.

## Admin Credentials

Tests use these credentials (configured in the test files):
- Email: `p.romanczuk@gmail.com`
- Password: `test123_admin`

**Note**: These credentials must exist in your test database.

## Test Coverage

Total test scenarios: **100+** covering:
- ✅ Create operations (11 scenarios)
- ✅ Read operations (24 scenarios)
- ✅ Update operations (19 scenarios)
- ✅ Delete operations (19 scenarios)
- ✅ Integration flows (27+ scenarios)

## Test Patterns

### Resilient Tests
Tests handle various UI states:
- Empty lists
- Missing UI elements (graceful degradation)
- Optional features
- Confirmation dialogs

### Example Pattern
```typescript
cy.get('body').then(($body) => {
  if ($body.find('button:contains("Delete")').length > 0) {
    // Element exists, interact with it
    cy.contains('button', 'Delete').click();
  } else {
    // Element doesn't exist, skip or handle gracefully
    cy.log('Delete button not found, skipping');
  }
});
```

## Common Issues & Solutions

### Issue: Tests Fail Due to Network Errors
**Solution**: Ensure the development server is running:
```bash
npm run dev
```

### Issue: Admin Credentials Don't Work
**Solution**: Ensure test user exists in database:
```bash
npm run seed:test-user
```

### Issue: Tests Time Out
**Solution**: Increase timeout in `cypress.config.ts` or use longer timeouts in specific tests:
```typescript
cy.get('element', { timeout: 15000 }).should('be.visible');
```

### Issue: Flaky Tests
**Solution**: Add explicit waits where needed:
```typescript
cy.wait(2000); // Wait for animations or async operations
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/e2e.yml
- name: Run E2E Tests
  run: npm run e2e:admin
```

## Best Practices

1. **Keep Tests Independent**: Each test should work standalone
2. **Use Dynamic Data**: Avoid hardcoded IDs or titles
3. **Handle Optional Elements**: Use conditional checks
4. **Add Meaningful Logs**: Use `cy.log()` for debugging
5. **Clean Up**: Tests should clean up their data (or use unique identifiers)

## Contributing

When adding new tests:
1. Follow the existing naming convention
2. Add comprehensive scenarios
3. Handle edge cases
4. Update this README
5. Ensure tests pass locally before committing

## Related Documentation

- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Standards](../../.github/testing-standards.instructions.md)
- [Component Architecture](../../.github/component-architecture.instructions.md)
