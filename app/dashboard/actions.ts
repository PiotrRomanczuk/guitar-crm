'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGoogleOAuth2Client } from '@/lib/google';
import { google, calendar_v3 } from 'googleapis';
import { SupabaseClient } from '@supabase/supabase-js';

async function getAuthenticatedCalendarClient(userId: string) {
  const supabase = await createClient();
  const { data: integration, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !integration) {
    throw new Error('Google Calendar not connected');
  }

  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: integration.expires_at,
  });

  const now = Date.now();
  if (integration.expires_at && integration.expires_at < now) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await supabase
        .from('user_integrations')
        .update({
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date,
          updated_at: new Date().toISOString(),
          ...(credentials.refresh_token && { refresh_token: credentials.refresh_token }),
        })
        .eq('user_id', userId)
        .eq('provider', 'google');
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError);
      throw new Error('Failed to refresh Google access token');
    }
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function getGoogleEvents() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const calendar = await getAuthenticatedCalendarClient(user.id);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: fourteenDaysAgo.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    if (error instanceof Error && error.message === 'Google Calendar not connected') {
      return null;
    }
    throw new Error('Failed to fetch calendar events');
  }
}

export async function getPotentialCustomerEvents() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const calendar = await getAuthenticatedCalendarClient(user.id);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: fourteenDaysAgo.toISOString(),
      q: 'Pierwsza lekcja',
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching potential customer events:', error);
    if (error instanceof Error && error.message === 'Google Calendar not connected') {
      return null;
    }
    throw new Error('Failed to fetch potential customer events');
  }
}

export async function inviteUser(
  email: string,
  fullName: string,
  role: 'student' | 'teacher' | 'admin' = 'student',
  phone?: string
) {
  const supabaseAdmin = createAdminClient();

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers.users.find((u) => u.email === email);

  let userId = existingUser?.id;

  console.log(`[Invite Debug] Checking if user ${email} exists... Found ID: ${userId || 'No'}`);

  if (!userId) {
    console.log(`[Invite Debug] Sending invite to ${email}...`);
    const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email
    );
    console.log('[Invite Debug] Supabase Response:', { user: authData.user?.id, error: inviteError?.message });
    
    if (inviteError) throw new Error(`Failed to invite user: ${inviteError.message}`);
    if (!authData.user) throw new Error('User creation failed');
    userId = authData.user.id;
  } else {
    console.log(`[Invite Debug] User already exists. Skipping invite email.`);
  }

  const updates: Record<string, unknown> = {
    full_name: fullName,
    phone: phone || null,
    is_student: role === 'student',
    is_teacher: role === 'teacher',
    is_admin: role === 'admin',
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (profileError) console.error('Error updating profile:', profileError);

  return { success: true, userId };
}

export async function syncLessonsFromCalendar(studentEmail: string, studentId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let targetStudentId = studentId;
  if (!targetStudentId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', studentEmail)
      .single();

    if (profile) {
      targetStudentId = profile.id;
    } else {
      // If we can't find the student ID, we can't link the lesson to a student in the DB
      // unless we create a new student or just log it.
      // For now, let's throw an error if not found.
      throw new Error(`Student with email ${studentEmail} not found in the system.`);
    }
  }

  const calendar = await getAuthenticatedCalendarClient(user.id);

  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);
  const sevenDaysFuture = new Date(now);
  sevenDaysFuture.setDate(now.getDate() + 7);

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: fourteenDaysAgo.toISOString(),
      timeMax: sevenDaysFuture.toISOString(),
      q: studentEmail,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const supabaseAdmin = createAdminClient();
    let createdCount = 0;

    for (const event of events) {
      const created = await syncSingleEvent(
        supabaseAdmin,
        event,
        user.id,
        targetStudentId!,
        studentEmail
      );
      if (created) createdCount++;
    }

    return { success: true, count: createdCount };
  } catch (error) {
    console.error('Error syncing lessons:', error);
    throw new Error('Failed to sync lessons');
  }
}

function isEventRelevant(event: calendar_v3.Schema$Event, studentEmail: string): boolean {
  if (!event.start?.dateTime || !event.id) return false;

  return !!(
    event.attendees?.some((a) => a.email === studentEmail) ||
    event.summary?.includes(studentEmail) ||
    event.description?.includes(studentEmail)
  );
}

async function updateLesson(
  supabaseAdmin: SupabaseClient,
  lessonId: string,
  event: calendar_v3.Schema$Event
) {
  const { error } = await supabaseAdmin
    .from('lessons')
    .update({
      title: event.summary || 'Lesson',
      scheduled_at: event.start!.dateTime!,
    })
    .eq('id', lessonId);

  if (error) console.error('Error updating lesson:', error);
}

async function createLesson(
  supabaseAdmin: SupabaseClient,
  event: calendar_v3.Schema$Event,
  teacherId: string,
  studentId: string
): Promise<boolean> {
  const { data: lastLesson } = await supabaseAdmin
    .from('lessons')
    .select('lesson_teacher_number')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .order('lesson_teacher_number', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = (lastLesson?.lesson_teacher_number || 0) + 1;

  const { error } = await supabaseAdmin.from('lessons').insert({
    teacher_id: teacherId,
    student_id: studentId,
    title: event.summary || 'Lesson',
    scheduled_at: event.start!.dateTime!,
    google_event_id: event.id,
    lesson_teacher_number: nextNumber,
  });

  if (error) {
    console.error('Error inserting lesson:', error);
    return false;
  }
  return true;
}

async function syncSingleEvent(
  supabaseAdmin: SupabaseClient,
  event: calendar_v3.Schema$Event,
  teacherId: string,
  studentId: string,
  studentEmail: string
): Promise<boolean> {
  if (!isEventRelevant(event, studentEmail)) return false;

  const { data: existing } = await supabaseAdmin
    .from('lessons')
    .select('id')
    .eq('google_event_id', event.id!)
    .single();

  if (existing) {
    await updateLesson(supabaseAdmin, existing.id, event);
    return false;
  }

  return await createLesson(supabaseAdmin, event, teacherId, studentId);
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Check if requester is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const supabaseAdmin = createAdminClient();
  
  // Delete from profiles first (to ensure clean state if no cascade)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
    // Continue to delete auth user even if profile delete fails (might be already gone)
  }

  // Delete from auth.users
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  return { success: true };
}
