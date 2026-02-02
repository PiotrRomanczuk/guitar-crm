# Security Tests - Server Action Authorization

## Overview

This directory contains critical security tests for server-side authorization vulnerabilities in Strummy.

## Test Files

### `auth-server-actions.cy.ts` ✅ IMPLEMENTED

**Purpose**: Validates authorization checks in server actions (`/app/dashboard/actions.ts`)

**Priority**: P0 - BLOCKING PRODUCTION DEPLOYMENT

**Status**: COMPLETE - Ready for execution

---

## Critical Vulnerabilities Tested

### 🔴 CRITICAL #1: `inviteUser()` - No Authorization Check

**File**: `/app/dashboard/actions.ts:120`

**Vulnerability**:
```typescript
export async function inviteUser(
  email: string,
  fullName: string,
  role: 'student' | 'teacher' | 'admin' = 'student',
  phone?: string
) {
  const supabaseAdmin = createAdminClient();
  // ❌ MISSING: No check if caller is admin
  // ANY authenticated user can create admin accounts!
}
```

**Risk**: **Privilege Escalation** - Students can create admin accounts

**Test Coverage**:
- ✅ Student attempting to create admin users
- ✅ Admin successfully creating users
- ✅ Teacher role restrictions
- ✅ API-level enforcement testing

---

### 🟡 HIGH #2: `createShadowUser()` - Missing Role Check

**File**: `/app/dashboard/actions.ts:170`

**Vulnerability**:
```typescript
export async function createShadowUser(studentEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  // ✅ Has auth check
  // ❌ MISSING: No role check (should be admin OR teacher only)
}
```

**Risk**: Students can create user accounts

**Test Coverage**:
- ✅ Student attempting to create shadow users
- ✅ Admin successfully creating shadow users
- ✅ Teacher successfully creating shadow users
- ✅ Access to calendar import page (triggers createShadowUser)

---

### ✅ SECURE: `deleteUser()` - Reference Implementation

**File**: `/app/dashboard/actions.ts:573`

**Proper Implementation**:
```typescript
export async function deleteUser(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized'); // ✅ Auth check
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) { // ✅ Role check
    throw new Error('Unauthorized: Admin access required');
  }

  // ✅ Only then proceed with admin operation
}
```

**This is the CORRECT pattern** that should be applied to `inviteUser()` and `createShadowUser()`

---

## Test Structure

### Test Scenarios

1. **inviteUser() Authorization Bypass**
   - Student can create admin accounts (EXPLOIT TEST)
   - Admin can create users (EXPECTED BEHAVIOR)
   - Teacher cannot create admin users (EXPECTED BEHAVIOR)
   - API-level enforcement verification

2. **createShadowUser() Missing Role Check**
   - Student can create shadow users (EXPLOIT TEST)
   - Admin can create shadow users (EXPECTED BEHAVIOR)
   - Teacher can create shadow users (EXPECTED BEHAVIOR)
   - Calendar import access verification

3. **deleteUser() - Secure Reference**
   - Admin can delete users (EXPECTED BEHAVIOR)
   - Student cannot delete users (EXPECTED BEHAVIOR)
   - Documentation of correct pattern

4. **API-Level Permission Enforcement**
   - Unauthenticated requests rejected
   - Student API requests blocked for admin operations
   - Teacher cannot create admin via API

5. **Security Summary**
   - Complete vulnerability documentation
   - Remediation plan
   - Reference implementations

---

## Running the Tests

### Run all security tests:
```bash
npm run cypress:run -- --spec "cypress/e2e/security/**/*.cy.ts"
```

### Run server action tests only:
```bash
npm run cypress:run -- --spec "cypress/e2e/security/auth-server-actions.cy.ts"
```

### Open in interactive mode:
```bash
npm run cypress:open
# Then select: E2E Testing > security/auth-server-actions.cy.ts
```

---

## Expected Test Results

### Before Fixes:
- 🔴 Several tests will FAIL (documenting vulnerabilities)
- Student WILL be able to create admin accounts (if UI accessible)
- Student WILL be able to access calendar import
- Tests document the exploits

### After Fixes:
- ✅ All tests should PASS
- Students CANNOT create admin accounts
- Students CANNOT create shadow users
- Only admins/teachers have proper access

---

## Required Fixes

### Fix #1: Secure `inviteUser()`

```typescript
// File: app/dashboard/actions.ts:120
export async function inviteUser(
  email: string,
  fullName: string,
  role: 'student' | 'teacher' | 'admin' = 'student',
  phone?: string
) {
  // ✅ ADD: Authentication check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // ✅ ADD: Admin role verification
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  // ✅ NOW safe to use admin client
  const supabaseAdmin = createAdminClient();
  // ... rest of function
}
```

### Fix #2: Secure `createShadowUser()`

```typescript
// File: app/dashboard/actions.ts:170
export async function createShadowUser(studentEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // ✅ ADD: Role check (admin OR teacher)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    throw new Error('Unauthorized: Admin or Teacher access required');
  }

  // ✅ NOW safe to use admin client
  const supabaseAdmin = createAdminClient();
  // ... rest of function
}
```

---

## Integration with CI/CD

### Pre-commit Hook
```bash
# Run security tests before commit
npm run cypress:run -- --spec "cypress/e2e/security/**/*.cy.ts"
```

### Pull Request Checks
- Security tests MUST pass before merge
- Any failing security test blocks deployment
- Require code review for security-related changes

### Production Deployment
- Run full security suite
- Generate security report
- Verify all P0 vulnerabilities resolved

---

## Test Maintenance

### When to Update Tests:

1. **New server actions added**
   - Add authorization tests for new actions
   - Verify role-based access

2. **Authorization logic changed**
   - Update tests to match new logic
   - Verify backward compatibility

3. **New roles added**
   - Test new role permissions
   - Update test credentials

4. **Security vulnerability discovered**
   - Add regression test
   - Document exploit
   - Verify fix

---

## Related Documentation

- **Security Policy**: `SECURITY.md` (if exists)
- **Authorization Guide**: `docs/authorization.md` (if exists)
- **RBAC Documentation**: `/CLAUDE.md` (Role-Based Access Control section)
- **Migration Progress**: `/PLAYWRIGHT_MIGRATION_PROGRESS.md` (Security section)

---

## Contact

**Security Concerns**: Report via GitHub Security Advisory

**Test Issues**: Create issue with label `security` and `testing`

---

## Verification Checklist

Before marking security fixes as complete:

- [ ] All security tests pass
- [ ] No student can create admin accounts
- [ ] No student can create shadow users
- [ ] Admin functions properly gated
- [ ] Teacher functions properly scoped
- [ ] API-level enforcement verified
- [ ] UI-level enforcement verified
- [ ] Database RLS policies validated
- [ ] Code review completed
- [ ] Security team approval

---

**Last Updated**: 2026-02-02
**Test Coverage**: Server Action Authorization
**Status**: Tests implemented, awaiting code fixes
