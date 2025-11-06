'use client';

import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { ProfileEditSchema, type ProfileEdit } from '@/schemas/ProfileSchema';

async function loadProfileFromDb(userId: string): Promise<ProfileEdit> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('user_id', userId)
		.single();

	// If no profile exists yet, return empty form
	if (error && error.code === 'PGRST116') {
		return { firstname: '', lastname: '', username: '', bio: '' };
	}

	if (error) throw error;

	return {
		firstname: data.firstname || '',
		lastname: data.lastname || '',
		username: data.username || '',
		bio: data.bio || '',
	};
}

async function saveProfileToDb(userId: string, profileData: ProfileEdit) {
	const validatedData = ProfileEditSchema.parse(profileData);

	const supabase = createClient();
	const { data: existingProfile } = await supabase
		.from('profiles')
		.select('id')
		.eq('user_id', userId)
		.single();

	if (existingProfile) {
		const { error } = await supabase
			.from('profiles')
			.update(validatedData)
			.eq('user_id', userId);
		if (error) throw error;
	} else {
		const { error } = await supabase
			.from('profiles')
			.insert({ user_id: userId, ...validatedData });
		if (error) throw error;
	}
}

export function useProfileData(user: { id: string } | null) {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [formData, setFormData] = useState<ProfileEdit>({
		firstname: '',
		lastname: '',
		username: '',
		bio: '',
	});

	useEffect(() => {
		if (!user) return;

		const loadProfile = async () => {
			try {
				setLoading(true);
				setError(null);
				const profile = await loadProfileFromDb(user.id);
				setFormData(profile);
			} catch (err) {
				console.error('Profile load error:', err);
				setError(err instanceof Error ? err.message : 'Failed to load profile');
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		try {
			setSaving(true);
			setError(null);
			setSuccess(false);

			await saveProfileToDb(user.id, formData);

			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error('Profile save error:', err);
			setError(err instanceof Error ? err.message : 'Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	return {
		user,
		loading,
		saving,
		error,
		success,
		formData,
		setFormData,
		handleSubmit,
	};
}
