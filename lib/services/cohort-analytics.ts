/**
 * Cohort Analytics Service
 * Groups students and calculates metrics for cohort comparison
 */

import { createClient } from '@/lib/supabase/server';

export type CohortDimension = 'enrollment_period' | 'status' | 'teacher' | 'lesson_frequency';

export type CohortMetric =
  | 'lessons_completed'
  | 'mastery_rate'
  | 'completion_rate'
  | 'retention_rate'
  | 'avg_time_to_master';

export interface CohortData {
  cohortId: string;
  cohortName: string;
  studentCount: number;
  metricValue: number;
}

export interface CohortAnalyticsResult {
  dimension: CohortDimension;
  metric: CohortMetric;
  cohorts: CohortData[];
  overall: {
    totalStudents: number;
    averageMetric: number;
  };
}

interface StudentData {
  id: string;
  created_at: string;
  student_status: string | null;
}

interface LessonData {
  student_id: string;
  teacher_id: string;
  status: string;
  scheduled_at: string;
}

interface SongProgressData {
  student_id: string;
  current_status: string;
  mastered_at: string | null;
  assigned_at: string;
}

/**
 * Group students by enrollment quarter (Q1 2024, Q2 2024, etc.)
 */
export function groupByEnrollmentQuarter(students: StudentData[]): Map<string, string[]> {
  const cohorts = new Map<string, string[]>();

  students.forEach((student) => {
    const date = new Date(student.created_at);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const cohortKey = `Q${quarter} ${year}`;

    if (!cohorts.has(cohortKey)) {
      cohorts.set(cohortKey, []);
    }
    cohorts.get(cohortKey)!.push(student.id);
  });

  return cohorts;
}

/**
 * Group students by status (active, churned, trial, etc.)
 */
export function groupByStatus(students: StudentData[]): Map<string, string[]> {
  const cohorts = new Map<string, string[]>();

  students.forEach((student) => {
    const status = student.student_status || 'unknown';

    if (!cohorts.has(status)) {
      cohorts.set(status, []);
    }
    cohorts.get(status)!.push(student.id);
  });

  return cohorts;
}

/**
 * Group students by primary teacher
 */
export function groupByTeacher(
  students: StudentData[],
  lessons: LessonData[]
): Map<string, string[]> {
  const cohorts = new Map<string, string[]>();

  // Count lessons per student per teacher
  const studentTeacherCounts = new Map<string, Map<string, number>>();

  lessons.forEach((lesson) => {
    if (!studentTeacherCounts.has(lesson.student_id)) {
      studentTeacherCounts.set(lesson.student_id, new Map());
    }
    const teacherCounts = studentTeacherCounts.get(lesson.student_id)!;
    teacherCounts.set(lesson.teacher_id, (teacherCounts.get(lesson.teacher_id) || 0) + 1);
  });

  // Assign each student to their primary teacher (most lessons)
  students.forEach((student) => {
    const teacherCounts = studentTeacherCounts.get(student.id);
    if (!teacherCounts || teacherCounts.size === 0) {
      // Student with no lessons - assign to "no_teacher"
      if (!cohorts.has('no_teacher')) {
        cohorts.set('no_teacher', []);
      }
      cohorts.get('no_teacher')!.push(student.id);
      return;
    }

    // Find teacher with most lessons
    let primaryTeacher = '';
    let maxLessons = 0;
    teacherCounts.forEach((count, teacherId) => {
      if (count > maxLessons) {
        maxLessons = count;
        primaryTeacher = teacherId;
      }
    });

    if (!cohorts.has(primaryTeacher)) {
      cohorts.set(primaryTeacher, []);
    }
    cohorts.get(primaryTeacher)!.push(student.id);
  });

  return cohorts;
}

/**
 * Group students by lesson frequency (1x/week, 2x/week, 3+x/week)
 */
export function groupByLessonFrequency(
  students: StudentData[],
  lessons: LessonData[]
): Map<string, string[]> {
  const cohorts = new Map<string, string[]>();

  // Calculate lessons per week for each student
  students.forEach((student) => {
    const studentLessons = lessons.filter((l) => l.student_id === student.id);

    if (studentLessons.length === 0) {
      if (!cohorts.has('0x/week')) {
        cohorts.set('0x/week', []);
      }
      cohorts.get('0x/week')!.push(student.id);
      return;
    }

    // Calculate weeks since first lesson
    const firstLesson = new Date(
      Math.min(...studentLessons.map((l) => new Date(l.scheduled_at).getTime()))
    );
    const now = new Date();
    const weeksSinceFirst = Math.max(
      1,
      Math.floor((now.getTime() - firstLesson.getTime()) / (7 * 24 * 60 * 60 * 1000))
    );

    const lessonsPerWeek = studentLessons.length / weeksSinceFirst;

    let cohortKey: string;
    if (lessonsPerWeek < 1) {
      cohortKey = '<1x/week';
    } else if (lessonsPerWeek < 2) {
      cohortKey = '1x/week';
    } else if (lessonsPerWeek < 3) {
      cohortKey = '2x/week';
    } else {
      cohortKey = '3+x/week';
    }

    if (!cohorts.has(cohortKey)) {
      cohorts.set(cohortKey, []);
    }
    cohorts.get(cohortKey)!.push(student.id);
  });

  return cohorts;
}

/**
 * Calculate lessons completed for a cohort
 */
export function calculateLessonsCompleted(
  studentIds: string[],
  lessons: LessonData[]
): number {
  return lessons.filter(
    (l) => studentIds.includes(l.student_id) && l.status === 'COMPLETED'
  ).length;
}

/**
 * Calculate mastery rate for a cohort
 */
export function calculateCohortMasteryRate(
  studentIds: string[],
  songProgress: SongProgressData[]
): number {
  const cohortProgress = songProgress.filter((sp) => studentIds.includes(sp.student_id));

  if (cohortProgress.length === 0) return 0;

  const mastered = cohortProgress.filter((sp) => sp.current_status === 'mastered').length;

  return Math.round((mastered / cohortProgress.length) * 100 * 10) / 10;
}

/**
 * Calculate completion rate for a cohort
 */
export function calculateCohortCompletionRate(
  studentIds: string[],
  lessons: LessonData[]
): number {
  const cohortLessons = lessons.filter((l) => studentIds.includes(l.student_id));

  if (cohortLessons.length === 0) return 0;

  const completed = cohortLessons.filter((l) => l.status === 'COMPLETED').length;
  const scheduled = cohortLessons.filter((l) => l.status === 'SCHEDULED').length;
  const total = completed + scheduled;

  if (total === 0) return 0;

  return Math.round((completed / total) * 100 * 10) / 10;
}

/**
 * Calculate retention rate for a cohort
 */
export function calculateCohortRetentionRate(
  studentIds: string[],
  students: StudentData[]
): number {
  const cohortStudents = students.filter((s) => studentIds.includes(s.id));

  if (cohortStudents.length === 0) return 0;

  const active = cohortStudents.filter((s) => s.student_status === 'active').length;

  return Math.round((active / cohortStudents.length) * 100 * 10) / 10;
}

/**
 * Calculate average time to master songs for a cohort (in days)
 */
export function calculateAvgTimeToMaster(
  studentIds: string[],
  songProgress: SongProgressData[]
): number {
  const masteredSongs = songProgress.filter(
    (sp) => studentIds.includes(sp.student_id) && sp.current_status === 'mastered' && sp.mastered_at
  );

  if (masteredSongs.length === 0) return 0;

  const totalDays = masteredSongs.reduce((sum, sp) => {
    const assigned = new Date(sp.assigned_at);
    const mastered = new Date(sp.mastered_at!);
    const days = Math.floor((mastered.getTime() - assigned.getTime()) / (24 * 60 * 60 * 1000));
    return sum + days;
  }, 0);

  return Math.round((totalDays / masteredSongs.length) * 10) / 10;
}

/**
 * Get cohort analytics data
 */
export async function getCohortAnalytics(
  dimension: CohortDimension,
  metric: CohortMetric,
  startDate?: Date,
  endDate?: Date
): Promise<CohortAnalyticsResult> {
  const supabase = await createClient();

  // Fetch students
  let studentsQuery = supabase
    .from('profiles')
    .select('id, created_at, student_status')
    .eq('is_student', true);

  if (startDate) {
    studentsQuery = studentsQuery.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    studentsQuery = studentsQuery.lte('created_at', endDate.toISOString());
  }

  const { data: students } = await studentsQuery;

  if (!students || students.length === 0) {
    return {
      dimension,
      metric,
      cohorts: [],
      overall: { totalStudents: 0, averageMetric: 0 },
    };
  }

  const studentIds = students.map((s) => s.id);

  // Fetch lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('student_id, teacher_id, status, scheduled_at')
    .in('student_id', studentIds);

  // Fetch song progress
  const { data: songProgress } = await supabase
    .from('student_song_progress')
    .select('student_id, current_status, mastered_at, assigned_at')
    .in('student_id', studentIds);

  // Group students by dimension
  let cohortGroups: Map<string, string[]>;

  switch (dimension) {
    case 'enrollment_period':
      cohortGroups = groupByEnrollmentQuarter(students as StudentData[]);
      break;
    case 'status':
      cohortGroups = groupByStatus(students as StudentData[]);
      break;
    case 'teacher':
      cohortGroups = groupByTeacher(students as StudentData[], (lessons || []) as LessonData[]);
      break;
    case 'lesson_frequency':
      cohortGroups = groupByLessonFrequency(
        students as StudentData[],
        (lessons || []) as LessonData[]
      );
      break;
  }

  // Calculate metric for each cohort
  const cohorts: CohortData[] = [];

  cohortGroups.forEach((studentIds, cohortName) => {
    let metricValue = 0;

    switch (metric) {
      case 'lessons_completed':
        metricValue = calculateLessonsCompleted(studentIds, (lessons || []) as LessonData[]);
        break;
      case 'mastery_rate':
        metricValue = calculateCohortMasteryRate(
          studentIds,
          (songProgress || []) as SongProgressData[]
        );
        break;
      case 'completion_rate':
        metricValue = calculateCohortCompletionRate(studentIds, (lessons || []) as LessonData[]);
        break;
      case 'retention_rate':
        metricValue = calculateCohortRetentionRate(studentIds, students as StudentData[]);
        break;
      case 'avg_time_to_master':
        metricValue = calculateAvgTimeToMaster(studentIds, (songProgress || []) as SongProgressData[]);
        break;
    }

    cohorts.push({
      cohortId: cohortName,
      cohortName,
      studentCount: studentIds.length,
      metricValue,
    });
  });

  // Sort cohorts by name
  cohorts.sort((a, b) => a.cohortName.localeCompare(b.cohortName));

  // Calculate overall stats
  const totalStudents = students.length;
  const averageMetric =
    cohorts.length > 0
      ? Math.round(
          (cohorts.reduce((sum, c) => sum + c.metricValue, 0) / cohorts.length) * 10
        ) / 10
      : 0;

  return {
    dimension,
    metric,
    cohorts,
    overall: {
      totalStudents,
      averageMetric,
    },
  };
}
