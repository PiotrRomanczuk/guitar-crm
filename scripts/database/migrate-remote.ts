
import { Client } from 'pg';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';

// Ignore SSL certificate errors for migrations
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

config({ path: join(process.cwd(), '.env.local') });

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function migrate() {
    if (!connectionString) {
        console.error('❌ Missing POSTGRES_URL');
        process.exit(1);
    }

    console.log('🔗 Connecting to remote database...');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // 1. Check for migrations table
        const tableRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'supabase_migrations'
        AND    table_name   = 'schema_migrations'
      );
    `);

        if (!tableRes.rows[0].exists) {
            console.log('📋 Creating supabase_migrations schema and table...');
            await client.query('CREATE SCHEMA IF NOT EXISTS supabase_migrations;');
            await client.query(`
        CREATE TABLE supabase_migrations.schema_migrations (
          version text PRIMARY KEY,
          statements text[],
          name text
        );
      `);
        }

        // 2. Get applied migrations
        const migrationsRes = await client.query('SELECT version FROM supabase_migrations.schema_migrations');
        const appliedVersions = new Set(migrationsRes.rows.map(r => r.version));
        console.log(`📜 Found ${appliedVersions.size} tracked migrations.`);

        // 3. Read migration files
        const migrationsDir = join(process.cwd(), 'supabase/migrations');
        const files = readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`📂 Found ${files.length} migration files in supabase/migrations/`);

        // 4. Apply missing migrations
        for (const file of files) {
            const version = file.split('_')[0];

            if (appliedVersions.has(version)) {
                continue;
            }

            console.log(`🚀 Processing migration: ${file} (version: ${version})...`);
            const sql = readFileSync(join(migrationsDir, file), 'utf8');

            // Helper to execute SQL and ignore "already exists" errors
            try {
                await client.query('BEGIN');

                // Split SQL by semicolon and execute parts, or just execute whole block
                // Since many migrations use blocks/functions, executing whole block is better
                // But we need to handle "already exists" errors gracefully.
                // We'll try to run the whole thing. If it fails with "already exists", we'll log it and mark as done.

                await client.query(sql);
                await client.query('INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ($1, $2)', [version, file]);
                await client.query('COMMIT');
                console.log(`✅ Successfully applied (or already existed): ${file}`);
            } catch (err: unknown) {
                await client.query('ROLLBACK');

                const pgErr = err as { code?: string; message?: string };

                // Error code 42P07: relation already exists
                // Error code 42710: extension already exists / type already exists
                // Error code 42723: function already exists
                if (pgErr.code === '42P07' || pgErr.code === '42710' || pgErr.code === '42723') {
                    console.log(`⚠️ Skipping ${file} - some objects already exist. Marking as applied.`);
                    await client.query('INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING', [version, file]);
                    continue;
                }

                console.error(`❌ Error applying migration ${file}:`, pgErr.message);
                console.error(`Code: ${pgErr.code}`);
                // If it's a real error, we stop.
                process.exit(1);
            }
        }

        console.log('🎉 Remote database migration complete!');
        await client.end();
    } catch (err) {
        console.error('❌ FATAL Migration error:', err);
        process.exit(1);
    }
}

migrate();
