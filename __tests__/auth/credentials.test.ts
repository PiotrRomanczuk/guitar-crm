import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({
	path: path.resolve(process.cwd(), '.env.test'),
});

if (
	!process.env.NEXT_PUBLIC_SUPABASE_URL ||
	!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
) {
	throw new Error('Missing required environment variables for testing');
}

const supabase = createClient<Database>(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

describe('Development Credentials Authentication Tests', () => {
	// Test credentials from development_credentials.txt
	const testUsers = [
		{
			email: 'p.romanczuk@gmail.com',
			password: 'test123_admin',
			role: { isAdmin: true, isTeacher: true, isStudent: false },
			description: 'Admin & Teacher',
		},
		{
			email: 'teacher@example.com',
			password: 'test123_teacher',
			role: { isAdmin: false, isTeacher: true, isStudent: false },
			description: 'Teacher',
		},
		{
			email: 'student@example.com',
			password: 'test123_student',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			description: 'Student',
		},
		{
			email: 'teststudent1@example.com',
			password: 'test123_student',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			description: 'Student 1',
		},
		{
			email: 'teststudent2@example.com',
			password: 'test123_student',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			description: 'Student 2',
		},
		{
			email: 'teststudent3@example.com',
			password: 'test123_student',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			description: 'Student 3',
		},
	];

	describe('Authentication Tests', () => {
		test.each(testUsers)(
			'should authenticate successfully: $description',
			async ({ email, password }) => {
				const { data, error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				expect(error).toBeNull();
				expect(data.user).not.toBeNull();
				expect(data.user?.email).toBe(email);
			}
		);

		test.each(testUsers)(
			'should have correct role flags: $description',
			async ({ email, role }) => {
				const {
					data: { user },
					error,
				} = await supabase.auth.signInWithPassword({
					email,
					password: testUsers.find((u) => u.email === email)?.password!,
				});

				expect(error).toBeNull();
				expect(user).not.toBeNull();

				// Check profile roles
				const { data: profile } = await supabase
					.from('profiles')
					.select('*')
					.eq('user_id', user?.id)
					.single();

				expect(profile).not.toBeNull();
				expect(profile?.isAdmin).toBe(role.isAdmin);
				expect(profile?.isTeacher).toBe(role.isTeacher);
				expect(profile?.isStudent).toBe(role.isStudent);
			}
		);
	});

	describe('Invalid Authentication Tests', () => {
		test.each(testUsers)(
			'should fail with wrong password: $description',
			async ({ email }) => {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password: 'wrong_password',
				});

				expect(error).not.toBeNull();
				expect(error?.message).toContain('Invalid login credentials');
			}
		);

		test('should fail with non-existent email', async () => {
			const { error } = await supabase.auth.signInWithPassword({
				email: 'nonexistent@example.com',
				password: 'any_password',
			});

			expect(error).not.toBeNull();
			expect(error?.message).toContain('Invalid login credentials');
		});
	});

	describe('Role-based Access Tests', () => {
		test('admin user should have admin access', async () => {
			const {
				data: { user },
			} = await supabase.auth.signInWithPassword({
				email: 'p.romanczuk@gmail.com',
				password: 'test123_admin',
			});

			// Try to access admin-only data
			const { data: tasks, error } = await supabase
				.from('task_management')
				.select('*')
				.limit(1);

			expect(error).toBeNull();
			expect(tasks).not.toBeNull();
		});

		test('teacher can access their assigned lessons', async () => {
			const {
				data: { user },
			} = await supabase.auth.signInWithPassword({
				email: 'teacher@example.com',
				password: 'test123_teacher',
			});

			const { data: lessons, error } = await supabase
				.from('lessons')
				.select('*')
				.eq('teacher_id', user?.id);

			expect(error).toBeNull();
			expect(lessons).not.toBeNull();
		});

		test('student cannot access admin features', async () => {
			const {
				data: { user },
			} = await supabase.auth.signInWithPassword({
				email: 'student@example.com',
				password: 'test123_student',
			});

			// Try to access admin-only data
			const { data: tasks, error } = await supabase
				.from('task_management')
				.select('*')
				.limit(1);

			expect(error).not.toBeNull();
			expect(tasks).toBeNull();
		});
	});

	describe('Password Pattern Tests', () => {
		test.each(testUsers)(
			'password follows pattern test123_[role]: $description',
			({ password, role }) => {
				if (role.isAdmin) {
					expect(password).toBe('test123_admin');
				} else if (role.isTeacher) {
					expect(password).toBe('test123_teacher');
				} else if (role.isStudent) {
					expect(password).toBe('test123_student');
				}
			}
		);
	});

	// Clean up after tests
	afterAll(async () => {
		const { error } = await supabase.auth.signOut();
		expect(error).toBeNull();
	});
});
