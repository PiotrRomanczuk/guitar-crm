'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SongInputSchema, Song } from '@/schemas/SongSchema';
import { ZodError } from 'zod';
import SongFormFields from './SongForm.Fields';

interface Props {
	mode: 'create' | 'edit';
	song?: Song;
	onSuccess?: () => void;
}

export default function SongFormContent({ mode, song, onSuccess }: Props) {
	const [formData, setFormData] = useState({
		title: song?.title || '',
		author: song?.author || '',
		level: song?.level || ('beginner' as const),
		key: song?.key || ('C' as const),
		ultimate_guitar_link: song?.ultimate_guitar_link || '',
		chords: song?.chords || '',
		short_title: song?.short_title || '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field on change
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setSubmitError(null);
		setIsSubmitting(true);

		try {
			// Validate form data
			const validatedData = SongInputSchema.parse(formData);

			if (mode === 'create') {
				const { error } = await supabase.from('songs').insert([validatedData]);

				if (error) {
					setSubmitError('Failed to save song');
					return;
				}
			} else if (song?.id) {
				const { error } = await supabase
					.from('songs')
					.update(validatedData)
					.eq('id', song.id);

				if (error) {
					setSubmitError('Failed to save song');
					return;
				}
			}

			onSuccess?.();
		} catch (err) {
			if (err instanceof ZodError) {
				const fieldErrors: Record<string, string> = {};
				err.errors.forEach((error) => {
					const field = error.path[0] as string;
					fieldErrors[field] = error.message;
				});
				setErrors(fieldErrors);
			} else {
				setSubmitError('Failed to save song');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{submitError && (
				<div className='p-4 bg-red-50 border border-red-200 text-red-700 rounded'>
					{submitError}
				</div>
			)}

			<SongFormFields
				formData={formData}
				errors={errors}
				onChange={handleChange}
			/>

			<button
				type='submit'
				disabled={isSubmitting}
				className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400'
			>
				{isSubmitting ? 'Saving...' : 'Save song'}
			</button>
		</form>
	);
}
