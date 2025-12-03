const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';
const OUTPUT_FILE = path.resolve(process.cwd(), 'supabase/seed.sql');

const client = new Client({
  connectionString: DB_URL,
});

function toSqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  // String
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateInsert(tableName, rows, schema = 'public') {
  if (!rows || rows.length === 0) return `-- No data for ${schema}.${tableName}\n`;

  const columns = Object.keys(rows[0]).join(', ');
  const values = rows
    .map((row) => {
      const rowValues = Object.values(row).map(toSqlValue).join(', ');
      return `(${rowValues})`;
    })
    .join(',\n');

  return `
-- Data for ${schema}.${tableName}
INSERT INTO ${schema}.${tableName} (${columns})
VALUES
${values}
ON CONFLICT DO NOTHING;
`;
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database...');

    // 1. Fetch auth.users
    // We need specific columns to avoid issues with generated columns or unnecessary data
    const usersQuery = `
      SELECT id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
             invited_at, confirmation_token, confirmation_sent_at, recovery_token, 
             recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, 
             last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, 
             created_at, updated_at, phone, phone_confirmed_at, phone_change, 
             phone_change_token, phone_change_sent_at, email_change_token_current, 
             email_change_confirm_status, banned_until, reauthentication_token, 
             reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous
      FROM auth.users
    `;
    const { rows: users } = await client.query(usersQuery);
    console.log(`Fetched ${users.length} users.`);

    // 2. Fetch auth.identities
    const identitiesQuery = `SELECT * FROM auth.identities`;
    const { rows: identities } = await client.query(identitiesQuery);
    console.log(`Fetched ${identities.length} identities.`);

    // 3. Fetch public tables
    const tables = ['profiles', 'songs', 'lessons', 'lesson_songs', 'assignments', 'user_roles'];
    const publicData = {};

    for (const table of tables) {
      const { rows } = await client.query(`SELECT * FROM public.${table}`);
      publicData[table] = rows;
      console.log(`Fetched ${rows.length} rows from ${table}.`);
    }

    // 4. Generate SQL
    let sql = `-- Auto-generated seed file
-- Generated at: ${new Date().toISOString()}

-- 1. Auth Users
${generateInsert('users', users, 'auth')}

-- 2. Auth Identities
${generateInsert('identities', identities, 'auth')}

-- 3. Profiles
${generateInsert('profiles', publicData.profiles)}

-- 4. User Roles
${generateInsert('user_roles', publicData.user_roles)}

-- 5. Songs
${generateInsert('songs', publicData.songs)}

-- 6. Lessons
${generateInsert('lessons', publicData.lessons)}

-- 7. Lesson Songs
${generateInsert('lesson_songs', publicData.lesson_songs)}

-- 8. Assignments
${generateInsert('assignments', publicData.assignments)}
`;

    // 5. Write to file
    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`Seed file written to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Error generating seed:', err);
  } finally {
    await client.end();
  }
}

main();
