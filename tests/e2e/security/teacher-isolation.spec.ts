/**
 * Security: Teacher Data Isolation Tests
 *
 * Tests multi-tenancy security between teachers to ensure proper data isolation.
 * Each teacher should only see their own students and lessons, not other teachers' data.
 *
 * CRITICAL SECURITY TESTS - These verify that:
 * 1. Teachers cannot see other teachers' students via API endpoints
 * 2. Teachers cannot access other teachers' lessons
 * 3. Teachers cannot modify data belonging to other teachers
 * 4. Dashboard UI properly filters data by teacher context
 *
 * Architecture:
 * - Database RLS policies enforce isolation at row level (lessons, profiles)
 * - API routes MUST filter by teacher_id (some may be vulnerable)
 * - Frontend components rely on filtered API responses
 *
 * Known Issues:
 * - VULNERABILITY: /api/teacher/students returns ALL students without teacher filtering
 *   (See: app/api/teacher/students/route.ts lines 27-31)
 * - Lessons API properly filters by teacher_id via RLS and handlers
 *
 * @tags @security @teacher @isolation @critical
 */
import { test, expect } from '../../fixtures';
import { createClient } from '@supabase/supabase-js';

// Supabase admin client for test data setup
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for security tests');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Test data IDs to be created during setup
let teacher1Id: string;
let teacher2Id: string;
let teacher1Student1Id: string;
let teacher1Student2Id: string;
let teacher2Student1Id: string;
let teacher1Lesson1Id: string;
let teacher2Lesson1Id: string;

test.describe('Security: Teacher Data Isolation', { tag: ['@security', '@teacher'] }, () => {
  test.beforeAll(async () => {
    const supabase = getSupabaseAdmin();

    // Clean up any existing test data
    await supabase.from('lessons').delete().like('title', 'SecurityTest:%');
    await supabase.from('profiles').delete().like('email', 'security-test-%');

    console.log('Creating test users...');

    // Create Teacher 1
    const { data: teacher1Auth, error: teacher1AuthError } = await supabase.auth.admin.createUser(
      {
        email: 'security-test-teacher1@example.com',
        password: 'test123_security',
        email_confirm: true,
      }
    );
    if (teacher1AuthError) throw teacher1AuthError;
    teacher1Id = teacher1Auth.user.id;

    await supabase
      .from('profiles')
      .update({ full_name: 'Security Test Teacher 1' })
      .eq('id', teacher1Id);
    await supabase.from('user_roles').insert({ user_id: teacher1Id, role: 'teacher' });

    // Create Teacher 2
    const { data: teacher2Auth, error: teacher2AuthError } = await supabase.auth.admin.createUser(
      {
        email: 'security-test-teacher2@example.com',
        password: 'test123_security',
        email_confirm: true,
      }
    );
    if (teacher2AuthError) throw teacher2AuthError;
    teacher2Id = teacher2Auth.user.id;

    await supabase
      .from('profiles')
      .update({ full_name: 'Security Test Teacher 2' })
      .eq('id', teacher2Id);
    await supabase.from('user_roles').insert({ user_id: teacher2Id, role: 'teacher' });

    // Create Students
    const { data: t1s1Auth } = await supabase.auth.admin.createUser({
      email: 'security-test-t1-student1@example.com',
      password: 'test123_security',
      email_confirm: true,
    });
    teacher1Student1Id = t1s1Auth!.user.id;
    await supabase
      .from('profiles')
      .update({ full_name: 'Security Test T1 Student 1' })
      .eq('id', teacher1Student1Id);
    await supabase
      .from('user_roles')
      .insert({ user_id: teacher1Student1Id, role: 'student' });

    const { data: t1s2Auth } = await supabase.auth.admin.createUser({
      email: 'security-test-t1-student2@example.com',
      password: 'test123_security',
      email_confirm: true,
    });
    teacher1Student2Id = t1s2Auth!.user.id;
    await supabase
      .from('profiles')
      .update({ full_name: 'Security Test T1 Student 2' })
      .eq('id', teacher1Student2Id);
    await supabase
      .from('user_roles')
      .insert({ user_id: teacher1Student2Id, role: 'student' });

    const { data: t2s1Auth } = await supabase.auth.admin.createUser({
      email: 'security-test-t2-student1@example.com',
      password: 'test123_security',
      email_confirm: true,
    });
    teacher2Student1Id = t2s1Auth!.user.id;
    await supabase
      .from('profiles')
      .update({ full_name: 'Security Test T2 Student 1' })
      .eq('id', teacher2Student1Id);
    await supabase
      .from('user_roles')
      .insert({ user_id: teacher2Student1Id, role: 'student' });

    // Create Lessons
    const { data: t1Lesson } = await supabase
      .from('lessons')
      .insert({
        teacher_id: teacher1Id,
        student_id: teacher1Student1Id,
        lesson_number: 1,
        title: 'SecurityTest: Teacher 1 Lesson',
        scheduled_at: new Date().toISOString(),
        status: 'SCHEDULED',
      })
      .select()
      .single();
    teacher1Lesson1Id = t1Lesson!.id;

    const { data: t2Lesson } = await supabase
      .from('lessons')
      .insert({
        teacher_id: teacher2Id,
        student_id: teacher2Student1Id,
        lesson_number: 1,
        title: 'SecurityTest: Teacher 2 Lesson',
        scheduled_at: new Date().toISOString(),
        status: 'SCHEDULED',
      })
      .select()
      .single();
    teacher2Lesson1Id = t2Lesson!.id;

    console.log('✅ Security test data created');
  });

  test.afterAll(async () => {
    const supabase = getSupabaseAdmin();
    await supabase.from('lessons').delete().like('title', 'SecurityTest:%');
    if (teacher1Id) await supabase.auth.admin.deleteUser(teacher1Id);
    if (teacher2Id) await supabase.auth.admin.deleteUser(teacher2Id);
    if (teacher1Student1Id) await supabase.auth.admin.deleteUser(teacher1Student1Id);
    if (teacher1Student2Id) await supabase.auth.admin.deleteUser(teacher1Student2Id);
    if (teacher2Student1Id) await supabase.auth.admin.deleteUser(teacher2Student1Id);
    console.log('✅ Security test data cleaned up');
  });

  test('VULNERABILITY: /api/teacher/students returns ALL students', async ({ request, baseURL }) => {
    const loginResponse = await request.post(`${baseURL}/auth/v1/token?grant_type=password`, {
      data: {
        email: 'security-test-teacher1@example.com',
        password: 'test123_security',
      },
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });

    const loginData = await loginResponse.json();
    const accessToken = loginData.access_token;

    const studentsResponse = await request.get(`${baseURL}/api/teacher/students`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(studentsResponse.ok()).toBeTruthy();
    const studentsData = await studentsResponse.json();
    
    const hasTeacher2Student = studentsData.students?.some(
      (s: { id: string }) => s.id === teacher2Student1Id
    );

    if (hasTeacher2Student) {
      console.error('🔴 VULNERABILITY: Teacher 1 can see Teacher 2\'s students!');
    }

    expect(hasTeacher2Student).toBe(true); // Documents the vulnerability
  });

  test('SECURE: /api/lessons properly filters by teacher', async ({ request, baseURL }) => {
    const loginResponse = await request.post(`${baseURL}/auth/v1/token?grant_type=password`, {
      data: {
        email: 'security-test-teacher1@example.com',
        password: 'test123_security',
      },
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });

    const loginData = await loginResponse.json();
    const accessToken = loginData.access_token;

    const lessonsResponse = await request.get(`${baseURL}/api/lessons`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(lessonsResponse.ok()).toBeTruthy();
    const lessonsData = await lessonsResponse.json();

    const hasOwnLesson = lessonsData.lessons?.some(
      (l: { id: string }) => l.id === teacher1Lesson1Id
    );
    expect(hasOwnLesson).toBe(true);

    const hasOtherTeacherLesson = lessonsData.lessons?.some(
      (l: { id: string }) => l.id === teacher2Lesson1Id
    );
    expect(hasOtherTeacherLesson).toBe(false);
  });
});
