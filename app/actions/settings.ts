'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserSettings } from '@/schemas/SettingsSchema';

/**
 * Database row shape for user_settings (snake_case columns).
 */
interface UserSettingsRow {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  timezone: string;
  profile_visibility: string;
  show_email: boolean;
  show_last_seen: boolean;
  font_scheme: string;
  created_at: string;
  updated_at: string;
}

interface ActionResult<T = void> {
  success: boolean;
  settings?: T;
  error?: string;
}

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

/**
 * Convert a database row (snake_case) to the client UserSettings shape (camelCase).
 * Notification fields are not stored in the DB yet, so they get defaults.
 */
function rowToSettings(row: UserSettingsRow): UserSettings {
  return {
    emailNotifications: DEFAULT_SETTINGS.emailNotifications,
    pushNotifications: DEFAULT_SETTINGS.pushNotifications,
    lessonReminders: DEFAULT_SETTINGS.lessonReminders,
    theme: row.theme as UserSettings['theme'],
    language: row.language as UserSettings['language'],
    timezone: row.timezone,
    profileVisibility: row.profile_visibility as UserSettings['profileVisibility'],
    showEmail: row.show_email,
    showLastSeen: row.show_last_seen,
  };
}

/**
 * Fetch user settings from the database.
 * Returns default settings if none are found.
 */
export async function getUserSettings(
  userId: string
): Promise<ActionResult<UserSettings>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (user.id !== userId) {
    return { success: false, error: 'Unauthorized: Cannot access other user settings' };
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('id, user_id, theme, language, timezone, profile_visibility, show_email, show_last_seen, font_scheme, created_at, updated_at')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "no rows returned" which is expected for new users
    console.error('Error fetching user settings:', error);
    return { success: false, error: 'Failed to fetch user settings' };
  }

  if (!data) {
    return { success: true, settings: DEFAULT_SETTINGS };
  }

  return { success: true, settings: rowToSettings(data as UserSettingsRow) };
}

/**
 * Upsert user settings to the database.
 * Creates a new row if one does not exist, otherwise updates the existing row.
 */
export async function saveUserSettings(
  settings: UserSettings
): Promise<ActionResult<UserSettings>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        profile_visibility: settings.profileVisibility,
        show_email: settings.showEmail,
        show_last_seen: settings.showLastSeen,
      },
      { onConflict: 'user_id' }
    )
    .select('id, user_id, theme, language, timezone, profile_visibility, show_email, show_last_seen, font_scheme, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error saving user settings:', error);
    return { success: false, error: 'Failed to save user settings' };
  }

  revalidatePath('/dashboard/settings');

  return { success: true, settings: rowToSettings(data as UserSettingsRow) };
}
