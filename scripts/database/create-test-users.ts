import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const supabaseServiceRole = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

const TEST_PASSWORD = 'testpass123';

const createTestUsers = async () => {
	const testUsers = [
		{
			email: 'admin@test.com',
			password: TEST_PASSWORD,
			username: 'admin',
			firstname: 'Admin',
			lastname: 'User',
			isadmin: true,
			isteacher: false,
			isstudent: false,
		},
		{
			email: 'teacher@test.com',
			password: TEST_PASSWORD,
			username: 'teacher',
			firstname: 'Teacher',
			lastname: 'User',
			isadmin: false,
			isteacher: true,
			isstudent: false,
		},
		{
			email: 'student@test.com',
			password: TEST_PASSWORD,
			username: 'student',
			firstname: 'Student',
			lastname: 'User',
			isadmin: false,
			isteacher: false,
			isstudent: true,
		},
	];

	for (const user of testUsers) {
		// Create user with Supabase Auth
		const { data: authData, error: authError } =
			await supabase.auth.admin.createUser({
				email: user.email,
				password: user.password,
				email_confirm: true,
			});

		if (authError) {
			console.error(`Failed to create user ${user.email}:`, authError);
			continue;
		}

		console.log(`Created user ${user.email} with ID ${authData.user.id}`);

		// Create profile
		const { error: profileError } = await supabase.from('profiles').insert({
			user_id: authData.user.id,
			username: user.username,
			email: user.email,
			firstname: user.firstname,
			lastname: user.lastname,
			isadmin: user.isadmin,
			isteacher: user.isteacher,
			isstudent: user.isstudent,
		});

		if (profileError) {
			console.error(
				`Failed to create profile for ${user.email}:`,
				profileError
			);
		} else {
			console.log(`Created profile for ${user.email}`);
		}
	}

	console.log('\nTest users created successfully!');
	console.log('You can now sign in with any of these emails:');
	console.log('- admin@test.com');
	console.log('- teacher@test.com');
	console.log('- student@test.com');
	console.log(`Password for all users: ${TEST_PASSWORD}`);
};

createTestUsers().catch(console.error);
