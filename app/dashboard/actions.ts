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
    if (error instanceof Error && error.message === 'Google Calendar not connected') {
      return null;
    }
    console.error('Error fetching calendar events:', error);
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
    if (error instanceof Error && error.message === 'Google Calendar not connected') {
      return null;
    }
    console.error('Error fetching potential customer events:', error);
    throw new Error('Failed to fetch potential customer events');
  }
}

export async function inviteUser(
  email: string,
  fullName: string,
  role: 'student' | 'teacher' | 'admin' = 'student',
  phone?: string
) {
  // ✅ Authorization check - CRITICAL SECURITY FIX
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Only admins can invite users');
  }

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
    console.log('[Invite Debug] Supabase Response:', {
      user: authData.user?.id,
      error: inviteError?.message,
    });

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

export async function createShadowUser(studentEmail: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // ✅ Authorization check - CRITICAL SECURITY FIX
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    throw new Error('Unauthorized: Only teachers and admins can create shadow users');
  }

  const supabaseAdmin = createAdminClient();

  // 1. Try to find existing auth user first (to avoid duplicate error)
  let userId: string | undefined;

  // Scan first few pages of users
  let page = 1;
  const MAX_PAGES = 5;

  while (!userId && page <= MAX_PAGES) {
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (listError || !users || users.length === 0) break;

    const found = users.find((u) => u.email?.toLowerCase() === studentEmail.toLowerCase());
    if (found) {
      userId = found.id;
    }
    page++;
  }

  // 2. If not found, try to get or create user via generateLink
  if (!userId) {
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: studentEmail,
        options: {
          data: {
            is_student: true,
            full_name: studentEmail.split('@')[0],
          },
        },
      });

      if (linkError) {
        console.error('Generate link failed:', linkError);
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser(
          {
            email: studentEmail,
            email_confirm: true,
            user_metadata: {
              is_student: true,
              full_name: studentEmail.split('@')[0],
            },
          }
        );

        if (createUserError) {
          throw new Error(`Failed to create/find user: ${createUserError.message}`);
        }
        userId = newUser.user.id;
      } else if (linkData?.user) {
        userId = linkData.user.id;
        if (!linkData.user.email_confirmed_at) {
          await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
        }
      }
    } catch (err) {
      console.error('Error in user creation flow:', err);
      throw new Error(
        `Failed to process shadow user: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  if (!userId) {
    throw new Error('Could not obtain user ID for shadow user');
  }

  // 3. Ensure profile exists and is correct (Upsert)
  const { error: upsertProfileError } = await supabaseAdmin.from('profiles').upsert(
    {
      id: userId,
      email: studentEmail,
      full_name: studentEmail.split('@')[0],
      is_student: true,
      is_teacher: false,
      is_admin: false,
      is_development: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (upsertProfileError) {
    // Handle duplicate email error (orphan profile cleanup)
    if (
      upsertProfileError.code === '23505' &&
      upsertProfileError.message?.includes('profiles_email_key')
    ) {
      console.log(
        `[createShadowUser] Detected orphan profile for ${studentEmail}. Attempting cleanup...`
      );

      // 1. Find the orphan profile
      const { data: orphanProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', studentEmail)
        .single();

      if (orphanProfile && orphanProfile.id !== userId) {
        // 2. Rename orphan profile email to free up the unique constraint
        const tempEmail = `${studentEmail}_migrated_${Date.now()}`;
        const { error: renameError } = await supabaseAdmin
          .from('profiles')
          .update({ email: tempEmail })
          .eq('id', orphanProfile.id);

        if (renameError) {
          console.error('Failed to rename orphan profile:', renameError);
          throw new Error('Failed to cleanup orphan profile');
        }

        // 3. Create the new profile
        const { error: retryError } = await supabaseAdmin.from('profiles').upsert(
          {
            id: userId,
            email: studentEmail,
            full_name: studentEmail.split('@')[0],
            is_student: true,
            is_teacher: false,
            is_admin: false,
            is_development: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (retryError) {
          throw new Error(`Failed to create profile after cleanup: ${retryError.message}`);
        }

        // 4. Migrate related data
        // Lessons
        await supabaseAdmin
          .from('lessons')
          .update({ student_id: userId })
          .eq('student_id', orphanProfile.id);
        await supabaseAdmin
          .from('lessons')
          .update({ teacher_id: userId })
          .eq('teacher_id', orphanProfile.id);

        // Assignments
        await supabaseAdmin
          .from('assignments')
          .update({ student_id: userId })
          .eq('student_id', orphanProfile.id);
        await supabaseAdmin
          .from('assignments')
          .update({ teacher_id: userId })
          .eq('teacher_id', orphanProfile.id);

        // User Roles
        await supabaseAdmin
          .from('user_roles')
          .update({ user_id: userId })
          .eq('user_id', orphanProfile.id);

        // 5. Delete orphan profile
        await supabaseAdmin.from('profiles').delete().eq('id', orphanProfile.id);

        console.log(
          `[createShadowUser] Successfully migrated data from orphan profile ${orphanProfile.id} to ${userId}`
        );
        return { success: true, userId };
      }
    }

    console.error('Failed to upsert shadow profile:', upsertProfileError);
    throw new Error('Failed to ensure shadow profile exists');
  }

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
      // Create shadow user
      const result = await createShadowUser(studentEmail);
      targetStudentId = result.userId;
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

export async function syncAllLessonsFromCalendar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const calendar = await getAuthenticatedCalendarClient(user.id);
  const supabaseAdmin = createAdminClient();

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
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    let totalSynced = 0;

    for (const event of events) {
      if (!event.start?.dateTime || !event.id) continue;

      // Identify potential students from attendees
      const attendees = event.attendees || [];
      const studentEmails = attendees
        .map((a) => a.email)
        .filter((email) => email && email !== user.email && email.includes('@')) as string[];

      for (const email of studentEmails) {
        try {
          // Ensure user exists (get or create)
          // We cache processed students to avoid repeated API calls in this loop if possible,
          // but createShadowUser is idempotent-ish (checks existence).
          // However, to be safe and efficient:

          // We can reuse createShadowUser which handles the "get or create" logic
          const userResult = await createShadowUser(email);
          const studentId = userResult.userId;

          // Sync the event
          const created = await syncSingleEvent(supabaseAdmin, event, user.id, studentId, email);

          if (created) totalSynced++;
        } catch (err) {
          console.error(`Failed to sync event ${event.id} for student ${email}:`, err);
          // Continue with next student/event
        }
      }
    }

    return { success: true, count: totalSynced };
  } catch (error) {
    console.error('Error syncing all lessons:', error);
    throw new Error('Failed to sync all lessons');
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

  // Check if user exists in auth.users before trying to delete
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

  // Delete from profiles first (to ensure clean state if no cascade)
  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
    // Continue anyway - profile might be already gone
  }

  // Only delete from auth.users if user exists there
  if (authUser?.user) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      // If profile was already deleted successfully, don't fail completely
      if (!profileError) {
        return { success: true, warning: 'Profile deleted but auth user deletion failed' };
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  return { success: true };
}
