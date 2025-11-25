#!/usr/bin/env tsx

/**
 * Validate Lesson Profiles
 *
 * This script fetches all lessons from the local Supabase database and validates
 * that each lesson's student_id and teacher_id reference valid profiles.
 *
 * Usage: npx tsx scripts/validate-lesson-profiles.ts
 *
 * Environment variables (optional, defaults to local Supabase):
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables (optional)
config({ path: '.env.local' });

// LOCAL Supabase credentials (hardcoded for local dev, same as reset-local-db.ts)
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LOCAL_SUPABASE_URL;
const supabaseServiceKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  LOCAL_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  is_teacher: boolean | null;
  is_student: boolean | null;
}

interface Lesson {
  id: string;
  student_id: string;
  teacher_id: string;
  status: string | null;
  scheduled_at: string | null;
  lesson_teacher_number: number | null;
  notes: string | null;
}

interface ValidationResult {
  lessonId: string;
  studentId: string;
  teacherId: string;
  studentValid: boolean;
  teacherValid: boolean;
  studentProfile: Profile | null;
  teacherProfile: Profile | null;
  issues: string[];
}

async function fetchAllProfiles(): Promise<Map<string, Profile>> {
  console.log('🔍 Fetching all profiles from database...');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_teacher, is_student')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching profiles:', error.message);
    throw error;
  }

  const profileMap = new Map<string, Profile>();
  if (profiles) {
    profiles.forEach((profile) => {
      profileMap.set(profile.id, profile);
    });
  }

  console.log(`✅ Found ${profileMap.size} profiles\n`);
  return profileMap;
}

async function fetchAllLessons(): Promise<Lesson[]> {
  console.log('🔍 Fetching all lessons from database...');

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(
      'id, student_id, teacher_id, status, scheduled_at, lesson_teacher_number, notes'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching lessons:', error.message);
    throw error;
  }

  console.log(`✅ Found ${lessons?.length || 0} lessons\n`);
  return lessons || [];
}

function validateLesson(
  lesson: Lesson,
  profileMap: Map<string, Profile>
): ValidationResult {
  const studentProfile = profileMap.get(lesson.student_id) || null;
  const teacherProfile = profileMap.get(lesson.teacher_id) || null;

  const issues: string[] = [];

  // Check if student_id exists in profiles
  if (!studentProfile) {
    issues.push(`Student ID '${lesson.student_id}' does not exist in profiles`);
  } else if (!studentProfile.is_student) {
    issues.push(
      `Student ID '${lesson.student_id}' exists but is_student is not true (${studentProfile.email})`
    );
  }

  // Check if teacher_id exists in profiles
  if (!teacherProfile) {
    issues.push(`Teacher ID '${lesson.teacher_id}' does not exist in profiles`);
  } else if (!teacherProfile.is_teacher) {
    issues.push(
      `Teacher ID '${lesson.teacher_id}' exists but is_teacher is not true (${teacherProfile.email})`
    );
  }

  return {
    lessonId: lesson.id,
    studentId: lesson.student_id,
    teacherId: lesson.teacher_id,
    studentValid: !!studentProfile,
    teacherValid: !!teacherProfile,
    studentProfile,
    teacherProfile,
    issues,
  };
}

async function validateLessonProfiles(): Promise<void> {
  console.log('========================================');
  console.log('🎸 Guitar CRM - Lesson Profile Validator');
  console.log('========================================\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);

  try {
    // Fetch all data
    const profileMap = await fetchAllProfiles();
    const lessons = await fetchAllLessons();

    if (lessons.length === 0) {
      console.log('ℹ️  No lessons found in the database.');
      console.log('========================================');
      console.log('📊 SUMMARY');
      console.log('========================================');
      console.log('Total Profiles: ' + profileMap.size);
      console.log('Total Lessons: 0');
      console.log('✅ No lessons to validate');
      return;
    }

    // Validate each lesson
    console.log('🔄 Validating lessons against profiles...\n');
    const results: ValidationResult[] = lessons.map((lesson) =>
      validateLesson(lesson, profileMap)
    );

    // Separate valid and invalid lessons
    const validLessons = results.filter((r) => r.issues.length === 0);
    const invalidLessons = results.filter((r) => r.issues.length > 0);

    // Print detailed results
    console.log('========================================');
    console.log('📊 VALIDATION RESULTS');
    console.log('========================================\n');

    // Print all lessons with their status
    console.log('📚 All Lessons:');
    console.log('---------------');
    results.forEach((result, index) => {
      const status = result.issues.length === 0 ? '✅' : '❌';
      console.log(`\nLesson ${index + 1}: ${result.lessonId}`);
      console.log(`  Status: ${status}`);
      console.log(
        `  Student ID: ${result.studentId} ${result.studentValid ? '✅' : '❌'}`
      );
      if (result.studentProfile) {
        console.log(
          `    → Profile: ${result.studentProfile.email || 'N/A'} (${result.studentProfile.full_name || 'N/A'})`
        );
        console.log(
          `    → is_student: ${result.studentProfile.is_student ? 'Yes' : 'No'}`
        );
      }
      console.log(
        `  Teacher ID: ${result.teacherId} ${result.teacherValid ? '✅' : '❌'}`
      );
      if (result.teacherProfile) {
        console.log(
          `    → Profile: ${result.teacherProfile.email || 'N/A'} (${result.teacherProfile.full_name || 'N/A'})`
        );
        console.log(
          `    → is_teacher: ${result.teacherProfile.is_teacher ? 'Yes' : 'No'}`
        );
      }
      if (result.issues.length > 0) {
        console.log('  Issues:');
        result.issues.forEach((issue) => console.log(`    ⚠️  ${issue}`));
      }
    });

    // Print summary
    console.log('\n========================================');
    console.log('📊 SUMMARY');
    console.log('========================================');
    console.log(`Total Profiles: ${profileMap.size}`);
    console.log(`Total Lessons: ${lessons.length}`);
    console.log(`Valid Lessons: ${validLessons.length} ✅`);
    console.log(`Invalid Lessons: ${invalidLessons.length} ❌`);

    // Collect unique issues
    const uniqueIssues = new Set<string>();
    invalidLessons.forEach((r) => r.issues.forEach((i) => uniqueIssues.add(i)));

    if (uniqueIssues.size > 0) {
      console.log('\n⚠️  Unique Issues Found:');
      uniqueIssues.forEach((issue) => console.log(`   - ${issue}`));
    }

    // List all profiles for reference
    console.log('\n========================================');
    console.log('👥 ALL PROFILES REFERENCE');
    console.log('========================================');
    profileMap.forEach((profile) => {
      const roles: string[] = [];
      if (profile.is_teacher) roles.push('Teacher');
      if (profile.is_student) roles.push('Student');
      console.log(
        `  ${profile.id.substring(0, 8)}... | ${profile.email || 'N/A'} | ${roles.join(', ') || 'No roles'}`
      );
    });

    // Final status
    console.log('\n========================================');
    if (invalidLessons.length === 0) {
      console.log(
        '✅ ALL LESSONS HAVE VALID STUDENT AND TEACHER PROFILES'
      );
    } else {
      console.log(
        `❌ ${invalidLessons.length} LESSON(S) HAVE INVALID PROFILE REFERENCES`
      );
    }
    console.log('========================================');
  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run the validation
validateLessonProfiles();
