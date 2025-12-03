# TanStack Query Integration Guide

**Date**: November 10, 2025  
**Status**: ✅ COMPLETE

## Overview

TanStack Query (React Query) has been installed and integrated into Guitar CRM to centralize data-fetching logic, eliminate manual state management, and improve maintainability across the application.

**Benefits:**
- ✅ Automatic caching and refetching
- ✅ Built-in error handling and retry logic
- ✅ Reduces boilerplate (`useState` + `useEffect`)
- ✅ Improved performance with request deduplication
- ✅ Easy to test with `@tanstack/react-query/testing`

---

## What Was Installed

### Packages
```bash
npm install @tanstack/react-query
```

### Files Created

1. **`lib/query-client.ts`** - QueryClient configuration with sensible defaults
2. **`components/providers/QueryProvider.tsx`** - Wrapper component for App Router
3. **`lib/api-client.ts`** - Centralized API client for all fetch operations
4. **`lib/testing/query-client-test-utils.tsx`** - Testing helpers for React Testing Library

### Files Updated

1. **`app/layout.tsx`** - Wrapped app with `<Providers>` (QueryClientProvider)
2. **`components/users/useUsersList.ts`** - Refactored to use `useQuery()`
3. **`components/lessons/useProfiles.ts`** - Refactored to use `useQuery()`
4. **`components/songs/hooks/useSongList.ts`** - Refactored to use `useQuery()`

---

## Configuration Details

### QueryClient Settings (`lib/query-client.ts`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes cache
      retry: 1,                    // Retry failed requests once
      retryOnMount: true,          // Retry when component remounts
    },
    mutations: {
      retry: 1,                    // Retry failed mutations once
    },
  },
});
```

**Customization:** Adjust these values in `lib/query-client.ts` to match your app's needs.

---

## API Client Usage (`lib/api-client.ts`)

The centralized API client handles all HTTP requests with consistent error handling:

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const users = await apiClient.get<User[]>('/api/users', {
  params: { search: 'john', role: 'teacher' }
});

// POST request
const newUser = await apiClient.post<User>('/api/users', {
  email: 'john@example.com',
  firstName: 'John'
});

// PUT/PATCH/DELETE requests
await apiClient.patch<User>('/api/users/123', { firstName: 'Jane' });
await apiClient.delete<void>('/api/users/123');
```

**Benefits:**
- Automatic error handling (throws on non-2xx status)
- Consistent headers and content-type
- Query parameter building
- Type-safe responses with TypeScript generics

---

## Hook Migration Pattern

### Before (Manual State Management)

```typescript
export function useUsersList(search: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users?search=${search}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search]);

  return { users, loading, error };
}
```

### After (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useUsersList(search: string) {
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      return apiClient.get<User[]>('/api/users', { params: { search } });
    },
  });

  return {
    users,
    loading: isLoading,
    error: error ? error.message : null,
    refetch,
  };
}
```

**Improvements:**
- 40% less code
- Automatic caching by `queryKey`
- No manual state management
- Built-in refetch method
- Better error handling

---

## Creating New Data-Fetching Hooks

### Template for GET Requests

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useMyData(id: string) {
  const { data, isLoading, error, refetch, isError } = useQuery({
    queryKey: ['mydata', id],  // Unique cache key
    queryFn: async () => {
      return apiClient.get<MyDataType>(`/api/mydata/${id}`);
    },
    enabled: !!id,  // Only fetch if id exists
    staleTime: 1000 * 60 * 10,  // Override: keep fresh for 10 min
  });

  return { data, loading: isLoading, error, refetch, isError };
}
```

### Template for Mutations (Create/Update/Delete)

```typescript
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

export function useCreateUser() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (newUser: CreateUserInput) => {
      return apiClient.post<User>('/api/users', newUser);
    },
    onSuccess: (newUser) => {
      // Invalidate related queries to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Optional: show success message
    },
    onError: (error) => {
      // Handle error
      console.error('Failed to create user:', error);
    },
  });

  return { mutate, loading: isPending, error };
}
```

---

## Testing with TanStack Query

### Using Test Utilities

```typescript
import { renderWithClient } from '@/lib/testing/query-client-test-utils';
import { screen, waitFor } from '@testing-library/react';
import { useUsersList } from './useUsersList';

describe('useUsersList', () => {
  it('should fetch users', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', email: 'test@example.com' }],
    });

    function TestComponent() {
      const { users, loading } = useUsersList('');
      return <div>{!loading && users[0]?.email}</div>;
    }

    renderWithClient(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
```

**Key Functions:**
- `renderWithClient()` - Renders component with QueryProvider
- `createTestQueryClient()` - Creates fresh QueryClient for tests
- `QueryWrapper` - Provider component for manual wrapping

---

## Migration Checklist

When refactoring existing hooks to use TanStack Query:

- [ ] Replace `useState` with `useQuery`/`useMutation`
- [ ] Use `apiClient` instead of direct `fetch()`
- [ ] Create proper `queryKey` arrays (e.g., `['users', id, filters]`)
- [ ] Add `enabled` condition if needed
- [ ] Update component return to match old interface (for compatibility)
- [ ] Update tests to use `renderWithClient`
- [ ] Test caching behavior (verify requests aren't duplicated)

---

## Hooks Already Migrated

✅ **`components/users/useUsersList.ts`**
- Uses `useQuery` with search/role/active filters
- Returns: `{ users, loading, error, refetch }`

✅ **`components/lessons/useProfiles.ts`**
- Uses `useQuery` to fetch all profiles
- Filters into students/teachers client-side
- Returns: `{ students, teachers, loading, error }`

✅ **`components/songs/hooks/useSongList.ts`**
- Uses `useQuery` with auth context
- Respects role-based endpoints
- Returns: `{ songs, loading, error, filters, setFilters, refresh }`

---

## Next Steps

### Immediate (Priority: HIGH)
1. **Refactor more hooks** in:
   - `components/profile/useProfileData.ts`
   - `components/auth/` hooks
   - `components/lessons/useLessonList.ts`
   - Any other component with `useState` + `useEffect` for data

2. **Create mutation hooks** for:
   - Creating/updating/deleting songs
   - Creating/updating/deleting lessons
   - Creating/updating users
   - Form submissions

### Medium-term (Priority: MEDIUM)
3. **Add DevTools** for debugging:
   ```bash
   npm install @tanstack/react-query-devtools
   ```

4. **Implement optimistic updates** in mutations for better UX

5. **Add request cancellation** for in-flight requests

### Documentation
6. **Update component tests** as hooks are migrated
7. **Add TypeScript types** for all API responses
8. **Document API contracts** for each endpoint

---

## Troubleshooting

### "Component rendered more than expected"
- **Cause**: QueryProvider not wrapping component in tests
- **Solution**: Use `renderWithClient()` instead of `render()`

### "Query keeps refetching"
- **Cause**: `queryKey` array includes unstable references
- **Solution**: Only include primitive values in `queryKey` arrays

### "Old data appears briefly"
- **Cause**: `staleTime` is too long
- **Solution**: Reduce `staleTime` or call `refetch()` manually

### "Refetch not working"
- **Cause**: Query disabled via `enabled: false`
- **Solution**: Check `enabled` condition is correct

---

## Resources

- **Official Docs**: https://tanstack.com/query/latest
- **Playground**: https://tanstack.com/query/latest/docs/react/examples/simple
- **Migration Guide**: https://tanstack.com/query/latest/docs/react/guides/migrating-to-react-query-5

---

## Summary

TanStack Query is now the standard for data-fetching in Guitar CRM. All new hooks should use it, and existing hooks are gradually being migrated. This provides:

✅ Consistency across the codebase  
✅ Better performance with smart caching  
✅ Reduced code complexity  
✅ Easier testing  
✅ Built-in error handling  

Questions? Check existing implementations in:
- `components/users/useUsersList.ts`
- `components/lessons/useProfiles.ts`
- `components/songs/hooks/useSongList.ts`
