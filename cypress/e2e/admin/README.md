# Admin E2E Test Suite

Complete end-to-end testing suite for admin functionality in Guitar CRM.

## 📋 Test Files Overview

### Consolidated Tests

| Test File               | Purpose                              | Tests | Duration | Status |
| ----------------------- | ------------------------------------ | ----- | -------- | ------ |
| `admin-sign-in.cy.ts`   | Admin authentication & access        | 2     | ~5s      | ✅     |
| `admin-dashboard.cy.ts` | Dashboard display & navigation       | 4     | ~10s     | ✅     |
| `admin-songs.cy.ts`     | Complete Songs CRUD operations       | 6     | ~30s     | ✅     |

## �� Test Coverage

### ✅ Fully Tested & Working

- **Authentication**: Admin login, session management, role verification
- **Dashboard**: Layout, stats display, navigation links, error handling
- **Songs CRUD**:
  - Create new songs with validation
  - Read/display songs in list and detail views
  - Update existing songs
  - Delete songs with confirmation
  - Form validation and error messages
  - Cancel operations and discard changes

### ⏳ Pending Implementation (No Routes Yet)

- User management (admin user CRUD)
- Lessons management
- Assignments management
- System settings
- Reports & analytics
- Activity logs

## 🚀 Running Tests

### Run All Admin Tests

```bash
npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"
```

### Run Specific Test

```bash
# Authentication tests
npm run e2e -- --spec "cypress/e2e/admin/admin-sign-in.cy.ts"

# Dashboard tests
npm run e2e -- --spec "cypress/e2e/admin/admin-dashboard.cy.ts"

# Songs CRUD tests
npm run e2e -- --spec "cypress/e2e/admin/admin-songs.cy.ts"
```

### Interactive Test Mode

```bash
npm run e2e:open
```

## 🔧 Test Credentials

```
Email: p.romanczuk@gmail.com
Password: test123_admin
```

## 📝 Test Structure

Each test file follows this pattern:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
  });

  it('should do something specific', () => {
    // Arrange, Act, Assert
  });
});
```

## 🐛 Troubleshooting

### Tests Failing

1. Ensure database is seeded:
   ```bash
   npm run seed
   ```

2. Clear Cypress cache:
   ```bash
   npx cypress cache clear
   ```

3. Check screenshots:
   ```bash
   ls cypress/screenshots/admin/
   ```

### Running in Headed Mode

```bash
npm run e2e -- --headed --spec "cypress/e2e/admin/**/*.cy.ts"
```

## 📈 Performance

- **Total test time**: ~45 seconds for full admin suite
- **Average test duration**: 5-10 seconds per test
- **Consolidated from**: 10+ files down to 3 files
- **Reduced test count**: From 40+ tests to 12 focused tests

## �� Best Practices Used

1. **DRY Principle**: Consolidated duplicate tests into single focused files
2. **beforeEach Hooks**: Common setup for authentication
3. **Data Attributes**: Uses `data-testid` for reliable selectors
4. **API Mocking**: Intercepts and validates API calls
5. **Clear Naming**: Test descriptions clearly state what is being tested
6. **Minimal Steps**: Each test focuses on a single feature

## 🔑 Key Test IDs

### Authentication
- `[data-testid="email"]` - Email input
- `[data-testid="password"]` - Password input
- `[data-testid="signin-button"]` - Sign in button

### Songs
- `[data-testid="song-table"]` - Songs table
- `[data-testid="song-row"]` - Song rows
- `[data-testid="song-new-button"]` - Create song button
- `[data-testid="song-title"]` - Title input
- `[data-testid="song-author"]` - Author input
- `[data-testid="song-level"]` - Level dropdown
- `[data-testid="song-key"]` - Key dropdown
- `[data-testid="song-ultimate_guitar_link"]` - UG link input
- `[data-testid="song-save"]` - Save button
- `[data-testid="song-edit-button"]` - Edit button
- `[data-testid="song-delete-button"]` - Delete button

---

**Last Updated**: November 10, 2025  
**Total Test Files**: 3 (consolidated from 10+)  
**Total Test Scenarios**: 12  
**Estimated Runtime**: ~45 seconds
