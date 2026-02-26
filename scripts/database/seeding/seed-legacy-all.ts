#!/usr/bin/env tsx

/**
 * Legacy Data Seed Script
 * Seeds profiles, songs, lessons, and lesson_songs from .LEGACY_DATA/ folder.
 *
 * Usage:
 *   npx tsx scripts/database/seeding/seed-legacy-all.ts           # Local DB
 *   npx tsx scripts/database/seeding/seed-legacy-all.ts --remote  # Remote DB
 *   npx tsx scripts/database/seeding/seed-legacy-all.ts --dry-run # Validate only
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
const LEGACY_PASSWORD = 'Legacy2024!';
const BATCH_SIZE = 50;
const DATA_DIR = path.join(process.cwd(), '.LEGACY_DATA');

// ============================================================================
// Enums & constants
// ============================================================================

const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const VALID_KEYS = new Set([
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb',
  'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m',
  'Am', 'A#m', 'Bbm', 'Bm',
]);
const VALID_SONG_STATUSES = new Set([
  'to_learn', 'started', 'remembered', 'with_author', 'mastered',
]);
const VALID_LESSON_STATUSES = new Set([
  'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED',
]);

// Single-lowercase-letter keys map to their natural minor
const KEY_MAP: Record<string, string> = {
  a: 'Am', b: 'Bm', c: 'Cm', d: 'Dm', e: 'Em', f: 'Fm', g: 'Gm',
};

// ============================================================================
// Client helpers
// ============================================================================

function resolveCredentials(useRemote: boolean): { url: string; key: string } {
  if (useRemote) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('❌ Missing remote credentials: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
    return { url, key };
  }
  return { url: LOCAL_URL, key: LOCAL_SERVICE_KEY };
}

// ============================================================================
// Normalizers
// ============================================================================

function normalizeKey(rawKey: unknown): string | null {
  if (!rawKey || typeof rawKey !== 'string') return null;
  const trimmed = rawKey.trim();
  if (VALID_KEYS.has(trimmed)) return trimmed;
  // Single lowercase letter → natural minor (e.g. 'a' → 'Am')
  const mapped = KEY_MAP[trimmed.toLowerCase()];
  if (mapped && trimmed.length === 1) return mapped;
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

function normalizeSongStatus(rawStatus: unknown): string {
  if (!rawStatus || typeof rawStatus !== 'string') return 'to_learn';
  const lower = rawStatus.toLowerCase();
  return VALID_SONG_STATUSES.has(lower) ? lower : 'to_learn';
}

function normalizeLessonStatus(rawStatus: unknown): string {
  if (!rawStatus || typeof rawStatus !== 'string') return 'SCHEDULED';
  return VALID_LESSON_STATUSES.has(rawStatus) ? rawStatus : 'SCHEDULED';
}

// ============================================================================
// Auth user creation
// ============================================================================

interface LegacyProfile {
  id: number;
  user_id: string;
  username: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  canEdit: boolean;
  isTest: boolean;
  isActive: boolean;
}

async function getExistingAuthUserId(
  adminUrl: string,
  headers: Record<string, string>,
  email: string,
): Promise<string | null> {
  const res = await fetch(adminUrl, { method: 'GET', headers });
  if (!res.ok) return null;
  const data = (await res.json()) as { users?: Array<{ id: string; email: string }> };
  const found = data.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}

async function createAuthUser(
  supabaseUrl: string,
  serviceKey: string,
  profile: LegacyProfile,
  dryRun: boolean,
): Promise<string | null> {
  if (dryRun) {
    console.log(`  [dry-run] Would create auth user: ${profile.email}`);
    return profile.user_id;
  }

  const adminUrl = `${supabaseUrl}/auth/v1/admin/users`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${serviceKey}`,
    apikey: serviceKey,
  };

  const res = await fetch(adminUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: profile.user_id,
      email: profile.email,
      password: LEGACY_PASSWORD,
      email_confirm: true,
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (res.ok) {
    const created = data as { id: string };
    console.log(`  ✅ Created: ${profile.email} (${created.id})`);
    return created.id;
  }

  // Handle "already exists" gracefully
  const errMsg = String(data.msg ?? data.error ?? '');
  if (/already (exists|been registered|registered)/i.test(errMsg)) {
    console.log(`  ℹ️  Already exists: ${profile.email}`);
    const existingId = await getExistingAuthUserId(adminUrl, headers, profile.email);
    return existingId ?? profile.user_id;
  }

  console.error(`  ❌ Failed: ${profile.email} — ${JSON.stringify(data)}`);
  return null;
}

// ============================================================================
// Step 1: Songs
// ============================================================================

interface LegacySong {
  id: string;
  title: string;
  level: string | null;
  key: string | null;
  chords: string | null;
  audio_files: unknown;
  created_at: string | null;
  updated_at: string | null;
  author: string | null;
  ultimate_guitar_link: string | null;
  short_title: string | null;
}

async function seedSongs(supabase: SupabaseClient, dryRun: boolean): Promise<Set<string>> {
  console.log('\n📚 Step 1: Seeding songs...');
  const filePath = path.join(DATA_DIR, 'songs.json');
  const songs = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as LegacySong[];

  const normalized = songs.map((song) => ({
    id: song.id,
    title: song.title,
    author: song.author ?? null,
    level: VALID_LEVELS.has(String(song.level)) ? song.level : null,
    key: normalizeKey(song.key),
    chords: normalizeChords(song.chords),
    ultimate_guitar_link: song.ultimate_guitar_link ?? null,
    short_title: song.short_title ?? null,
    created_at: song.created_at ?? new Date().toISOString(),
    updated_at: song.updated_at ?? new Date().toISOString(),
    deleted_at: null,
    youtube_url: null,
    gallery_images: null,
  }));

  const songIds = new Set(normalized.map((s) => s.id));

  if (dryRun) {
    console.log(`  [dry-run] Would upsert ${normalized.length} songs`);
    return songIds;
  }

  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(normalized.length / BATCH_SIZE);
    const { error } = await supabase.from('songs').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  ❌ Songs batch ${batchNum}/${total}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`  ✅ Songs batch ${batchNum}/${total} (${batch.length} rows)`);
    }
  }
  console.log(`  Songs: ${inserted} upserted, ${errors} errors`);
  return songIds;
}

// ============================================================================
// Step 2: Profiles
// ============================================================================

async function seedProfiles(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceKey: string,
  dryRun: boolean,
): Promise<Set<string>> {
  console.log('\n👤 Step 2: Seeding profiles...');
  const filePath = path.join(DATA_DIR, 'profiles.json');
  const profiles = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as LegacyProfile[];

  const seededIds = new Set<string>();
  const profileRows: Array<Record<string, unknown>> = [];

  for (const profile of profiles) {
    const authId = await createAuthUser(supabaseUrl, serviceKey, profile, dryRun);
    if (!authId) {
      console.warn(`  ⚠️  Skipping profile row for ${profile.email} (auth creation failed)`);
      continue;
    }

    seededIds.add(authId);
    profileRows.push({
      id: authId,
      email: profile.email,
      full_name: `${profile.firstName} ${profile.lastName}`.trim(),
      is_admin: Boolean(profile.isAdmin),
      is_teacher: Boolean(profile.isTeacher),
      is_student: Boolean(profile.isStudent),
      is_active: Boolean(profile.isActive),
      is_development: Boolean(profile.isTest),
      notes: profile.bio ?? null,
      // student_status only meaningful for students
      student_status: profile.isStudent
        ? profile.isActive
          ? 'active'
          : 'inactive'
        : null,
    });
  }

  if (dryRun) {
    console.log(`  [dry-run] Would upsert ${profileRows.length} profiles`);
    return seededIds;
  }

  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < profileRows.length; i += BATCH_SIZE) {
    const batch = profileRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('profiles').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  ❌ Profiles batch error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  Profiles: ${inserted} upserted, ${errors} errors`);
  return seededIds;
}

// ============================================================================
// Step 3: Lessons
// ============================================================================

interface LegacyLesson {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: string;
  lesson_number: number | null;
  title: string | null;
  notes: string | null;
  creator_user_id: string;
  start_time: string | null;
  lesson_teacher_number: number | null;
}

async function seedLessons(
  supabase: SupabaseClient,
  validProfileIds: Set<string>,
  dryRun: boolean,
): Promise<Set<string>> {
  console.log('\n📅 Step 3: Seeding lessons...');
  const filePath = path.join(DATA_DIR, 'lessons.json');
  const lessons = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as LegacyLesson[];

  // Filter: student_id must exist in seeded profiles
  const filtered = lessons.filter((l) => {
    if (!validProfileIds.has(l.student_id)) return false;
    return true;
  });

  const skipped = lessons.length - filtered.length;
  if (skipped > 0) {
    console.log(`  ⚠️  Skipped ${skipped} lessons (student_id not in seeded profiles)`);
  }

  // Drop fields the current schema doesn't have; lesson_teacher_number set by trigger
  const normalized = filtered.map((lesson) => ({
    id: lesson.id,
    student_id: lesson.student_id,
    teacher_id: lesson.teacher_id,
    scheduled_at: lesson.date,
    status: normalizeLessonStatus(lesson.status),
    title: lesson.title ?? null,
    notes: lesson.notes ?? null,
  }));

  const lessonIds = new Set(normalized.map((l) => l.id));

  if (dryRun) {
    console.log(`  [dry-run] Would upsert ${normalized.length} lessons`);
    return lessonIds;
  }

  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(normalized.length / BATCH_SIZE);
    const { error } = await supabase.from('lessons').upsert(batch, { onConflict: 'id' });
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
// Step 4: Lesson songs
// ============================================================================

interface LegacyLessonSong {
  lesson_id: string;
  song_id: string;
  song_status: string;
  teacher_id: string | null;
  student_id: string | null;
}

async function seedLessonSongs(
  supabase: SupabaseClient,
  validLessonIds: Set<string>,
  dryRun: boolean,
): Promise<number> {
  console.log('\n🎵 Step 4: Seeding lesson_songs...');
  const filePath = path.join(DATA_DIR, 'lesson.songs.json');
  const lessonSongs = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as LegacyLessonSong[];

  // Filter orphaned lesson_ids
  const filtered = lessonSongs.filter((ls) => validLessonIds.has(ls.lesson_id));
  const skipped = lessonSongs.length - filtered.length;
  if (skipped > 0) {
    console.log(`  ⚠️  Skipped ${skipped} lesson_songs (orphaned lesson_id)`);
  }

  // Deduplicate on (lesson_id, song_id) — keep last occurrence
  const seen = new Map<string, LegacyLessonSong>();
  for (const ls of filtered) {
    seen.set(`${ls.lesson_id}:${ls.song_id}`, ls);
  }
  const deduplicated = Array.from(seen.values());
  if (deduplicated.length < filtered.length) {
    console.log(`  ℹ️  Deduplicated: ${filtered.length} → ${deduplicated.length} rows`);
  }

  const normalized = deduplicated.map((ls) => ({
    id: crypto.randomUUID(),
    lesson_id: ls.lesson_id,
    song_id: ls.song_id,
    status: normalizeSongStatus(ls.song_status),
  }));

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
    // ignoreDuplicates: true — on re-runs, skip existing (lesson_id, song_id) pairs
    const { error } = await supabase
      .from('lesson_songs')
      .upsert(batch, { onConflict: 'lesson_id,song_id', ignoreDuplicates: true });
    if (error) {
      console.error(`  ❌ Lesson songs batch ${batchNum}/${total}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`  ✅ Lesson songs batch ${batchNum}/${total} (${batch.length} rows)`);
    }
  }
  console.log(`  Lesson songs: ${inserted} upserted, ${errors} errors`);
  return inserted;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🚀 LEGACY DATA SEED');
  console.log('===================\n');

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
    const songIds = await seedSongs(supabase, dryRun);
    const profileIds = await seedProfiles(supabase, supabaseUrl, serviceKey, dryRun);
    const lessonIds = await seedLessons(supabase, profileIds, dryRun);
    const lessonSongCount = await seedLessonSongs(supabase, lessonIds, dryRun);

    console.log('\n✅ Legacy seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   Songs processed:        ${songIds.size}`);
    console.log(`   Profiles seeded:        ${profileIds.size}`);
    console.log(`   Lessons seeded:         ${lessonIds.size}`);
    console.log(`   Lesson songs seeded:    ${lessonSongCount}`);

    if (!dryRun) {
      console.log('\n🔍 Verification SQL:');
      console.log('   SELECT COUNT(*) FROM profiles;     -- expect ~28');
      console.log('   SELECT COUNT(*) FROM songs;        -- expect ~118');
      console.log('   SELECT COUNT(*) FROM lessons;      -- expect ~132');
      console.log('   SELECT COUNT(*) FROM lesson_songs; -- expect <239');
    }
  } catch (err) {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  }
}

main().catch(console.error);
