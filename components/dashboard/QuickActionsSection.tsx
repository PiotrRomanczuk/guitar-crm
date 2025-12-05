import { QuickActionButton } from './QuickActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActionsSection({
  isAdmin,
  isTeacher,
}: {
  isAdmin: boolean;
  isTeacher: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">🚀 Quick Actions</CardTitle>
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
              <QuickActionButton
                emoji="➕"
                title="Add Student"
                description="Register a new student"
              />
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
