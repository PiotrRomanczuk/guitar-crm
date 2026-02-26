import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '@/components/settings/useSettings';
import { QueryWrapper } from '@/lib/testing/query-client-test-utils';
import type { User } from '@supabase/supabase-js';
import type { UserSettings } from '@/schemas/SettingsSchema';

const mockUser: Partial<User> = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  pushNotifications: false,
  lessonReminders: true,
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  profileVisibility: 'public',
  showEmail: false,
  showLastSeen: true,
};

// Mock the server actions
const mockGetUserSettings = jest.fn();
const mockSaveUserSettings = jest.fn();

jest.mock('@/app/actions/settings', () => ({
  getUserSettings: (...args: unknown[]) => mockGetUserSettings(...args),
  saveUserSettings: (...args: unknown[]) => mockSaveUserSettings(...args),
}));

// Mock the useAuth hook
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
    jest.clearAllMocks();
    mockGetUserSettings.mockResolvedValue({
      success: true,
      settings: DEFAULT_SETTINGS,
    });
    mockSaveUserSettings.mockResolvedValue({
      success: true,
      settings: DEFAULT_SETTINGS,
    });
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

  it('should save settings via server action', async () => {
    mockSaveUserSettings.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('theme', 'dark');
    });

    await act(async () => {
      result.current.saveSettings();
    });

    await waitFor(() => expect(result.current.hasChanges).toBe(false));
    expect(mockSaveUserSettings).toHaveBeenCalled();
  });

  it('should load settings from server action', async () => {
    const savedSettings: UserSettings = {
      emailNotifications: false,
      pushNotifications: true,
      theme: 'light',
      language: 'es',
      lessonReminders: true,
      timezone: 'UTC',
      profileVisibility: 'public',
      showEmail: false,
      showLastSeen: true,
    };

    mockGetUserSettings.mockResolvedValue({
      success: true,
      settings: savedSettings,
    });

    const { result } = renderHook(() => useSettings(), { wrapper: QueryWrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings).toMatchObject(savedSettings);
    expect(mockGetUserSettings).toHaveBeenCalledWith('test-user-id');
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

  it('should use initialSettings when provided', async () => {
    const initialSettings: UserSettings = {
      emailNotifications: true,
      pushNotifications: false,
      lessonReminders: true,
      theme: 'dark',
      language: 'pl',
      timezone: 'Europe/Warsaw',
      profileVisibility: 'private',
      showEmail: true,
      showLastSeen: false,
    };

    const { result } = renderHook(() => useSettings(initialSettings), {
      wrapper: QueryWrapper,
    });

    // initialSettings are available immediately, no loading state
    expect(result.current.settings).toMatchObject(initialSettings);
  });
});
