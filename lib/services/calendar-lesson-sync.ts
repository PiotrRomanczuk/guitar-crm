/**
 * Service for syncing lessons with Google Calendar
 * Handles bidirectional sync between Strummy lessons and Google Calendar events
 */

import { createClient } from '@/lib/supabase/server';
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '@/lib/google';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface LessonData {
  id: string;
  title: string;
  scheduled_at: string;
  notes?: string | null;
  student_id: string;
  teacher_id: string;
  google_event_id?: string | null;
  status?: string;
}

/**
 * Check if a user has Google Calendar integration enabled
 */
export async function hasGoogleIntegration(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_integrations')
    .select('access_token')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  return !error && !!data?.access_token;
}

/**
 * Get student email for Google Calendar attendee
 */
async function getStudentEmail(
  supabase: SupabaseClient,
  studentId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', studentId)
    .single();

  if (error || !data) {
    console.error('Failed to fetch student email:', error);
    return null;
  }

  return data.email;
}

/**
 * Sync a newly created lesson to Google Calendar
 * Creates a Google Calendar event and stores the event ID
 */
export async function syncLessonCreation(
  supabase: SupabaseClient,
  lessonData: LessonData
): Promise<void> {
  try {
    // Check if teacher has Google Calendar integration
    const hasIntegration = await hasGoogleIntegration(supabase, lessonData.teacher_id);
    if (!hasIntegration) {
      return; // Silent return - no integration enabled
    }

    // Get student email
    const studentEmail = await getStudentEmail(supabase, lessonData.student_id);
    if (!studentEmail) {
      console.warn('Cannot sync lesson to Google Calendar: student has no email');
      return;
    }

    // Create Google Calendar event
    const { eventId } = await createGoogleCalendarEvent(lessonData.teacher_id, {
      title: lessonData.title,
      scheduled_at: lessonData.scheduled_at,
      notes: lessonData.notes || undefined,
      student_email: studentEmail,
    });

    // Update lesson with Google event ID
    await supabase
      .from('lessons')
      .update({ google_event_id: eventId })
      .eq('id', lessonData.id);

    // Lesson synced to Google Calendar
  } catch (error) {
    // Log error but don't fail the lesson creation
    console.error('Failed to sync lesson to Google Calendar:', error);
  }
}

/**
 * Sync lesson updates to Google Calendar
 * Updates the corresponding Google Calendar event if it exists
 */
export async function syncLessonUpdate(
  supabase: SupabaseClient,
  lessonData: LessonData,
  updates: {
    title?: string;
    scheduled_at?: string;
    notes?: string | null;
  }
): Promise<void> {
  try {
    // Only sync if lesson has a Google event ID
    if (!lessonData.google_event_id) {
      return;
    }

    // Check if teacher has Google Calendar integration
    const hasIntegration = await hasGoogleIntegration(supabase, lessonData.teacher_id);
    if (!hasIntegration) {
      return;
    }

    // Update Google Calendar event
    await updateGoogleCalendarEvent(
      lessonData.teacher_id,
      lessonData.google_event_id,
      {
        title: updates.title,
        scheduled_at: updates.scheduled_at,
        notes: updates.notes || undefined,
      }
    );

    // Lesson updated in Google Calendar
  } catch (error) {
    // Log error but don't fail the lesson update
    console.error('Failed to update Google Calendar event:', error);
  }
}

/**
 * Sync lesson deletion to Google Calendar
 * Deletes the corresponding Google Calendar event if it exists
 */
export async function syncLessonDeletion(
  supabase: SupabaseClient,
  lessonId: string
): Promise<void> {
  try {
    // Fetch lesson to get Google event ID and teacher ID
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('google_event_id, teacher_id')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return; // Lesson doesn't exist or error occurred
    }

    if (!lesson.google_event_id) {
      return; // No Google Calendar event to delete
    }

    // Check if teacher has Google Calendar integration
    const hasIntegration = await hasGoogleIntegration(supabase, lesson.teacher_id);
    if (!hasIntegration) {
      return;
    }

    // Delete Google Calendar event
    await deleteGoogleCalendarEvent(lesson.teacher_id, lesson.google_event_id);

    // Lesson deleted from Google Calendar
  } catch (error) {
    // Log error but don't fail the lesson deletion
    console.error('Failed to delete Google Calendar event:', error);
  }
}
