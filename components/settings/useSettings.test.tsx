import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '@/components/settings/useSettings';
import { QueryWrapper } from '@/lib/testing/query-client-test-utils';
import type { User } from '@supabase/supabase-js';

const mockUser: Partial<User> = {
  id: 'test-user-id',
  email: 'test@example.com',
};

// Mock the useAuth hook directly since we don't need the full AuthProvider for this test
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signOut: jest.fn(),
    isAdmin: false,
    isTeacher: false,
    isStudent: false,
  }),
}));

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default settings', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings).toMatchObject({
      emailNotifications: true,
      pushNotifications: false,
      theme: 'system',
      language: 'en',
    });
  });

  it('should update individual settings', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('emailNotifications', false);
    });

    expect(result.current.settings.emailNotifications).toBe(false);
    expect(result.current.hasChanges).toBe(true);
  });

  it('should save settings to localStorage', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('theme', 'dark');
    });

    await act(async () => {
      result.current.saveSettings();
    });

    await waitFor(() => expect(result.current.hasChanges).toBe(false));

    const stored = localStorage.getItem(`settings_${mockUser.id}`);
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.theme).toBe('dark');
  });

  it('should load settings from localStorage', async () => {
    const savedSettings = {
      emailNotifications: false,
      pushNotifications: true,
      theme: 'light' as const,
      language: 'es' as const,
      lessonReminders: true,
      timezone: 'UTC',
      profileVisibility: 'public' as const,
      showEmail: false,
      showLastSeen: true,
    };

    localStorage.setItem(`settings_${mockUser.id}`, JSON.stringify(savedSettings));

    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings).toMatchObject(savedSettings);
  });

  it('should reset settings to defaults', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('theme', 'dark');
    });

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings.theme).toBe('system');
    expect(result.current.hasChanges).toBe(true);
  });
});
