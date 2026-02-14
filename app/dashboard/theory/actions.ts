'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TheoryCourseInputSchema, TheoryLessonInputSchema } from '@/schemas/TheoryLessonSchema';

// ============================================================================
// COURSES
// ============================================================================

export async function getTheoryCourses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('theoretical_courses')
    .select(`
      id, title, description, cover_image_url, level,
      is_published, sort_order, created_at,
      theoretical_lessons(id)
    `)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[getTheoryCourses] Error:', error);
    return [];
  }

  return (data ?? []).map((c) => ({
    ...c,
    lesson_count: c.theoretical_lessons?.length ?? 0,
    theoretical_lessons: undefined,
  }));
}

export async function getTheoryCourse(courseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('theoretical_courses')
    .select(`
      *,
      creator:profiles!theoretical_courses_created_by_fkey(id, full_name),
      lessons:theoretical_lessons(
        id, title, excerpt, is_published, sort_order, created_at
      )
    `)
    .eq('id', courseId)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('[getTheoryCourse] Error:', error);
    return null;
  }

  // Sort lessons by sort_order
  if (data?.lessons) {
    data.lessons.sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    );
  }

  return data;
}

export async function createTheoryCourse(input: unknown) {
  const parsed = TheoryCourseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Get next sort_order
  const { data: maxRow } = await supabase
    .from('theoretical_courses')
    .select('sort_order')
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('theoretical_courses')
    .insert({
      ...parsed.data,
      cover_image_url: parsed.data.cover_image_url || null,
      created_by: user.id,
      sort_order: nextOrder,
      published_at: parsed.data.is_published ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createTheoryCourse] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/theory');
  return { success: true, courseId: data.id };
}

export async function updateTheoryCourse(courseId: string, input: unknown) {
  const parsed = TheoryCourseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();

  // Check if published state changed
  const { data: existing } = await supabase
    .from('theoretical_courses')
    .select('is_published')
    .eq('id', courseId)
    .single();

  const publishedAt =
    parsed.data.is_published && !existing?.is_published
      ? new Date().toISOString()
      : undefined;

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    cover_image_url: parsed.data.cover_image_url || null,
  };
  if (publishedAt) updateData.published_at = publishedAt;

  const { error } = await supabase
    .from('theoretical_courses')
    .update(updateData)
    .eq('id', courseId);

  if (error) {
    console.error('[updateTheoryCourse] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/theory');
  revalidatePath(`/dashboard/theory/${courseId}`);
  return { success: true };
}

export async function deleteTheoryCourse(courseId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('theoretical_courses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', courseId);

  if (error) {
    console.error('[deleteTheoryCourse] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/theory');
  return { success: true };
}

// ============================================================================
// LESSONS (CHAPTERS)
// ============================================================================

export async function getTheoryLesson(lessonId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('theoretical_lessons')
    .select(`
      *,
      course:theoretical_courses(id, title, created_by)
    `)
    .eq('id', lessonId)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('[getTheoryLesson] Error:', error);
    return null;
  }

  return data;
}

export async function createTheoryLesson(courseId: string, input: unknown) {
  const parsed = TheoryLessonInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();

  // Get next sort_order for this course
  const { data: maxRow } = await supabase
    .from('theoretical_lessons')
    .select('sort_order')
    .eq('course_id', courseId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('theoretical_lessons')
    .insert({
      ...parsed.data,
      course_id: courseId,
      sort_order: nextOrder,
      published_at: parsed.data.is_published ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createTheoryLesson] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/theory/${courseId}`);
  return { success: true, lessonId: data.id };
}

export async function updateTheoryLesson(lessonId: string, courseId: string, input: unknown) {
  const parsed = TheoryLessonInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('theoretical_lessons')
    .select('is_published')
    .eq('id', lessonId)
    .single();

  const publishedAt =
    parsed.data.is_published && !existing?.is_published
      ? new Date().toISOString()
      : undefined;

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (publishedAt) updateData.published_at = publishedAt;

  const { error } = await supabase
    .from('theoretical_lessons')
    .update(updateData)
    .eq('id', lessonId);

  if (error) {
    console.error('[updateTheoryLesson] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/theory/${courseId}`);
  revalidatePath(`/dashboard/theory/${courseId}/${lessonId}`);
  return { success: true };
}

export async function deleteTheoryLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('theoretical_lessons')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', lessonId);

  if (error) {
    console.error('[deleteTheoryLesson] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/theory/${courseId}`);
  return { success: true };
}

// ============================================================================
// ACCESS CONTROL
// ============================================================================

export async function getCourseAccess(courseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('theoretical_course_access')
    .select(`
      id, course_id, user_id, granted_by, granted_at,
      user:profiles!theoretical_course_access_user_id_fkey(id, full_name, email)
    `)
    .eq('course_id', courseId)
    .order('granted_at', { ascending: false });

  if (error) {
    console.error('[getCourseAccess] Error:', error);
    return [];
  }

  return data ?? [];
}

export async function grantCourseAccess(courseId: string, userIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const rows = userIds.map((userId) => ({
    course_id: courseId,
    user_id: userId,
    granted_by: user.id,
  }));

  const { error } = await supabase
    .from('theoretical_course_access')
    .upsert(rows, { onConflict: 'course_id,user_id' });

  if (error) {
    console.error('[grantCourseAccess] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/theory/${courseId}`);
  return { success: true };
}

export async function revokeCourseAccess(courseId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('theoretical_course_access')
    .delete()
    .eq('course_id', courseId)
    .eq('user_id', userId);

  if (error) {
    console.error('[revokeCourseAccess] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/theory/${courseId}`);
  return { success: true };
}

export async function getStudentsList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('is_student', true)
    .eq('is_active', true)
    .order('full_name');

  if (error) {
    console.error('[getStudentsList] Error:', error);
    return [];
  }

  return data ?? [];
}
