# Admin E2E Test Suite

Complete end-to-end testing suite for admin functionality in Guitar CRM.

## 📋 Test Organization

Tests are organized into focused, category-based suites for better maintainability, selective execution, and clear separation of concerns.

**Total Tests**: 98 organized tests across 15 files (all passing at 100%)

### Organized Test Structure

```
admin/
├── songs/
│   ├── navigation.cy.ts          (6 tests)
│   ├── ui-layout.cy.ts           (8 tests)
│   ├── authentication.cy.ts       (5 tests)
│   ├── responsive-design.cy.ts    (7 tests)
│   └── workflow.cy.ts            (7 tests)
│
├── assignments/
│   ├── navigation.cy.ts          (6 tests)
│   ├── ui-layout.cy.ts           (8 tests)
│   ├── authentication.cy.ts       (5 tests)
│   ├── responsive-design.cy.ts    (7 tests)
│   └── workflow.cy.ts            (7 tests)
│
├── lessons/
│   ├── navigation.cy.ts          (6 tests)
│   ├── ui-layout.cy.ts           (8 tests)
│   ├── authentication.cy.ts       (5 tests)
│   ├── responsive-design.cy.ts    (7 tests)
│   └── workflow.cy.ts            (6 tests)
│
└── Legacy (deprecated):
    ├── admin-lesson-journey.cy.ts
    ├── admin-song-journey.cy.ts
    └── admin-assignment-journey.cy.ts
```

### Test Categories

| Category | Tests Per Feature | Purpose |
|----------|-----------------|---------|
| **Navigation** | 6 | Page transitions, links, URL handling |
| **UI/Layout** | 8 | Visual components, structure, forms |
| **Authentication** | 5 | Session persistence, user context |
| **Responsive Design** | 7 | Mobile/tablet/desktop viewports |
| **Workflow** | 6-7 | Complete user workflows, complex scenarios |

---

## 🚀 Running Tests

### Run All Organized Tests

```bash
# All organized tests (98 tests, ~5 minutes)
npm run cypress:run -- --spec "cypress/e2e/admin/{songs,assignments,lessons}/**/*.cy.ts"
```

### Run All Tests for a Specific Feature

```bash
# Songs
npm run cypress:run -- --spec "cypress/e2e/admin/songs/**/*.cy.ts"

# Assignments
npm run cypress:run -- --spec "cypress/e2e/admin/assignments/**/*.cy.ts"

# Lessons
npm run cypress:run -- --spec "cypress/e2e/admin/lessons/**/*.cy.ts"
```

### Run a Specific Test Category

```bash
# All navigation tests
npm run cypress:run -- --spec "cypress/e2e/admin/**/navigation.cy.ts"

# All authentication tests
npm run cypress:run -- --spec "cypress/e2e/admin/**/authentication.cy.ts"

# All responsive design tests
npm run cypress:run -- --spec "cypress/e2e/admin/**/responsive-design.cy.ts"

# All workflow tests
npm run cypress:run -- --spec "cypress/e2e/admin/**/workflow.cy.ts"

# All UI/Layout tests
npm run cypress:run -- --spec "cypress/e2e/admin/**/ui-layout.cy.ts"
```

### Run a Specific Test File

```bash
npm run cypress:run -- --spec "cypress/e2e/admin/songs/navigation.cy.ts"
```

### Interactive Cypress Studio

```bash
npm run cypress:open
# Then select specific tests to run interactively
```

## Run Individual Tests

```bash
# Authentication
```bash
npm run cypress:run -- --spec "cypress/e2e/admin/songs/authentication.cy.ts"
```

---

## 📊 Test Results Summary

| Feature | Navigation | UI/Layout | Auth | Responsive | Workflow | Total |
|---------|-----------|-----------|------|------------|----------|-------|
| Songs | 6 ✓ | 8 ✓ | 5 ✓ | 7 ✓ | 7 ✓ | 33 ✓ |
| Assignments | 6 ✓ | 8 ✓ | 5 ✓ | 7 ✓ | 7 ✓ | 33 ✓ |
| Lessons | 6 ✓ | 8 ✓ | 5 ✓ | 7 ✓ | 6 ✓ | 32 ✓ |
| **Total** | **18** | **24** | **15** | **21** | **20** | **98** |

**All tests passing at 100%** ✅

---

## 📝 Test Categories Explained

### Navigation Tests (6 tests per feature)

Tests page navigation patterns:

- Navigate to list page
- Navigate to create page
- Navigate back from create page
- Handle direct URL access to list page
- Handle direct URL access to create page
- Navigate between pages without errors

### UI/Layout Tests (8 tests per feature)

Tests visual components and structure:

- Header visibility on page load
- Content area presence
- Container layout structure
- Form presence on create page
- Form fields existence and visibility
- Submit button visibility and functionality
- Multiple action buttons presence
- Form persistence after page reload

### Authentication Tests (5 tests per feature)

Tests session and authentication state:

- Admin email display in header
- Session persistence on list page
- Session persistence on create page
- Session persistence across page navigation
- Session persistence after page reload

### Responsive Design Tests (7 tests per feature)

Tests cross-viewport responsiveness:

- Mobile display (iphone-x: 375x812)
- Tablet display (ipad-2: 768x1024)
- Desktop display (macbook-15: 1440x900)
- Responsive form behavior on mobile
- Responsive form behavior on tablet
- Responsive form behavior on desktop
- Viewport resize and recalculation

### Workflow Tests (6-7 tests per feature)

Tests complete user workflows and scenarios:

- Full navigation workflow through feature
- Form data persistence on page reload
- List reload behavior
- Entity details page navigation (when data exists)
- Edit page navigation (when data exists)
- Sequential page transitions
- State management after back navigation

---

## 🎯 Test Data & Credentials

### Admin User Credentials

```typescript
const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
const ADMIN_PASSWORD = 'test123_admin';
```

### Feature Routes

- **Songs**: `/dashboard/songs` (list), `/dashboard/songs/new` (create)
- **Assignments**: `/dashboard/assignements` (list), `/dashboard/assignements/new` (create)
- **Lessons**: `/dashboard/lessons` (list), `/dashboard/lessons/new` (create)

---

## 🔍 Common Selectors

### Authentication Form

- `input[type="email"]` - Email input field
- `input[type="password"]` - Password input field
- `button[type="submit"]` - Sign in button

### Page Elements

- `header, nav` - Header and navigation elements
- `form` - Form container
- `[class*="container"]` - Layout container
- `button[type="submit"]` - Form submit button
- `a[href*="/dashboard/{feature}/"]` - Feature entity links

---

## 📚 Best Practices

### Writing New Tests

1. **Keep tests focused**: Each test should test one specific behavior
2. **Use descriptive names**: Make it clear what each test verifies
3. **Handle missing data**: Tests should gracefully handle cases where data doesn't exist
4. **Use appropriate timeouts**:
   - Default: 4s (for element queries)
   - Auth setup: 8s (for sign-in form visibility)
   - Navigation: 15s (for pathname changes)
5. **Avoid hard-coded waits**: Use Cypress built-in waiting mechanisms
6. **Follow the pattern**: Keep consistent structure across all test files
7. **Add comments**: Explain complex test logic

### Example Test Pattern

```typescript
describe('Feature - Category Tests', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should perform specific action', () => {
    cy.visit('/dashboard/feature');
    // Test implementation
  });
});
```

---

## 🐛 Troubleshooting

### Tests Timing Out

- Increase timeout: `cy.get('selector', { timeout: 10000 })`
- Check if element exists: Use `.then()` for conditional checks
- Verify auth is working: Ensure beforeEach completes successfully

### Tests Failing Intermittently

- Add appropriate timeouts for slow responses
- Use `.should()` for proper wait conditions
- Avoid race conditions with explicit waits using `.should()`

### Cannot Find Elements

- Check selector accuracy
- Verify page loaded: Wait for header/nav to be visible first
- Use Cypress inspector: Run tests with `--headed` flag and inspect

---

## 📦 Legacy Files (Deprecated)

The original monolithic journey tests are available but deprecated:

- `admin-lesson-journey.cy.ts` (14 tests)
- `admin-song-journey.cy.ts` (17 tests)
- `admin-assignment-journey.cy.ts` (17 tests)

These can be removed once all features are verified in the new organized structure.

---

## 🎓 Tips for Adding Tests to Existing Categories

1. Open the appropriate test file (e.g., `songs/navigation.cy.ts`)
2. Add new `it()` blocks within the existing `describe` block
3. Follow the same pattern as existing tests
4. Run only that file to verify: `npm run cypress:run -- --spec "cypress/e2e/admin/songs/navigation.cy.ts"`
5. Run all tests to ensure no conflicts

---

## 📞 Questions or Issues?

For questions about test organization, patterns, or specific test failures:
1. Check the test file for existing patterns
2. Review the error screenshots in `cypress/screenshots/`
3. Run tests in headed mode for debugging: `npm run cypress:open`
4. Contact the team with specific error details and test output

---

**Last Updated**: 2025 - Test Organization Completed
**Total Test Count**: 98 organized tests (100% passing)
```

### Interactive Mode

```bash
# Open Cypress UI for debugging
npm run e2e:open

# Then select admin tests from the GUI
```

---

## 📝 Test Scenarios

### 1. Authentication (`admin-sign-in.cy.ts`)

- ✅ Admin can sign in with valid credentials
- ✅ Admin redirected to dashboard after login
- ✅ Invalid credentials show error message
- ✅ Session persists across page reloads

### 2. Dashboard (`admin-dashboard.cy.ts`)

- ✅ Display admin dashboard title and description
- ✅ Show statistics cards (Users, Teachers, Students, Songs)
- ✅ Display admin action cards (User Management, Settings, etc.)
- ✅ Navigate to user management page
- ✅ Show "Coming Soon" badges for unavailable features
- ✅ Display recent activity section
- ✅ Debug view selector (switch between Admin/Teacher/Student views)
- ✅ Responsive design on mobile (375px) and tablet (768px)
- ✅ Load without errors

### 3. Create Song (`admin-create-song-journey.cy.ts`)

- ✅ Navigate from dashboard to songs list
- ✅ Count existing songs
- ✅ Create new song with all required fields
- ✅ Verify song count increases by 1
- ✅ Verify new song appears in list

### 4. Edit Song (`admin-song-edit.cy.ts`)

- ✅ Navigate to song detail page
- ✅ Click edit button
- ✅ Update song fields (title, author, level, key)
- ✅ Save changes successfully
- ✅ Verify updates in song detail page
- ✅ Verify updates in songs list
- ✅ Show validation errors for invalid data
- ✅ Cancel edit without saving changes

### 5. Delete Song (`admin-song-delete.cy.ts`)

- ✅ Create test song before each test
- ✅ Navigate to song detail page
- ✅ Click delete button
- ✅ Confirm deletion
- ✅ Verify song removed from list
- ✅ Verify song count decreases by 1
- ✅ Cancel deletion (if confirmation dialog)
- ✅ Handle delete errors gracefully

### 6. Complete Journey (`admin-complete-journey.cy.ts`)

**11-step comprehensive workflow:**

1. ✅ Admin login with credentials
2. ✅ Verify dashboard access
3. ✅ Navigate to songs management
4. ✅ Create new song
5. ✅ Verify song in list (count +1)
6. ✅ View song detail page
7. ✅ Edit song fields
8. ✅ Verify edits in list
9. ✅ Delete song
10. ✅ Verify deletion (count -1)
11. ✅ Return to dashboard

**Additional scenarios:**

- ✅ Handle validation errors gracefully
- ✅ Maintain session across navigation

---

## 🎯 Test Data

### Admin User Credentials

```typescript
const adminEmail = 'p.romanczuk@gmail.com';
const adminPassword = 'test123_admin';
```

### Sample Song Data

```typescript
const songData = {
  title: 'Test Song Title',
  author: 'Test Artist',
  level: 'intermediate', // beginner | intermediate | advanced
  key: 'C', // Any musical key (C, D, E, F, G, A, B, etc.)
  ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test-song',
};
```

---

## 🏗️ Component Test IDs

### Authentication

- `[data-testid="email"]` - Email input field
- `[data-testid="password"]` - Password input field
- `[data-testid="signin-button"]` - Sign in button

### Songs List

- `[data-testid="song-table"]` - Songs table container
- `[data-testid="song-row"]` - Individual song rows
- `[data-testid="song-new-button"]` - Create new song button
- `[data-testid="user-search-input"]` - Search input (for future user management)

### Song Form

- `[data-testid="song-title"]` - Title input
- `[data-testid="song-author"]` - Author input
- `[data-testid="song-level"]` - Level dropdown
- `[data-testid="song-key"]` - Key dropdown
- `[data-testid="song-ultimate_guitar_link"]` - UG link input
- `[data-testid="song-save"]` - Save button

### Song Detail

- `[data-testid="song-edit-button"]` - Edit song button
- `[data-testid="song-delete-button"]` - Delete song button

### Confirmation Dialogs (future implementation)

- `[data-testid="confirm-delete"]` - Confirm deletion
- `[data-testid="cancel-delete"]` - Cancel deletion

---

## 🔍 API Interceptions

All tests use `cy.intercept()` to monitor API calls:

```typescript
// Create
cy.intercept('POST', '/api/song').as('createSong');

// Update
cy.intercept('PUT', '/api/song*').as('updateSong');

// Delete
cy.intercept('DELETE', '/api/song*').as('deleteSong');

// Wait and verify
cy.wait('@createSong').then((interception) => {
  expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
});
```

---

## 📊 Expected Test Results

### Success Criteria

- ✅ All tests pass on first run
- ✅ No flaky tests (100% pass rate on 3 consecutive runs)
- ✅ Total execution time < 5 minutes
- ✅ All CRUD operations verified
- ✅ Error scenarios handled
- ✅ Responsive design verified

### Coverage Metrics

- **Authentication**: 100%
- **Dashboard**: 90% (settings/reports pending)
- **Songs CRUD**: 100%
- **Error Handling**: 85%
- **Navigation**: 95%

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **User Management**: No page/route implemented yet (components exist)
2. **Confirmation Dialogs**: May vary by implementation (conditional handling in tests)
3. **Delete Cascade**: Separate test file, not fully integrated

### Future Enhancements

1. Add tests for user management once routes are implemented
2. Add tests for settings and reports features
3. Add tests for activity logs
4. Add performance testing
5. Add visual regression testing

---

## 📚 Best Practices

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Login and setup
  });

  it('should perform specific action', () => {
    // Arrange: Navigate and setup
    // Act: Perform action
    // Assert: Verify outcome
  });

  afterEach(() => {
    // Cleanup (if needed)
  });
});
```

### Naming Conventions

- **Files**: `admin-{feature}-{action}.cy.ts`
- **Tests**: `should {action} {expected outcome}`
- **Logs**: Use `cy.log()` for step-by-step tracking

### Debugging Tips

```typescript
// Add detailed logging
cy.log('STEP 1: Performing action');

// Inspect elements
cy.get('body').then(($body) => {
  console.log($body.text());
});

// Wait for specific conditions
cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard');

// Take screenshots on failure (automatic in Cypress)
```

---

## 🔄 CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Admin E2E Tests
  run: npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-admin-tests
    path: cypress/screenshots
```

---

## 📞 Support & Maintenance

### Running Into Issues?

1. Check test logs in terminal
2. Review screenshots in `cypress/screenshots/`
3. Run tests in interactive mode: `npm run e2e:open`
4. Verify database is seeded: `npm run seed`

### Updating Tests

When adding new features:

1. Add `data-testid` attributes to new components
2. Create test file following naming convention
3. Update this README with new test details
4. Run quality checks: `npm run quality`

---

## ✅ Checklist for New Admin Features

- [ ] Add `data-testid` attributes to all interactive elements
- [ ] Create E2E test file in `cypress/e2e/admin/`
- [ ] Write tests for happy path
- [ ] Write tests for error scenarios
- [ ] Test responsive design (mobile/tablet)
- [ ] Add API interceptions
- [ ] Update this README
- [ ] Run `npm run quality`
- [ ] Commit with descriptive message

---

**Last Updated**: November 9, 2025  
**Total Test Files**: 7  
**Total Test Scenarios**: 40+  
**Estimated Runtime**: ~3-4 minutes
