# Multiple Roles Per User Implementation

## Summary
This implementation enables users to have multiple roles simultaneously (e.g., admin + teacher, teacher + student, etc.). The database already supported this architecture; the changes enable it fully in the application layer.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20260125150000_enable_multiple_roles.sql`

**What Changed**:
- Updated the `sync_profile_roles()` trigger function
- **Removed** DELETE statements that prevented multiple roles (lines 152, 160, 168 in original)
- **Kept** INSERT statements with `ON CONFLICT DO NOTHING`
- Added comments explaining the new behavior

**Why**:
- The original trigger deleted roles when boolean flags were set to false
- This prevented users from simultaneously having multiple role flags set to true
- The API endpoint (`/api/users/[id]`) already manually manages role deletions
- Removing the DELETE statements from the trigger allows the API to handle roles explicitly

### 2. Code Updates
**File**: `components/users/form/UserFormFields.tsx:79`

**What Changed**:
- Added comment documenting that multiple roles are now supported
- No functional changes (checkboxes already supported multi-select)

### 3. What Was Already Working
No code changes were needed for these components - they already supported multiple roles:

- **UI Component** (`components/users/form/UserFormFields.tsx:79-128`):
  - Uses checkboxes for all three roles (not radio buttons)
  - Already supports selecting multiple roles simultaneously

- **Role Display** (`components/users/list/UsersListTable.tsx:37-43`):
  - `getRoleDisplay()` function already joins multiple roles with commas
  - Shows "Admin, Teacher" when user has both roles

- **API Endpoint** (`app/api/users/[id]/route.ts:76-91`):
  - Already deletes all existing roles and re-inserts selected ones
  - Already supports multiple roles in role assignment

- **Role Display** (`components/users/details/UserDetail.tsx:53-59`):
  - Shows role badges that already support multiple roles

- **Database Schema** (`user_roles` table):
  - Has `UNIQUE(user_id, role)` constraint supporting multiple roles
  - No schema changes needed

## How It Works

### Before
1. User profile had `is_admin`, `is_teacher`, `is_student` boolean flags
2. Trigger would synchronize flags to `user_roles` table
3. Trigger would **delete** roles when flags were set to false
4. Result: User could only have one role at a time

### After
1. User profile has independent `is_admin`, `is_teacher`, `is_student` boolean flags
2. Trigger synchronizes by **only adding** roles when flags are true
3. API endpoint explicitly handles role deletions
4. Result: User can have any combination of roles

### Role Assignment Flow
```
Admin edits user → Checkbox selections → Form submission
                    ↓
            API PUT /api/users/[id]
                    ↓
    Update profiles table (boolean flags)
    Delete all existing user_roles
    Re-insert selected roles
                    ↓
    Trigger fires (adds roles again if flags are true)
    Sync complete - user_roles now has all selected roles
```

## Testing Guide

### 1. Apply the Database Migration
```bash
# Restart Supabase local development
npm run setup:db

# Or manually run the migration via Supabase dashboard
```

### 2. Manual UI Testing
1. Start dev server: `npm run dev`
2. Login as admin: `p.romanczuk@gmail.com` / `test123_admin`
3. Navigate to: `/dashboard/users`
4. Click **Edit** on any user
5. Select multiple role checkboxes (e.g., ✓Admin, ✓Teacher)
6. Save the user
7. Verify:
   - User profile shows all selected roles as badges
   - Can see "Admin, Teacher" in the role column

### 3. Database Verification
```bash
# Start Supabase console
npm run setup:db

# Then use SQL to verify:
# SELECT user_id, role FROM user_roles WHERE user_id = '<test-user-id>' ORDER BY role;
# Should show multiple rows for same user with different roles

# Or use the inspect tool:
npm run db:inspect
```

### 4. Verify Role-Based Features
- **Admin Panel Access**: User with admin role can access `/dashboard/users`
- **Teacher Dashboard**: User with teacher role can access teacher features
- **Student Portal**: User with student role can access student features
- **Multi-Role**: User with admin+teacher can access both dashboards

### 5. Run Tests
```bash
# Unit tests
npm test -- users

# E2E tests
npm run cypress:run

# Specific user tests
npm test -- components/users
```

## Database View Impact

The `user_overview` view automatically handles multiple roles:
```sql
SELECT
    ...
    bool_or(ur.role = 'admin') AS is_admin,
    bool_or(ur.role = 'teacher') AS is_teacher,
    bool_or(ur.role = 'student') AS is_student
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
GROUP BY ...
```

This view derives role flags from `user_roles` table, so multiple roles are correctly aggregated.

## RLS Policies
No RLS policy changes needed. Existing policies work correctly:
- `is_admin()` function: Returns true if user has admin role (works with multiple roles)
- `is_teacher()` function: Returns true if user has teacher role
- `is_student()` function: Returns true if user has student role
- All other role-checking functions continue to work

## Migration Rollback (if needed)
If you need to revert to single-role support:
```sql
CREATE OR REPLACE FUNCTION sync_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Restore original logic with DELETE statements
  IF NEW.is_admin = true THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM user_roles WHERE user_id = NEW.id AND role = 'admin';
  END IF;
  -- ... etc for teacher and student
END;
```

## Backward Compatibility
✅ **Fully Backward Compatible**
- Existing users with single roles continue to work
- Existing role-checking logic unchanged
- No breaking changes to API or database structure
- Profiles table remains as-is (denormalized cache)
- Boolean flags remain independent and toggleable

## Example Scenarios

### Scenario 1: Admin who teaches
1. Create user "Alice"
2. Check boxes: ✓Admin, ✓Teacher
3. Alice can now:
   - Access admin dashboard
   - Create lessons as a teacher
   - See admin overview

### Scenario 2: Teacher who is also a student
1. Create user "Bob"
2. Check boxes: ✓Teacher, ✓Student
3. Bob can now:
   - Upload assignments (as teacher)
   - Submit lessons (as student)
   - Access both teacher and student dashboards

### Scenario 3: Full access user
1. Create user "Charlie"
2. Check boxes: ✓Admin, ✓Teacher, ✓Student
3. Charlie can:
   - Manage all users (admin)
   - Create lessons (teacher)
   - View lessons (student)
   - Access all dashboards

## Files Modified
- `supabase/migrations/20260125150000_enable_multiple_roles.sql` (NEW)
- `components/users/form/UserFormFields.tsx` (comment added)

## Files Already Supporting Multiple Roles (No Changes Needed)
- `components/users/form/UserForm.tsx`
- `components/users/form/hooks/useUserFormState.ts`
- `components/users/list/UsersListTable.tsx`
- `components/users/details/UserDetail.tsx`
- `app/api/users/[id]/route.ts`
- `app/api/users/route.ts`
- `lib/getUserWithRolesSSR.ts`
- All RLS policy functions
- `user_overview` database view

## Notes
- The `inviteUser` action in `app/dashboard/actions.ts` still accepts a single role for initial invite. Users can be assigned multiple roles after creation via the user edit page.
- To assign multiple roles during invite, a future enhancement could update the `inviteUser` function to accept an array of roles.
- The implementation maintains data consistency by having the API explicitly manage role deletions while the trigger handles additions.
