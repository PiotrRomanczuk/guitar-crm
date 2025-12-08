'use client';

import { StudentDashboardData } from "@/app/actions/student/dashboard";
import { LastLessonCard } from "./LastLessonCard";
import { AssignmentsCard } from "./AssignmentsCard";
import { RecentSongsCard } from "./RecentSongsCard";
import { DashboardHeader } from "../DashboardHeader";

interface StudentDashboardClientProps {
  data: StudentDashboardData;
  email?: string;
}

export function StudentDashboardClient({ data, email }: StudentDashboardClientProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <DashboardHeader email={email} roleText="Student" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="col-span-1">
            <LastLessonCard lesson={data.lastLesson} />
          </div>
          <div className="col-span-1">
            <AssignmentsCard assignments={data.assignments} />
          </div>
          <div className="col-span-1">
            <RecentSongsCard songs={data.recentSongs} />
          </div>
        </div>
      </main>
    </div>
  );
}
