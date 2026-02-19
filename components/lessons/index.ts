export { default as LessonTable } from './list/LessonTable';
export { default as LessonTableRow } from './list/LessonTable.Row';
export { default as LessonTableEmpty } from './list/LessonTable.Empty';
// Note: LessonList (server component) is exported from ./list/index.tsx directly
// For tests, we export the client component:
export { LessonListClient as LessonList } from './list/Client';
export { LessonListClient } from './list/Client';
export { default as LessonListHeader } from './list/LessonList.Header';
export { default as LessonListFilter } from './list/LessonList.Filter';
export { default as LessonForm } from './form/LessonForm';
export { default as LessonDeleteButton } from './actions/LessonDeleteButton';
export { default as SendEmailButton } from './actions/SendEmailButton';
export { default as LessonSongs } from './songs/LessonSongs';
export { LessonSongsList } from './songs/LessonSongsList';
export { LessonDetailsCard } from './details/LessonDetailsCard';
export { LessonAssignmentsList } from './details/LessonAssignmentsList';
export { default as useLessonList } from './hooks/useLessonList';
export { default as useLessonForm } from './hooks/useLessonForm';
export { useProfiles } from './hooks/useProfiles';
export * from './list/LessonTable.helpers';
export { GoogleEventImporter } from './integrations/GoogleEventImporter';
export { CalendarWebhookControl } from './integrations/CalendarWebhookControl';
export { HistoricalCalendarSync } from './integrations/HistoricalCalendarSync';

// Shared components (Stitch-based UI)
export * from './shared';
