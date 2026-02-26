'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import {
  CsvSongImportRequestSchema,
  type CsvSongRow,
  type CsvSongImportResult,
  type CsvSongImportRowResult,
} from '@/schemas/CsvSongImportSchema';
import { parseEuropeanDate, groupRowsByDate, findOrCreateSong } from './import-csv-songs.helpers';

export async function importCsvSongs(
  input: unknown
): Promise<CsvSongImportResult> {
  const { user, isTeacher, isAdmin } = await getUserWithRolesSSR();
  if (!user || (!isTeacher && !isAdmin)) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = CsvSongImportRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const { studentId, rows, validateOnly, repertoireOnly } = parsed.data;
  const supabase = await createClient();
  const counters = { songsMatched: 0, songsCreated: 0 };
  const songCache = new Map<string, { id: string; matchStatus: 'matched' | 'low_confidence' | 'new'; matchedTitle?: string; score?: number }>();

  if (repertoireOnly) {
    return importRepertoireOnly(supabase, rows, studentId, validateOnly, songCache, counters);
  }

  return importWithLessons(supabase, rows, studentId, user.id, validateOnly, songCache, counters);
}

async function importRepertoireOnly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: CsvSongRow[],
  studentId: string,
  validateOnly: boolean,
  songCache: Map<string, { id: string; matchStatus: 'matched' | 'low_confidence' | 'new'; matchedTitle?: string; score?: number }>,
  counters: { songsMatched: number; songsCreated: number },
): Promise<CsvSongImportResult> {
  const results: CsvSongImportRowResult[] = [];
  let errorCount = 0;

  for (const row of rows) {
    const rowIndex = rows.indexOf(row);
    const author = row.author?.trim() || 'Unknown';

    try {
      const match = await findOrCreateSong(supabase, row.title, author, validateOnly, songCache, counters);

      if (match.error) {
        results.push({
          rowIndex, date: '', title: row.title, author,
          success: false, error: match.error,
          matchStatus: 'new', lessonCreated: false, songCreated: false,
        });
        errorCount++;
        continue;
      }

      if (!validateOnly && match.songId) {
        await supabase
          .from('student_songs')
          .upsert(
            { student_id: studentId, song_id: match.songId, status: 'to_learn' },
            { onConflict: 'student_id,song_id' }
          );
      }

      results.push({
        rowIndex, date: '', title: row.title, author,
        success: true,
        matchStatus: match.matchStatus, matchedSongTitle: match.matchedTitle,
        matchScore: match.matchScore, songId: match.songId,
        lessonCreated: false, songCreated: match.songCreated,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({
        rowIndex, date: '', title: row.title, author,
        success: false, error: message,
        matchStatus: 'new', lessonCreated: false, songCreated: false,
      });
      errorCount++;
    }
  }

  return {
    success: true,
    results,
    summary: {
      totalRows: rows.length,
      songsMatched: counters.songsMatched,
      songsCreated: counters.songsCreated,
      lessonsCreated: 0,
      lessonsExisting: 0,
      errors: errorCount,
    },
  };
}

async function importWithLessons(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: CsvSongRow[],
  studentId: string,
  teacherId: string,
  validateOnly: boolean,
  songCache: Map<string, { id: string; matchStatus: 'matched' | 'low_confidence' | 'new'; matchedTitle?: string; score?: number }>,
  counters: { songsMatched: number; songsCreated: number },
): Promise<CsvSongImportResult> {
  const results: CsvSongImportRowResult[] = [];
  let errorCount = 0;
  let lessonsCreated = 0;
  let lessonsExisting = 0;

  const dateGroups = groupRowsByDate(rows);

  for (const [dateStr, dateRows] of dateGroups) {
    const isoDate = parseEuropeanDate(dateStr);
    if (!isoDate) {
      for (const row of dateRows) {
        results.push({
          rowIndex: rows.indexOf(row), date: dateStr, title: row.title,
          author: row.author || '', success: false,
          error: `Invalid date: ${dateStr}`,
          matchStatus: 'new', lessonCreated: false, songCreated: false,
        });
        errorCount++;
      }
      continue;
    }

    const lesson = await findOrCreateLesson(supabase, teacherId, studentId, isoDate, validateOnly);
    if (lesson.error) {
      for (const row of dateRows) {
        results.push({
          rowIndex: rows.indexOf(row), date: dateStr, title: row.title,
          author: row.author || '', success: false, error: lesson.error,
          matchStatus: 'new', lessonCreated: false, songCreated: false,
        });
        errorCount++;
      }
      continue;
    }

    if (lesson.created) lessonsCreated++;
    else if (lesson.id) lessonsExisting++;

    for (const row of dateRows) {
      const rowIndex = rows.indexOf(row);
      const author = row.author?.trim() || 'Unknown';

      try {
        const match = await findOrCreateSong(supabase, row.title, author, validateOnly, songCache, counters);

        if (match.error) {
          results.push({
            rowIndex, date: dateStr, title: row.title, author,
            success: false, error: match.error,
            matchStatus: 'new', lessonCreated: lesson.created, songCreated: false,
          });
          errorCount++;
          continue;
        }

        if (!validateOnly && match.songId && lesson.id) {
          await supabase
            .from('lesson_songs')
            .upsert(
              { lesson_id: lesson.id, song_id: match.songId, status: 'to_learn' },
              { onConflict: 'lesson_id,song_id' }
            );
        }

        results.push({
          rowIndex, date: dateStr, title: row.title, author,
          success: true,
          matchStatus: match.matchStatus, matchedSongTitle: match.matchedTitle,
          matchScore: match.matchScore, songId: match.songId,
          lessonId: lesson.id, lessonCreated: lesson.created,
          songCreated: match.songCreated,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          rowIndex, date: dateStr, title: row.title, author,
          success: false, error: message,
          matchStatus: 'new', lessonCreated: lesson.created, songCreated: false,
        });
        errorCount++;
      }
    }
  }

  return {
    success: true,
    results,
    summary: {
      totalRows: rows.length,
      songsMatched: counters.songsMatched,
      songsCreated: counters.songsCreated,
      lessonsCreated,
      lessonsExisting,
      errors: errorCount,
    },
  };
}

async function findOrCreateLesson(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  studentId: string,
  isoDate: string,
  validateOnly: boolean,
): Promise<{ id?: string; created: boolean; error?: string }> {
  if (validateOnly) return { created: false };

  const dateOnly = isoDate.split('T')[0];
  const { data: existing } = await supabase
    .from('lessons')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .gte('scheduled_at', `${dateOnly}T00:00:00Z`)
    .lt('scheduled_at', `${dateOnly}T23:59:59Z`)
    .is('deleted_at', null)
    .limit(1)
    .single();

  if (existing) return { id: existing.id, created: false };

  const { data: newLesson, error } = await supabase
    .from('lessons')
    .insert({
      teacher_id: teacherId,
      student_id: studentId,
      scheduled_at: isoDate,
      status: 'COMPLETED',
      title: 'Lesson (imported)',
    })
    .select('id')
    .single();

  if (error || !newLesson) {
    return { created: false, error: `Failed to create lesson: ${error?.message || 'Unknown error'}` };
  }

  return { id: newLesson.id, created: true };
}
