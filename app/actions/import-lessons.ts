'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { matchStudentByEmail, createShadowStudent } from '@/lib/services/import-utils';
import { TablesInsert } from '@/types/database.types';
import { getCalendarEventsInRange } from '@/lib/google';

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
        
        const createResult = await createShadowStudent(
          event.attendeeEmail,
          firstName,
          lastName
        );
        
        if (!createResult.success) {
          results.push({ eventId: event.googleEventId, success: false, error: createResult.error });
          continue;
        }
        
        studentId = createResult.profileId!;
      } else {
        results.push({ eventId: event.googleEventId, success: false, error: 'Student match required' });
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
      teacher_id: user.id,
      creator_user_id: user.id,
      title: event.title || 'Lesson',
      notes: event.notes,
      start_time: event.startTime,
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

export async function fetchGoogleEvents(startDate: string, endDate: string) {
  const { user, isTeacher } = await getUserWithRolesSSR();
  if (!user || !isTeacher) return { success: false, error: 'Unauthorized' };
  
  try {
    const events = await getCalendarEventsInRange(user.id, new Date(startDate), new Date(endDate));
    return { success: true, events };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
