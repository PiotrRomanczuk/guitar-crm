'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Music, ClipboardList, LayoutDashboard, Plus } from 'lucide-react';
import UserOverviewTab from './UserOverviewTab';
import UserLessons from './UserLessons';
import UserAssignments from './UserAssignments';
import UserRepertoireTab from './UserRepertoireTab';
import type { StudentRepertoireWithSong } from '@/types/StudentRepertoire';

export interface Lesson {
  id: string;
  lesson_teacher_number: number | null;
  lesson_number: number | null;
  date: string | null;
  status: string | null;
  student: { full_name: string } | null;
  teacher: { full_name: string } | null;
}

export interface Assignment {
  id: string;
  title: string | null;
  description: string | null;
  due_date: string | null;
  status: string | null;
}

interface ParentInfo {
  id: string;
  full_name: string | null;
  email: string;
}

interface UserDetailTabsProps {
  userId: string;
  activeTab: string;
  lessons: Lesson[];
  assignments: Assignment[];
  repertoire: StudentRepertoireWithSong[];
  parentProfile?: ParentInfo | null;
}

const TAB_CONFIG = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'lessons', label: 'Lessons', icon: BookOpen },
  { value: 'repertoire', label: 'Repertoire', icon: Music },
  { value: 'assignments', label: 'Assignments', icon: ClipboardList },
];

export function UserDetailTabs({
  userId,
  activeTab,
  lessons,
  assignments,
  repertoire,
  parentProfile,
}: UserDetailTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    const query = params.toString();
    router.push(`/dashboard/users/${userId}${query ? `?${query}` : ''}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="w-full justify-start">
        {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="gap-1.5">
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <UserOverviewTab
          userId={userId}
          lessons={lessons}
          repertoire={repertoire}
          assignments={assignments}
          parentProfile={parentProfile}
        />
      </TabsContent>

      <TabsContent value="lessons" className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </span>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`/dashboard/lessons/new?student_id=${userId}`}>
              <Plus className="h-4 w-4" />
              New Lesson
            </Link>
          </Button>
        </div>
        <UserLessons lessons={lessons} showStudentColumn={false} />
      </TabsContent>

      <TabsContent value="repertoire" className="mt-4">
        <UserRepertoireTab userId={userId} repertoire={repertoire} />
      </TabsContent>

      <TabsContent value="assignments" className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </span>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`/dashboard/assignments/new?studentId=${userId}`}>
              <Plus className="h-4 w-4" />
              New Assignment
            </Link>
          </Button>
        </div>
        <UserAssignments assignments={assignments} />
      </TabsContent>
    </Tabs>
  );
}
