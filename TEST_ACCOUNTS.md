# Test Accounts

This document lists the test accounts available for local development and testing.

## Authentication

Passwords vary by role:
- **Admin:** `test123_admin`
- **Teacher:** `test123_teacher`
- **Students:** `test123_student`

## Available Accounts

### Admin (Owner)
- **Email:** `p.romanczuk@gmail.com`
- **Password:** `test123_admin`
- **Roles:** Admin + Teacher
- **Access:** Full administrative access + teaching capabilities

### Teacher
- **Email:** `teacher@example.com`
- **Password:** `test123_teacher`
- **Role:** Teacher
- **Access:** Create/manage lessons, assignments, and student progress

### Students

#### Student 1
- **Email:** `student1@example.com`
- **Password:** `test123_student`
- **Role:** Student
- **Access:** View assigned lessons and track progress

#### Student 2
- **Email:** `student2@example.com`
- **Password:** `test123_student`
- **Role:** Student
- **Access:** View assigned lessons and track progress

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
- **Profiles:** `20260105100030_seed_initial_data.sql`
- **Auth Users:** `20260107100001_seed_auth_users.sql`
- **User Roles:** Auto-generated via `sync_profile_roles()` trigger

## Notes

- ⚠️ These accounts are for **development and testing only**
- The admin account uses the real owner's email for production compatibility
- All passwords are intentionally simple for testing convenience
- User IDs are sequential UUIDs (11111111..., 22222222..., etc.) for easy identification in logs
- The admin has both admin and teacher roles to access all dashboard features
