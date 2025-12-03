'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { matchStudentByEmail, createShadowStudent } from '@/lib/services/import-utils';
import { Database } from '@/database.types';
import { getCalendarEventsInRange, CalendarEvent } from '@/lib/google';

type LessonInsert = Database['public']['Tables']['lessons']['Insert'];

export interface EnrichedCalendarEvent extends CalendarEvent {
  matchStatus: 'MATCHED' | 'AMBIGUOUS' | 'NONE';
  matchedStudent?: { id: string; full_name: string | null; email: string };
  studentAttendee?: { email: string; displayName?: string };
}

export interface ImportEvent {
  googleEventId: string;
  title: string;
  notes?: string;
  startTime: string;
  attendeeEmail: string;
  attendeeName?: string;
  manualStudentId?: string; // For manual override
}

export async function importLessonsFromGoogle(events: ImportEvent[]) {
  const { user, isTeacher } = await getUserWithRolesSSR();

  if (!user || !isTeacher) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const results = [];

  for (const event of events) {
    let studentId = event.manualStudentId;

    // If no manual override, try to match or create
    if (!studentId) {
      const match = await matchStudentByEmail(event.attendeeEmail);

      if (match.status === 'MATCHED') {
        studentId = match.candidates[0].id.toString();
      } else if (match.status === 'NONE' && event.attendeeName) {
        // Create shadow student
        const [firstName, ...lastNameParts] = event.attendeeName.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const createResult = await createShadowStudent(event.attendeeEmail, firstName, lastName);

        if (!createResult.success) {
          console.error('Error creating shadow student:', event.attendeeEmail, createResult.error);
          results.push({ eventId: event.googleEventId, success: false, error: createResult.error });
          continue;
        }

        studentId = createResult.profileId!;
      } else {
        results.push({
          eventId: event.googleEventId,
          success: false,
          error: 'Student match required',
        });
        continue;
      }
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('lessons')
      .select('id')
      .eq('google_event_id', event.googleEventId)
      .single();

    if (existing) {
      results.push({ eventId: event.googleEventId, success: false, error: 'Already imported' });
      continue;
    }

    // Insert lesson
    // Use correct column names matching database.types.ts
    const lessonData: LessonInsert = {
      student_id: studentId,
      teacher_id: user.id,
      title: event.title || 'Lesson',
      notes: event.notes,
      scheduled_at: event.startTime, // Mapped from startTime
      google_event_id: event.googleEventId,
      status: 'SCHEDULED',
      lesson_teacher_number: 0, // Required field in database.types.ts
    };

    const { error } = await supabase.from('lessons').insert(lessonData);

    if (error) {
      console.error('Error importing lesson:', event.googleEventId, error);
      results.push({ eventId: event.googleEventId, success: false, error: error.message });
    } else {
      results.push({ eventId: event.googleEventId, success: true });
    }
  }

  return { success: true, results };
}

export async function fetchGoogleEvents(startDate: string, endDate: string) {
  const { user, isTeacher } = await getUserWithRolesSSR();
  if (!user || !isTeacher) return { success: false, error: 'Unauthorized' };

  const teacherEmail = user.email;

  try {
    const events = await getCalendarEventsInRange(user.id, new Date(startDate), new Date(endDate));

    // Enrich events with match status
    const enrichedEvents: EnrichedCalendarEvent[] = await Promise.all(
      events.map(async (event) => {
        // Find the student attendee (any attendee that is not the teacher)
        // We filter out the current user's email (teacher).
        // TODO: Improve student identification logic.
        // Currently, we assume the first attendee that is NOT the teacher is the student.
        // This might fail if there are multiple attendees (e.g. parents, multiple students).
        // Consider:
        // 1. Checking for specific roles if available.
        // 2. Handling multiple students per lesson.
        // 3. Using a more sophisticated heuristic based on past lessons or contact lists.
        let studentAttendee = event.attendees?.find((a) => a.email !== teacherEmail);

        // Try to guess name from summary if missing
        if (studentAttendee && !studentAttendee.displayName && event.summary) {
          // Simple heuristic: if summary contains " and ", split it.
          const parts = event.summary.split(' and ');
          if (parts.length === 2) {
            // If we have user name, we can try to identify the other part
            const userName = user.user_metadata?.full_name;
            if (userName) {
              if (parts[0].includes(userName)) {
                studentAttendee = { ...studentAttendee, displayName: parts[1].trim() };
              } else if (parts[1].includes(userName)) {
                studentAttendee = { ...studentAttendee, displayName: parts[0].trim() };
              }
            } else {
              // If we don't know user name, assume the first part is student (common pattern: Student and Teacher)
              // But this is risky. Let's just leave it as is if we can't be sure.
              // Or maybe just take the part that is NOT "Piotr Romańczuk" (hardcoded check? No, bad practice).
              // Let's just use the first part as a fallback guess if it looks like a name.
              studentAttendee = { ...studentAttendee, displayName: parts[0].trim() };
            }
          }
        }

        const attendeeEmail = studentAttendee?.email;
        let matchStatus: 'MATCHED' | 'AMBIGUOUS' | 'NONE' = 'NONE';
        let matchedStudent;

        if (attendeeEmail) {
          const match = await matchStudentByEmail(attendeeEmail);
          matchStatus = match.status;
          if (match.status === 'MATCHED') {
            const candidate = match.candidates[0];
            matchedStudent = {
              id: candidate.id,
              full_name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
              email: candidate.email,
            };
          }
        }

        // Fix organizer
        let organizer = event.organizer;
        if (organizer && !organizer.displayName && organizer.email === teacherEmail) {
          organizer = { ...organizer, displayName: user.user_metadata?.full_name || 'Me' };
        }

        return {
          ...event,
          matchStatus,
          matchedStudent,
          studentAttendee,
          organizer,
        };
      })
    );

    return { success: true, events: enrichedEvents };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
