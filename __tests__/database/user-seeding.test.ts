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

describe('User Seeding Tests', () => {
	// Test users from development_credentials.txt
	const expectedUsers = [
		{
			email: 'p.romanczuk@gmail.com',
			role: { isAdmin: true, isTeacher: true, isStudent: false },
			notes: 'Has full system access',
		},
		{
			email: 'teacher@example.com',
			role: { isAdmin: false, isTeacher: true, isStudent: false },
			notes: 'For testing teacher functionality',
		},
		{
			email: 'student@example.com',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			notes: 'For testing student views',
		},
		{
			email: 'teststudent1@example.com',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			notes: 'Sample active student',
		},
		{
			email: 'teststudent2@example.com',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			notes: 'Sample active student',
		},
		{
			email: 'teststudent3@example.com',
			role: { isAdmin: false, isTeacher: false, isStudent: true },
			notes: 'Sample active student',
		},
	];

	describe('User Profile Verification', () => {
		test('profiles have correct role flags', async () => {
			const { data: profiles, error } = await supabase
				.from('profiles')
				.select('email, is_admin, is_teacher, is_student')
				.in(
					'email',
					expectedUsers.map((u) => u.email)
				);

			expect(error).toBeNull();
			expect(profiles).not.toBeNull();
			expect(profiles?.length).toBe(expectedUsers.length);

			// Check each expected user
			for (const expectedUser of expectedUsers) {
				const profile = (profiles as Array<{
					email: string;
					is_admin: boolean;
					is_teacher: boolean;
					is_student: boolean;
				}>)?.find((p) => p.email === expectedUser.email);
				expect(profile).toBeDefined();
				expect(profile?.is_admin).toBe(expectedUser.role.isAdmin);
				expect(profile?.is_teacher).toBe(expectedUser.role.isTeacher);
				expect(profile?.is_student).toBe(expectedUser.role.isStudent);
			}
		});

		test('users have isDevelopment flag set', async () => {
			const { data: profiles } = await supabase
				.from('profiles')
				.select('*')
				.in(
					'email',
					expectedUsers.map((u) => u.email)
				);

			profiles?.forEach((profile) => {
				// @ts-expect-error - using lowercase column names from database
				expect(profile.isdevelopment).toBe(true);
			});
		});

		test('no duplicate emails exist', async () => {
			const { data: profiles } = await supabase
				.from('profiles')
				.select('email');

			// @ts-expect-error - profiles has email column
			const emails = profiles?.map((p) => p.email) || [];
			const uniqueEmails = new Set(emails);
			expect(emails.length).toBe(uniqueEmails.size);
		});
	});

	describe('Auth User Verification', () => {
		test('all users exist in auth.users', async () => {
			for (const user of expectedUsers) {
				const { data: authUser, error } = await supabase.auth.admin.listUsers();
				expect(error).toBeNull();

				const found = authUser.users.find((u) => u.email === user.email);
				expect(found).toBeDefined();
				expect(found?.user_metadata).toMatchObject({
					isDevelopment: true,
				});
			}
		});
	});
});
