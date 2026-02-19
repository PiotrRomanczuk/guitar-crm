import { QuickActionsSection } from './QuickActionsSection';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { DashboardHeader } from './DashboardHeader';
import { CalendarEventsList } from './calendar/CalendarEventsList';
import { AIAssistantCard } from './admin/AIAssistantCard';

export function DashboardPageContent({
  email,
  fullName,
  isAdmin,
  isTeacher,
  isStudent,
}: {
  email: string | undefined;
  fullName?: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}) {
  const userRoles = [];
  if (isAdmin) userRoles.push('Admin');
  if (isTeacher) userRoles.push('Teacher');
  if (isStudent) userRoles.push('Student');
  const roleText = userRoles.length > 0 ? userRoles.join(', ') : 'User';

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <DashboardHeader email={email} fullName={fullName} roleText={roleText} />
        <DashboardStatsGrid />
        {isAdmin && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <CalendarEventsList limit={5} />
            <div data-tour="ai-assistant">
              <AIAssistantCard firstName={fullName?.split(' ')[0]} />
            </div>
          </div>
        )}
        <QuickActionsSection isAdmin={isAdmin} isTeacher={isTeacher} />
      </main>
    </div>
  );
}
