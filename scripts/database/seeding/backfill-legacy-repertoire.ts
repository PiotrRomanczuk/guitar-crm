#!/usr/bin/env tsx

/**
 * Backfill Legacy Repertoire Data
 *
 * Migrates legacy lesson-song repertoire data into the live Supabase DB.
 * Unlike seed-legacy-all.ts, this script handles the UUID mismatch between
 * legacy profiles and live profiles by remapping IDs via email address.
 *
 * Usage:
 *   npx tsx scripts/database/seeding/backfill-legacy-repertoire.ts --dry-run   # Validate only
 *   npx tsx scripts/database/seeding/backfill-legacy-repertoire.ts --remote    # Run against production
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });

// ============================================================================
// Config
// ============================================================================

const LOCAL_URL = 'http://127.0.0.1:54321';
const LOCAL_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const BATCH_SIZE = 50;
const DATA_DIR = path.join(process.cwd(), '.LEGACY_DATA');

// ============================================================================
// Types
// ============================================================================

interface LegacyProfile {
  user_id: string;
  email: string;
  firstName: string;
  lastName: string;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isActive: boolean;
  isTest: boolean;
  bio: string | null;
}

interface LegacyLesson {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: string;
  title: string | null;
  notes: string | null;
}

interface LegacySong {
  id: string;
  title: string;
  level: string | null;
  key: string | null;
  chords: string | null;
  author: string | null;
  ultimate_guitar_link: string | null;
  short_title: string | null;
  created_at: string | null;
}

interface LegacyLessonSong {
  lesson_id: string;
  song_id: string;
  song_status: string;
}

interface UserRepertoireEntry {
  live_id: string;
  email: string;
  full_name: string;
  is_student: boolean;
  is_shadow: boolean;
  songs: Array<{
    song_id: string;
    title: string;
    author: string;
    status: string;
  }>;
}

// ============================================================================
// Helpers
// ============================================================================

function resolveCredentials(useRemote: boolean): { url: string; key: string } {
  if (useRemote) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error(
        '❌ Missing remote credentials: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      );
      process.exit(1);
    }
    return { url, key };
  }
  return { url: LOCAL_URL, key: LOCAL_SERVICE_KEY };
}

const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const VALID_KEYS = new Set([
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb',
  'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m',
  'Am', 'A#m', 'Bbm', 'Bm',
]);
const VALID_LESSON_STATUSES = new Set([
  'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED',
]);
const VALID_SONG_STATUSES = new Set([
  'to_learn', 'started', 'remembered', 'with_author', 'mastered',
]);

function normalizeKey(rawKey: unknown): string | null {
  if (!rawKey || typeof rawKey !== 'string') return null;
  const trimmed = rawKey.trim();
  if (VALID_KEYS.has(trimmed)) return trimmed;
  return null;
}

function normalizeChords(rawChords: unknown): string | null {
  if (!rawChords || typeof rawChords !== 'string') return null;
  return rawChords
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .join(', ');
}

function normalizeLessonStatus(rawStatus: unknown): string {
  if (!rawStatus || typeof rawStatus !== 'string') return 'SCHEDULED';
  return VALID_LESSON_STATUSES.has(rawStatus) ? rawStatus : 'SCHEDULED';
}

function normalizeSongStatus(rawStatus: unknown): string {
  if (!rawStatus || typeof rawStatus !== 'string') return 'to_learn';
  const lower = rawStatus.toLowerCase();
  return VALID_SONG_STATUSES.has(lower) ? lower : 'to_learn';
}

function loadJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
}

// ============================================================================
// Step 1: Build email → live_id mapping
// ============================================================================

async function buildIdMapping(
  supabase: SupabaseClient,
  dryRun: boolean,
): Promise<Map<string, string>> {
  console.log('\n🔗 Step 1: Building legacy → live ID mapping...');

  const legacyProfiles = loadJson<LegacyProfile[]>('profiles.json');

  // Build email → legacy_user_id map
  const emailToLegacyId = new Map<string, string>();
  const legacyIdToEmail = new Map<string, string>();
  for (const p of legacyProfiles) {
    emailToLegacyId.set(p.email.toLowerCase(), p.user_id);
    legacyIdToEmail.set(p.user_id, p.email.toLowerCase());
  }

  const emails = legacyProfiles.map((p) => p.email.toLowerCase());
  console.log(`  Legacy profiles: ${legacyProfiles.length}`);

  // Query live DB for matching emails
  const { data: liveProfiles, error } = await supabase
    .from('profiles')
    .select('id, email')
    .in('email', emails);

  if (error) {
    console.error(`  ❌ Failed to query live profiles: ${error.message}`);
    process.exit(1);
  }

  // Build email → live_id
  const emailToLiveId = new Map<string, string>();
  for (const lp of liveProfiles ?? []) {
    emailToLiveId.set(lp.email.toLowerCase(), lp.id);
  }

  console.log(`  Matched in live DB: ${emailToLiveId.size}/${emails.length}`);

  // Find missing profiles
  const missingProfiles = legacyProfiles.filter(
    (p) => !emailToLiveId.has(p.email.toLowerCase()),
  );

  if (missingProfiles.length > 0) {
    console.log(`  Missing profiles (will create as shadow): ${missingProfiles.length}`);
    for (const mp of missingProfiles) {
      console.log(`    - ${mp.email}`);
    }

    if (!dryRun) {
      // Insert shadow profiles
      const shadowRows = missingProfiles.map((p) => ({
        email: p.email,
        full_name: `${p.firstName} ${p.lastName}`.trim(),
        first_name: p.firstName || null,
        last_name: p.lastName || null,
        is_admin: false,
        is_teacher: Boolean(p.isTeacher),
        is_student: Boolean(p.isStudent),
        is_active: Boolean(p.isActive),
        is_development: Boolean(p.isTest),
        is_shadow: true,
        student_status: p.isStudent ? (p.isActive ? 'active' : 'archived') : 'archived',
        notes: p.bio ?? null,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(shadowRows)
        .select('id, email');

      if (insertError) {
        console.error(`  ❌ Failed to insert shadow profiles: ${insertError.message}`);
        process.exit(1);
      }

      for (const row of inserted ?? []) {
        emailToLiveId.set(row.email.toLowerCase(), row.id);
        console.log(`  ✅ Shadow profile: ${row.email} → ${row.id}`);
      }
    } else {
      // In dry-run, use placeholder UUIDs
      for (const mp of missingProfiles) {
        emailToLiveId.set(mp.email.toLowerCase(), `shadow-${mp.user_id}`);
      }
    }
  }

  // Build final legacy_user_id → live_id mapping
  const legacyToLive = new Map<string, string>();
  for (const [email, legacyId] of Array.from(emailToLegacyId.entries())) {
    const liveId = emailToLiveId.get(email);
    if (liveId) {
      legacyToLive.set(legacyId, liveId);
    } else {
      console.warn(`  ⚠️  No live ID for ${email} (legacy: ${legacyId})`);
    }
  }

  console.log(`  Final mapping: ${legacyToLive.size} legacy IDs → live IDs`);
  return legacyToLive;
}

// ============================================================================
// Step 2: Upsert songs (idempotent, skip existing)
// ============================================================================

async function upsertSongs(
  supabase: SupabaseClient,
  dryRun: boolean,
): Promise<number> {
  console.log('\n📚 Step 2: Upserting songs...');

  const songs = loadJson<LegacySong[]>('songs.json');
  console.log(`  Legacy songs: ${songs.length}`);

  const normalized = songs.map((song) => ({
    id: song.id,
    title: song.title,
    author: song.author ?? null,
    level: VALID_LEVELS.has(String(song.level)) ? song.level : null,
    key: normalizeKey(song.key),
    chords: normalizeChords(song.chords),
    ultimate_guitar_link: song.ultimate_guitar_link ?? null,
    short_title: song.short_title ?? null,
  }));

  if (dryRun) {
    console.log(`  [dry-run] Would insert ${normalized.length} songs (skip existing)`);
    return normalized.length;
  }

  // Use ignoreDuplicates to avoid overwriting enriched songs
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(normalized.length / BATCH_SIZE);

    const { error, count } = await supabase
      .from('songs')
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: true, count: 'exact' });

    if (error) {
      console.error(`  ❌ Songs batch ${batchNum}/${total}: ${error.message}`);
    } else {
      const batchInserted = count ?? 0;
      inserted += batchInserted;
      skipped += batch.length - batchInserted;
      console.log(`  ✅ Songs batch ${batchNum}/${total}: ${batchInserted} new, ${batch.length - batchInserted} existing`);
    }
  }

  console.log(`  Songs: ${inserted} inserted, ${skipped} already existed`);
  return songs.length;
}

// ============================================================================
// Step 3: Insert lessons with remapped IDs
// ============================================================================

async function upsertLessons(
  supabase: SupabaseClient,
  idMap: Map<string, string>,
  dryRun: boolean,
): Promise<Set<string>> {
  console.log('\n📅 Step 3: Upserting lessons with remapped IDs...');

  const lessons = loadJson<LegacyLesson[]>('lessons.json');
  console.log(`  Legacy lessons: ${lessons.length}`);

  const remapped: Array<{
    id: string;
    student_id: string;
    teacher_id: string;
    scheduled_at: string;
    status: string;
    title: string | null;
    notes: string | null;
  }> = [];
  const skippedStudents: string[] = [];
  const skippedTeachers: string[] = [];

  for (const lesson of lessons) {
    const liveStudentId = idMap.get(lesson.student_id);
    const liveTeacherId = idMap.get(lesson.teacher_id);

    if (!liveStudentId) {
      skippedStudents.push(lesson.student_id);
      continue;
    }
    if (!liveTeacherId) {
      skippedTeachers.push(lesson.teacher_id);
      continue;
    }

    remapped.push({
      id: lesson.id,
      student_id: liveStudentId,
      teacher_id: liveTeacherId,
      scheduled_at: lesson.date,
      status: normalizeLessonStatus(lesson.status),
      title: lesson.title ?? null,
      notes: lesson.notes ?? null,
    });
  }

  if (skippedStudents.length > 0) {
    const unique = Array.from(new Set(skippedStudents));
    console.log(`  ⚠️  Skipped ${skippedStudents.length} lessons (unmapped student_id): ${unique.join(', ')}`);
  }
  if (skippedTeachers.length > 0) {
    const unique = Array.from(new Set(skippedTeachers));
    console.log(`  ⚠️  Skipped ${skippedTeachers.length} lessons (unmapped teacher_id): ${unique.join(', ')}`);
  }

  console.log(`  Lessons to upsert: ${remapped.length}`);

  const lessonIds = new Set(remapped.map((l) => l.id));

  if (dryRun) {
    console.log(`  [dry-run] Would upsert ${remapped.length} lessons`);
    return lessonIds;
  }

  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < remapped.length; i += BATCH_SIZE) {
    const batch = remapped.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(remapped.length / BATCH_SIZE);

    const { error } = await supabase
      .from('lessons')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Lessons batch ${batchNum}/${total}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`  ✅ Lessons batch ${batchNum}/${total} (${batch.length} rows)`);
    }
  }

  console.log(`  Lessons: ${inserted} upserted, ${errors} errors`);
  return lessonIds;
}

// ============================================================================
// Step 4: Insert lesson_songs
// ============================================================================

async function upsertLessonSongs(
  supabase: SupabaseClient,
  validLessonIds: Set<string>,
  dryRun: boolean,
): Promise<number> {
  console.log('\n🎵 Step 4: Upserting lesson_songs...');

  const lessonSongs = loadJson<LegacyLessonSong[]>('lesson.songs.json');
  console.log(`  Legacy lesson_songs: ${lessonSongs.length}`);

  // Filter to only lessons we successfully inserted
  const filtered = lessonSongs.filter((ls) => validLessonIds.has(ls.lesson_id));
  const orphaned = lessonSongs.length - filtered.length;
  if (orphaned > 0) {
    console.log(`  ⚠️  Skipped ${orphaned} lesson_songs (lesson_id not in upserted lessons)`);
  }

  // Deduplicate on (lesson_id, song_id) — keep last occurrence
  const seen = new Map<string, LegacyLessonSong>();
  for (const ls of filtered) {
    seen.set(`${ls.lesson_id}:${ls.song_id}`, ls);
  }
  const deduplicated = Array.from(seen.values());
  if (deduplicated.length < filtered.length) {
    console.log(`  Deduplicated: ${filtered.length} → ${deduplicated.length}`);
  }

  const normalized = deduplicated.map((ls) => ({
    id: crypto.randomUUID(),
    lesson_id: ls.lesson_id,
    song_id: ls.song_id,
    status: normalizeSongStatus(ls.song_status),
  }));

  console.log(`  Lesson_songs to upsert: ${normalized.length}`);

  if (dryRun) {
    console.log(`  [dry-run] Would upsert ${normalized.length} lesson_songs`);
    return normalized.length;
  }

  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(normalized.length / BATCH_SIZE);

    const { error } = await supabase
      .from('lesson_songs')
      .upsert(batch, { onConflict: 'lesson_id,song_id', ignoreDuplicates: true });

    if (error) {
      console.error(`  ❌ Lesson_songs batch ${batchNum}/${total}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`  ✅ Lesson_songs batch ${batchNum}/${total} (${batch.length} rows)`);
    }
  }

  console.log(`  Lesson_songs: ${inserted} upserted, ${errors} errors`);
  return inserted;
}

// ============================================================================
// Step 5: Insert student_repertoire from user-repertoire-live.json
// ============================================================================

async function upsertStudentRepertoire(
  supabase: SupabaseClient,
  dryRun: boolean,
): Promise<number> {
  console.log('\n🎸 Step 5: Upserting student_repertoire (IDs only, skip duplicates)...');

  const users = loadJson<UserRepertoireEntry[]>('user-repertoire-live.json');
  console.log(`  Users in file: ${users.length}`);

  // Flatten to (student_id, song_id) pairs
  const entries = users.flatMap((u) =>
    u.songs.map((s) => ({
      student_id: u.live_id,
      song_id: s.song_id,
    })),
  );
  console.log(`  Total repertoire entries: ${entries.length}`);

  // Deduplicate on (student_id, song_id)
  const seen = new Map<string, { student_id: string; song_id: string }>();
  for (const e of entries) {
    seen.set(`${e.student_id}:${e.song_id}`, e);
  }
  const deduplicated = Array.from(seen.values());
  if (deduplicated.length < entries.length) {
    console.log(`  Deduplicated: ${entries.length} → ${deduplicated.length}`);
  }

  if (dryRun) {
    console.log(`  [dry-run] Would upsert ${deduplicated.length} student_repertoire entries`);
    return deduplicated.length;
  }

  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  for (let i = 0; i < deduplicated.length; i += BATCH_SIZE) {
    const batch = deduplicated.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(deduplicated.length / BATCH_SIZE);

    const { error, count } = await supabase
      .from('student_repertoire')
      .upsert(batch, { onConflict: 'student_id,song_id', ignoreDuplicates: true, count: 'exact' });

    if (error) {
      console.error(`  ❌ Repertoire batch ${batchNum}/${total}: ${error.message}`);
      errors += batch.length;
    } else {
      const batchInserted = count ?? 0;
      inserted += batchInserted;
      skipped += batch.length - batchInserted;
      console.log(`  ✅ Repertoire batch ${batchNum}/${total}: ${batchInserted} new, ${batch.length - batchInserted} existing`);
    }
  }

  console.log(`  Student repertoire: ${inserted} inserted, ${skipped} already existed, ${errors} errors`);
  return inserted;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🚀 BACKFILL LEGACY REPERTOIRE DATA');
  console.log('====================================\n');

  const args = process.argv.slice(2);
  const useRemote = args.includes('--remote');
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('ℹ️  DRY RUN — no writes will be made\n');
  }

  const { url: supabaseUrl, key: serviceKey } = resolveCredentials(useRemote);
  console.log(`📍 Target: ${useRemote ? 'REMOTE' : 'LOCAL'} — ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Step 1: Build ID mapping (legacy UUID → live UUID via email)
    const idMap = await buildIdMapping(supabase, dryRun);

    // Step 2: Upsert songs (idempotent, skip existing)
    const songCount = await upsertSongs(supabase, dryRun);

    // Step 3: Insert lessons with remapped student/teacher IDs
    const lessonIds = await upsertLessons(supabase, idMap, dryRun);

    // Step 4: Insert lesson_songs
    const lessonSongCount = await upsertLessonSongs(supabase, lessonIds, dryRun);

    // Step 5: Insert student_repertoire (IDs only, skip duplicates)
    const repertoireCount = await upsertStudentRepertoire(supabase, dryRun);

    console.log('\n✅ Backfill complete!\n');
    console.log('📊 Summary:');
    console.log(`   ID mappings:            ${idMap.size}`);
    console.log(`   Songs processed:        ${songCount}`);
    console.log(`   Lessons upserted:       ${lessonIds.size}`);
    console.log(`   Lesson_songs upserted:  ${lessonSongCount}`);
    console.log(`   Student repertoire:     ${repertoireCount}`);

    if (!dryRun) {
      console.log('\n🔍 Verification — run this SQL to check per-student song counts:');
      console.log(`
  SELECT p.email, COUNT(DISTINCT s.id) as song_count
  FROM profiles p
  JOIN lessons l ON l.student_id = p.id
  JOIN lesson_songs ls ON ls.lesson_id = l.id
  JOIN songs s ON s.id = ls.song_id
  GROUP BY p.email
  ORDER BY song_count DESC;
      `);
    }
  } catch (err) {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  }
}

main().catch(console.error);
