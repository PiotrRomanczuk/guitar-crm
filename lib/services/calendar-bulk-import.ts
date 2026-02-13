import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';
import { matchStudentByEmail, createShadowStudent } from '@/lib/services/import-utils';

export interface MonthChunk {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Generate month-boundary chunks between two dates for paginated fetching.
 */
export function generateMonthChunks(startDate: Date, endDate: Date): MonthChunk[] {
  const chunks: MonthChunk[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current < endDate) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const effectiveEnd = monthEnd > endDate ? endDate : monthEnd;

    chunks.push({
      start: monthStart,
      end: effectiveEnd,
      label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });

    current.setMonth(current.getMonth() + 1);
  }

  return chunks;
}

/**
 * Determine lesson status based on whether the event is in the past or future.
 */
export function determineLessonStatus(eventStartTime: string): 'COMPLETED' | 'SCHEDULED' {
  return new Date(eventStartTime) < new Date() ? 'COMPLETED' : 'SCHEDULED';
}

/**
 * Check if a Google Calendar event is a Calendly-booked guitar lesson.
 */
export function isGuitarLesson(event: { description?: string | null }): boolean {
  if (!event.description) return false;
  return event.description.includes('Powered by Calendly.com');
}

/**
 * Extract student email from event attendees, excluding the teacher.
 */
export function extractStudentFromAttendees(
  attendees: Array<{ email: string; displayName?: string }> | undefined,
  teacherEmail: string
): { email: string; displayName: string } | null {
  if (!attendees || attendees.length === 0) return null;

  const student =
    attendees.find((a) => a.email.toLowerCase() !== teacherEmail.toLowerCase()) || attendees[0];

  if (!student?.email) return null;

  const cleanName = (name: string) => name.replace(/\$\$\$\s*/g, '').trim();

  return {
    email: student.email,
    displayName: student.displayName ? cleanName(student.displayName) : '',
  };
}

/**
 * Find an existing student profile by email, or create a shadow student.
 * Uses the admin client to bypass RLS for bulk operations.
 */
export async function findOrCreateStudent(
  _adminClient: SupabaseClient<Database>,
  email: string,
  displayName: string
): Promise<{ profileId: string } | { error: string }> {
  const match = await matchStudentByEmail(email);

  if (match.status === 'MATCHED') {
    return { profileId: match.candidates[0].id };
  }

  if (match.status === 'AMBIGUOUS') {
    return { error: `Ambiguous match for ${email} (${match.candidates.length} candidates)` };
  }

  // No match - create shadow student
  const [firstName, ...lastParts] = (displayName || email.split('@')[0]).split(' ');
  const lastName = lastParts.join(' ') || '';

  const result = await createShadowStudent(email, firstName, lastName);

  if (!result.success || !result.profileId) {
    return { error: result.error || `Failed to create student for ${email}` };
  }

  return { profileId: result.profileId };
}
