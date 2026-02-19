import { isDisposableEmail } from '../disposable-email-checker';

describe('isDisposableEmail', () => {
	it('should detect common disposable domains', () => {
		expect(isDisposableEmail('test@mailinator.com')).toBe(true);
		expect(isDisposableEmail('test@guerrillamail.com')).toBe(true);
		expect(isDisposableEmail('test@yopmail.com')).toBe(true);
		expect(isDisposableEmail('test@tempmail.com')).toBe(true);
		expect(isDisposableEmail('test@maildrop.cc')).toBe(true);
		expect(isDisposableEmail('test@throwaway.email')).toBe(true);
	});

	it('should allow legitimate email domains', () => {
		expect(isDisposableEmail('user@gmail.com')).toBe(false);
		expect(isDisposableEmail('user@yahoo.com')).toBe(false);
		expect(isDisposableEmail('user@outlook.com')).toBe(false);
		expect(isDisposableEmail('user@protonmail.com')).toBe(false);
		expect(isDisposableEmail('user@company.org')).toBe(false);
		expect(isDisposableEmail('teacher@school.edu')).toBe(false);
	});

	it('should be case-insensitive', () => {
		expect(isDisposableEmail('test@MAILINATOR.COM')).toBe(true);
		expect(isDisposableEmail('test@Yopmail.Com')).toBe(true);
	});

	it('should handle edge cases', () => {
		expect(isDisposableEmail('')).toBe(false);
		expect(isDisposableEmail('nope')).toBe(false);
		expect(isDisposableEmail('@')).toBe(false);
		expect(isDisposableEmail('user@')).toBe(false);
	});
});
