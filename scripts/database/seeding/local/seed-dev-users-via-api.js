// Node.js script to create development users via Supabase Auth REST API
// Usage: node create-dev-users-via-api.js

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Prefer non-public service role key name if present, fallback to NEXT_PUBLIC_ variant (not recommended for production)
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set.'
  );
  process.exit(1);
}

// Extended dev users include role flags matching profiles schema (is_admin, is_teacher, is_student)
const devUsers = [
  {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
    firstName: 'Admin',
    lastName: 'User',
    notes: 'Has full system access',
    is_admin: true,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'teacher@example.com',
    password: 'test123_teacher',
    firstName: 'Test',
    lastName: 'Teacher',
    notes: 'For testing teacher functionality',
    is_admin: false,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'student@example.com',
    password: 'test123_student',
    firstName: 'Test',
    lastName: 'Student',
    notes: 'For testing student views',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent1@example.com',
    password: 'test123_student',
    firstName: 'Test',
    lastName: 'Student 1',
    notes: 'Sample active student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent2@example.com',
    password: 'test123_student',
    firstName: 'Test',
    lastName: 'Student 2',
    notes: 'Sample active student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent3@example.com',
    password: 'test123_student',
    firstName: 'Test',
    lastName: 'Student 3',
    notes: 'Sample active student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
];

async function createUser(user) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const body = {
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      firstName: user.firstName,
      lastName: user.lastName,
      notes: user.notes,
      isDevelopment: true,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.error && /already exists|User already registered/i.test(data.error.message)) {
      console.log(`User already exists: ${user.email}`);
      // Fetch existing user id to reconcile profile and roles
      const listRes = await fetch(url.replace(/users$/, ''), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
      });
      const listData = await listRes.json();
      const existing = listData.users?.find(
        (u) => u.email?.toLowerCase() === user.email.toLowerCase()
      );
      if (existing?.id) {
        await upsertProfile(existing.id, user);
      }
      return { exists: true, data };
    }
    console.error(`Failed to create user ${user.email}:`, JSON.stringify(data, null, 2));
    return { exists: false, data };
  }
  console.log(`✅ Created user: ${user.email} (ID: ${data.id})`);
  if (data.id) {
    await upsertProfile(data.id, user);
  }
  return { exists: true, data };
}

// Upsert profile row with roles using auth.user id as profile id
async function upsertProfile(userId, user) {
  const profilePayload = {
    id: userId, // align profile id with auth user id for easier joins
    email: user.email,
    full_name: `${user.firstName} ${user.lastName}`,
    notes: user.notes,
    is_development: true,
    is_admin: !!user.is_admin,
    is_teacher: !!user.is_teacher,
    is_student: !!user.is_student,
  };
  const supabaseClient = require('@supabase/supabase-js').createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY
  );
  const { error } = await supabaseClient
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });
  if (error) {
    console.error(`Failed to upsert profile for ${user.email}:`, error.message);
  } else {
    console.log(`🔐 Profile/roles upserted for ${user.email}`);
  }
}

(async () => {
  const results = [];
  for (const user of devUsers) {
    const result = await createUser(user);
    results.push({ email: user.email, ...result });
  }

  const successCount = results.filter((r) => r.exists).length;
  console.log(`\n✨ Seeded ${successCount}/${devUsers.length} development users via API`);

  // Output user IDs for role assignment
  console.log('\n📋 User IDs for role assignment:');
  results.forEach((r) => {
    if (r.data && r.data.id) {
      console.log(`${r.email}: ${r.data.id}`);
    }
  });
})();
