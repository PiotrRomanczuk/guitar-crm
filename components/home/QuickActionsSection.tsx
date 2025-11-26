import { QuickActionButton } from './QuickActionButton';
import { InviteUserModal } from '../dashboard/InviteUserModal';
import { SyncCalendarModal } from '../dashboard/SyncCalendarModal';

export function QuickActionsSection({
  isAdmin,
  isTeacher,
}: {
  isAdmin: boolean;
  isTeacher: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
        🚀 Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {(isTeacher || isAdmin) && (
          <>
            <QuickActionButton
              emoji="📅"
              title="Schedule Lesson"
              description="Create a new lesson with a student"
            />
            <InviteUserModal />
            <SyncCalendarModal />
          </>
        )}
        <QuickActionButton
          emoji="🎸"
          title="Add Song"
          description="Add a new song to the library"
        />
        <QuickActionButton
          emoji="⭐"
          title="View Favorites"
          description="See your favorite songs"
        />
      </div>
    </div>
  );
}
