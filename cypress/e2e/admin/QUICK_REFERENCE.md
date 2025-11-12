# Admin E2E Tests - Quick Reference

## 🚀 Run Tests

```bash
# All admin tests
npm run e2e -- --spec "cypress/e2e/admin/**/*.cy.ts"

# Specific test file
npm run e2e -- --spec "cypress/e2e/admin/admin-songs.cy.ts"

# Interactive mode
npm run e2e:open
```

## 📋 Test Files (Consolidated)

| File                  | Tests | Time | Coverage                          |
| --------------------- | ----- | ---- | --------------------------------- |
| `admin-sign-in.cy.ts` | 2     | 5s   | Login, access control             |
| `admin-dashboard.cy.ts` | 4   | 10s  | Dashboard display, navigation     |
| `admin-songs.cy.ts`   | 6     | 30s  | Create, Read, Update, Delete      |
| **Total**             | **12**| **45s** | All admin features            |

## 🔧 Test Credentials

```
Email: p.romanczuk@gmail.com
Password: test123_admin
```

## 📝 What's Tested

### ✅ Admin Sign-In
- Admin login flow
- Redirect to dashboard
- Songs page access

### ✅ Admin Dashboard
- Title and layout
- Statistics display
- Navigation links
- Error handling

### ✅ Admin Songs CRUD
- Create songs with validation
- Read/display songs
- Edit song details
- Delete songs
- Form validation errors
- Cancel operations

## 🎯 Common Commands

```bash
# Run with headed browser
npm run e2e -- --headed --spec "cypress/e2e/admin/**/*.cy.ts"

# Run in debug mode
npm run e2e -- --spec "cypress/e2e/admin/admin-songs.cy.ts" --debug

# Clear cache if tests fail
npx cypress cache clear
```

## 📊 Performance

- **Consolidated from**: 10+ files → 3 files
- **Test reduction**: 40+ tests → 12 focused tests
- **Total runtime**: ~45 seconds
- **Per test average**: 5-10 seconds

## 🐛 Troubleshooting

| Issue | Solution |
| --- | --- |
| Tests fail | `npm run seed && npx cypress cache clear` |
| Can't find elements | Verify `data-testid` attributes in components |
| Database errors | Restart: `npm run setup:db` |
| Flaky tests | Run 3x consecutively to verify |

## 🔑 Key Test IDs

```
Authentication: [data-testid="email"], [data-testid="password"]
Songs: [data-testid="song-table"], [data-testid="song-new-button"]
Forms: [data-testid="song-title"], [data-testid="song-save"]
Actions: [data-testid="song-edit-button"], [data-testid="song-delete-button"]
```

## ⏳ Pending Features

No routes yet for:
- User management
- Lessons CRUD
- Assignments
- Settings
- Reports
- Logs

---

**Last Updated**: November 10, 2025  
**Status**: ✅ All implemented features tested and working
