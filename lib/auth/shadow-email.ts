const SHADOW_EMAIL_PATTERN = /^shadow_[a-f0-9-]+@placeholder\.com$/;

export function isShadowPlaceholderEmail(email: string | null | undefined): boolean {
	if (!email) return false;
	return SHADOW_EMAIL_PATTERN.test(email);
}

export function maskShadowEmail(email: string | null | undefined): string | null {
	if (isShadowPlaceholderEmail(email)) return null;
	return email ?? null;
}
