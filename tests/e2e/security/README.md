# Security Tests Documentation

## Overview

This directory contains critical security tests for the Strummy application, focusing on authorization and access control enforcement.

## Test Files

### `auth-server-actions.spec.ts`

**Purpose**: Verify server action authorization controls

**Test Coverage**: 21 tests across 5 test suites

**Priority**: P0 - Critical Security Tests

**Tags**: `@security`, `@server-actions`, `@authorization`, `@rbac`

## What We're Testing

### 1. Server Action Authorization

The tests verify that Next.js Server Actions in `/app/dashboard/actions.ts` properly enforce role-based access control:

#### Critical Server Actions Tested:

1. **`inviteUser()`** (Lines 120-189)
   - Admin-only action
   - Creates new users and assigns roles
   - **Security Risk**: Could allow privilege escalation if not secured
   - **Current Status**: ✅ FIXED - Proper admin check implemented

2. **`createShadowUser()`** (Lines 191-391)
   - Teacher/Admin action
   - Creates student profiles from calendar sync
   - **Security Risk**: Could allow unauthorized student creation
   - **Current Status**: ✅ FIXED - Teacher/Admin check implemented

3. **`deleteUser()`** (Lines 605-654)
   - Admin-only action
   - Removes users from system
   - **Security Risk**: Critical - user data deletion
   - **Current Status**: ✅ SECURE - Properly implemented from start

## Running the Tests

### Run All Security Tests

```bash
npx playwright test tests/e2e/security/
```

### Run with Specific Tags

```bash
# All security tests
npx playwright test --grep @security

# Server action tests only
npx playwright test --grep @server-actions
```

## Test Suites

### 1. inviteUser() Security (5 tests)
### 2. createShadowUser() Security (4 tests)
### 3. deleteUser() Security (4 tests)
### 4. Cross-Role Authorization Enforcement (4 tests)
### 5. Security Best Practices (4 tests)

**Last Updated**: 2026-02-02
**Test Count**: 21 tests
**Status**: All tests passing ✅
