# Security Tests

## Overview

Critical security tests for server action authorization in Strummy.

## Files

- **auth-server-actions.spec.ts** (650 lines, 21 tests)
  - Tests authorization controls for `inviteUser()`, `createShadowUser()`, `deleteUser()`
  - Verifies role-based access control (RBAC)
  - Priority: P0 - Critical Security

## Running Tests

```bash
# All security tests
npx playwright test tests/e2e/security/

# With tags
npx playwright test --grep @security
npx playwright test --grep @server-actions
```

## Test Coverage

### 1. inviteUser() Security (5 tests)
- Admin access allowed
- Unauthenticated blocked
- Student blocked
- Teacher (non-admin) blocked
- Server-side enforcement

### 2. createShadowUser() Security (4 tests)
- Admin access allowed
- Teacher access allowed
- Student blocked
- Server-side enforcement

### 3. deleteUser() Security (4 tests)
- Admin access allowed
- Student blocked
- Teacher (non-admin) blocked
- Server-side enforcement

### 4. Cross-Role Authorization (4 tests)
- Privilege escalation prevention
- Per-request authorization
- Authentication required
- Role hierarchy enforcement

### 5. Security Best Practices (4 tests)
- No sensitive data leakage
- Email validation
- HTTPS headers
- Session timeout

## Security Status

✅ **All vulnerabilities FIXED**

Previously vulnerable server actions now have proper authorization:
- `inviteUser()` - Admin-only check added
- `createShadowUser()` - Teacher/Admin check added
- `deleteUser()` - Already secure (reference pattern)

## Quick Reference

**Test Credentials** (from `playwright.config.ts`):
- Admin: `p.romanczuk@gmail.com` / `test123_admin`
- Teacher: `teacher@example.com` / `test123_teacher`
- Student: `student@example.com` / `test123_student`

**Tags**:
- `@security` - All security tests
- `@server-actions` - Server action tests
- `@authorization` - Authorization tests
- `@rbac` - Role-based access control

**Last Updated**: 2026-02-02
