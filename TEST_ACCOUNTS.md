# Test Accounts

This document lists the test accounts available for local development and testing.

## Authentication

All test accounts use the same password for simplicity:

**Password:** `password123`

## Available Accounts

### Admin
- **Email:** `admin@guitcrm.test`
- **Role:** Admin
- **Access:** Full administrative access to all features

### Teachers

#### Teacher 1
- **Email:** `teacher1@guitcrm.test`
- **Role:** Teacher
- **Access:** Create/manage lessons, assignments, and student progress

#### Teacher 2
- **Email:** `teacher2@guitcrm.test`
- **Role:** Teacher
- **Access:** Create/manage lessons, assignments, and student progress

### Students

#### Student 1
- **Email:** `student1@guitcrm.test`
- **Role:** Student
- **Access:** View assigned lessons and track progress

#### Student 2
- **Email:** `student2@guitcrm.test`
- **Role:** Student
- **Access:** View assigned lessons and track progress

#### Student 3
- **Email:** `student3@guitcrm.test`
- **Role:** Student
- **Access:** View assigned lessons and track progress

### Dual Role

#### Teacher Student
- **Email:** `teacher_student@guitcrm.test`
- **Roles:** Teacher + Student
- **Access:** Both teacher and student functionalities
- **Purpose:** Testing dual-role scenarios and permission edge cases

## Database Reset

To reset the database and restore all test accounts:

```bash
npx supabase db reset
```

This will:
1. Drop all tables
2. Run all migrations
3. Seed test accounts (auth.users + profiles + user_roles)
4. Apply any data from `supabase/seed.sql`

## Migration Details

Test accounts are seeded via migrations:
- **Profiles & Roles:** `20260105100030_seed_initial_data.sql`
- **Auth Users:** `20260107100001_seed_auth_users.sql`

## Notes

- ⚠️ These accounts are for **development and testing only**
- The `.test` domain ensures they cannot be used in production
- All passwords are intentionally simple for testing convenience
- User IDs are sequential UUIDs (11111111..., 22222222..., etc.) for easy identification in logs
