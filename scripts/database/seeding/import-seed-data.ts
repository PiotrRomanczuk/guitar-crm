#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Import seed data from exported JSON file
 * Seeds all data into local or remote database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Default to local database
const SUPABASE_URL = process.env.SEED_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  process.env.SEED_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

async function importTable(tableName: string, data: any[]): Promise<number> {
  if (data.length === 0) {
    console.log(`   ⏭️  Skipping (no data)`);
    return 0;
  }

  try {
    const BATCH_SIZE = 50;
    let imported = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(tableName).upsert(batch, {
        onConflict: 'id', // Assumes all tables have an 'id' column
      });

      if (error) {
        console.error(`   ❌ Error in batch ${i / BATCH_SIZE + 1}:`, error.message);
      } else {
        imported += batch.length;
      }
    }

    return imported;
  } catch (err) {
    console.error(`   ❌ Unexpected error:`, err);
    return 0;
  }
}

async function importDatabase(filePath: string) {
  console.log('🗄️  Importing Database from Seed File\n');
  console.log('═══════════════════════════════════════════\n');

  // Read seed file
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Seed file not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`📂 Reading seed file: ${filePath}\n`);
  const seedData: ExportedData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`📅 Export Date: ${new Date(seedData.exportDate).toLocaleString()}`);
  console.log(`📊 Total Tables: ${Object.keys(seedData.tables).length}\n`);
  console.log('═══════════════════════════════════════════\n');

  let totalImported = 0;
  const skippedTables: string[] = [];

  // Import tables in order
  for (const [key, tableInfo] of Object.entries(seedData.tables)) {
    const { table, data, count } = tableInfo;

    // Skip views (they're generated from tables)
    if (key.includes('_per_') || key.includes('_overview')) {
      console.log(`📦 ${table} (View)`);
      console.log(`   ⏭️  Skipping (view, not a table)\n`);
      skippedTables.push(table);
      continue;
    }

    console.log(`📦 Importing ${table} (${count} records)...`);
    const imported = await importTable(table, data);

    if (imported > 0) {
      console.log(`   ✅ Imported ${imported} records\n`);
      totalImported += imported;
    } else if (count === 0) {
      console.log(`   ⏭️  Skipping (no data)\n`);
    } else {
      console.log(`   ⚠️  Failed to import\n`);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('✨ Import Complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Records Imported: ${totalImported}`);
  console.log(`   Tables Skipped: ${skippedTables.length} (views)`);
  console.log(`   Target Database: ${SUPABASE_URL}\n`);
  console.log('🎉 Done!\n');
}

// Get seed file path from command line or use latest
const args = process.argv.slice(2);
const seedFile =
  args[0] ||
  (() => {
    const exportDir = path.join(process.cwd(), 'scripts', 'database', 'seeding', 'exported');
    const files = fs
      .readdirSync(exportDir)
      .filter((f) => f.startsWith('seed-data-') && f.endsWith('.json'));

    if (files.length === 0) {
      console.error('❌ No seed files found. Run export-local-db-to-seed.ts first.');
      process.exit(1);
    }

    // Sort by date (newest first) and return the latest
    files.sort().reverse();
    return path.join(exportDir, files[0]);
  })();

importDatabase(seedFile).catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
