const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we can't rely on dotenv being installed/configured for this script context easily
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function toSqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    // Handle Date objects if they come through as objects, though usually strings from JSON
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  // String
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateInsert(tableName, rows) {
  if (!rows || rows.length === 0) return `-- No data for ${tableName}\n`;

  const columns = Object.keys(rows[0]).join(', ');
  const values = rows
    .map((row) => {
      const rowValues = Object.values(row).map(toSqlValue).join(', ');
      return `(${rowValues})`;
    })
    .join(',\n');

  return `
-- Data for ${tableName}
INSERT INTO public.${tableName} (${columns})
VALUES
${values}
ON CONFLICT DO NOTHING;
`;
}

async function main() {
  console.log('Fetching data...');

  // 1. Profiles
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
  if (profilesError) throw profilesError;

  // 2. Songs
  const { data: songs, error: songsError } = await supabase.from('songs').select('*');
  if (songsError) throw songsError;

  // 3. Lessons
  const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('*');
  if (lessonsError) throw lessonsError;

  // 4. Lesson Songs
  const { data: lessonSongs, error: lessonSongsError } = await supabase
    .from('lesson_songs')
    .select('*');
  if (lessonSongsError) throw lessonSongsError;

  // 5. Assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*');
  if (assignmentsError) throw assignmentsError;

  // 6. User Roles
  const { data: userRoles, error: userRolesError } = await supabase.from('user_roles').select('*');
  if (userRolesError) throw userRolesError;

  console.log('Generating SQL...');

  let sql = `-- Auto-generated seed file
-- Generated at: ${new Date().toISOString()}

-- 1. Profiles
${generateInsert('profiles', profiles)}

-- 2. User Roles
${generateInsert('user_roles', userRoles)}

-- 3. Songs
${generateInsert('songs', songs)}

-- 4. Lessons
${generateInsert('lessons', lessons)}

-- 5. Lesson Songs
${generateInsert('lesson_songs', lessonSongs)}

-- 6. Assignments
${generateInsert('assignments', assignments)}
`;

  const outputPath = path.join(__dirname, '../../../supabase/seed.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ Seed file generated at: ${outputPath}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
