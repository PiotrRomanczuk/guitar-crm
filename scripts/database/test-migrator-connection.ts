
import { Client } from 'pg';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

async function testConnection() {
    if (!connectionString) {
        console.error('❌ Missing POSTGRES_URL');
        process.exit(1);
    }

    console.log('🔗 Connecting to:', connectionString.split('@')[1]); // Log host only for safety

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log('📊 Connection info:', res.rows[0]);

        // Check for migrations table
        const tableRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'supabase_migrations'
        AND    table_name   = 'schema_migrations'
      );
    `);
        console.log('📋 Migrations table exists:', tableRes.rows[0].exists);

        if (tableRes.rows[0].exists) {
            const migrationsRes = await client.query('SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5');
            console.log('📜 Latest applied migrations:', migrationsRes.rows);
        }

        await client.end();
    } catch (err) {
        console.error('❌ Connection error:', err);
        process.exit(1);
    }
}

testConnection();
