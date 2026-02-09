import { Lesson, LessonInput } from '@/schemas/LessonSchema';

// Helper types for query building
type SupabaseClientType = Awaited<
  ReturnType<typeof import('../../../lib/supabase/server').createClient>
>;

export async function handleLessonSongsUpdate(
  supabase: SupabaseClientType,
  lessonId: string,
  newSongIds: string[]
) {
  // 1. Get current songs
  const { data: currentSongs } = await supabase
    .from('lesson_songs')
    .select('song_id')
    .eq('lesson_id', lessonId);

  const currentSongIds = currentSongs?.map((s) => s.song_id) || [];

  // 2. Calculate diff
  const toDelete = currentSongIds.filter((sid) => !newSongIds.includes(sid));
  const toInsert = newSongIds.filter((sid) => !currentSongIds.includes(sid));

  // 3. Delete removed songs
  if (toDelete.length > 0) {
    await supabase.from('lesson_songs').delete().eq('lesson_id', lessonId).in('song_id', toDelete);
  }

  // 4. Insert new songs
  if (toInsert.length > 0) {
    const newRecords = toInsert.map((songId) => ({
      lesson_id: lessonId,
      song_id: songId,
      status: 'started', // Default status
    }));

    const { error: insertError } = await supabase.from('lesson_songs').insert(newRecords);
    if (insertError) {
      console.error('Error inserting lesson songs:', insertError);
    }
  }
}

export async function addSongsToLesson(
  supabase: SupabaseClientType,
  lessonId: string,
  songIds: string[]
) {
  if (!songIds || songIds.length === 0) return;

  const lessonSongs = songIds.map((songId) => ({
    lesson_id: lessonId,
    song_id: songId,
  }));

  const { error: songsError } = await supabase.from('lesson_songs').insert(lessonSongs);

  if (songsError) {
    console.error('Error adding songs to lesson:', songsError);
  }
}

export async function calculateNextLessonNumber(
  supabase: SupabaseClientType,
  teacherId: string,
  studentId: string
): Promise<number> {
  const { data: maxLesson } = await supabase
    .from('lessons')
    .select('lesson_teacher_number')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .order('lesson_teacher_number', { ascending: false })
    .limit(1)
    .single();

  return (maxLesson?.lesson_teacher_number || 0) + 1;
}

export async function insertLessonRecord(
  supabase: SupabaseClientType,
  lessonData: Partial<LessonInput>
) {
  const dbData = prepareLessonForDb(lessonData);

  // Note: lesson_teacher_number is auto-set by database trigger (set_lesson_numbers)
  // Do NOT manually set it here as it will conflict with the trigger

  console.log('Inserting lesson with dbData:', dbData);
  return await supabase.from('lessons').insert(dbData).select().single();
}

/**
 * Transforms DB lesson data to match frontend schema
 * Maps scheduled_at -> date + start_time
 */
export function transformLessonData(lesson: Lesson & { scheduled_at?: string }) {
  const transformed = { ...lesson };

  // If we have scheduled_at but missing date/start_time (which are virtual/derived),
  // populate them from scheduled_at
  if (lesson.scheduled_at && (!lesson.date || !lesson.start_time)) {
    const dateObj = new Date(lesson.scheduled_at);

    // Format date as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    transformed.date = `${year}-${month}-${day}`;

    // Format time as HH:MM
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    transformed.start_time = `${hours}:${minutes}`;
  }

  return transformed;
}

/**
 * Prepares frontend lesson input for DB insertion
 * Maps date + start_time -> scheduled_at
 */
export function prepareLessonForDb(lessonData: Partial<LessonInput>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbData: any = { ...lessonData };

  // Combine date and start_time into scheduled_at (if date is provided)
  if (lessonData.date) {
    const timeStr = lessonData.start_time || '00:00';
    // Create date object from date and time strings
    // We use a simple string concatenation and let Date parse it
    // This assumes the input date/time are "local" to the user/server context
    const dateTimeStr = `${lessonData.date}T${timeStr}:00`;
    dbData.scheduled_at = new Date(dateTimeStr).toISOString();
  }

  // Remove virtual fields that don't exist in DB
  delete dbData.date;
  delete dbData.start_time;
  delete dbData.time;

  // Remove song_ids if it exists (should be handled separately)
  delete dbData.song_ids;

  // Remove auto-generated fields that are set by database triggers
  // lesson_number is auto-set by set_lesson_number() trigger
  delete dbData.lesson_number;
  delete dbData.lesson_teacher_number;

  // Remove fields that don't exist in the actual database schema
  delete dbData.creator_user_id;

  // Filter out undefined values to prevent Supabase JSONB operator errors
  Object.keys(dbData).forEach((key) => {
    if (dbData[key] === undefined) {
      delete dbData[key];
    }
  });

  return dbData;
}
