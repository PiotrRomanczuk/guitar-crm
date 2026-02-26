'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { matchStudentByEmail, createShadowStudent } from '@/lib/services/import-utils';
import { Database } from '@/database.types';
import { getCalendarEventsInRange } from '@/lib/google';

type LessonsInsert = Database['public']['Tables']['lessons']['Insert'];

export interface ImportEvent {
  googleEventId: string;
  title: string;
  notes?: string;
  startTime: string;
  attendeeEmail: string;       // pre-selected primary attendee (kept for compat)
  allAttendeeEmails?: string[]; // all non-teacher emails for smarter resolution
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

  // Get the last lesson number for the teacher
  const { data: lastLesson } = await supabase
    .from('lessons')
    .select('lesson_teacher_number')
    .eq('teacher_id', user.id)
    .order('lesson_teacher_number', { ascending: false })
    .limit(1)
    .single();

  let nextLessonNumber = (lastLesson?.lesson_teacher_number || 0) + 1;
  
  for (const event of events) {
    let studentId = event.manualStudentId;

    // If no manual override, try to match or create
    if (!studentId) {
      // When multiple attendees present, try to find the actual student
      let resolvedEmail = event.attendeeEmail;
      if (event.allAttendeeEmails && event.allAttendeeEmails.length > 1) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, is_student, is_parent')
          .in('email', event.allAttendeeEmails);
        if (profiles && profiles.length > 0) {
          const studentProfile = profiles.find((p) => p.is_student);
          if (studentProfile?.email) {
            resolvedEmail = studentProfile.email;
          } else {
            const parentProfile = profiles.find((p) => p.is_parent);
            if (parentProfile) {
              const { data: child } = await supabase
                .from('profiles')
                .select('email')
                .eq('parent_id', parentProfile.id)
                .eq('is_student', true)
                .single();
              if (child?.email) resolvedEmail = child.email;
            }
          }
        }
      }

      const match = await matchStudentByEmail(resolvedEmail);
      
      if (match.status === 'MATCHED') {
        studentId = match.candidates[0].id.toString();
      } else if (match.status === 'NONE') {
        // Create shadow student
        let firstName = '';
        let lastName = '';

        const cleanName = (name: string) => name.replace(/\$\$\$\s*/g, '').trim();
        const displayName = event.attendeeName ? cleanName(event.attendeeName) : '';

        if (displayName) {
          const parts = displayName.split(' ');
          firstName = parts[0];
          lastName = parts.slice(1).join(' ') || '';
        } else {
          // Fallback to email if name is missing
          const namePart = resolvedEmail.split('@')[0];
          const parts = namePart.split(/[._]/);
          firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          if (parts.length > 1) {
            lastName = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
          }
        }

        const createResult = await createShadowStudent(
          resolvedEmail,
          firstName,
          lastName
        );
        
        if (!createResult.success) {
          results.push({ eventId: event.googleEventId, success: false, error: createResult.error });
          continue;
        }
        
        studentId = createResult.profileId!;
      } else {
        results.push({ eventId: event.googleEventId, success: false, error: 'Student match ambiguous' });
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
    const lessonData: LessonsInsert = {
      student_id: studentId,
      teacher_id: user.id,
      title: event.title || 'Lesson',
      notes: event.notes,
      scheduled_at: event.startTime,
      google_event_id: event.googleEventId,
      status: 'SCHEDULED',
      lesson_teacher_number: nextLessonNumber++,
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

export async function fetchGoogleEvents(startDate: string, endDate: string) {
  const { user, isTeacher } = await getUserWithRolesSSR();
  if (!user || !isTeacher) return { success: false, error: 'Unauthorized' };
  
  try {
    const events = await getCalendarEventsInRange(user.id, new Date(startDate), new Date(endDate));
    return { success: true, events };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
