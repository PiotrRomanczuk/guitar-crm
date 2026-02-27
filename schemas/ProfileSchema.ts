import * as z from 'zod';

// Profile edit schema - for user editing their own profile
export const ProfileEditSchema = z.object({
	firstname: z.string().min(1, 'First name is required').max(100),
	lastname: z.string().min(1, 'Last name is required').max(100),
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(50)
		.optional(),
	bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
	spotifyPlaylistUrl: z
		.string()
		.url('Must be a valid URL')
		.refine((url) => url.startsWith('https://open.spotify.com/'), {
			message: 'Must be a Spotify URL (https://open.spotify.com/...)',
		})
		.optional()
		.or(z.literal('')),
});

export type ProfileEdit = z.infer<typeof ProfileEditSchema>;
