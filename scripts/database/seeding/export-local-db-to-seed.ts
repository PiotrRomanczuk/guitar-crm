#!/usr/bin/env tsx

/**
 * Export local database to seed file
 * Exports all data from auth.profiles and public schema tables
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_LOCAL_SERVICE_ROLE_KEY is not set in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'database', 'seeding', 'exported');
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  `seed-data-${new Date().toISOString().split('T')[0]}.json`
);

// Define tables to export in order (respecting foreign key dependencies)
const TABLES_TO_EXPORT = [
  // Core user and profile data
  { schema: 'public', table: 'profiles', label: 'User Profiles' },
  { schema: 'public', table: 'user_roles', label: 'User Roles' },
  { schema: 'public', table: 'user_integrations', label: 'User Integrations' },

  // Songs and related data
  { schema: 'public', table: 'songs', label: 'Songs' },
  { schema: 'public', table: 'spotify_matches', label: 'Spotify Matches' },
  { schema: 'public', table: 'song_usage_stats', label: 'Song Usage Stats' },

  // Lessons and assignments
  { schema: 'public', table: 'lessons', label: 'Lessons' },
  { schema: 'public', table: 'assignments', label: 'Assignments' },
  { schema: 'public', table: 'assignment_templates', label: 'Assignment Templates' },
  { schema: 'public', table: 'lesson_songs', label: 'Lesson Songs' },

  // Student progress tracking
  { schema: 'public', table: 'student_song_progress', label: 'Student Song Progress' },
  { schema: 'public', table: 'practice_sessions', label: 'Practice Sessions' },

  // History and logs
  { schema: 'public', table: 'lesson_history', label: 'Lesson History' },
  { schema: 'public', table: 'assignment_history', label: 'Assignment History' },
  { schema: 'public', table: 'song_status_history', label: 'Song Status History' },
  { schema: 'public', table: 'user_history', label: 'User History' },

  // AI features
  { schema: 'public', table: 'ai_conversations', label: 'AI Conversations' },
  { schema: 'public', table: 'ai_messages', label: 'AI Messages' },
  { schema: 'public', table: 'ai_prompt_templates', label: 'AI Prompt Templates' },
  { schema: 'public', table: 'ai_usage_stats', label: 'AI Usage Stats' },
  { schema: 'public', table: 'agent_execution_logs', label: 'Agent Execution Logs' },

  // System and configuration
  { schema: 'public', table: 'api_keys', label: 'API Keys' },
  { schema: 'public', table: 'webhook_subscriptions', label: 'Webhook Subscriptions' },

  // Views (read-only, for reference)
  {
    schema: 'public',
    table: 'lesson_counts_per_student',
    label: 'Lesson Counts Per Student (View)',
  },
  {
    schema: 'public',
    table: 'lesson_counts_per_teacher',
    label: 'Lesson Counts Per Teacher (View)',
  },
  { schema: 'public', table: 'user_overview', label: 'User Overview (View)' },
];

interface ExportedData {
  exportDate: string;
  tables: {
    [key: string]: {
      schema: string;
      table: string;
      count: number;
      data: any[];
    };
  };
}

async function exportTable(schema: string, tableName: string): Promise<any[]> {
  try {
    let query = supabase.from(tableName).select('*');

    // For auth.users, we need to use a different approach
    if (schema === 'auth' && tableName === 'users') {
      console.log(
        `   ⚠️  Skipping ${schema}.${tableName} (auth tables not directly accessible via client)`
      );
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error(`   ❌ Error exporting ${schema}.${tableName}:`, error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`   ❌ Unexpected error exporting ${schema}.${tableName}:`, err);
    return [];
  }
}

async function exportDatabase() {
  console.log('🗄️  Exporting Local Database to Seed File\n');
  console.log('═══════════════════════════════════════════\n');

  const exportData: ExportedData = {
    exportDate: new Date().toISOString(),
    tables: {},
  };

  let totalRecords = 0;

  for (const { schema, table, label } of TABLES_TO_EXPORT) {
    console.log(`📦 Exporting ${label} (${schema}.${table})...`);

    const data = await exportTable(schema, table);
    const key = `${schema}.${table}`;

    exportData.tables[key] = {
      schema,
      table,
      count: data.length,
      data,
    };

    totalRecords += data.length;
    console.log(`   ✅ Exported ${data.length} records\n`);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write to file
  console.log('💾 Writing to file...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2));

  console.log('\n═══════════════════════════════════════════');
  console.log('✨ Export Complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Tables: ${Object.keys(exportData.tables).length}`);
  console.log(`   Total Records: ${totalRecords}`);
  console.log(`   Output File: ${OUTPUT_FILE}\n`);

  // Print table breakdown
  console.log('📋 Records by Table:');
  Object.entries(exportData.tables).forEach(([key, info]) => {
    console.log(`   ${info.schema}.${info.table}: ${info.count} records`);
  });

  console.log('\n🎉 Done!\n');
}

exportDatabase().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
