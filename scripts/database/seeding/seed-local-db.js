#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load seed data
const seedFilePath = path.join(__dirname, 'exported/seed-data-2026-01-08.json');
const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

// Supabase local connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CLEAR_EXISTING = process.argv.includes('--clear');

console.log('🌱 Starting database seeding...\n');
console.log(`📡 Connected to: ${supabaseUrl}`);
if (CLEAR_EXISTING) {
  console.log('⚠️  CLEAR MODE: Will delete existing data before seeding\n');
} else {
  console.log('ℹ️  APPEND MODE: Will skip tables with existing data (use --clear to wipe first)\n');
}

// Define seeding order (respecting foreign key constraints)
const seedingOrder = [
  // Core tables first (skip profiles - they exist from migrations)
  //'public.profiles',  // Skip - already exists from migration
  'public.user_roles',
  'public.user_integrations',
  'public.songs',

  // Dependent tables (skip lessons - they exist from migrations)
  //'public.lessons',  // Skip - already exists from migration
  'public.assignments',
  'public.assignment_templates',
  'public.lesson_songs',
  'public.student_song_progress',
  'public.practice_sessions',

  // History tables
  'public.song_status_history',
  'public.lesson_history',
  'public.assignment_history',
  'public.user_history',

  // AI tables
  'public.ai_prompt_templates',
  'public.ai_conversations',
  'public.ai_messages',
  'public.ai_usage_stats',
  'public.agent_execution_logs',

  // Integration tables
  'public.api_keys',
  'public.webhook_subscriptions',
  'public.spotify_matches',
];

async function clearAllTables() {
  console.log('\n🗑️  Clearing all tables in reverse order...\n');

  // Tables that should NEVER be cleared (they come from migrations)
  const doNotClear = ['profiles', 'lessons'];

  // Tables with history triggers that need special handling
  // Clear history tables first to avoid trigger conflicts
  const historyTables = [
    'public.assignment_history',
    'public.lesson_history',
    'public.user_history',
    'public.song_status_history',
  ];

  // First, clear all history tables
  console.log('  📋 Clearing history tables first...');
  for (const tableName of historyTables) {
    if (!seedData.tables[tableName] || seedData.tables[tableName].count === 0) continue;

    const table = tableName.split('.')[1];
    try {
      await supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000');
      console.log(`  ✓ Cleared ${tableName} (pre-clear)`);
    } catch (error) {
      console.log(`  ⚠️  ${tableName}: ${error.message}`);
    }
  }

  // Reverse the seeding order for clearing (to respect FK constraints)
  const clearOrder = [...seedingOrder].reverse();

  console.log('  📋 Clearing remaining tables...');
  for (const tableName of clearOrder) {
    // Skip history tables (already cleared)
    if (historyTables.includes(tableName)) {
      continue;
    }

    const tableData = seedData.tables[tableName];
    if (!tableData || tableData.count === 0) continue;

    const schemaTable = tableName.split('.');
    const table = schemaTable[1];

    // Skip tables that should not be cleared
    if (doNotClear.includes(table)) {
      console.log(`  ⏭️  Skipping ${tableName} (preserved from migrations)`);
      continue;
    }

    try {
      // Special handling for tables with different primary key structures
      if (table === 'user_integrations') {
        // user_integrations has composite PK (user_id, provider), so delete all
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('user_id', '00000000-0000-0000-0000-000000000000');
        if (error && !error.message.includes('0 rows')) {
          console.log(`  ⚠️  ${tableName}: ${error.message}`);
        }
      } else {
        // Delete all records with 'id' column - cascading deletes will handle dependencies
        const { error } = await supabase
          .from(table)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          // If error is not about missing rows, log it
          if (!error.message.includes('0 rows')) {
            console.log(`  ⚠️  ${tableName}: ${error.message}`);
          }
        }
      }

      console.log(`  ✓ Cleared ${tableName}`);
    } catch (error) {
      console.log(`  ⚠️  ${tableName}: ${error.message}`);
    }
  }

  console.log('\n✅ All tables cleared\n');
}

async function seedTable(tableName) {
  const tableData = seedData.tables[tableName];

  if (!tableData || tableData.count === 0) {
    console.log(`⏭️  Skipping ${tableName.padEnd(35)} (no data)`);
    return { success: true, count: 0 };
  }

  const schemaTable = tableName.split('.');
  const table = schemaTable[1];

  try {
    // Note: If using --clear mode, tables are already cleared by clearAllTables()
    // Insert data in batches
    const batchSize = 100;
    let totalInserted = 0;

    // Tables that should use UPSERT instead of INSERT (only for incremental seeding)
    // When using --clear mode, all tables are already cleared, so regular INSERT is fine
    const upsertTables = CLEAR_EXISTING ? [] : ['user_roles'];
    const useUpsert = upsertTables.includes(table);

    for (let i = 0; i < tableData.data.length; i += batchSize) {
      const batch = tableData.data.slice(i, i + batchSize);

      let result;

      // Use upsert for tables that may have existing data from migrations
      if (useUpsert) {
        result = await supabase.from(table).upsert(batch, { onConflict: 'id' }).select();
      } else {
        result = await supabase.from(table).insert(batch).select();
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      totalInserted += batch.length;
    }

    console.log(
      `✅ ${tableName.padEnd(35)} ${String(totalInserted).padStart(4)} records ${
        useUpsert ? 'upserted' : 'inserted'
      }`
    );
    return { success: true, count: totalInserted };
  } catch (error) {
    console.error(`❌ ${tableName.padEnd(35)} ERROR: ${error.message}`);
    return { success: false, error: error.message, count: 0 };
  }
}

async function seedDatabase() {
  // Clear all tables first if requested
  if (CLEAR_EXISTING) {
    await clearAllTables();
  }

  const results = {
    success: [],
    failed: [],
    totalRecords: 0,
  };

  for (const tableName of seedingOrder) {
    const result = await seedTable(tableName);

    if (result.success) {
      results.success.push(tableName);
      results.totalRecords += result.count;
    } else {
      results.failed.push({ table: tableName, error: result.error });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Seeding Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully seeded: ${results.success.length} tables`);
  console.log(`❌ Failed: ${results.failed.length} tables`);
  console.log(`📝 Total records inserted: ${results.totalRecords}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed tables:');
    results.failed.forEach(({ table, error }) => {
      console.log(`   - ${table}: ${error}`);
    });
  }

  console.log('\n🎉 Database seeding complete!\n');
}

// Run seeding
seedDatabase().catch((error) => {
  console.error('\n💥 Fatal error during seeding:', error);
  process.exit(1);
});
