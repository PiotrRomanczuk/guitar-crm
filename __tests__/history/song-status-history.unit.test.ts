import { createClient } from '@/lib/supabase/client';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Song Status History Tracking', () => {
  let supabase: ReturnType<typeof createClient>;
  let testLessonId: string;
  let testSongId: string;
  let testStudentId: string;

  beforeEach(async () => {
    supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Get a student
    const { data: students } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student')
      .limit(1)
      .single();
    
    testStudentId = students?.user_id || user.id;

    // Get or create a song
    const { data: song } = await supabase
      .from('songs')
      .select('id')
      .limit(1)
      .single();

    if (!song) {
      const { data: newSong } = await supabase
        .from('songs')
        .insert({ title: 'Test Song', author: 'Test Author' })
        .select('id')
        .single();
      testSongId = newSong!.id;
    } else {
      testSongId = song.id;
    }

    // Create a lesson
    const { data: lesson } = await supabase
      .from('lessons')
      .insert({
        student_id: testStudentId,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        status: 'scheduled',
      })
      .select()
      .single();

    testLessonId = lesson!.id;

    // Add song to lesson
    await supabase
      .from('lesson_songs')
      .insert({
        lesson_id: testLessonId,
        song_id: testSongId,
        status: 'to_learn',
      });
  });

  afterEach(async () => {
    // Clean up
    if (testLessonId && testSongId) {
      await supabase
        .from('song_status_history')
        .delete()
        .eq('lesson_id', testLessonId);
      
      await supabase
        .from('lesson_songs')
        .delete()
        .eq('lesson_id', testLessonId);
      
      await supabase
        .from('lessons')
        .delete()
        .eq('id', testLessonId);
    }
  });

  it('should create history record when song status changes', async () => {
    // Update status
    await supabase
      .from('lesson_songs')
      .update({ status: 'learning' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    // Check history
    const { data: history } = await supabase
      .from('song_status_history')
      .select('*')
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId)
      .eq('new_status', 'learning')
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.previous_status).toBe('to_learn');
    expect(history?.new_status).toBe('learning');
  });

  it('should track progression through statuses', async () => {
    // Progress through statuses
    await supabase
      .from('lesson_songs')
      .update({ status: 'learning' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    await supabase
      .from('lesson_songs')
      .update({ status: 'learned' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    await supabase
      .from('lesson_songs')
      .update({ status: 'mastered' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    // Get all history
    const { data: history } = await supabase
      .from('song_status_history')
      .select('*')
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId)
      .order('changed_at', { ascending: true });

    expect(history).toBeDefined();
    expect(history!.length).toBe(3);
    
    // Verify progression
    expect(history![0].new_status).toBe('learning');
    expect(history![1].new_status).toBe('learned');
    expect(history![2].new_status).toBe('mastered');
  });

  it('should join with student and song details', async () => {
    await supabase
      .from('lesson_songs')
      .update({ status: 'learning' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    const { data: history } = await supabase
      .from('song_status_history')
      .select(`
        *,
        student_profile:profiles!song_status_history_student_id_fkey(full_name, email),
        song:songs(title, author)
      `)
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId)
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.student_profile).toBeDefined();
    expect(history?.song).toBeDefined();
  });

  it('should filter by student', async () => {
    await supabase
      .from('lesson_songs')
      .update({ status: 'learning' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    const { data: history } = await supabase
      .from('song_status_history')
      .select('*')
      .eq('student_id', testStudentId)
      .order('changed_at', { ascending: false });

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
    
    if (history && history.length > 0) {
      expect(history[0].student_id).toBe(testStudentId);
    }
  });

  it('should filter by song', async () => {
    await supabase
      .from('lesson_songs')
      .update({ status: 'learning' })
      .eq('lesson_id', testLessonId)
      .eq('song_id', testSongId);

    const { data: history } = await supabase
      .from('song_status_history')
      .select('*')
      .eq('song_id', testSongId)
      .order('changed_at', { ascending: false });

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
    
    if (history && history.length > 0) {
      expect(history[0].song_id).toBe(testSongId);
    }
  });
});
