import { DISPOSABLE_DOMAINS } from './disposable-domains';

/**
 * Checks if an email address uses a known disposable email domain.
 */
export function isDisposableEmail(email: string): boolean {
	if (!email || !email.includes('@')) return false;

	const domain = email.split('@')[1]?.toLowerCase();
	if (!domain) return false;

	return DISPOSABLE_DOMAINS.has(domain);
}
