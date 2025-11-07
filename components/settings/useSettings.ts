'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
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

export function useSettings() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (!user) return;

		// Load settings from localStorage for now
		// TODO: Move to database table in future
		const loadSettings = () => {
			try {
				setLoading(true);
				const stored = localStorage.getItem(`settings_${user.id}`);
				if (stored) {
					setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
				}
			} catch (err) {
				console.error('Failed to load settings:', err);
			} finally {
				setLoading(false);
			}
		};

		loadSettings();
	}, [user]);

	const updateSetting = <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K]
	) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		setHasChanges(true);
	};

	const saveSettings = async () => {
		if (!user) return;

		try {
			setSaving(true);
			// Save to localStorage for now
			// TODO: Save to database table in future
			localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
			setHasChanges(false);
		} catch (err) {
			console.error('Failed to save settings:', err);
			throw err;
		} finally {
			setSaving(false);
		}
	};

	const resetSettings = () => {
		setSettings(DEFAULT_SETTINGS);
		setHasChanges(true);
	};

	return {
		user,
		loading,
		saving,
		settings,
		hasChanges,
		updateSetting,
		saveSettings,
		resetSettings,
	};
}
