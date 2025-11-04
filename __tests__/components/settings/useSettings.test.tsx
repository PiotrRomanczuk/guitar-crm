import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '@/components/settings/useSettings';
import { AuthProvider } from '@/components/auth/AuthProvider';
import type { User } from '@supabase/supabase-js';

const mockUser: Partial<User> = {
	id: 'test-user-id',
	email: 'test@example.com',
};

jest.mock('@/components/auth/AuthProvider', () => ({
	...jest.requireActual('@/components/auth/AuthProvider'),
	useAuth: () => ({
		user: mockUser,
		loading: false,
		signOut: jest.fn(),
		isAdmin: false,
		isTeacher: false,
		isStudent: false,
	}),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<AuthProvider>{children}</AuthProvider>
);

describe('useSettings', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('should initialize with default settings', async () => {
		const { result } = renderHook(() => useSettings(), { wrapper });

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.settings).toMatchObject({
			emailNotifications: true,
			pushNotifications: false,
			theme: 'system',
			language: 'en',
		});
	});

	it('should update individual settings', async () => {
		const { result } = renderHook(() => useSettings(), { wrapper });

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => {
			result.current.updateSetting('emailNotifications', false);
		});

		expect(result.current.settings.emailNotifications).toBe(false);
		expect(result.current.hasChanges).toBe(true);
	});

	it('should save settings to localStorage', async () => {
		const { result } = renderHook(() => useSettings(), { wrapper });

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => {
			result.current.updateSetting('theme', 'dark');
		});

		await act(async () => {
			await result.current.saveSettings();
		});

		const stored = localStorage.getItem(`settings_${mockUser.id}`);
		expect(stored).toBeTruthy();

		const parsed = JSON.parse(stored!);
		expect(parsed.theme).toBe('dark');
		expect(result.current.hasChanges).toBe(false);
	});

	it('should load settings from localStorage', async () => {
		const savedSettings = {
			emailNotifications: false,
			pushNotifications: true,
			theme: 'light',
			language: 'es',
		};

		localStorage.setItem(
			`settings_${mockUser.id}`,
			JSON.stringify(savedSettings)
		);

		const { result } = renderHook(() => useSettings(), { wrapper });

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.settings).toMatchObject(savedSettings);
	});

	it('should reset settings to defaults', async () => {
		const { result } = renderHook(() => useSettings(), { wrapper });

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
