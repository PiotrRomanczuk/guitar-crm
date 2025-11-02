// set_passwords_from_file.js
// Usage: node set_passwords_from_file.js path/to/users_to_update.json
// JSON file must be an array: [{ "id": "<uuid>", "password": "<plaintext>" }, ... ]

import fs from 'fs/promises';
import path from 'path';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SERVICE_ROLE_KEY) {
	console.error('ERROR: set SERVICE_ROLE_KEY env var and re-run.');
	process.exit(1);
}
if (!SUPABASE_URL) {
	console.error(
		'ERROR: set SUPABASE_URL env var (e.g., https://xyz.supabase.co) and re-run.'
	);
	process.exit(1);
}
const args = process.argv.slice(2);
if (args.length === 0) {
	console.error(
		'Usage: node set_passwords_from_file.js path/to/users_to_update.json'
	);
	process.exit(1);
}
const filePath = path.resolve(process.cwd(), args[0]);
async function loadUsers(file) {
	const raw = await fs.readFile(file, 'utf8');
	const parsed = JSON.parse(raw);
	if (!Array.isArray(parsed)) throw new Error('JSON must be an array');
	return parsed;
}
async function setPassword(user) {
	const url = `${SUPABASE_URL.replace(
		/\/+$/,
		''
	)}/auth/v1/admin/users/${encodeURIComponent(user.id)}`;
	const body = { password: user.password };
	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
			apikey: SERVICE_ROLE_KEY,
		},
		body: JSON.stringify(body),
	});
	const text = await res.text();
	let json;
	try {
		json = JSON.parse(text);
	} catch (err) {
		json = text;
	}
	return { ok: res.ok, status: res.status, body: json };
}
(async () => {
	try {
		const users = await loadUsers(filePath);
		console.log(`Loaded ${users.length} users from ${filePath}`);
		for (const u of users) {
			if (!u.id || !u.password) {
				console.error('Skipping invalid entry (missing id or password):', u);
				continue;
			}
			try {
				const result = await setPassword(u);
				if (result.ok) {
					console.log(`SUCCESS: ${u.id}`);
				} else {
					console.error(
						`FAIL: ${u.id} -> status=${result.status} body=`,
						result.body
					);
				}
			   } catch {
				   console.error(`ERROR for ${u.id}`);
			   }
			// small delay to avoid burst limits
			await new Promise((r) => setTimeout(r, 250));
		}
		console.log('Done.');
	} catch (err) {
		console.error('Fatal:', err);
		process.exit(1);
	}
})();
