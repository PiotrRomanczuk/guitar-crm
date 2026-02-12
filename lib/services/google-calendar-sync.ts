import { createClient } from '@/lib/supabase/server';
import { matchStudentByEmail, createShadowStudent } from '@/lib/services/import-utils';
import { TablesInsert } from '@/types/database.types';
import { getCalendarEventsInRange } from '@/lib/google';

function isGuitarLesson(event: { description?: string | null }): boolean {
  if (!event.description) return false;
  return event.description.includes('Powered by Calendly.com');
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

export async function syncGoogleEventsForUser(userId: string, events: ImportEvent[]) {
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
          results.push({ eventId: event.googleEventId, success: false, error: createResult.error });
          continue;
        }

        studentId = createResult.profileId!;
      } else {
        // If ambiguous, we skip for now in automated flow
        results.push({
          eventId: event.googleEventId,
          success: false,
          error: 'Student match ambiguous or required',
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
    const lessonData: TablesInsert<'lessons'> = {
      student_id: studentId,
      teacher_id: userId,
      title: event.title || 'Lesson',
      notes: event.notes,
      scheduled_at: event.startTime,
      google_event_id: event.googleEventId,
      status: 'SCHEDULED',
    };

    const { error } = await supabase.from('lessons').insert(lessonData);

    if (error) {
      results.push({ eventId: event.googleEventId, success: false, error: error.message });
    } else {
      results.push({ eventId: event.googleEventId, success: true });
    }
  }

  return { success: true, results };
}

export async function fetchAndSyncRecentEvents(userId: string) {
  // Sync events from now to 30 days in future, and maybe 7 days back?
  // Webhook usually notifies about a change, so we should probably sync a window around now or just future.
  // Let's sync next 30 days.
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  try {
    const googleEvents = await getCalendarEventsInRange(userId, startDate, endDate);

    const importEvents: ImportEvent[] = googleEvents
      .filter((e) => isGuitarLesson(e) && e.attendees && e.attendees.length > 0 && e.attendees[0].email)
      .map((e) => ({
        googleEventId: e.id,
        title: e.summary,
        notes: e.description,
        startTime: e.start.dateTime,
        attendeeEmail: e.attendees![0].email,
        attendeeName: e.attendees![0].displayName || '',
      }));

    if (importEvents.length === 0) {
      return { success: true, count: 0 };
    }

    const result = await syncGoogleEventsForUser(userId, importEvents);
    return {
      success: true,
      count: result.results.filter((r) => r.success).length,
      details: result,
    };
  } catch (error) {
    console.error('Error syncing events:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
