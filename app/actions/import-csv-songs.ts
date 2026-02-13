'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import {
  CsvSongImportRequestSchema,
  type CsvSongImportResult,
  type CsvSongImportRowResult,
  type SimilarSong,
} from '@/schemas/CsvSongImportSchema';
import { parseEuropeanDate, groupRowsByDate } from './import-csv-songs.helpers';

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

  const { studentId, rows, validateOnly } = parsed.data;
  const supabase = await createClient();
  const results: CsvSongImportRowResult[] = [];
  let songsMatched = 0;
  let songsCreated = 0;
  let lessonsCreated = 0;
  let lessonsExisting = 0;
  let errorCount = 0;

  const dateGroups = groupRowsByDate(rows);

  // Cache to avoid re-querying the same song title
  const songCache = new Map<string, { id: string; matchStatus: 'matched' | 'low_confidence' | 'new'; matchedTitle?: string; score?: number }>();

  for (const [dateStr, dateRows] of dateGroups) {
    const isoDate = parseEuropeanDate(dateStr);
    if (!isoDate) {
      for (let i = 0; i < dateRows.length; i++) {
        const row = dateRows[i];
        results.push({
          rowIndex: rows.indexOf(row),
          date: dateStr,
          title: row.title,
          author: row.author || '',
          success: false,
          error: `Invalid date: ${dateStr}`,
          matchStatus: 'new',
          lessonCreated: false,
          songCreated: false,
        });
        errorCount++;
      }
      continue;
    }

    // Find or create lesson for this date
    let lessonId: string | undefined;
    let lessonWasCreated = false;

    if (!validateOnly) {
      const dateOnly = isoDate.split('T')[0];
      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('teacher_id', user.id)
        .eq('student_id', studentId)
        .gte('scheduled_at', `${dateOnly}T00:00:00Z`)
        .lt('scheduled_at', `${dateOnly}T23:59:59Z`)
        .is('deleted_at', null)
        .limit(1)
        .single();

      if (existingLesson) {
        lessonId = existingLesson.id;
        lessonsExisting++;
      } else {
        const { data: newLesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            teacher_id: user.id,
            student_id: studentId,
            scheduled_at: isoDate,
            status: 'COMPLETED',
            title: 'Lesson (imported)',
          })
          .select('id')
          .single();

        if (lessonError || !newLesson) {
          for (const row of dateRows) {
            results.push({
              rowIndex: rows.indexOf(row),
              date: dateStr,
              title: row.title,
              author: row.author || '',
              success: false,
              error: `Failed to create lesson: ${lessonError?.message || 'Unknown error'}`,
              matchStatus: 'new',
              lessonCreated: false,
              songCreated: false,
            });
            errorCount++;
          }
          continue;
        }
        lessonId = newLesson.id;
        lessonsCreated++;
        lessonWasCreated = true;
      }
    }

    // Process each song row for this date
    for (const row of dateRows) {
      const rowIndex = rows.indexOf(row);
      const titleLower = row.title.toLowerCase().trim();
      const author = row.author?.trim() || 'Unknown';

      try {
        let songId: string | undefined;
        let matchStatus: 'matched' | 'low_confidence' | 'new' = 'new';
        let matchedTitle: string | undefined;
        let matchScore: number | undefined;
        let songWasCreated = false;

        // Check cache first
        const cached = songCache.get(titleLower);
        if (cached) {
          songId = cached.id;
          matchStatus = cached.matchStatus;
          matchedTitle = cached.matchedTitle;
          matchScore = cached.score;
        } else {
          // Fuzzy match via RPC
          const { data: similar } = await supabase.rpc('find_similar_songs', {
            search_title: row.title,
            threshold: 0.3,
            max_results: 1,
          }) as { data: SimilarSong[] | null };

          if (similar && similar.length > 0) {
            const best = similar[0];
            songId = best.id;
            matchScore = best.similarity;
            matchedTitle = best.title;
            matchStatus = best.similarity >= 0.6 ? 'matched' : 'low_confidence';
            if (matchStatus === 'matched') songsMatched++;
          }

          if (!songId && !validateOnly) {
            // Create new song
            const { data: newSong, error: songError } = await supabase
              .from('songs')
              .insert({ title: row.title, author })
              .select('id')
              .single();

            if (songError || !newSong) {
              results.push({
                rowIndex, date: dateStr, title: row.title, author,
                success: false, error: `Failed to create song: ${songError?.message}`,
                matchStatus: 'new', lessonCreated: lessonWasCreated, songCreated: false,
              });
              errorCount++;
              continue;
            }
            songId = newSong.id;
            songWasCreated = true;
            songsCreated++;
          }

          if (songId) {
            songCache.set(titleLower, { id: songId, matchStatus, matchedTitle, score: matchScore });
          }
        }

        // Link song to lesson
        if (!validateOnly && songId && lessonId) {
          await supabase
            .from('lesson_songs')
            .upsert(
              { lesson_id: lessonId, song_id: songId, status: 'to_learn' },
              { onConflict: 'lesson_id,song_id' }
            );
        }

        results.push({
          rowIndex, date: dateStr, title: row.title, author,
          success: true,
          matchStatus, matchedSongTitle: matchedTitle, matchScore,
          songId, lessonId,
          lessonCreated: lessonWasCreated, songCreated: songWasCreated,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          rowIndex, date: dateStr, title: row.title, author,
          success: false, error: message,
          matchStatus: 'new', lessonCreated: lessonWasCreated, songCreated: false,
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
      songsMatched,
      songsCreated,
      lessonsCreated,
      lessonsExisting,
      errors: errorCount,
    },
  };
}
