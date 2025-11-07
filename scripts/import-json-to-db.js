// scripts/import-json-to-db.js
// Node script to import JSON files into Postgres tables for Supabase local

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const DB_URL =
	process.env.DB_URL ||
	'postgresql://postgres:postgres@localhost:54322/postgres';
const DATA_DIR = path.join(__dirname, '../supabase/backups/2025-10-26');

const TABLES = [
	{ table: 'profiles', file: 'profiles.json' },
	{ table: 'songs', file: 'songs.json' },
	{ table: 'lessons', file: 'lessons.json' },
	{ table: 'lesson_songs', file: 'lesson_songs.json' },
	{ table: 'task_management', file: 'task_management.json' },
];

async function importTable(client, table, file) {
	const filePath = path.join(DATA_DIR, file);
	if (!fs.existsSync(filePath)) {
		console.warn(`File not found: ${filePath}`);
		return;
	}
	const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	if (!Array.isArray(data) || data.length === 0) {
		console.warn(`No data in ${filePath}`);
		return;
	}
	// Get columns from first object
	const columns = Object.keys(data[0]);
	const colList = columns.map((c) => `"${c}"`).join(', ');
	const valuePlaceholders = (rowIdx) =>
		columns.map((_, i) => `$${rowIdx * columns.length + i + 1}`).join(', ');
	const values = data.flatMap((row) => columns.map((col) => row[col]));
	const rowsSql = data
		.map((_, idx) => `(${valuePlaceholders(idx)})`)
		.join(', ');
	const sql = `INSERT INTO ${table} (${colList}) VALUES ${rowsSql} ON CONFLICT DO NOTHING;`;
	try {
		await client.query('BEGIN');
		await client.query(sql, values);
		await client.query('COMMIT');
		console.log(`Imported ${data.length} rows into ${table}`);
	} catch (err) {
		await client.query('ROLLBACK');
		console.error(`Error importing ${table}:`, err.message);
	}
}

async function main() {
	const client = new Client({ connectionString: DB_URL });
	await client.connect();
	for (const { table, file } of TABLES) {
		await importTable(client, table, file);
	}
	await client.end();
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
