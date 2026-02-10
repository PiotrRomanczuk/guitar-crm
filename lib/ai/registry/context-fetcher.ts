/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Agent Context Data Fetchers
 *
 * Utilities for fetching context data required by agents.
 * All queries use the RLS-enforced Supabase client from createClient(),
 * so access is scoped to the authenticated user's permissions. [BMS-112]
 */

import { createClient } from '@/lib/supabase/server';
import type { AgentContext } from './types';

/**
 * Fetch context data based on context key
 */
export async function fetchContextData(contextKey: string, context: AgentContext): Promise<any> {
  const supabase = await createClient();

  switch (contextKey) {
    case 'currentUser':
      return await fetchCurrentUser(supabase, context.userId);

    case 'currentStudent':
      return await fetchCurrentStudent(supabase, context);

    case 'recentLessons':
      return await fetchRecentLessons(supabase, context);

    case 'studentData':
      return await fetchStudentData(supabase, context);

    case 'lessonHistory':
      return await fetchLessonHistory(supabase, context);

    case 'assignmentHistory':
      return await fetchAssignmentHistory(supabase, context);

    case 'assignmentSong':
      return await fetchAssignmentSong(supabase, context);

    case 'lessonDetails':
      return await fetchLessonDetails(supabase, context);

    case 'schoolStats':
      return await fetchSchoolStats(supabase);

    case 'enrollmentData':
      return await fetchEnrollmentData(supabase);

    case 'revenueData':
      return await fetchRevenueData(supabase);

    default:
      throw new Error(`Unknown context key: ${contextKey}`);
  }
}

/**
 * Fetch current user profile
 */
async function fetchCurrentUser(supabase: any, userId: string) {
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return user;
}

/**
 * Fetch current student data
 */
async function fetchCurrentStudent(supabase: any, context: AgentContext) {
  if (context.entityType === 'student' && context.entityId) {
    const { data: student, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', context.entityId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch student: ${error.message}`);
    }

    return student;
  }
  return null;
}

/**
 * Fetch recent lessons
 */
async function fetchRecentLessons(supabase: any, context: AgentContext) {
  // RLS enforces access; additionally scope by userId when available [BMS-112]
  let query = supabase
    .from('lessons')
    .select('*')
    .order('scheduled_at', { ascending: false })
    .limit(5);

  if (context.userId) {
    query = query.eq('teacher_id', context.userId);
  }

  const { data: lessons, error } = await query;

  if (error) {
    console.warn('[ContextFetcher] Failed to fetch recent lessons:', error.message);
    return [];
  }

  return lessons || [];
}

/**
 * Fetch student data for analysis
 */
async function fetchStudentData(supabase: any, context: AgentContext) {
  // Fetch multiple students if specified in context
  if (context.contextData.studentIds) {
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', context.contextData.studentIds);

    if (error) {
      throw new Error(`Failed to fetch student data: ${error.message}`);
    }

    return students || [];
  }

  return [];
}

/**
 * Fetch lesson history
 */
async function fetchLessonHistory(supabase: any, context: AgentContext) {
  let query = supabase
    .from('lessons')
    .select('*')
    .order('scheduled_at', { ascending: false })
    .limit(20);

  if (context.userId) {
    query = query.eq('teacher_id', context.userId);
  }

  const { data: lessons, error } = await query;

  if (error) {
    console.warn('[ContextFetcher] Failed to fetch lesson history:', error.message);
    return [];
  }

  return lessons || [];
}

/**
 * Fetch assignment history
 */
async function fetchAssignmentHistory(supabase: any, context: AgentContext) {
  let query = supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (context.userId) {
    query = query.eq('teacher_id', context.userId);
  }

  const { data: assignments, error } = await query;

  if (error) {
    console.warn('[ContextFetcher] Failed to fetch assignment history:', error.message);
    return [];
  }

  return assignments || [];
}

/**
 * Fetch assignment song details
 */
async function fetchAssignmentSong(supabase: any, context: AgentContext) {
  if (context.contextData.songInfo?.title) {
    const { data: song, error } = await supabase
      .from('songs')
      .select('*')
      .eq('title', context.contextData.songInfo.title)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn(`Song not found: ${context.contextData.songInfo.title}`);
    }

    return song;
  }

  return null;
}

/**
 * Fetch lesson details
 */
async function fetchLessonDetails(supabase: any, context: AgentContext) {
  if (context.entityType === 'lesson' && context.entityId) {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', context.entityId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch lesson details: ${error.message}`);
    }

    return lesson;
  }

  return null;
}

/**
 * Fetch school statistics
 */
async function fetchSchoolStats(supabase: any) {
  try {
    const [usersResult, lessonsResult, songsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('songs').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: usersResult.count || 0,
      totalLessons: lessonsResult.count || 0,
      totalSongs: songsResult.count || 0,
    };
  } catch (error) {
    console.warn('Failed to fetch school stats:', error);
    return { totalUsers: 0, totalLessons: 0, totalSongs: 0 };
  }
}

/**
 * Fetch enrollment data
 */
async function fetchEnrollmentData(supabase: any) {
  try {
    const { data: recentUsers, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch enrollment data: ${error.message}`);
    }

    return recentUsers || [];
  } catch (error) {
    console.warn('Failed to fetch enrollment data:', error);
    return [];
  }
}

/**
 * Fetch revenue data (placeholder - implement based on your billing system)
 */
async function fetchRevenueData(_supabase: any) {
  // Not yet implemented — return null so agents know data is unavailable [BMS-116]
  return null;
}
