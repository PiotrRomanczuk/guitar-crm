import { createClient } from '@/lib/supabase/client';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Lesson History Tracking', () => {
  let supabase: ReturnType<typeof createClient>;
  let testLessonId: string;
  let testUserId: string;
  let testStudentId: string;

  beforeEach(async () => {
    supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    testUserId = user.id;

    // Get a student for the lesson
    const { data: students } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student')
      .limit(1)
      .single();
    
    testStudentId = students?.user_id || testUserId;

    // Create a test lesson
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        student_id: testStudentId,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    testLessonId = lesson.id;
  });

  afterEach(async () => {
    // Clean up
    if (testLessonId) {
      await supabase.from('lesson_history').delete().eq('lesson_id', testLessonId);
      await supabase.from('lessons').delete().eq('id', testLessonId);
    }
  });

  it('should create history record when lesson is created', async () => {
    const { data: history } = await supabase
      .from('lesson_history')
      .select('*')
      .eq('lesson_id', testLessonId)
      .eq('change_type', 'created')
      .single();

    expect(history).toBeDefined();
    expect(history?.change_type).toBe('created');
    expect(history?.lesson_id).toBe(testLessonId);
    expect(history?.new_data).toBeDefined();
    expect(history?.previous_data).toBeNull();
  });

  it('should create history record when lesson is rescheduled', async () => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);

    await supabase
      .from('lessons')
      .update({ scheduled_at: newDate.toISOString() })
      .eq('id', testLessonId);

    const { data: history } = await supabase
      .from('lesson_history')
      .select('*')
      .eq('lesson_id', testLessonId)
      .eq('change_type', 'rescheduled')
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.change_type).toBe('rescheduled');
    expect(history?.previous_data).toBeDefined();
    expect(history?.new_data).toBeDefined();
  });

  it('should create history record when lesson status changes', async () => {
    await supabase
      .from('lessons')
      .update({ status: 'completed' })
      .eq('id', testLessonId);

    const { data: history } = await supabase
      .from('lesson_history')
      .select('*')
      .eq('lesson_id', testLessonId)
      .eq('change_type', 'status_changed')
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.change_type).toBe('status_changed');
    expect((history?.previous_data as any).status).toBe('scheduled');
    expect((history?.new_data as any).status).toBe('completed');
  });

  it('should create history record when lesson is cancelled', async () => {
    await supabase
      .from('lessons')
      .update({ status: 'cancelled' })
      .eq('id', testLessonId);

    const { data: history } = await supabase
      .from('lesson_history')
      .select('*')
      .eq('lesson_id', testLessonId)
      .eq('change_type', 'cancelled')
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.change_type).toBe('cancelled');
  });

  it('should join with lesson details', async () => {
    const { data: history } = await supabase
      .from('lesson_history')
      .select('*, lesson:lessons(lesson_teacher_number, student_id)')
      .eq('lesson_id', testLessonId)
      .eq('change_type', 'created')
      .single();

    expect(history).toBeDefined();
    expect(history?.lesson).toBeDefined();
  });
});
