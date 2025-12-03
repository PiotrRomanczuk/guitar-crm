# TanStack Query + API Client - Quick Reference

**Location**: `/docs/guides/TANSTACK_QUERY_QUICK_REFERENCE.md`

## Quick Start

### Import These

```typescript
// For data fetching
import { useQuery } from '@tanstack/react-query';

// For mutations (create/update/delete)
import { useMutation } from '@tanstack/react-query';

// For invalidating cache
import { queryClient } from '@/lib/query-client';

// For API calls
import { apiClient } from '@/lib/api-client';
```

---

## Common Patterns

### 1. Fetch Data (GET)

```typescript
export function useSongs() {
  return useQuery({
    queryKey: ['songs'],
    queryFn: () => apiClient.get<Song[]>('/api/songs'),
  });
}

// Usage in component
function MyComponent() {
  const { data: songs, isLoading, error } = useSongs();
  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <SongList songs={songs} />;
}
```

### 2. Fetch with Parameters

```typescript
export function useSongs(level?: string, key?: string) {
  return useQuery({
    queryKey: ['songs', level, key],
    queryFn: () => apiClient.get<Song[]>('/api/songs', {
      params: { ...(level && { level }), ...(key && { key }) }
    }),
  });
}
```

### 3. Fetch with Filters (Complex Query Key)

```typescript
export function useSongs(filters: SongFilters) {
  const { level, key, search, page, limit } = filters;
  
  return useQuery({
    queryKey: ['songs', { level, key, search, page, limit }],
    queryFn: () => apiClient.get<SongPage>('/api/songs', { params: filters }),
  });
}
```

### 4. Create Data (Mutation)

```typescript
export function useCreateSong() {
  return useMutation({
    mutationFn: (newSong: CreateSongInput) =>
      apiClient.post<Song>('/api/songs', newSong),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

// Usage in form
function SongForm() {
  const { mutate: createSong, isPending } = useCreateSong();

  const handleSubmit = (data: CreateSongInput) => {
    createSong(data);
  };

  return <form onSubmit={(e) => { 
    e.preventDefault(); 
    handleSubmit(formData); 
  }} />;
}
```

### 5. Update Data (Mutation)

```typescript
export function useUpdateSong(id: string) {
  return useMutation({
    mutationFn: (updates: Partial<Song>) =>
      apiClient.patch<Song>(`/api/songs/${id}`, updates),
    onSuccess: (updatedSong) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['song', id] });
    },
  });
}
```

### 6. Delete Data (Mutation)

```typescript
export function useDeleteSong(id: string) {
  return useMutation({
    mutationFn: () => apiClient.delete(`/api/songs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}
```

### 7. Conditional Fetching

```typescript
export function useSongDetail(id?: string) {
  return useQuery({
    queryKey: ['song', id],
    queryFn: () => apiClient.get<Song>(`/api/songs/${id}`),
    enabled: !!id, // Only fetch if id exists
  });
}
```

### 8. Dependent Queries (Fetch B after A)

```typescript
export function useSongLessons(songId?: string) {
  // First fetch song
  const { data: song } = useSongDetail(songId);
  
  // Then fetch lessons using song data
  return useQuery({
    queryKey: ['songLessons', song?.id],
    queryFn: () => apiClient.get<Lesson[]>(`/api/songs/${song.id}/lessons`),
    enabled: !!song?.id, // Only fetch if song is loaded
  });
}
```

---

## Testing

### Setup

```typescript
import { renderWithClient } from '@/lib/testing/query-client-test-utils';
import { screen, waitFor } from '@testing-library/react';
```

### Test a Hook

```typescript
describe('useSongs', () => {
  it('should fetch songs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', title: 'Song 1' }],
    });

    function TestComponent() {
      const { data: songs } = useSongs();
      return <div>{songs?.map(s => s.title)}</div>;
    }

    renderWithClient(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });
  });
});
```

### Test a Mutation

```typescript
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('useCreateSong', () => {
  it('should create a song', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: '1', title: 'New Song' }),
    });

    function TestComponent() {
      const { mutate } = useCreateSong();
      return (
        <button onClick={() => mutate({ title: 'New Song', ... })}>
          Create
        </button>
      );
    }

    renderWithClient(<TestComponent />);
    
    await userEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/songs', expect.any(Object));
    });
  });
});
```

---

## API Client Methods

### GET

```typescript
// No params
const data = await apiClient.get<Type>('/api/endpoint');

// With params
const data = await apiClient.get<Type>('/api/endpoint', {
  params: { search: 'text', page: 1 }
});
```

### POST

```typescript
const response = await apiClient.post<Type>('/api/endpoint', {
  name: 'value',
  email: 'test@example.com'
});
```

### PATCH

```typescript
const updated = await apiClient.patch<Type>('/api/endpoint/123', {
  name: 'updated'
});
```

### PUT

```typescript
const replaced = await apiClient.put<Type>('/api/endpoint/123', {
  ...fullObject
});
```

### DELETE

```typescript
await apiClient.delete('/api/endpoint/123');
```

---

## QueryClient API

### Invalidate Queries

```typescript
// Invalidate all
queryClient.invalidateQueries();

// Invalidate specific
queryClient.invalidateQueries({ queryKey: ['songs'] });

// Invalidate with partial match
queryClient.invalidateQueries({ 
  queryKey: ['songs'], 
  exact: false 
});
```

### Refetch

```typescript
const { refetch } = useQuery(...);

// Manual refetch
await refetch();

// Refetch all
await queryClient.refetchQueries();
```

### Set Data

```typescript
// Set initial data (optimistic update)
queryClient.setQueryData(['song', id], newSongData);
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Hook called outside QueryProvider" | Wrap test with `renderWithClient()` |
| Infinite refetch loop | Check `queryKey` - use only primitives, avoid functions/objects |
| Old data shows briefly | Reduce `staleTime` in config |
| Refetch not working | Check `enabled` condition isn't `false` |
| Multiple requests for same data | Ensure same `queryKey` is used |

---

## Next Hooks to Migrate

- [ ] `components/profile/useProfileData.ts`
- [ ] `components/auth/useSignUp.ts`
- [ ] `components/auth/useSignIn.ts`
- [ ] `components/lessons/useLessonList.ts`
- [ ] Any other component using `useState` + `useEffect`

---

## Full Example: Song CRUD

```typescript
// hooks/useSongCRUD.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

export function useSongs(filters?: SongFilters) {
  return useQuery({
    queryKey: ['songs', filters],
    queryFn: () => apiClient.get<Song[]>('/api/songs', { params: filters }),
  });
}

export function useSongDetail(id: string) {
  return useQuery({
    queryKey: ['song', id],
    queryFn: () => apiClient.get<Song>(`/api/songs/${id}`),
    enabled: !!id,
  });
}

export function useSongMutations() {
  const create = useMutation({
    mutationFn: (data: CreateSongInput) => 
      apiClient.post<Song>('/api/songs', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['songs'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: UpdateSongInput) =>
      apiClient.patch<Song>(`/api/songs/${id}`, data),
    onSuccess: (song) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.setQueryData(['song', song.id], song);
    },
  });

  const delete_ = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/songs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['songs'] }),
  });

  return { create, update, delete: delete_ };
}
```

```tsx
// Component usage
function SongManager() {
  const { data: songs } = useSongs();
  const { create, update, delete: deleteSong } = useSongMutations();

  return (
    <div>
      <SongList 
        songs={songs}
        onDelete={(id) => deleteSong.mutate(id)}
      />
      <SongForm 
        onSubmit={(data) => create.mutate(data)}
      />
    </div>
  );
}
```

---

## References

- **TanStack Docs**: https://tanstack.com/query/latest
- **API Client**: `lib/api-client.ts`
- **Query Client**: `lib/query-client.ts`
- **Test Utils**: `lib/testing/query-client-test-utils.tsx`
- **Full Integration Guide**: `docs/TANSTACK_QUERY_INTEGRATION.md`
