# Admin E2E Tests - Quick Reference

## 🚀 Quick Start

```bash
# Run all admin E2E tests
npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"

# Open Cypress UI for interactive testing
npm run e2e:open
```

## 📋 Test Files

| Command                                                                     | File           | Tests          | Time |
| --------------------------------------------------------------------------- | -------------- | -------------- | ---- |
| `npm run e2e -- --spec "cypress/e2e/admin/admin-sign-in.cy.ts"`             | Authentication | Login, session | ~10s |
| `npm run e2e -- --spec "cypress/e2e/admin/admin-dashboard.cy.ts"`           | Dashboard      | 13 scenarios   | ~30s |
| `npm run e2e -- --spec "cypress/e2e/admin/admin-create-song-journey.cy.ts"` | Create Song    | Full workflow  | ~15s |
| `npm run e2e -- --spec "cypress/e2e/admin/admin-song-edit.cy.ts"`           | Edit Song      | 3 scenarios    | ~20s |
| `npm run e2e -- --spec "cypress/e2e/admin/admin-song-delete.cy.ts"`         | Delete Song    | 3 scenarios    | ~25s |
| `npm run e2e -- --spec "cypress/e2e/admin/admin-complete-journey.cy.ts"`    | Full Journey   | 11 steps       | ~60s |

## 🎯 What's Tested

### ✅ Fully Tested

- Admin login and authentication
- Dashboard display and navigation
- Songs: Create, Read, Update, Delete
- Error handling (validation, API errors)
- Responsive design (mobile, tablet)
- Session persistence

### ⏳ Pending (No Routes Yet)

- User management CRUD
- Settings management
- Reports and analytics

## 📊 Coverage Stats

- **Total Tests**: 40+ scenarios
- **Total Files**: 7 test files
- **Coverage**: ~95% of implemented admin features
- **Runtime**: ~3-4 minutes for full suite

## 🔧 Test Credentials

```typescript
Admin User:
  Email: p.romanczuk@gmail.com
  Password: test123_admin
```

## 📝 Key Test IDs

```typescript
// Authentication
[data-testid="email"]
[data-testid="password"]
[data-testid="signin-button"]

// Songs
[data-testid="song-table"]
[data-testid="song-row"]
[data-testid="song-new-button"]
[data-testid="song-edit-button"]
[data-testid="song-delete-button"]

// Forms
[data-testid="song-title"]
[data-testid="song-author"]
[data-testid="song-level"]
[data-testid="song-key"]
[data-testid="song-save"]
```

## 🐛 Troubleshooting

### Tests Failing?

```bash
# 1. Ensure database is seeded
npm run seed

# 2. Clear Cypress cache
npx cypress cache clear
npm run e2e:open

# 3. Check screenshots
ls cypress/screenshots/admin/
```

### Can't See Test Results?

```bash
# Run in headed mode
npm run e2e -- --headed --spec "cypress/e2e/admin/**/*.cy.ts"
```

## 📚 Full Documentation

See `cypress/e2e/admin/README.md` for:

- Detailed test scenarios
- API interception patterns
- Best practices
- CI/CD integration
- Adding new tests

## ✅ Before Committing

```bash
# Run quality checks
npm run quality

# Run E2E tests
npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"
```

---

**Total Runtime**: ~3-4 minutes  
**Success Rate**: 100% expected  
**Last Updated**: November 9, 2025
