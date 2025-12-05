'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function resetPassword(email: string) {
	console.log(`[Auth] Password reset requested for email: ${email}`);

	const supabase = await createClient();
	const headersList = await headers();
	const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

	if (!origin) {
		console.error('[Auth] Could not determine origin for password reset redirect');
		return { error: 'Configuration error: Could not determine site origin' };
	}

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/callback?next=/reset-password`,
	});

	if (error) {
		console.error(`[Auth] Password reset failed for ${email}:`, error.message);
		return { error: error.message };
	}

	console.log(`[Auth] Password reset email sent to ${email}`);
	return { success: true };
}
