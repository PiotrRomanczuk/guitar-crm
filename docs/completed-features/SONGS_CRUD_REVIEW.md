# Songs CRUD: Compliance Review & Action Items

## ✅ What's Working Well

### API Layer

- ✅ Separation of concerns with `handlers.ts`
- ✅ Proper Zod validation in handlers
- ✅ Comprehensive error handling
- ✅ Role-based access control logic

### Schemas

- ✅ Comprehensive schema coverage (SongSchema.ts)
- ✅ Multiple schema variants (Input, Update, Filter, etc.)
- ✅ Proper type exports

### Components

- ✅ Good component decomposition (List.Header, List.Table, etc.)
- ✅ Uses `useAuth` hook for role checking
- ✅ Mobile-first design principles

---

## ⚠️ Issues to Fix

### 1. **CRITICAL: student-songs Route Logic Error**

**File:** `/app/api/song/student-songs/route.ts`

**Problem:** The route uses RPC function `get_songs_by_user` and complex nested queries that may not work correctly.

**Fix:**

```typescript
// Current (incorrect):
const { data: userSongsID } = await supabase.rpc('get_songs_by_user', {
	p_user_id: userId,
});

// Should be (correct):
const { data: lessonSongs } = await supabase
	.from('lesson_songs')
	.select('song_id, status, lesson:lessons!inner(student_id)')
	.eq('lesson.student_id', userId);

const songIds = [...new Set(lessonSongs.map((ls) => ls.song_id))];
const { data: songs } = await supabase
	.from('songs')
	.select('*')
	.in('id', songIds);
```

**Action:** Replace current implementation with correct query pattern
**Priority:** HIGH
**Estimated Time:** 15 minutes

---

### 2. **Authentication Pattern Inconsistency**

**Files:** `/app/api/song/*.ts`

**Problem:** Mixed use of authentication patterns:

- Main route uses: `const supabase = await createClient()`
- Student route uses: `const supabase = await createClient()` with headers
- Should standardize on: `createClient(headers())`

**Fix:**

```typescript
// Standardize all routes to:
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
	const headersList = headers();
	const supabase = createClient(headersList);
	// ...
}
```

**Action:** Update all API routes to use consistent pattern
**Priority:** MEDIUM
**Estimated Time:** 20 minutes

---

### 3. **Missing Refresh Functionality**

**File:** `/components/songs/useSongList.ts`

**Problem:** Hook doesn't expose a refresh function, making it hard to reload data after mutations.

**Fix:**

```typescript
// Add to return value:
return {
	songs,
	loading,
	error,
	filterLevel,
	setFilterLevel,
	refresh: loadSongs, // ← Add this
};
```

**Action:** Add refresh function to hook
**Priority:** MEDIUM
**Estimated Time:** 5 minutes

---

### 4. **Profile Creation Logic**

**File:** `/app/api/song/route.ts`

**Problem:** `getOrCreateProfile` helper creates profiles on-the-fly, which should be handled during sign-up instead.

**Current Approach:**

```typescript
async function getOrCreateProfile(supabase, userId, email) {
	// Creates profile if missing
}
```

**Better Approach:**

- Profiles should be created by database trigger on auth.users insert
- API should only fetch existing profiles
- Return 404 if profile doesn't exist

**Fix:**

```typescript
// Simplify to:
const { data: profile, error } = await supabase
	.from('profiles')
	.select('is_admin, is_teacher, is_student')
	.eq('user_id', user.id)
	.single();

if (error || !profile) {
	return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
}
```

**Action:** Remove auto-creation logic, add database trigger
**Priority:** MEDIUM
**Estimated Time:** 30 minutes (including migration)

---

### 5. **Type Safety Issues**

**Files:** Multiple handlers and routes

**Problem:** Using `any` types in several places:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
supabase: any;
```

**Fix:** Create proper Supabase client type:

```typescript
// lib/supabase.ts
import { createClient } from '@/utils/supabase/server';

export type SupabaseClient = ReturnType<typeof createClient>;

// Then use:
export async function getSongsHandler(
	supabase: SupabaseClient
	// ...
);
```

**Action:** Replace `any` with proper types
**Priority:** LOW
**Estimated Time:** 15 minutes

---

### 6. **Error UI Improvements**

**Files:** `/components/songs/SongList.tsx` and related

**Problem:** Simple error display without retry option:

```typescript
if (error) return <div className='text-red-500'>Error: {error}</div>;
```

**Fix:** Add proper error component with retry:

```typescript
if (error) {
	return (
		<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
			<h3 className='text-red-800 font-semibold'>Error Loading Songs</h3>
			<p className='text-red-600'>{error}</p>
			<button onClick={refresh} className='btn-secondary mt-2'>
				Try Again
			</button>
		</div>
	);
}
```

**Action:** Create reusable ErrorDisplay component
**Priority:** LOW
**Estimated Time:** 20 minutes

---

### 7. **Loading State Improvements**

**Files:** `/components/songs/SongList.tsx`

**Problem:** Basic loading text without skeleton UI:

```typescript
if (loading) return <div>Loading...</div>;
```

**Fix:** Add skeleton loader:

```typescript
if (loading) {
	return (
		<div className='space-y-4'>
			{[1, 2, 3].map((i) => (
				<div key={i} className='animate-pulse bg-gray-200 h-20 rounded-lg' />
			))}
		</div>
	);
}
```

**Action:** Create reusable Skeleton components
**Priority:** LOW
**Estimated Time:** 15 minutes

---

## 📋 Action Plan (Priority Order)

### Sprint 1: Critical Fixes (50 min)

1. Fix student-songs route query logic (15 min)
2. Standardize authentication pattern (20 min)
3. Add refresh functionality to hook (5 min)
4. Remove auto-profile creation (10 min)

### Sprint 2: Type Safety (15 min)

5. Replace `any` types with proper types (15 min)

### Sprint 3: UX Improvements (35 min)

6. Improve error UI with retry (20 min)
7. Add skeleton loading states (15 min)

**Total Estimated Time: 100 minutes (1h 40min)**

---

## 🧪 Testing Requirements

After fixes, ensure:

- [ ] Student can load only their assigned songs
- [ ] Teacher can load all songs
- [ ] Admin can load all songs
- [ ] Filters work correctly
- [ ] Refresh works after mutations
- [ ] Error states show properly with retry
- [ ] Loading states use skeletons
- [ ] All TypeScript types are correct
- [ ] No ESLint warnings

---

## 📝 Implementation Order

```bash
# 1. Fix student-songs route
git checkout -b fix/student-songs-query
# Make changes
npm run quality
git commit -m "fix: correct student-songs query logic"

# 2. Standardize auth pattern
# Make changes
npm run quality
git commit -m "refactor: standardize auth pattern in API routes"

# 3. Add refresh to hook
# Make changes
npm run quality
git commit -m "feat: add refresh function to useSongList"

# 4. Remove auto-profile creation
# Make migration + changes
npm run quality
git commit -m "refactor: remove auto-profile creation logic"

# 5. Type safety
# Make changes
npm run quality
git commit -m "refactor: replace any types with proper SupabaseClient type"

# 6. UX improvements
# Make changes
npm run quality
git commit -m "feat: improve error and loading UI"

git push origin fix/student-songs-query
```

---

## 📚 References

- [CRUD Standards](./CRUD_STANDARDS.md) - Full implementation guide
- [Quick Reference](./CRUD_QUICK_REFERENCE.md) - Copy-paste templates
- [TDD Guide](./TDD_GUIDE.md) - Testing patterns
