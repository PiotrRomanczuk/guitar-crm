#!/usr/bin/env ts-node

/**
 * Export current database data to seed files
 *
 * This script connects to your running Supabase instance and exports
 * all data from main tables to SQL seed files in supabase/seed_sql/
 *
 * Usage: npm run export:seeds
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error('❌ Missing Supabase environment variables!');
	console.error('   Make sure .env.local has:');
	console.error('   - NEXT_PUBLIC_SUPABASE_URL');
	console.error('   - SUPABASE_SERVICE_ROLE_KEY');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_DIR = path.join(process.cwd(), 'supabase', 'seed_sql');

interface TableConfig {
	name: string;
	orderBy?: string;
	includeAuth?: boolean;
}

const TABLES: TableConfig[] = [
	{ name: 'profiles', orderBy: 'created_at', includeAuth: true },
	{ name: 'songs', orderBy: 'created_at' },
	{ name: 'lessons', orderBy: 'created_at' },
	{ name: 'lesson_songs', orderBy: 'created_at' },
	{ name: 'task_management', orderBy: 'created_at' },
];

function escapeValue(value: unknown): string {
	if (value === null || value === undefined) {
		return 'NULL';
	}
	if (typeof value === 'string') {
		// Escape single quotes by doubling them
		return `'${value.replace(/'/g, "''")}'`;
	}
	if (typeof value === 'boolean') {
		return value ? 'true' : 'false';
	}
	if (typeof value === 'number') {
		return value.toString();
	}
	if (typeof value === 'object') {
		// Handle arrays and objects as JSON
		return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
	}
	return String(value);
}

async function exportTable(
	tableName: string,
	orderBy?: string
): Promise<string> {
	console.log(`📊 Fetching data from ${tableName}...`);

	let query = supabase.from(tableName).select('*');

	if (orderBy) {
		query = query.order(orderBy);
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
	}

	if (!data || data.length === 0) {
		console.log(`⚠️  No data found in ${tableName}`);
		return '';
	}

	console.log(`✅ Found ${data.length} rows in ${tableName}`);

	// Get column names from first row
	const columns = Object.keys(data[0]);

	// Build SQL
	let sql = `-- Seed for table: ${tableName}\n`;
	sql += `-- Auto-generated on ${new Date().toISOString()}\n`;
	sql += `-- Total rows: ${data.length}\n\n`;
	sql += `BEGIN;\n\n`;
	sql += `-- Clean existing data\n`;
	sql += `DELETE FROM public.${tableName};\n\n`;
	sql += `-- Insert ${data.length} rows\n`;
	sql += `INSERT INTO public.${tableName} (\n`;
	sql += `  ${columns.join(',\n  ')}\n`;
	sql += `)\nVALUES\n`;

	// Build values
	const values = data.map((row, idx) => {
		const rowValues = columns.map((col) => escapeValue(row[col]));
		const isLast = idx === data.length - 1;
		return `  (${rowValues.join(', ')})${isLast ? ';' : ','}`;
	});

	sql += values.join('\n');
	sql += `\n\n-- ✅ ${tableName} import complete\n`;
	sql += `COMMIT;\n`;

	return sql;
}

async function exportAuthUsers(): Promise<string> {
	console.log(`📊 Fetching auth.users data...`);

	// Get profiles to extract user IDs
	const { data: profiles, error } = await supabase
		.from('profiles')
		.select('user_id, email, username, created_at')
		.order('created_at');

	if (error) {
		throw new Error(`Failed to fetch profiles: ${error.message}`);
	}

	if (!profiles || profiles.length === 0) {
		console.log(`⚠️  No profiles found`);
		return '';
	}

	console.log(`✅ Found ${profiles.length} users`);

	let sql = `-- Seed for auth.users\n`;
	sql += `-- Auto-generated on ${new Date().toISOString()}\n`;
	sql += `-- Total users: ${profiles.length}\n\n`;
	sql += `BEGIN;\n\n`;
	sql += `-- Drop trigger temporarily to avoid conflicts\n`;
	sql += `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;\n\n`;
	sql += `-- Insert ${profiles.length} auth.users records\n`;
	sql += `INSERT INTO auth.users (\n`;
	sql += `  id,\n`;
	sql += `  email,\n`;
	sql += `  encrypted_password,\n`;
	sql += `  email_confirmed_at,\n`;
	sql += `  created_at,\n`;
	sql += `  updated_at,\n`;
	sql += `  raw_user_meta_data\n`;
	sql += `)\nVALUES\n`;

	const values = profiles.map((profile, idx) => {
		const isLast = idx === profiles.length - 1;
		const createdAt = profile.created_at || new Date().toISOString();
		return (
			`  (\n` +
			`    '${profile.user_id}',\n` +
			`    '${profile.email}',\n` +
			`    '$2a$10$placeholder.hash.for.seeding.only',\n` +
			`    now(),\n` +
			`    '${createdAt}',\n` +
			`    '${createdAt}',\n` +
			`    '{"firstname":"","lastname":""}'\n` +
			`  )${isLast ? ';' : ','}`
		);
	});

	sql += values.join('\n');
	sql += `\n\n-- Restore trigger\n`;
	sql += `CREATE TRIGGER on_auth_user_created\n`;
	sql += `  AFTER INSERT ON auth.users\n`;
	sql += `  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();\n\n`;
	sql += `-- ✅ auth.users import complete\n`;
	sql += `COMMIT;\n`;

	return sql;
}

async function exportProfiles(): Promise<string> {
	console.log(`📊 Exporting profiles with auth.users...`);

	const authUsersSql = await exportAuthUsers();
	const profilesSql = await exportTable('profiles', 'created_at');

	// Combine both
	let sql = `-- Seed for table: profiles (with auth.users)\n`;
	sql += `-- Auto-generated on ${new Date().toISOString()}\n\n`;
	sql += authUsersSql + '\n\n';
	sql += profilesSql;

	return sql;
}

async function main() {
	console.log('🚀 Starting seed data export...\n');
	console.log('═'.repeat(60));

	// Ensure seed directory exists
	if (!fs.existsSync(SEED_DIR)) {
		fs.mkdirSync(SEED_DIR, { recursive: true });
	}

	try {
		for (let i = 0; i < TABLES.length; i++) {
			const table = TABLES[i];

			console.log(
				`\n[${i + 1}/${TABLES.length}] Processing: ${table.name.toUpperCase()}`
			);
			console.log('─'.repeat(60));

			let sql: string;

			if (table.includeAuth && table.name === 'profiles') {
				sql = await exportProfiles();
			} else {
				sql = await exportTable(table.name, table.orderBy);
			}

			if (sql) {
				const filename = path.join(SEED_DIR, `seed_${table.name}.sql`);
				fs.writeFileSync(filename, sql, 'utf-8');
				console.log(`💾 Saved: ${filename}`);
				console.log(`✅ Table ${table.name} completed!`);
			} else {
				console.log(`⚠️  Table ${table.name} had no data to export`);
			}
		}

		console.log('\n═'.repeat(60));
		console.log('✨ Export complete!');
		console.log('═'.repeat(60));
		console.log(`\n📁 Seed files saved to: ${SEED_DIR}`);
		console.log('\n📝 To use these seeds:');
		console.log('   1. Restart Supabase: supabase db reset');
		console.log('   2. Or manually run: psql < supabase/seed_sql/seed_*.sql\n');
	} catch (error) {
		console.error('\n❌ Export failed:', error);
		process.exit(1);
	}
}

main();
