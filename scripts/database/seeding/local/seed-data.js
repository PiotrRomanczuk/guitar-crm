const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const songsData = [
  {
    title: 'Wonderwall',
    author: 'Oasis',
    level: 'beginner',
    key: 'Em',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596',
  },
  {
    title: 'Stairway to Heaven',
    author: 'Led Zeppelin',
    level: 'advanced',
    key: 'Am',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-tabs-9488',
  },
  {
    title: 'Hotel California',
    author: 'Eagles',
    level: 'intermediate',
    key: 'Bm',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-46190',
  },
  {
    title: 'Sweet Child O Mine',
    author: 'Guns N Roses',
    level: 'intermediate',
    key: 'D',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-1756',
  },
  {
    title: 'Nothing Else Matters',
    author: 'Metallica',
    level: 'intermediate',
    key: 'Em',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-tabs-8519',
  },
  {
    title: 'Wish You Were Here',
    author: 'Pink Floyd',
    level: 'beginner',
    key: 'G',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/pink-floyd/wish-you-were-here-chords-44555',
  },
  {
    title: 'Blackbird',
    author: 'The Beatles',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-tabs-19486',
  },
  {
    title: 'Smells Like Teen Spirit',
    author: 'Nirvana',
    level: 'beginner',
    key: 'F',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/nirvana/smells-like-teen-spirit-tabs-202727',
  },
  {
    title: 'Californication',
    author: 'Red Hot Chili Peppers',
    level: 'intermediate',
    key: 'Am',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/californication-tabs-57896',
  },
  {
    title: 'Imagine',
    author: 'John Lennon',
    level: 'beginner',
    key: 'C',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/john-lennon/imagine-chords-9306',
  },
  {
    title: 'Hallelujah',
    author: 'Jeff Buckley',
    level: 'intermediate',
    key: 'C',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/jeff-buckley/hallelujah-chords-198052',
  },
  {
    title: 'Let It Be',
    author: 'The Beatles',
    level: 'beginner',
    key: 'C',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/let-it-be-chords-17427',
  },
  {
    title: 'Purple Haze',
    author: 'Jimi Hendrix',
    level: 'advanced',
    key: 'E',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/jimi-hendrix/purple-haze-tabs-168678',
  },
  {
    title: 'Comfortably Numb',
    author: 'Pink Floyd',
    level: 'advanced',
    key: 'Bm',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/pink-floyd/comfortably-numb-chords-10365',
  },
  {
    title: 'Under the Bridge',
    author: 'Red Hot Chili Peppers',
    level: 'intermediate',
    key: 'E',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/under-the-bridge-chords-7034',
  },
];

async function seedData() {
  console.log('🌱 Seeding additional data (Songs, Lessons, Assignments)...');

  // 1. Get Users and Roles
  const { data: users, error: usersError } = await supabase.from('profiles').select('*');
  const { data: roles, error: rolesError } = await supabase.from('user_roles').select('*');

  if (usersError || rolesError) {
    console.error('Error fetching users or roles:', usersError || rolesError);
    return;
  }

  const teacher = users.find((u) => roles.some((r) => r.user_id === u.id && r.role === 'teacher'));
  const student = users.find((u) => roles.some((r) => r.user_id === u.id && r.role === 'student'));
  const admin = users.find((u) => roles.some((r) => r.user_id === u.id && r.role === 'admin'));

  if (!teacher || !student) {
    console.error('❌ Missing teacher or student profiles. Run user seeding first.');
    return;
  }

  console.log(`Found Teacher: ${teacher.email} (${teacher.id})`);
  console.log(`Found Student: ${student.email} (${student.id})`);

  // 2. Seed Songs
  console.log('🎵 Seeding Songs...');

  // Check for existing songs to avoid duplicates
  const { data: existingSongs } = await supabase.from('songs').select('title, id');
  const existingTitles = new Set(existingSongs?.map((s) => s.title) || []);

  const newSongs = songsData.filter((s) => !existingTitles.has(s.title));

  if (newSongs.length > 0) {
    const { error: insertError } = await supabase.from('songs').insert(newSongs);
    if (insertError) console.error('Error inserting new songs:', insertError);
    else console.log(`✅ Inserted ${newSongs.length} new songs.`);
  } else {
    console.log('ℹ️ No new songs to insert.');
  }

  // Fetch all songs again to ensure we have IDs for linking
  const { data: songs, error: songsError } = await supabase.from('songs').select('*');

  if (songsError) {
    console.error('Error fetching songs:', songsError);
  } else {
    console.log(`✅ Total available songs: ${songs.length}`);
  }

  // 3. Seed Lessons
  console.log('📚 Seeding Lessons...');
  const lessonsData = [
    {
      student_id: student.id,
      teacher_id: teacher.id,
      lesson_teacher_number: 1,
      scheduled_at: new Date().toISOString(),
      status: 'SCHEDULED',
      notes: 'Bring your guitar!',
    },
    {
      student_id: student.id,
      teacher_id: teacher.id,
      lesson_teacher_number: 2,
      scheduled_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'COMPLETED',
      notes: 'Practice G and C chords',
    },
    {
      student_id: student.id,
      teacher_id: teacher.id,
      lesson_teacher_number: 3,
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      status: 'SCHEDULED',
      notes: 'Review scales',
    },
    {
      student_id: student.id,
      teacher_id: teacher.id,
      lesson_teacher_number: 4,
      scheduled_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'SCHEDULED',
      notes: 'Song practice',
    },
    {
      student_id: student.id,
      teacher_id: teacher.id,
      lesson_teacher_number: 5,
      scheduled_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      status: 'COMPLETED',
      notes: 'Intro to fingerstyle',
    },
  ];

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .upsert(lessonsData, { onConflict: 'teacher_id, student_id, lesson_teacher_number' })
    .select();

  if (lessonsError) {
    console.error('Error seeding lessons:', lessonsError);
  } else {
    console.log(`✅ Seeded ${lessons.length} lessons.`);
  }

  // 4. Seed Lesson Songs
  if (lessons && songs && lessons.length > 0 && songs.length > 0) {
    console.log(`🔗 Seeding Lesson Songs (Lessons: ${lessons.length}, Songs: ${songs.length})...`);

    const lessonSongsData = [];

    // Distribute songs across lessons
    // Lesson 1 gets songs 0, 1
    if (lessons[0]) {
      if (songs[0]) lessonSongsData.push({ lesson_id: lessons[0].id, song_id: songs[0].id });
      if (songs[1]) lessonSongsData.push({ lesson_id: lessons[0].id, song_id: songs[1].id });
    }

    // Lesson 2 gets songs 1, 2 (overlap on song 1)
    if (lessons[1]) {
      if (songs[1]) lessonSongsData.push({ lesson_id: lessons[1].id, song_id: songs[1].id });
      if (songs[2]) lessonSongsData.push({ lesson_id: lessons[1].id, song_id: songs[2].id });
    }

    // Lesson 3 gets song 3
    if (lessons[2] && songs[3]) {
      lessonSongsData.push({ lesson_id: lessons[2].id, song_id: songs[3].id });
    }

    if (lessonSongsData.length > 0) {
      // Specify onConflict to handle duplicates correctly
      const { error: lsError } = await supabase
        .from('lesson_songs')
        .upsert(lessonSongsData, { onConflict: 'lesson_id, song_id', ignoreDuplicates: true });

      if (lsError) {
        console.error('Error seeding lesson_songs:', lsError);
      } else {
        console.log(`✅ Seeded ${lessonSongsData.length} lesson_songs.`);
      }
    }
  } else {
    console.log('⚠️ Skipping lesson_songs seeding: Missing lessons or songs.');
  }

  // 5. Seed Assignments
  console.log('📝 Seeding Assignments...');

  const assignmentsData = [
    {
      title: 'Practice Scales',
      description: 'Major scale up and down',
      due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
      teacher_id: teacher.id,
      student_id: student.id,
      status: 'in_progress',
    },
    {
      title: 'Learn Chords',
      description: 'G, C, D chords',
      due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      teacher_id: teacher.id,
      student_id: student.id,
      status: 'completed',
    },
    {
      title: 'Strumming Pattern 1',
      description: 'Down, Down, Up, Up, Down, Up',
      due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      teacher_id: teacher.id,
      student_id: student.id,
      status: 'not_started',
    },
  ];

  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .upsert(assignmentsData, { ignoreDuplicates: true })
    .select();

  if (assignError) {
    console.error('Error seeding assignments:', assignError);
  } else {
    console.log(`✅ Seeded ${assignments.length} assignments.`);
  }

  console.log('✨ Data seeding complete.');
}

seedData().catch(console.error);
