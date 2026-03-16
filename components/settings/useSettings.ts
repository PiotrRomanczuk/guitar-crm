'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { queryClient } from '@/lib/query-client';
import { getUserSettings, saveUserSettings } from '@/app/actions/settings';
import type { UserSettings } from '@/schemas/SettingsSchema';
import { logger } from '@/lib/logger';

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

async function fetchSettingsFromServer(userId: string): Promise<UserSettings> {
  const result = await getUserSettings(userId);
  if (!result.success || !result.settings) {
    logger.error('Failed to fetch settings from server:', result.error);
    return DEFAULT_SETTINGS;
  }
  return result.settings;
}

async function persistSettingsToServer(settings: UserSettings): Promise<void> {
  const result = await saveUserSettings(settings);
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to save settings');
  }
}

export function useSettings(initialSettings?: UserSettings) {
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(
    initialSettings ?? DEFAULT_SETTINGS
  );

  // Fetch settings from database on mount; use server-provided initialData when available
  const { data: settings = initialSettings ?? DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => (user ? fetchSettingsFromServer(user.id) : Promise.resolve(DEFAULT_SETTINGS)),
    enabled: !!user?.id,
    staleTime: Infinity, // Settings don't get stale; only invalidate on save
    initialData: initialSettings,
  });

  // Mutation for saving settings to database
  const { mutate: saveSettings, isPending: saving } = useMutation({
    mutationFn: (data: UserSettings) =>
      user ? persistSettingsToServer(data) : Promise.reject(new Error('No user')),
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
