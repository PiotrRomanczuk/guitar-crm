// Dashboard stats hooks
export { useDashboardStats } from './useDashboardStats';
export { useLessonStats } from './useLessonStats';
export type {
  DashboardStatsResponse,
  AdminStats,
  TeacherStats,
  StudentStats,
} from './useDashboardStats';
export type { LessonStatsResponse, LessonStatsFilters, MonthlyStats } from './useLessonStats';

// Media query hook
export { useMediaQuery } from './use-media-query';

// Database status hook
export { useDatabaseStatus } from './useDatabaseStatus';
export type {
  DatabaseType,
  DatabaseStatusState,
  UseDatabaseStatusReturn,
} from './useDatabaseStatus';
