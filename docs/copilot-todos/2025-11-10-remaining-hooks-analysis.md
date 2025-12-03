# Remaining Hooks Analysis - TanStack Query Migration

**Date:** November 10, 2025  
**Status:** Complete analysis of remaining data-fetching hooks  
**Total Hooks Analyzed:** 12 (6 migrated, 5 candidates for migration, 1 form-only hook)

## Summary

After comprehensive analysis of all custom hooks in the project, 6 hooks have been successfully migrated to TanStack Query in phases 1-2. This document identifies 5 additional hooks as candidates for migration, prioritized by usage frequency and complexity.

---

## Already Migrated (Phase 1-2) ✅

| Hook | Location | Pattern | Lines | Status |
|------|----------|---------|-------|--------|
| useUsersList | components/users/ | useQuery + filtering | 50 | ✅ |
| useProfiles | components/lessons/ | useQuery + client-side filter | 30 | ✅ |
| useSongList | components/songs/hooks/ | useQuery + conditional fetch | 35 | ✅ |
| useProfileData | components/profile/ | useQuery + useMutation | 85 | ✅ |
| useSettings | components/settings/ | useQuery + localStorage | 43 | ✅ |
| useLessonList | components/lessons/ | useQuery + status filter | 37 | ✅ |

---

## Identified Candidates for Migration

### Priority 1: High Impact (Most Used)

#### 1. **`useSong`** - Single Song Fetching Hook
- **Location:** `components/songs/hooks/useSong.ts`
- **Current Pattern:** useState/useEffect
- **Lines:** ~50 lines
- **Usage:** Fetch single song by ID with delete mutation
- **Key Features:**
  - Loads song from Supabase by ID
  - Implements deleteSong mutation
  - Returns: song, loading, error, deleting, deleteSong()
- **Migration Impact:** Moderate (single query + one mutation)
- **Complexity:** Medium
- **Estimated Effort:** 45 min
- **Benefits:**
  - Enable caching of individual songs (improves detail page performance)
  - Centralized delete logic
  - Better error handling for mutations

**Current Implementation:**
```typescript
const [song, setSong] = useState<Song | undefined>(undefined);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

useEffect(() => {
  async function loadSong() { /* fetch from supabase */ }
  loadSong();
}, [songId]);

const deleteSong = async (songId: string) => { /* delete logic */ }
```

---

#### 2. **`useSongDetail`** - Song Detail with Delete
- **Location:** `components/songs/SongDetail/useSongDetail.ts`
- **Current Pattern:** useState/useEffect + useCallback
- **Lines:** ~80 lines
- **Usage:** Detail view with refresh and delete
- **Key Features:**
  - Similar to useSong but with additional refresh logic
  - useCallback for loadSong optimization
  - Handles hydration edge cases
- **Migration Impact:** High (detail pages are frequent)
- **Complexity:** Medium-High
- **Estimated Effort:** 50 min
- **Benefits:**
  - Automatic invalidation on delete
  - Better caching strategy for detail views
  - Shared query key with useSong for consistency

---

#### 3. **`useAdminUsers`** - Admin Dashboard User List
- **Location:** `components/dashboard/admin/hooks/useAdminUsers.ts`
- **Current Pattern:** useState/useEffect + filter state
- **Lines:** ~60 lines
- **Usage:** Admin dashboard displaying paginated user list
- **Key Features:**
  - Fetches users with role/status filtering
  - Supports pagination
  - Initial data hydration from server
- **Migration Impact:** High (admin dashboard critical)
- **Complexity:** High (pagination, filtering)
- **Estimated Effort:** 60 min
- **Benefits:**
  - Automatic pagination caching
  - Shared query key with useUsersList
  - Persistent filter state across navigation

---

### Priority 2: Medium Impact (Form Submission)

#### 4. **`useUserFormState`** - User Form Submission
- **Location:** `components/users/useUserFormState.ts`
- **Current Pattern:** useState + form handling
- **Lines:** ~75 lines
- **Usage:** Create/edit user form with validation and submission
- **Key Features:**
  - Form data management
  - Submission handler
  - Error handling
  - Navigation after success
- **Migration Impact:** Moderate (mutation-focused)
- **Complexity:** Medium (form validation + submission)
- **Estimated Effort:** 60 min
- **Benefits:**
  - Better mutation tracking (pending state)
  - Automatic invalidation of useUsersList
  - Cleaner form state management

**Current Implementation:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    await saveUser(formData, initialData, isEdit);
    router.push('/dashboard/users');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

---

#### 5. **`useLessonForm`** - Lesson Form Submission
- **Location:** `components/lessons/useLessonForm.ts`
- **Current Pattern:** useState + form handling
- **Lines:** ~80 lines
- **Usage:** Create/edit lesson form
- **Key Features:**
  - Form state management
  - Lesson creation/update submission
  - Profile selection for student/teacher
  - Navigation after success
- **Migration Impact:** Moderate (mutation-focused)
- **Complexity:** High (complex form logic)
- **Estimated Effort:** 70 min
- **Benefits:**
  - Automatic useLessonList invalidation on create/update
  - Better error recovery
  - Form state persistence across navigation

---

## Not Migrating (Excluded Hooks)

### `useSignUpLogic` - Authentication-Specific
- **Reason:** Handles Supabase auth directly, not API queries
- **Better Pattern:** Keep as-is or extract into auth service
- **Future:** May be incorporated into auth context improvements

---

## Migration Roadmap

### Phase 3: High Priority Hooks (2-3 hours)
1. **useSong** (45 min) - Immediate value
2. **useSongDetail** (50 min) - Detail page improvements
3. **useAdminUsers** (60 min) - Dashboard critical path

**Total:** ~2.5 hours

### Phase 4: Form Hooks (2 hours)
1. **useUserFormState** (60 min) - User CRUD
2. **useLessonForm** (70 min) - Lesson CRUD

**Total:** ~2 hours

### Phase 5: Mutation Hooks Library
Create centralized hooks for common mutations:
- `useSongMutations` (create, update, delete)
- `useLessonMutations` (create, update, delete)
- `useUserMutations` (create, update, delete, role changes)
- `useAssignmentMutations` (create, update, delete)

---

## Key Implementation Patterns

### Pattern A: Simple Query Hook
```typescript
export function useSong(songId: string) {
  const { data: song, isLoading, error, refetch } = useQuery({
    queryKey: ['songs', songId],
    queryFn: () => apiClient.get<Song>(`/api/song/${songId}`),
    enabled: !!songId,
  });
  
  return { song, loading: isLoading, error, refetch };
}
```

### Pattern B: Query + Mutation Hook
```typescript
export function useSongDetail(songId: string, onDeleted?: () => void) {
  const { data: song, ...query } = useQuery({
    queryKey: ['songs', songId],
    queryFn: () => apiClient.get<Song>(`/api/song/${songId}`),
    enabled: !!songId,
  });
  
  const { mutate: deleteSong, isPending } = useMutation({
    mutationFn: () => apiClient.delete(`/api/song/${songId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      onDeleted?.();
    },
  });
  
  return { song, loading: query.isLoading, error: query.error, deleting: isPending, deleteSong };
}
```

### Pattern C: Form Mutation Hook
```typescript
export function useUserFormMutation(onSuccess?: () => void) {
  const { mutate: submitForm, isPending, error } = useMutation({
    mutationFn: (data: FormData) => 
      apiClient.post('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.();
    },
  });
  
  return { submitForm, loading: isPending, error };
}
```

---

## Query Key Strategy

Maintain consistency across all migrated hooks:

```typescript
// Single item queries
['songs', songId]
['users', userId]
['lessons', lessonId]
['assignments', assignmentId]

// List queries with filters
['songs', { level: 'beginner', key: 'C' }]
['users', { role: 'teacher', active: true }]
['lessons', { status: 'SCHEDULED' }]

// Form mutations (not cached)
// Invalidate parent list after mutation
```

---

## Testing Strategy

For each migrated hook, update/create tests:

1. **Query Tests:**
   - Verify initial loading state
   - Test successful data fetch
   - Test error handling
   - Test refetch functionality

2. **Mutation Tests:**
   - Verify pending state during submission
   - Test successful submission
   - Test error handling
   - Verify query invalidation

3. **Integration Tests:**
   - Test query key updates
   - Verify cache behavior
   - Test stale time handling

---

## Success Metrics

After completing all phases:
- ✅ 11+ hooks migrated to TanStack Query
- ✅ Centralized data fetching patterns
- ✅ Improved caching strategy
- ✅ Better error handling across app
- ✅ ~45% average code reduction per hook
- ✅ 100% test coverage for data layers

---

## Next Steps

1. **Immediate (Today):** Migrate useSong (highest impact)
2. **Short-term (This week):** Migrate useSongDetail + useAdminUsers
3. **Medium-term (Next week):** Migrate form hooks (useUserFormState, useLessonForm)
4. **Long-term (Following week):** Create centralized mutation hooks library

---

## Notes

- All hooks follow the same import/export patterns
- Maintain backward-compatible return interfaces
- Update corresponding tests with QueryWrapper
- Use apiClient for all HTTP requests
- Keep QueryClient reference consistent
- Document any special cases (localStorage, auth, etc.)

