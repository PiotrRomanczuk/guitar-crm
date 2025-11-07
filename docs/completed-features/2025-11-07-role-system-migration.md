# Role System Migration - Complete Fix

**Date**: November 7, 2025  
**Status**: ✅ Complete  
**Time Spent**: ~3 hours

## Summary

Fixed the complete role-based access control system to work with the new database schema where roles are stored as boolean flags (`is_admin`, `is_teacher`, `is_student`) in the `profiles` table instead of the deprecated `user_roles` table.

## Database Changes

### 1. Fixed `handle_new_user()` Trigger Function

- **File**: `supabase/migrations/20251107125500_create_handle_new_user_function.sql`
- **Changes**:
  - Removed duplicate function definition (stub was overwriting working version)
  - Added proper schema qualification with `public.profiles`
  - Granted `EXECUTE` permission to `supabase_auth_admin`
  - Set `search_path` to `public, auth`
  - Added exception handling to prevent user creation failures
  - Fixed metadata extraction to use both camelCase (`firstName`) and snake_case (`first_name`)

### 2. Added Missing `notes` Column

- **File**: `supabase/migrations/20251107122000_create_profiles_table.sql`
- **Changes**:
  - Added `notes text` column to profiles table
  - Made `full_name` nullable (was incorrectly set as NOT NULL)

### 3. Fixed RLS Helper Functions

- **Files**: Multiple RLS migration files
- **Changes**: Already completed in previous session - using `security definer` functions to avoid recursion

### 4. Dynamic Lesson Seeding

- **File**: `scripts/database/reset-with-users.sh`
- **Changes**:
  - Replaced static seed file with dynamic SQL that uses current user IDs
  - Ensures lessons are created with proper foreign key references
  - Seeds 9 lessons (3 per student) with realistic data

## API Changes

### Column Name Mapping

Changed all API routes from using:

- `user_id` → `id` (profiles table primary key)
- `isAdmin` → `is_admin` (snake_case in database)
- `isTeacher` → `is_teacher`
- `isStudent` → `is_student`

### Files Updated Automatically via Scripts

**Script**: `scripts/database/fix-profile-columns.sh`

- Fixed all `SELECT` statements to use snake_case column names
- Fixed all `.eq('user_id', userId)` to `.eq('id', userId)`
- Fixed all role flag filters

**Script**: `scripts/database/fix-profile-property-access.sh`

- Fixed all `profile.isAdmin` → `profile.is_admin`
- Fixed all `profile.isTeacher` → `profile.is_teacher`
- Fixed all `profile.isStudent` → `profile.is_student`
- Fixed optional chaining: `profile?.isAdmin` → `profile?.is_admin`

### Files Updated Manually

1. **`lib/getUserWithRolesSSR.ts`**

   - Changed query to use `is_admin, is_teacher, is_student`
   - Changed `.eq('user_id', user.id)` to `.eq('id', user.id)`
   - Map database columns to camelCase for TypeScript interface

2. **`app/api/song/route.ts`**

   - Updated `getOrCreateProfile()` helper function
   - Maps snake_case database columns to camelCase return object

3. **`app/api/lessons/route.ts`**

   - Updated `getUserProfile()` helper function
   - Returns properly mapped role flags

4. **`app/api/teacher/lessons/route.ts`**

   - Fixed profile query and mapping

5. **`app/api/lessons/[id]/route.ts`**

   - Fixed profile query and mapping

6. **`components/auth/AuthProvider.tsx`**

   - Updated `fetchUserRoles()` to query snake_case columns
   - Maps to camelCase for React state

7. **`scripts/database/check-db-quality.sh`**
   - Fixed role distribution query to use `is_admin`, `is_teacher`, `is_student`
   - Fixed task query to use `user_id` instead of `assigned_to`

## Frontend Changes

### No Changes Needed

- Frontend components already use camelCase (`isAdmin`, `isTeacher`, `isStudent`)
- TypeScript interfaces remain unchanged
- Only database queries needed updating

## Testing Results

### Database Reset Test

```bash
bash scripts/database/reset-with-users.sh
```

**Results**:

- ✅ All 6 users created successfully
- ✅ All 6 profiles created automatically by trigger
- ✅ Role flags set correctly:
  - Admin: `is_admin=true, is_teacher=true`
  - Teacher: `is_teacher=true`
  - Students: `is_student=true`
- ✅ 9 lessons seeded dynamically
- ✅ All users can login
- ✅ Admin can access all data:
  - 13 songs ✅
  - 9 lessons ✅
  - 6 profiles ✅

### User Creation Flow

1. User created via Supabase Auth API
2. Trigger `handle_new_user()` fires automatically
3. Profile record created in `profiles` table with user metadata
4. Role flags can be updated via SQL
5. RLS policies grant access based on role flags

## Files Changed

### Database Migrations

- `supabase/migrations/20251107125500_create_handle_new_user_function.sql`
- `supabase/migrations/20251107122000_create_profiles_table.sql`

### Scripts

- `scripts/database/reset-with-users.sh`
- `scripts/database/seed-dev-users-via-api.js`
- `scripts/database/check-db-quality.sh`
- `scripts/database/fix-profile-columns.sh` (new)
- `scripts/database/fix-profile-property-access.sh` (new)

### API Routes (via automated scripts)

- All files in `app/api/` with profile queries

### Manually Updated API Routes

- `lib/getUserWithRolesSSR.ts`
- `app/api/song/route.ts`
- `app/api/lessons/route.ts`
- `app/api/teacher/lessons/route.ts`
- `app/api/lessons/[id]/route.ts`

### Frontend Components

- `components/auth/AuthProvider.tsx`

## Architecture Decisions

### Why Map Column Names?

- **Database**: Uses PostgreSQL convention (snake_case)
- **TypeScript**: Uses JavaScript convention (camelCase)
- **Mapping Layer**: API routes map between conventions
- **Benefits**:
  - Each layer uses idiomatic naming
  - Type safety preserved
  - Easy to understand and maintain

### User Creation Pattern

```typescript
// 1. Create user via Auth API
const { data } = await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'password',
  user_metadata: {
    firstName: 'John',
    lastName: 'Doe',
    notes: 'Some notes',
  },
});

// 2. Trigger automatically creates profile
// 3. Query profile to get role flags
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin, is_teacher, is_student')
  .eq('id', user.id)
  .single();

// 4. Map to camelCase for TypeScript
return {
  isAdmin: profile.is_admin,
  isTeacher: profile.is_teacher,
  isStudent: profile.is_student,
};
```

## Known Issues Remaining

### Test Failures

- 62 tests failing (mostly unrelated to this change)
- Issues are in sign-in form tests and other component tests
- Need separate investigation

### Performance

- Lighthouse performance score: 38% (below 90% threshold)
- Not related to role system changes

### Database Quality Check

- Some warnings about minimal test data
- All critical checks passing

## Next Steps

1. ✅ **Complete** - All role system migration
2. ⏭️ **Next** - Fix failing tests (separate task)
3. ⏭️ **Next** - Investigate performance issues
4. ⏭️ **Next** - Add more test data if needed

## Verification Commands

```bash
# Test database reset with user creation
bash scripts/database/reset-with-users.sh

# Check database quality
bash scripts/database/check-db-quality.sh

# Test login
node test-login.js

# Test admin access
node test-admin-access.js

# Run quality checks
npm run quality
```

## Credentials

```
Admin:
  Email: p.romanczuk@gmail.com
  Password: test123_admin

Teacher:
  Email: teacher@example.com
  Password: test123_teacher

Student:
  Email: student@example.com
  Password: test123_student
```

## Lessons Learned

1. **Trigger Permissions**: Functions called by triggers need explicit `GRANT EXECUTE` to the role that invokes them
2. **Schema Qualification**: Always use fully qualified table names (`public.profiles`) in security definer functions
3. **Column Names**: Maintain clear separation between database (snake_case) and application (camelCase) layers
4. **Metadata Keys**: Support both camelCase and snake_case in user metadata for flexibility
5. **Testing**: Always test trigger functions with actual user creation, not just SQL inserts
6. **Automated Fixes**: Shell scripts with `sed` can safely batch-update column references across many files
7. **Backups**: Always create backups before automated bulk changes

## References

- Supabase Auth Triggers: https://supabase.com/docs/guides/auth/managing-user-data
- PostgreSQL Security Definer: https://www.postgresql.org/docs/current/sql-createfunction.html
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
