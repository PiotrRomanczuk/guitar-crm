import { isShadowPlaceholderEmail, maskShadowEmail } from '../shadow-email';

describe('shadow-email', () => {
	describe('isShadowPlaceholderEmail', () => {
		it('should detect shadow placeholder emails', () => {
			expect(isShadowPlaceholderEmail('shadow_abc123-def-456@placeholder.com')).toBe(true);
		});

		it('should accept valid UUID-based shadow emails', () => {
			expect(
				isShadowPlaceholderEmail('shadow_a1b2c3d4-e5f6-7890-abcd-ef1234567890@placeholder.com')
			).toBe(true);
		});

		it('should reject regular emails', () => {
			expect(isShadowPlaceholderEmail('user@example.com')).toBe(false);
		});

		it('should reject null/undefined', () => {
			expect(isShadowPlaceholderEmail(null)).toBe(false);
			expect(isShadowPlaceholderEmail(undefined)).toBe(false);
		});

		it('should reject empty string', () => {
			expect(isShadowPlaceholderEmail('')).toBe(false);
		});

		it('should reject partial matches', () => {
			expect(isShadowPlaceholderEmail('shadow_@placeholder.com')).toBe(false);
			expect(isShadowPlaceholderEmail('notshadow_abc@placeholder.com')).toBe(false);
		});
	});

	describe('maskShadowEmail', () => {
		it('should return null for shadow emails', () => {
			expect(
				maskShadowEmail('shadow_a1b2c3d4-e5f6-7890-abcd-ef1234567890@placeholder.com')
			).toBeNull();
		});

		it('should pass through regular emails', () => {
			expect(maskShadowEmail('user@example.com')).toBe('user@example.com');
		});

		it('should return null for null input', () => {
			expect(maskShadowEmail(null)).toBeNull();
		});

		it('should return null for undefined input', () => {
			expect(maskShadowEmail(undefined)).toBeNull();
		});
	});
});
