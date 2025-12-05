import { QuickActionButton } from './QuickActionButton';
import { InviteUserModal } from '../dashboard/InviteUserModal';
import { SyncCalendarModal } from '../dashboard/SyncCalendarModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActionsSection({
  isAdmin,
  isTeacher,
}: {
  isAdmin: boolean;
  isTeacher: boolean;
}) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">🚀 Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
