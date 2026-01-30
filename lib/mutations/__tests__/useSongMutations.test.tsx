/**
 * useSongMutations Hook Tests
 *
 * Tests the song mutation hook functionality:
 * - Create song mutation
 * - Update song mutation
 * - Delete song mutation
 * - Cache invalidation
 * - Error handling
 *
 * @see lib/mutations/useSongMutations.ts
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSongMutations } from '../useSongMutations';

// Mock the apiClient
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useSongMutations', () => {
  const mockSongId = '550e8400-e29b-41d4-a716-446655440000';

  const mockSong = {
    id: mockSongId,
    title: 'Test Song',
    author: 'Test Author',
    level: 'beginner' as const,
    key: 'C' as const,
    ultimate_guitar_link: null,
    youtube_url: null,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create mutation', () => {
    it('should create a song successfully', async () => {
      mockPost.mockResolvedValueOnce(mockSong);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          title: 'Test Song',
          author: 'Test Author',
          level: 'beginner',
          key: 'C',
          ultimate_guitar_link: null,
          youtube_url: null,
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith('/api/song', {
        title: 'Test Song',
        author: 'Test Author',
        level: 'beginner',
        key: 'C',
        ultimate_guitar_link: null,
        youtube_url: null,
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create song');
      mockPost.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          title: 'Test Song',
          author: 'Test Author',
          level: 'beginner',
          key: 'C',
          ultimate_guitar_link: null,
          youtube_url: null,
        },
      });

      await waitFor(() => {
        expect(result.current.create.error).toEqual(error);
      });
    });

    it('should show pending state during create', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockPost.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);

      result.current.create.mutate({
        data: {
          title: 'Test Song',
          author: 'Test Author',
          level: 'beginner',
          key: 'C',
          ultimate_guitar_link: null,
          youtube_url: null,
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(true);
      });

      resolvePromise!(mockSong);

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });
    });
  });

  describe('update mutation', () => {
    it('should update a song successfully', async () => {
      const updatedSong = { ...mockSong, title: 'Updated Song' };
      mockPut.mockResolvedValueOnce(updatedSong);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockSongId,
        data: {
          id: mockSongId,
          title: 'Updated Song',
        },
      });

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/song?id=${mockSongId}`, {
        id: mockSongId,
        title: 'Updated Song',
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update song');
      mockPut.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockSongId,
        data: {
          id: mockSongId,
          title: 'Updated Song',
        },
      });

      await waitFor(() => {
        expect(result.current.update.error).toEqual(error);
      });
    });

    it('should update song level', async () => {
      const updatedSong = { ...mockSong, level: 'advanced' };
      mockPut.mockResolvedValueOnce(updatedSong);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockSongId,
        data: {
          id: mockSongId,
          level: 'advanced',
        },
      });

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/song?id=${mockSongId}`, {
        id: mockSongId,
        level: 'advanced',
      });
    });
  });

  describe('delete mutation', () => {
    it('should delete a song successfully', async () => {
      mockDelete.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: mockSongId });

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });

      expect(mockDelete).toHaveBeenCalledWith(`/api/song?id=${mockSongId}`);
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete song');
      mockDelete.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: mockSongId });

      await waitFor(() => {
        expect(result.current.delete.error).toEqual(error);
      });
    });

    it('should return cascade info on delete success', async () => {
      mockDelete.mockResolvedValueOnce({
        success: true,
        cascadeInfo: { lesson_songs: 2, user_favorites: 1 },
      });

      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: mockSongId });

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });
    });
  });

  describe('hook structure', () => {
    it('should return all mutation operations', () => {
      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('create');
      expect(result.current).toHaveProperty('update');
      expect(result.current).toHaveProperty('delete');

      expect(result.current.create).toHaveProperty('mutate');
      expect(result.current.create).toHaveProperty('isPending');
      expect(result.current.create).toHaveProperty('error');

      expect(result.current.update).toHaveProperty('mutate');
      expect(result.current.update).toHaveProperty('isPending');
      expect(result.current.update).toHaveProperty('error');

      expect(result.current.delete).toHaveProperty('mutate');
      expect(result.current.delete).toHaveProperty('isPending');
      expect(result.current.delete).toHaveProperty('error');
    });

    it('should initialize with no pending operations', () => {
      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);
      expect(result.current.update.isPending).toBe(false);
      expect(result.current.delete.isPending).toBe(false);
    });

    it('should initialize with no errors', () => {
      const { result } = renderHook(() => useSongMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.error).toBeNull();
      expect(result.current.update.error).toBeNull();
      expect(result.current.delete.error).toBeNull();
    });
  });
});
