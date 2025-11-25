#!/usr/bin/env tsx

/**
 * Analyze Seed Data
 *
 * This script analyzes the seed.sql file to validate that lessons
 * have valid student_id and teacher_id references to existing profiles.
 *
 * This can be run without a running Supabase instance.
 *
 * Usage: npx tsx scripts/analyze-seed-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;
}

interface Lesson {
  id: string;
  teacher_id: string;
  student_id: string;
  lesson_teacher_number: number;
  scheduled_at: string;
  status: string;
  notes: string;
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

// Expected column orders for validation
const EXPECTED_PROFILE_COLUMNS = 'id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student';
const EXPECTED_LESSON_COLUMNS = 'id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at';

function validateColumnOrder(content: string): { profilesValid: boolean; lessonsValid: boolean } {
  // Extract column definitions from INSERT statements
  const profileColumnsMatch = content.match(/INSERT INTO public\.profiles \(([^)]+)\)/);
  const lessonColumnsMatch = content.match(/INSERT INTO public\.lessons \(([^)]+)\)/);
  
  const profilesValid = profileColumnsMatch 
    ? profileColumnsMatch[1].replace(/\s+/g, ' ').trim() === EXPECTED_PROFILE_COLUMNS
    : false;
    
  const lessonsValid = lessonColumnsMatch
    ? lessonColumnsMatch[1].replace(/\s+/g, ' ').trim() === EXPECTED_LESSON_COLUMNS
    : false;
    
  return { profilesValid, lessonsValid };
}

function parseSeedFile(filePath: string): { profiles: Profile[]; lessons: Lesson[]; warnings: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const profiles: Profile[] = [];
  const lessons: Lesson[] = [];
  const warnings: string[] = [];
  
  // Validate column order before parsing
  const { profilesValid, lessonsValid } = validateColumnOrder(content);
  
  if (!profilesValid) {
    warnings.push(`⚠️  Profile column order may have changed. Expected: (${EXPECTED_PROFILE_COLUMNS})`);
  }
  
  if (!lessonsValid) {
    warnings.push(`⚠️  Lesson column order may have changed. Expected: (${EXPECTED_LESSON_COLUMNS})`);
  }
  
  // Parse profiles - format:
  // INSERT INTO public.profiles (id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student) 
  // VALUES ('uuid', 'email', 'name', NULL, 'notes', 'ts', 'ts', true, true, true, false);
  const profileRegex = /INSERT INTO public\.profiles \([^)]+\) VALUES \('([^']+)', '([^']+)', '([^']*)', (?:NULL|'[^']*'), '[^']*', '[^']+', '[^']+', (true|false), (true|false), (true|false), (true|false)\)/g;
  let match;
  
  while ((match = profileRegex.exec(content)) !== null) {
    profiles.push({
      id: match[1],
      email: match[2],
      full_name: match[3] || 'N/A',
      is_admin: match[5] === 'true',
      is_teacher: match[6] === 'true',
      is_student: match[7] === 'true',
    });
  }
  
  // Parse lessons - format:
  // INSERT INTO public.lessons (id, teacher_id, student_id, lesson_teacher_number, scheduled_at, status, notes, created_at, updated_at)
  // VALUES ('uuid', 'teacher_uuid', 'student_uuid', 1, 'ts', 'STATUS', 'notes', 'ts', 'ts');
  const lessonRegex = /INSERT INTO public\.lessons \([^)]+\) VALUES \('([^']+)', '([^']+)', '([^']+)', (\d+), '([^']+)', '([^']+)', (?:'([^']*)'|NULL), '[^']+', '[^']+'\)/g;
  
  while ((match = lessonRegex.exec(content)) !== null) {
    lessons.push({
      id: match[1],
      teacher_id: match[2],
      student_id: match[3],
      lesson_teacher_number: parseInt(match[4], 10),
      scheduled_at: match[5],
      status: match[6],
      notes: match[7] || '',
    });
  }
  
  return { profiles, lessons, warnings };
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

  // Valid only if profile exists AND has correct role
  const studentRoleValid = studentProfile?.is_student === true;
  const teacherRoleValid = teacherProfile?.is_teacher === true;

  return {
    lessonId: lesson.id,
    studentId: lesson.student_id,
    teacherId: lesson.teacher_id,
    studentValid: !!studentProfile && studentRoleValid,
    teacherValid: !!teacherProfile && teacherRoleValid,
    studentProfile,
    teacherProfile,
    issues,
  };
}

function main() {
  console.log('========================================');
  console.log('🎸 Guitar CRM - Seed Data Analyzer');
  console.log('========================================\n');
  
  const seedFilePath = path.join(__dirname, '../supabase/seed.sql');
  
  if (!fs.existsSync(seedFilePath)) {
    console.error('❌ Seed file not found:', seedFilePath);
    process.exit(1);
  }
  
  console.log(`📄 Reading seed file: ${seedFilePath}\n`);
  
  const { profiles, lessons, warnings } = parseSeedFile(seedFilePath);
  
  // Display any schema warnings
  if (warnings.length > 0) {
    console.log('⚠️  Schema Warnings:');
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log('');
  }
  
  console.log(`✅ Found ${profiles.length} profiles`);
  console.log(`✅ Found ${lessons.length} lessons\n`);
  
  if (lessons.length === 0) {
    console.log('ℹ️  No lessons found in the seed file.');
    console.log('========================================');
    console.log('📊 SUMMARY');
    console.log('========================================');
    console.log(`Total Profiles: ${profiles.length}`);
    console.log('Total Lessons: 0');
    console.log('✅ No lessons to validate');
    return;
  }
  
  // Create profile map
  const profileMap = new Map<string, Profile>();
  profiles.forEach((profile) => {
    profileMap.set(profile.id, profile);
  });
  
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
    console.log(`\nLesson ${index + 1}: ${result.lessonId.substring(0, 8)}...`);
    console.log(`  Status: ${status}`);
    console.log(
      `  Student ID: ${result.studentId.substring(0, 8)}... ${result.studentValid ? '✅' : '❌'}`
    );
    if (result.studentProfile) {
      console.log(
        `    → Profile: ${result.studentProfile.email} (${result.studentProfile.full_name})`
      );
      console.log(
        `    → is_student: ${result.studentProfile.is_student ? 'Yes' : 'No'}`
      );
    }
    console.log(
      `  Teacher ID: ${result.teacherId.substring(0, 8)}... ${result.teacherValid ? '✅' : '❌'}`
    );
    if (result.teacherProfile) {
      console.log(
        `    → Profile: ${result.teacherProfile.email} (${result.teacherProfile.full_name})`
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
  console.log(`Total Profiles: ${profiles.length}`);
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
  profiles.forEach((profile) => {
    const roles: string[] = [];
    if (profile.is_admin) roles.push('Admin');
    if (profile.is_teacher) roles.push('Teacher');
    if (profile.is_student) roles.push('Student');
    console.log(
      `  ${profile.id.substring(0, 8)}... | ${profile.email} | ${roles.join(', ') || 'No roles'}`
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
}

main();
