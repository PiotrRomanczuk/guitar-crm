// Script to create initial development users with roles
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types.generated';
import { InsertTables } from '@/lib/supabase';

// Load test environment in test mode
if (process.env.NODE_ENV === 'test') {
	const envTestPath = path.resolve(process.cwd(), '.env.test');
	if (fs.existsSync(envTestPath)) {
		dotenv.config({ path: envTestPath });
	}
} else {
	// Load .env.local in development
	const envLocalPath = path.resolve(process.cwd(), '.env.local');
	if (fs.existsSync(envLocalPath)) {
		dotenv.config({ path: envLocalPath });
	}
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env
	.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error(
		'Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set.'
	);
	process.exit(1);
}

// Development users from development_credentials.txt
const devUsers = [
	{
		email: 'p.romanczuk@gmail.com',
		password: 'test123_admin',
		firstName: 'Admin',
		lastName: 'User',
		isAdmin: true,
		isTeacher: true,
		isStudent: false,
		notes: 'Has full system access',
	},
	{
		email: 'teacher@example.com',
		password: 'test123_teacher',
		firstName: 'Test',
		lastName: 'Teacher',
		isAdmin: false,
		isTeacher: true,
		isStudent: false,
		notes: 'For testing teacher functionality',
	},
	{
		email: 'student@example.com',
		password: 'test123_student',
		firstName: 'Test',
		lastName: 'Student',
		isAdmin: false,
		isTeacher: false,
		isStudent: true,
		notes: 'For testing student views',
	},
	// Sample students
	{
		email: 'teststudent1@example.com',
		password: 'test123_student',
		firstName: 'Test',
		lastName: 'Student 1',
		isAdmin: false,
		isTeacher: false,
		isStudent: true,
		notes: 'Sample active student',
	},
	{
		email: 'teststudent2@example.com',
		password: 'test123_student',
		firstName: 'Test',
		lastName: 'Student 2',
		isAdmin: false,
		isTeacher: false,
		isStudent: true,
		notes: 'Sample active student',
	},
	{
		email: 'teststudent3@example.com',
		password: 'test123_student',
		firstName: 'Test',
		lastName: 'Student 3',
		isAdmin: false,
		isTeacher: false,
		isStudent: true,
		notes: 'Sample active student',
	},
];

interface DevUser {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	isAdmin: boolean;
	isTeacher: boolean;
	isStudent: boolean;
	notes: string;
}

type ProfileInsert = InsertTables<'profiles'>;

async function createDevUser(
	admin: SupabaseClient<Database>,
	user: DevUser
): Promise<boolean> {
	// Try to create user (if exists, we'll continue)
	const { data: createRes, error: createErr } =
		await admin.auth.admin.createUser({
			email: user.email,
			password: user.password,
			email_confirm: true,
			user_metadata: {
				first_name: user.firstName,
				last_name: user.lastName,
				notes: user.notes,
				isDevelopment: true,
			},
		});

	if (
		createErr &&
		!/already exists|User already registered/i.test(createErr.message)
	) {
		console.error(`Failed to create user ${user.email}:`, createErr.message);
		return false;
	}

	const userId = createRes?.user?.id;
	if (!userId) {
		// Fetch user by listing (no direct get by email in SDK v2)
		const { data: users, error: listErr } = await admin.auth.admin.listUsers({
			page: 1,
			perPage: 1000,
		});
		if (listErr) {
			console.error(`Failed to list users for ${user.email}:`, listErr.message);
			return false;
		}
		const found = users.users.find(
			(u) => u.email?.toLowerCase() === user.email.toLowerCase()
		);
		if (!found) {
			console.error(`User not found after creation attempt: ${user.email}`);
			return false;
		}
		const id = found.id as string;

		// Upsert profile
		const { error: upsertErr } = await admin.from('profiles').upsert(
			{
				user_id: id,
				email: user.email,
				firstname: user.firstName,
				lastname: user.lastName,
				isadmin: user.isAdmin,
				isteacher: user.isTeacher,
				isstudent: user.isStudent,
				isActive: true,
				bio: user.notes,
				isTest: false,
				canEdit: user.isAdmin || user.isTeacher,
				isdevelopment: true,
			} satisfies ProfileInsert,
			{ onConflict: 'user_id' }
		);

		if (upsertErr) {
			console.error(
				`Failed to upsert profile for ${user.email}:`,
				upsertErr.message
			);
			return false;
		}

		return true;
	}

	// Upsert profile for newly created user
	const { error: upsertErr } = await admin.from('profiles').upsert(
		{
			user_id: userId,
			email: user.email,
			firstname: user.firstName,
			lastname: user.lastName,
			isadmin: user.isAdmin,
			isteacher: user.isTeacher,
			isstudent: user.isStudent,
			isActive: true,
			bio: user.notes,
			isTest: false,
			canEdit: user.isAdmin || user.isTeacher,
			isdevelopment: true,
		} satisfies ProfileInsert,
		{ onConflict: 'user_id' }
	);

	if (upsertErr) {
		console.error(
			`Failed to upsert profile for ${user.email}:`,
			upsertErr.message
		);
		return false;
	}

	return true;
}

async function main() {
	const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);
	let successCount = 0;

	console.log('🌱 Seeding development users...');

	for (const user of devUsers) {
		const success = await createDevUser(admin, user);
		if (success) {
			successCount++;
			console.log(
				`✅ Created/Updated user: ${user.email} (${user.firstName} ${user.lastName})`
			);
		}
	}

	console.log(
		`\n✨ Seeded ${successCount}/${devUsers.length} development users`
	);

	if (successCount === devUsers.length) {
		console.log('\n🎉 All development users created successfully!');
		console.log('\nℹ️  You can now use these credentials for testing:');
		console.log('• Admin: p.romanczuk@gmail.com / test123_admin');
		console.log('• Teacher: teacher@example.com / test123_teacher');
		console.log('• Student: student@example.com / test123_student');
	} else {
		console.log('\n⚠️  Some users failed to create. Check the logs above.');
		process.exit(1);
	}
}

main().catch((e) => {
	console.error('Fatal error:', e);
	process.exit(1);
});
