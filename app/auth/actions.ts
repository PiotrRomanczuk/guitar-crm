'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { checkAuthRateLimit } from '@/lib/auth/rate-limiter';

/**
 * Get client identifier for rate limiting
 * Uses combination of IP address and email for security
 */
async function getClientIdentifier(email: string): Promise<string> {
	const headersList = await headers();
	const forwarded = headersList.get('x-forwarded-for');
	const ip = forwarded?.split(',')[0].trim() ||
	          headersList.get('x-real-ip') ||
	          'unknown';
	return `${email}:${ip}`;
}

export async function resetPassword(email: string) {
	// Rate limiting check
	const identifier = await getClientIdentifier(email);
	const rateLimit = await checkAuthRateLimit(identifier, 'passwordReset');

	if (!rateLimit.allowed) {
		const minutes = Math.ceil(rateLimit.retryAfter! / 60);
		console.warn(
			`[Auth] Rate limit exceeded for password reset: ${email}, retry after ${rateLimit.retryAfter}s`
		);
		return {
			error: `Too many password reset attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
			rateLimited: true,
			retryAfter: rateLimit.retryAfter
		};
	}

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

	return { success: true };
}
