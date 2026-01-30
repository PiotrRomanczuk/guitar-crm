// Load dotenv when running via ts-node
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local explicitly if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
	dotenv.config({ path: envLocalPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Prefer server-side env var (SUPABASE_SERVICE_ROLE_KEY should never have NEXT_PUBLIC_ prefix)
const SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error(
		'Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
	);
	process.exit(1);
}

const E2E_TEST_EMAIL =
	process.env.E2E_TEST_EMAIL || 'e2e.tester@guitarcrm.local';
const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'E2Epassword123!';

async function main() {
	const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

	// Try to create user (if exists, we'll continue)
	const { data: createRes, error: createErr } =
		await admin.auth.admin.createUser({
			email: E2E_TEST_EMAIL,
			password: E2E_TEST_PASSWORD,
			email_confirm: true,
			user_metadata: { first_name: 'E2E', last_name: 'Tester', isTest: true },
		});

	if (
		createErr &&
		!/already exists|already been registered/i.test(createErr.message)
	) {
		console.error('Failed to create user:', createErr.message);
		process.exit(1);
	}

	const userId = createRes?.user?.id;
	if (!userId) {
		// Fetch user by listing (no direct get by email in SDK v2)
		const { data: users, error: listErr } = await admin.auth.admin.listUsers({
			page: 1,
			perPage: 1000,
		});
		if (listErr) {
			console.error('Failed to list users:', listErr.message);
			process.exit(1);
		}
		const found = users.users.find(
			(u) => u.email?.toLowerCase() === E2E_TEST_EMAIL.toLowerCase()
		);
		if (!found) {
			console.error('User not found after creation attempt');
			process.exit(1);
		}
		const id = found.id as string;

		// Upsert profile
		const { error: upsertErr } = await admin.from('profiles').upsert(
			{
				id: id,
				email: E2E_TEST_EMAIL,
				full_name: 'E2E Tester',
				is_admin: false,
				is_teacher: true,
				is_student: false,
				is_development: true,
			},
			{ onConflict: 'email' } // Conflict on email since it's unique
		);

		if (upsertErr) {
			console.error('Failed to upsert profile:', upsertErr.message);
			process.exit(1);
		}

		console.log('✅ Seeded E2E test user and profile');
		return;
	}

	// Upsert profile for newly created user
	const { error: upsertErr } = await admin.from('profiles').upsert(
		{
			id: userId,
			email: E2E_TEST_EMAIL,
			full_name: 'E2E Tester',
			is_admin: false,
			is_teacher: true,
			is_student: false,
			is_development: true,
		},
		{ onConflict: 'email' }
	);

	if (upsertErr) {
		console.error('Failed to upsert profile:', upsertErr.message);
		process.exit(1);
	}

	console.log('✅ Seeded E2E test user and profile');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
