export type TheoreticalCourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TheoryCourseSummary {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  level: TheoreticalCourseLevel;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  lesson_count?: number;
}

export interface TheoryCourse extends TheoryCourseSummary {
  created_by: string;
  published_at: string | null;
  updated_at: string;
  creator?: { id: string; full_name: string | null };
  lessons?: TheoryLessonSummary[];
}

export interface TheoryLessonSummary {
  id: string;
  course_id: string;
  title: string;
  excerpt: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface TheoryLesson extends TheoryLessonSummary {
  content: string;
  published_at: string | null;
  updated_at: string;
}

export interface TheoryCourseAccess {
  id: string;
  course_id: string;
  user_id: string;
  granted_by: string;
  granted_at: string;
  user?: { id: string; full_name: string | null; email: string };
}
