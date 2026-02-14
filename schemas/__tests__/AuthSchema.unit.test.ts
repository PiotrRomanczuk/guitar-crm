import {
	SignInSchema,
	SignUpSchema,
	ResetPasswordSchema,
	StrongPasswordSchema,
} from '../AuthSchema';

describe('AuthSchema', () => {
	describe('StrongPasswordSchema', () => {
		it('should reject passwords shorter than 8 characters', () => {
			const result = StrongPasswordSchema.safeParse('Ab1');
			expect(result.success).toBe(false);
		});

		it('should reject passwords without letters', () => {
			const result = StrongPasswordSchema.safeParse('12345678');
			expect(result.success).toBe(false);
		});

		it('should reject passwords without numbers', () => {
			const result = StrongPasswordSchema.safeParse('abcdefgh');
			expect(result.success).toBe(false);
		});

		it('should accept passwords with 8+ chars, letter, and number', () => {
			const result = StrongPasswordSchema.safeParse('abcdef12');
			expect(result.success).toBe(true);
		});

		it('should accept strong passwords', () => {
			const result = StrongPasswordSchema.safeParse('MyP@ssw0rd!');
			expect(result.success).toBe(true);
		});
	});

	describe('SignInSchema', () => {
		it('should require valid email', () => {
			const result = SignInSchema.safeParse({ email: 'bad', password: 'password' });
			expect(result.success).toBe(false);
		});

		it('should require password of at least 6 characters', () => {
			const result = SignInSchema.safeParse({ email: 'test@example.com', password: '12345' });
			expect(result.success).toBe(false);
		});

		it('should accept valid sign-in data', () => {
			const result = SignInSchema.safeParse({ email: 'test@example.com', password: '123456' });
			expect(result.success).toBe(true);
		});
	});

	describe('SignUpSchema', () => {
		const validData = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			password: 'MyPass12',
			confirmPassword: 'MyPass12',
		};

		it('should accept valid sign-up data', () => {
			const result = SignUpSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('should require strong password (8+ chars)', () => {
			const result = SignUpSchema.safeParse({
				...validData,
				password: 'Pass1',
				confirmPassword: 'Pass1',
			});
			expect(result.success).toBe(false);
		});

		it('should require password with at least one letter', () => {
			const result = SignUpSchema.safeParse({
				...validData,
				password: '12345678',
				confirmPassword: '12345678',
			});
			expect(result.success).toBe(false);
		});

		it('should require password with at least one number', () => {
			const result = SignUpSchema.safeParse({
				...validData,
				password: 'abcdefgh',
				confirmPassword: 'abcdefgh',
			});
			expect(result.success).toBe(false);
		});

		it('should reject mismatched passwords', () => {
			const result = SignUpSchema.safeParse({
				...validData,
				confirmPassword: 'Different1',
			});
			expect(result.success).toBe(false);
		});

		it('should require first name', () => {
			const result = SignUpSchema.safeParse({ ...validData, firstName: '' });
			expect(result.success).toBe(false);
		});

		it('should require last name', () => {
			const result = SignUpSchema.safeParse({ ...validData, lastName: '' });
			expect(result.success).toBe(false);
		});
	});

	describe('ResetPasswordSchema', () => {
		it('should require strong password', () => {
			const result = ResetPasswordSchema.safeParse({
				password: 'short',
				confirmPassword: 'short',
			});
			expect(result.success).toBe(false);
		});

		it('should require password with letter and number', () => {
			const result = ResetPasswordSchema.safeParse({
				password: '12345678',
				confirmPassword: '12345678',
			});
			expect(result.success).toBe(false);
		});

		it('should accept valid reset password data', () => {
			const result = ResetPasswordSchema.safeParse({
				password: 'NewPass12',
				confirmPassword: 'NewPass12',
			});
			expect(result.success).toBe(true);
		});

		it('should reject mismatched passwords', () => {
			const result = ResetPasswordSchema.safeParse({
				password: 'NewPass12',
				confirmPassword: 'Different1',
			});
			expect(result.success).toBe(false);
		});
	});
});
