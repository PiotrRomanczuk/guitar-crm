import * as z from 'zod';

// User preferences/settings schema
export const UserSettingsSchema = z.object({
	// Notification preferences
	emailNotifications: z.boolean().default(true),
	pushNotifications: z.boolean().default(false),
	lessonReminders: z.boolean().default(true),
	
	// Display preferences
	theme: z.enum(['light', 'dark', 'system']).default('system'),
	language: z.enum(['en', 'pl', 'es', 'de', 'fr']).default('en'),
	timezone: z.string().default('UTC'),
	
	// Privacy preferences
	profileVisibility: z.enum(['public', 'private', 'contacts']).default('public'),
	showEmail: z.boolean().default(false),
	showLastSeen: z.boolean().default(true),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const UserSettingsUpdateSchema = UserSettingsSchema.partial();
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>;
