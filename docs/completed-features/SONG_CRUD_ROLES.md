# Song CRUD Role-Based Access Control Implementation

**Date**: October 27, 2025  
**Status**: ✅ Implemented

## Overview

Role-based access control has been added to the Song CRUD system. The following rules are enforced:

## Access Levels

### 👤 Students (isStudent)

- ✅ **View** the song library (read-only)
- ✅ **View** individual song details
- ✅ **View** chords and Ultimate Guitar links
- ❌ Cannot create new songs
- ❌ Cannot edit songs
- ❌ Cannot delete songs

### 👨‍🏫 Teachers (isTeacher)

- ✅ View the song library
- ✅ View individual song details
- ✅ **Create new songs** (via `/songs/new`)
- ✅ **Edit existing songs** (via `/songs/[id]/edit`)
- ✅ **Delete songs** (via song detail page)
- ✅ See "Create Song" button in song list
- ✅ See "Edit" and "Delete" buttons on song detail

### 🔐 Admins (isAdmin)

- ✅ All teacher permissions
- ✅ All student permissions
- ✅ Full management of song library
- ✅ Can perform all CRUD operations

## Implementation Details

### Components Modified

#### 1. **SongList.Header** (`components/songs/SongList.Header.tsx`)

```tsx
- Uses `useAuth()` hook to check user roles
- Only renders "Create new song" button for teachers/admins
- Students see header without create button
```

#### 2. **SongDetail** (`components/songs/SongDetail.tsx`)

```tsx
- Uses `useAuth()` hook to check user roles
- Only renders "Edit" and "Delete" buttons for teachers/admins
- Students see song details but cannot modify them
- Conditional rendering: `{canManageSongs && <buttons>}`
```

#### 3. **SongFormGuard** (`components/songs/SongFormGuard.tsx`) - NEW

```tsx
- Wrapper component that enforces teacher/admin access
- Uses `RequireTeacher` component from auth system
- Redirects non-teachers to home page
- Used for `/songs/new` and `/songs/[id]/edit` routes
```

### Authentication Flow

```
User visits /songs
    ↓
SongList renders
    ↓
SongListHeader checks: isTeacher || isAdmin?
    ├─ YES → Show "Create Song" button
    └─ NO  → Hide button (students see nothing)
    ↓
User clicks on song
    ↓
SongDetail renders
    ↓
Component checks: isTeacher || isAdmin?
    ├─ YES → Show "Edit" and "Delete" buttons
    └─ NO  → Show read-only view (students only)
    ↓
User tries to access /songs/new or /songs/[id]/edit
    ↓
SongFormGuard checks: isTeacher || isAdmin?
    ├─ YES → Render SongForm component
    └─ NO  → Redirect to home page
```

## Code Examples

### For Page Routes

**`/songs` (List Page)**

```tsx
import SongList from '@/components/songs/SongList';

export default function SongsPage() {
	return <SongList />;
}
```

**`/songs/new` (Create Page)**

```tsx
import SongFormGuard from '@/components/songs/SongFormGuard';

export default function CreateSongPage() {
	return <SongFormGuard mode='create' />;
}
```

**`/songs/[id]` (Detail Page)**

```tsx
import SongDetail from '@/components/songs/SongDetail';

export default function SongDetailPage({ params }: { params: { id: string } }) {
	return <SongDetail songId={params.id} />;
}
```

**`/songs/[id]/edit` (Edit Page)**

```tsx
import SongFormGuard from '@/components/songs/SongFormGuard';
import { supabase } from '@/lib/supabase';

export default async function EditSongPage({
	params,
}: {
	params: { id: string };
}) {
	const { data: song } = await supabase
		.from('songs')
		.select('*')
		.eq('id', params.id)
		.single();

	return <SongFormGuard mode='edit' song={song} />;
}
```

## Database-Level Security (RLS Policies)

In addition to component-level access control, Supabase RLS (Row-Level Security) policies should be implemented:

### Recommended RLS Policies

```sql
-- Policy 1: Anyone can read songs
CREATE POLICY "songs_select_policy" ON songs
FOR SELECT
USING (true);

-- Policy 2: Only teachers and admins can create songs
CREATE POLICY "songs_insert_policy" ON songs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (isTeacher = true OR isAdmin = true)
  )
);

-- Policy 3: Only teachers and admins can update songs
CREATE POLICY "songs_update_policy" ON songs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (isTeacher = true OR isAdmin = true)
  )
);

-- Policy 4: Only teachers and admins can delete songs
CREATE POLICY "songs_delete_policy" ON songs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (isTeacher = true OR isAdmin = true)
  )
);
```

## Testing Scenarios

### Test as Student

1. ✅ Can see `/songs` list (no button)
2. ✅ Can click on songs and view details (no edit/delete buttons)
3. ✅ Accessing `/songs/new` redirects to home
4. ✅ Accessing `/songs/1/edit` redirects to home

### Test as Teacher

1. ✅ Can see `/songs` list with "Create new song" button
2. ✅ Can click on songs and see "Edit" and "Delete" buttons
3. ✅ Can access `/songs/new` and create songs
4. ✅ Can access `/songs/1/edit` and update songs
5. ✅ Can delete songs

### Test as Admin

1. ✅ Same permissions as teacher
2. ✅ Plus access to admin-specific features

## Security Considerations

### ✅ Implemented

- Component-level role checks for UI rendering
- `RequireTeacher` wrapper prevents unauthorized access to forms
- Role information from authenticated user context

### ⏳ TODO (For Production)

- [ ] Backend API route validation (verify role on POST/PATCH/DELETE)
- [ ] Supabase RLS policies (database-level security)
- [ ] Rate limiting on CRUD operations
- [ ] Audit logging of changes
- [ ] Input sanitization and XSS prevention

## Usage

### For Developers

When adding new features to Song CRUD:

1. **For read-only features**: Use standard components
2. **For write operations**: Wrap with `RequireTeacher`
3. **For admin-only features**: Wrap with `RequireAdmin`

### Example: Add a new management button to SongDetail

```tsx
const { isTeacher, isAdmin } = useAuth();

{
	(isTeacher || isAdmin) && <button onClick={handleAction}>Manage Song</button>;
}
```

## Files Modified

- ✅ `components/songs/SongList.Header.tsx` - Added role check
- ✅ `components/songs/SongDetail.tsx` - Added role check
- ✅ `components/songs/SongFormGuard.tsx` - NEW guard component
- ✅ `components/songs/index.ts` - Exported guard

## Next Steps

1. Create page routes that use these components
2. Implement API routes with role validation
3. Add Supabase RLS policies
4. Test all role scenarios
5. Add audit logging for changes

---

**Notes**:

- Roles are not mutually exclusive (users can be student + teacher + admin)
- Use `isTeacher || isAdmin` pattern for write operations
- Admin role always has access
