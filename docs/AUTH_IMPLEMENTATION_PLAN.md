# Auth Implementation Plan: Shadow Users & Recovery

## Overview
This document tracks the implementation of robust authentication flows, specifically focusing on "Shadow User" reconciliation (linking existing profiles to new auth accounts) and "Forgot Password" functionality.

## Status Tracker

### 1. Shadow User Reconciliation (Database Logic)
- [x] **Analysis**: Identify current trigger logic flaws.
- [x] **Reproduction**: Create a test case demonstrating failure when signing up with an email that already exists in `profiles`.
- [x] **Implementation**: Modify `handle_new_user` PostgreSQL function to handle conflicts (UPSERT or UPDATE).
- [ ] **Verification**: Verify the test case passes.

### 2. Forgot Password Flow (E2E)
- [ ] **Test Scaffolding**: Create `cypress/e2e/auth/forgot-password.cy.ts`.
- [ ] **Implementation**: Write Cypress test to trigger reset password flow.
- [ ] **Mocking**: Mock the email service/interception since we can't access real email in E2E.
- [ ] **Verification**: Run Cypress test.

### 3. Shadow User Flow (E2E)
- [ ] **Test Scaffolding**: Create `cypress/e2e/auth/shadow-user.cy.ts`.
- [ ] **Setup**: Seed a "Shadow User" (profile without auth_id) in the test database.
- [ ] **Implementation**: Write Cypress test to sign up with that email.
- [ ] **Assertion**: Verify the new Auth User is linked to the existing Profile ID.
- [ ] **Verification**: Run Cypress test.

### 4. CI/CD Integration
- [ ] **Configuration**: Ensure these tests run in the CI pipeline.

## Implementation Details

### Shadow User Logic
Currently, `handle_new_user` likely attempts an `INSERT` into `public.profiles`. If a profile with the same email exists (Shadow User), this violates the unique constraint (if email is unique) or creates a duplicate profile (if not), failing to link the new `auth.uid` to the existing data.

**Required Logic:**
1. Check if a profile exists with `new.email`.
2. If YES: Update that profile, setting `id` (auth_id) to `new.id`.
3. If NO: Insert a new profile.
