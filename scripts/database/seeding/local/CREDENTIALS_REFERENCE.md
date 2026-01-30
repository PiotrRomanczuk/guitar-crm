# Development Credentials Reference

**⚠️ WARNING:** These credentials are for **LOCAL DEVELOPMENT ONLY**. Never use in production.

## Master User List

All development users are created by: `bash scripts/database/seeding/local/seed-all.sh`

### Admin User

**Role Flags:** `is_admin=true`, `is_teacher=true`, `is_student=false`

```bash
Email:    p.romanczuk@gmail.com
Password: test123_admin
```

**Permissions:**

- Full system admin access
- Can manage students and teachers
- Can create/edit/delete songs, lessons, and assignments
- Can access admin dashboard

### Teacher User

**Role Flags:** `is_admin=false`, `is_teacher=true`, `is_student=false`

```bash
Email:    teacher@example.com
Password: test123_teacher
```

**Permissions:**

- Create and manage students
- Create and manage lessons
- Assign songs and exercises
- Track student progress
- Cannot access admin dashboard

### Student User (Primary)

**Role Flags:** `is_admin=false`, `is_teacher=false`, `is_student=true`

```bash
Email:    student@example.com
Password: test123_student
```

**Permissions:**

- View assigned lessons
- View assigned songs
- Track personal progress
- Submit practice logs

### Additional Student Users

All have role flags: `is_admin=false`, `is_teacher=false`, `is_student=true`

```bash
Email:    teststudent1@example.com
Password: test123_student

Email:    teststudent2@example.com
Password: test123_student

Email:    teststudent3@example.com
Password: test123_student
```

## Important Notes

### User IDs

User IDs are automatically generated during seeding and aligned between `auth.users` and `profiles` table.

### Verifying Credentials

Check that users are properly seeded:

```bash
# View all users in Supabase Studio
# URL: http://localhost:54323
# Navigate to: Auth > Users

# Or query directly:
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c \
  "SELECT email, is_admin, is_teacher, is_student FROM profiles ORDER BY email;"
```

### Creating/Updating Credentials

Credentials are defined in these files:

- Create users: `scripts/database/seeding/local/seed-dev-users-via-api.js`
- Update passwords: `scripts/database/seeding/local/update-dev-passwords-via-api.js`
- Run all seeding: `scripts/database/seeding/local/seed-all.sh`

To add new credentials:

1. Add user object to `seed-dev-users-via-api.js`
2. Generate a UUID for the `update-dev-passwords-via-api.js` file
3. Run seeding: `bash scripts/database/seeding/local/seed-all.sh`

### Role Flags Explanation

Users can have multiple role flags (not mutually exclusive):

- `is_admin`: System administrator with full access
- `is_teacher`: Can create lessons and manage students
- `is_student`: Can view assigned content and track progress

Example combinations:

- Admin who teaches: `is_admin=true, is_teacher=true`
- Teacher taking lessons: `is_teacher=true, is_student=true`

## Quick Start

### 1. Start Local Environment

```bash
# Start Supabase (requires Docker)
npm run setup:db

# Or if already running, skip to next step
```

### 2. Seed All Users and Data

```bash
bash scripts/database/seeding/local/seed-all.sh
```

### 3. Start Application

```bash
npm run dev
```

### 4. Login with Any Credential

Visit `http://localhost:3000/sign-in` and use any credential from above.

## Resetting Credentials

If you need to reset the database:

```bash
# Stop Supabase
npm run db:stop

# Remove all data
rm -rf supabase/.branches

# Restart with fresh data
npm run setup:db
bash scripts/database/seeding/local/seed-all.sh
```

## Testing Different Roles

### Test as Admin

```bash
Login: p.romanczuk@gmail.com / test123_admin
Expected: Access to admin dashboard
```

### Test as Teacher

```bash
Login: teacher@example.com / test123_teacher
Expected: Can see student list, create lessons
```

### Test as Student

```bash
Login: student@example.com / test123_student
Expected: Can only see assigned lessons and songs
```

### Test Multiple Roles

```bash
Login: p.romanczuk@gmail.com / test123_admin
Expected: Admin AND teacher features available
```

## Troubleshooting

### Users not created?

- Ensure Supabase is running: `curl http://localhost:54321/health`
- Check env variables: `.env.local` must have:
  - `NEXT_PUBLIC_SUPABASE_LOCAL_URL` or `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_LOCAL_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` (never use NEXT_PUBLIC_ for service role keys)

### Can't login?

- Verify user exists in Supabase Studio auth tab
- Check that password matches (they're case-sensitive)
- Ensure roles are set on `profiles` table

### Profiles missing?

- Run seeding again: `bash scripts/database/seeding/local/seed-all.sh`
- Verify API keys are correct

## Last Updated

- **Date**: November 10, 2025
- **Script Version**: seed-all.sh v1.0
- **Tested With**: Supabase v0.x, Next.js 16.0.0
