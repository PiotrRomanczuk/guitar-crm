import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local explicitly
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

const REMOTE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!REMOTE_URL) {
  console.error(
    '❌ NEXT_PUBLIC_SUPABASE_URL is not set.\n' +
    '   Add it to .env.local and re-run.'
  );
  process.exit(1);
}

if (/127\.0\.0\.1|localhost/.test(REMOTE_URL)) {
  console.error(
    '❌ NEXT_PUBLIC_SUPABASE_URL points to localhost — aborting.\n' +
    '   This script targets the remote Supabase project only.'
  );
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(REMOTE_URL, SERVICE_ROLE_KEY);

// ─── Demo Data ────────────────────────────────────────────────────────────────

// Demo-only password — intentionally committed, these accounts are non-production
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? 'Demo2024!';

const DEMO_USERS = [
  { email: 'sarah@strummy.app', fullName: 'Sarah Mitchell', isTeacher: true,  isStudent: false },
  { email: 'emma@strummy.app',  fullName: 'Emma Johnson',   isTeacher: false, isStudent: true  },
  { email: 'carlos@strummy.app',fullName: 'Carlos Reyes',   isTeacher: false, isStudent: true  },
  { email: 'lily@strummy.app',  fullName: 'Lily Park',      isTeacher: false, isStudent: true  },
  { email: 'james@strummy.app', fullName: "James O'Brien",  isTeacher: false, isStudent: true  },
] as const;

const DEMO_SONGS = [
  { title: 'Wonderwall',           author: 'Oasis',        level: 'beginner',     key: 'G'  },
  { title: 'Wish You Were Here',   author: 'Pink Floyd',   level: 'intermediate', key: 'G'  },
  { title: 'Hotel California',     author: 'Eagles',       level: 'advanced',     key: 'Bm' },
  { title: 'Blackbird',            author: 'The Beatles',  level: 'intermediate', key: 'G'  },
  { title: 'Brown Eyed Girl',      author: 'Van Morrison', level: 'beginner',     key: 'G'  },
  { title: 'Nothing Else Matters', author: 'Metallica',    level: 'intermediate', key: 'Em' },
  { title: 'Stairway to Heaven',   author: 'Led Zeppelin', level: 'advanced',     key: 'Am' },
] as const;

// Lessons per student: completed notes + count, plus 1 scheduled
const STUDENT_LESSONS: Record<string, { notes: string }[]> = {
  'emma@strummy.app': [
    { notes: 'Great first session — G, C, D open chords introduced. Focus on clean chord shapes before transitions.' },
    { notes: 'Wonderwall strumming pattern locked in. Timing is solid; start syncing with a metronome next session.' },
    { notes: 'Blackbird fingerpicking intro attempted — keep left-hand thumb anchored. 15 mins daily on the opening bars.' },
    { notes: 'Brown Eyed Girl progression feels natural now. Ready to add vocals next week; keep the groove loose.' },
  ],
  'carlos@strummy.app': [
    { notes: 'Barre chords introduced — F and Bm shapes. Wrist position corrected; squeeze from the thumb, not the forearm.' },
    { notes: 'Hotel California intro riff sounding great. Work on dynamics: let the quiet notes breathe.' },
    { notes: 'Nothing Else Matters picking pattern at 60 BPM is clean. Bump to 75 BPM and revisit string separation.' },
  ],
  'lily@strummy.app': [
    { notes: 'G, C, D chord triangle mastered with smooth transitions. Excellent posture from day one.' },
    { notes: 'Capo introduced for Wish You Were Here — key transposition concept understood. Practice the full intro daily.' },
    { notes: 'Brown Eyed Girl timing locked in with backing track. Ready to perform — add your own strumming flair.' },
  ],
  'james@strummy.app': [
    { notes: 'Guitar anatomy, posture, and first chord shapes (G, D, Em) covered. Take it slow — muscle memory takes time.' },
    { notes: 'Open chord progressions improving. Wonderwall verse rhythm is almost there; count out loud while strumming.' },
  ],
};

// lesson_songs per completed lesson index (song title + status)
type LessonSongSpec = { title: string; status: string; notes?: string };
const LESSON_SONGS_BY_STUDENT: Record<string, LessonSongSpec[][]> = {
  'emma@strummy.app': [
    [{ title: 'Wonderwall', status: 'to_learn' }, { title: 'Brown Eyed Girl', status: 'to_learn' }],
    [{ title: 'Wonderwall', status: 'started', notes: 'Verse strumming pattern — keep tempo steady' }, { title: 'Brown Eyed Girl', status: 'started' }],
    [{ title: 'Blackbird', status: 'to_learn', notes: 'Focus on first 4 bars only' }, { title: 'Wonderwall', status: 'remembered' }],
    [{ title: 'Brown Eyed Girl', status: 'with_author' }, { title: 'Blackbird', status: 'started' }],
  ],
  'carlos@strummy.app': [
    [{ title: 'Hotel California', status: 'to_learn' }, { title: 'Nothing Else Matters', status: 'to_learn' }],
    [{ title: 'Hotel California', status: 'started', notes: 'Nail the dynamics in the intro riff' }, { title: 'Nothing Else Matters', status: 'started' }, { title: 'Stairway to Heaven', status: 'to_learn' }],
    [{ title: 'Nothing Else Matters', status: 'remembered' }, { title: 'Stairway to Heaven', status: 'started' }],
  ],
  'lily@strummy.app': [
    [{ title: 'Brown Eyed Girl', status: 'to_learn' }, { title: 'Wish You Were Here', status: 'to_learn' }],
    [{ title: 'Brown Eyed Girl', status: 'started' }, { title: 'Wish You Were Here', status: 'started', notes: 'Capo 2 — practice the full intro' }],
    [{ title: 'Brown Eyed Girl', status: 'with_author', notes: 'Performance-ready!' }, { title: 'Wish You Were Here', status: 'remembered' }],
  ],
  'james@strummy.app': [
    [{ title: 'Wonderwall', status: 'to_learn' }],
    [{ title: 'Wonderwall', status: 'started' }, { title: 'Brown Eyed Girl', status: 'to_learn' }],
  ],
};

// Assignments per student
type AssignmentSpec = { title: string; description: string; status: string; dueDaysFromNow: number };
const ASSIGNMENTS_BY_STUDENT: Record<string, AssignmentSpec[]> = {
  'emma@strummy.app': [
    { title: 'Wonderwall chord transitions', description: 'Practice G → Cadd9 → Dsus4 transitions for 20 minutes daily. Use a metronome at 60 BPM.', status: 'completed', dueDaysFromNow: -7 },
    { title: 'Blackbird intro fingerpicking', description: 'Learn the opening 8 bars of Blackbird. Keep the thumb on the bass string at all times.', status: 'in_progress', dueDaysFromNow: 3 },
    { title: 'Brown Eyed Girl video recording', description: 'Record a 1-minute clip of your Brown Eyed Girl strumming and share it in the next lesson.', status: 'not_started', dueDaysFromNow: 7 },
  ],
  'carlos@strummy.app': [
    { title: 'Hotel California intro riff', description: 'Practice the iconic intro slowly at 50 BPM, focusing on clean note separation and dynamics.', status: 'completed', dueDaysFromNow: -5 },
    { title: 'Nothing Else Matters at 75 BPM', description: 'Bump the picking pattern tempo from 60 to 75 BPM. Record yourself and listen back for timing accuracy.', status: 'in_progress', dueDaysFromNow: 5 },
    { title: 'Stairway to Heaven chord research', description: 'Look up the chord shapes for Stairway to Heaven and practice each one slowly before the next session.', status: 'not_started', dueDaysFromNow: 10 },
  ],
  'lily@strummy.app': [
    { title: 'Wish You Were Here full intro', description: 'Practice the complete intro with capo on fret 2. Aim for smooth note transitions throughout.', status: 'completed', dueDaysFromNow: -3 },
    { title: 'Brown Eyed Girl with backing track', description: 'Play through the full song with a YouTube backing track at least 3 times before the next lesson.', status: 'in_progress', dueDaysFromNow: 4 },
  ],
  'james@strummy.app': [
    { title: 'Daily chord switching practice', description: 'Switch between G, D, and Em for 10 minutes every day. Time yourself — aim for 1 switch per second.', status: 'completed', dueDaysFromNow: -4 },
    { title: 'Wonderwall verse strumming', description: 'Learn the down-up strumming pattern for the Wonderwall verse. Count "1-and-2-and-3-and-4-and" out loud.', status: 'in_progress', dueDaysFromNow: 6 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function getOrCreateUser(email: string, fullName: string): Promise<string> {
  const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      avatar_url: `https://i.pravatar.cc/150?u=${email}`,
      isDemo: true,
    },
  });

  if (!createErr) return createData.user.id;

  if (!/already (exists|been registered)/i.test(createErr.message)) {
    console.error(`  ❌ Failed to create ${email}:`, createErr.message);
    process.exit(1);
  }

  // User already exists — fetch their ID
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) {
    console.error('  ❌ Failed to list users:', listErr.message);
    process.exit(1);
  }
  const existing = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error(`  ❌ User ${email} not found after creation attempt`);
    process.exit(1);
  }
  return existing.id;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎸 Demo Seed — Strummy Showcase\n' + '='.repeat(40));
  console.log(`🌐 Remote URL: ${REMOTE_URL}\n`);

  // ── Step 1: Create / get users + upsert profiles ──────────────────────────
  console.log('👤 Step 1: Users & profiles');
  const userIds: Record<string, string> = {};

  for (const user of DEMO_USERS) {
    const id = await getOrCreateUser(user.email, user.fullName);
    userIds[user.email] = id;

    const { error } = await supabase.from('profiles').upsert(
      {
        id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: `https://i.pravatar.cc/150?u=${user.email}`,
        is_teacher: user.isTeacher,
        is_student: user.isStudent,
        is_admin: false,
        is_development: true,
      },
      { onConflict: 'id' }
    );
    if (error) { console.error(`  ❌ Profile upsert failed for ${user.email}:`, error.message); process.exit(1); }
    console.log(`  ✅ ${user.fullName} <${user.email}>`);
  }

  const teacherId = userIds['sarah@strummy.app'];
  const studentEmails = DEMO_USERS.filter((u) => u.isStudent).map((u) => u.email);
  const studentIds = studentEmails.map((e) => userIds[e]);

  // ── Step 2: Get or insert songs ───────────────────────────────────────────
  console.log('\n🎵 Step 2: Songs');
  const songTitles = DEMO_SONGS.map((s) => s.title);
  const { data: existingSongs, error: fetchSongsErr } = await supabase
    .from('songs')
    .select('id, title')
    .in('title', songTitles);

  if (fetchSongsErr) { console.error('  ❌ Song fetch failed:', fetchSongsErr.message); process.exit(1); }

  const songMap: Record<string, string> = {};
  for (const s of existingSongs ?? []) songMap[s.title] = s.id;

  const missingSongs = DEMO_SONGS.filter((s) => !songMap[s.title]);
  if (missingSongs.length > 0) {
    const { data: newSongs, error: insertSongsErr } = await supabase
      .from('songs')
      .insert(missingSongs)
      .select('id, title');
    if (insertSongsErr) { console.error('  ❌ Song insert failed:', insertSongsErr.message); process.exit(1); }
    for (const s of newSongs ?? []) songMap[s.title] = s.id;
  }

  const totalSongs = Object.keys(songMap).length;
  console.log(`  ✅ ${totalSongs} songs ready (${missingSongs.length} new, ${totalSongs - missingSongs.length} existing)`);

  // ── Step 3: Clean up existing demo data ───────────────────────────────────
  console.log('\n🧹 Step 3: Clearing existing demo data');
  await supabase.from('assignments').delete().in('student_id', studentIds);
  await supabase.from('lessons').delete().in('student_id', studentIds);
  console.log('  ✅ Previous demo lessons & assignments removed');

  // ── Step 4: Insert lessons ────────────────────────────────────────────────
  console.log('\n📅 Step 4: Lessons');
  let totalLessons = 0;
  const lessonIdsByStudent: Record<string, string[]> = {};

  for (const email of studentEmails) {
    const studentId = userIds[email];
    const completedNotes = STUDENT_LESSONS[email];
    const lessonsToInsert = [];

    // Completed lessons spread over the past weeks
    for (let i = 0; i < completedNotes.length; i++) {
      const weeksAgo = completedNotes.length - i;
      lessonsToInsert.push({
        teacher_id: teacherId,
        student_id: studentId,
        lesson_teacher_number: i + 1,
        status: 'COMPLETED',
        scheduled_at: daysFromNow(-(weeksAgo * 7)),
        notes: completedNotes[i].notes,
      });
    }

    // 1 scheduled lesson next week
    lessonsToInsert.push({
      teacher_id: teacherId,
      student_id: studentId,
      lesson_teacher_number: completedNotes.length + 1,
      status: 'SCHEDULED',
      scheduled_at: daysFromNow(7),
      notes: null,
    });

    const { data: inserted, error: lessonErr } = await supabase
      .from('lessons')
      .insert(lessonsToInsert)
      .select('id, status');

    if (lessonErr) { console.error(`  ❌ Lessons insert failed for ${email}:`, lessonErr.message); process.exit(1); }
    const completedIds = (inserted ?? []).filter((l) => l.status === 'COMPLETED').map((l) => l.id);
    lessonIdsByStudent[email] = completedIds;
    totalLessons += inserted?.length ?? 0;
    console.log(`  ✅ ${email}: ${completedNotes.length} completed + 1 scheduled`);
  }

  // ── Step 5: Insert lesson_songs ───────────────────────────────────────────
  console.log('\n🎼 Step 5: Lesson songs');
  let totalLessonSongs = 0;
  const lessonSongsToInsert: object[] = [];

  for (const email of studentEmails) {
    const completedLessonIds = lessonIdsByStudent[email];
    const songsPerLesson = LESSON_SONGS_BY_STUDENT[email];

    for (let i = 0; i < completedLessonIds.length; i++) {
      const lessonId = completedLessonIds[i];
      const specs = songsPerLesson[i] ?? [];
      for (const spec of specs) {
        const songId = songMap[spec.title];
        if (!songId) continue;
        lessonSongsToInsert.push({
          lesson_id: lessonId,
          song_id: songId,
          status: spec.status,
          notes: spec.notes ?? null,
        });
      }
    }
  }

  const { data: insertedLS, error: lsErr } = await supabase
    .from('lesson_songs')
    .insert(lessonSongsToInsert)
    .select('id');

  if (lsErr) { console.error('  ❌ lesson_songs insert failed:', lsErr.message); process.exit(1); }
  totalLessonSongs = insertedLS?.length ?? 0;
  console.log(`  ✅ ${totalLessonSongs} lesson_songs inserted`);

  // ── Step 6: Insert assignments ────────────────────────────────────────────
  console.log('\n📝 Step 6: Assignments');
  let totalAssignments = 0;
  const assignmentsToInsert: object[] = [];

  for (const email of studentEmails) {
    const studentId = userIds[email];
    for (const a of ASSIGNMENTS_BY_STUDENT[email]) {
      assignmentsToInsert.push({
        teacher_id: teacherId,
        student_id: studentId,
        title: a.title,
        description: a.description,
        status: a.status,
        due_date: daysFromNow(a.dueDaysFromNow),
      });
    }
  }

  const { data: insertedA, error: aErr } = await supabase
    .from('assignments')
    .insert(assignmentsToInsert)
    .select('id');

  if (aErr) { console.error('  ❌ assignments insert failed:', aErr.message); process.exit(1); }
  totalAssignments = insertedA?.length ?? 0;
  console.log(`  ✅ ${totalAssignments} assignments inserted`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(40));
  console.log('✅ Demo seed complete!');
  console.log(`   👤 Users:        ${DEMO_USERS.length} (1 teacher, 4 students)`);
  console.log(`   🎵 Songs:        ${totalSongs}`);
  console.log(`   📅 Lessons:      ${totalLessons}`);
  console.log(`   🎼 Lesson songs: ${totalLessonSongs}`);
  console.log(`   📝 Assignments:  ${totalAssignments}`);
  console.log('\n🔑 Login credentials (password: Demo2024!)');
  for (const u of DEMO_USERS) {
    console.log(`   ${u.isTeacher ? 'Teacher' : 'Student'}: ${u.email}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
