// Script to create initial development users with roles
/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
/* eslint-enable @typescript-eslint/no-require-imports */

// Load .env.local in development
dotenv.config(); // Load .env first if exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
	const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
	for (const k in envConfig) {
		process.env[k] = envConfig[k];
	}
}

console.log(
	'Available environment variables:',
	Object.keys(process.env).filter((k) => k.includes('SUPABASE'))
);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error(
		'Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set.'
	);
	process.exit(1);
}

// Development users
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
];

async function createDevUser(admin, user) {
	// Try to create user
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
		// Fetch user by email
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
		const id = found.id;

		// Upsert profile
		const { error: upsertErr } = await admin.from('profiles').upsert(
			{
				user_id: id,
				email: user.email,
				first_name: user.firstName,
				last_name: user.lastName,
				is_admin: user.isAdmin,
				is_teacher: user.isTeacher,
				is_student: user.isStudent,
				is_active: true,
				bio: user.notes,
				is_test: false,
			},
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
			first_name: user.firstName,
			last_name: user.lastName,
			is_admin: user.isAdmin,
			is_teacher: user.isTeacher,
			is_student: user.isStudent,
			is_active: true,
			bio: user.notes,
			is_test: false,
		},
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
	const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
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
