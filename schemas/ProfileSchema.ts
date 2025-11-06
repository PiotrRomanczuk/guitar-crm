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
});

export type ProfileEdit = z.infer<typeof ProfileEditSchema>;
