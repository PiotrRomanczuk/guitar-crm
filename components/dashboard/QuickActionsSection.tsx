import { QuickActionButton } from './QuickActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, UserPlus, Music, Star } from 'lucide-react';
import Link from 'next/link';

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
              <Link href="/dashboard/lessons">
                <QuickActionButton
                  emoji={<Calendar className="w-5 h-5 mr-2" />}
                  title="Schedule Lesson"
                  description="Create a new lesson with a student"
                />
              </Link>
              <Link href="/dashboard/users">
                <QuickActionButton
                  emoji={<UserPlus className="w-5 h-5 mr-2" />}
                  title="Add Student"
                  description="Register a new student"
                />
              </Link>
            </>
          )}
          <Link href="/dashboard/songs">
            <QuickActionButton
              emoji={<Music className="w-5 h-5 mr-2" />}
              title="Add Song"
              description="Add a new song to the library"
            />
          </Link>
          <Link href="/dashboard/songs?favorites=true">
            <QuickActionButton
              emoji={<Star className="w-5 h-5 mr-2" />}
              title="View Favorites"
              description="See your favorite songs"
            />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
