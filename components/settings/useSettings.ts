'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { queryClient } from '@/lib/query-client';
import type { UserSettings } from '@/schemas/SettingsSchema';

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

async function loadSettingsFromStorage(userId: string): Promise<UserSettings> {
  try {
    const stored = localStorage.getItem(`settings_${userId}`);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Failed to load settings from localStorage:', err);
  }
  return DEFAULT_SETTINGS;
}

async function saveSettingsToStorage(userId: string, settings: UserSettings): Promise<void> {
  try {
    localStorage.setItem(`settings_${userId}`, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
    throw err;
  }
}

export function useSettings() {
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Fetch settings from localStorage on mount
  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => (user ? loadSettingsFromStorage(user.id) : Promise.resolve(DEFAULT_SETTINGS)),
    enabled: !!user?.id,
    staleTime: Infinity, // Settings don't get stale; only invalidate on save
  });

  // Mutation for saving settings
  const { mutate: saveSettings, isPending: saving } = useMutation({
    mutationFn: (data: UserSettings) =>
      user ? saveSettingsToStorage(user.id, data) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] });
      setHasChanges(false);
    },
  });

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setCurrentSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    saveSettings(currentSettings);
  };

  const resetSettings = () => {
    setCurrentSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return {
    user,
    loading: isLoading,
    saving,
    settings: hasChanges ? currentSettings : settings,
    hasChanges,
    updateSetting,
    saveSettings: handleSave,
    resetSettings,
  };
}
