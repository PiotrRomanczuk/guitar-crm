import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PostLessonPromptProps {
  lessonId: string;
  studentId: string;
  studentName: string;
  songs: { id: string; title: string; status: string }[];
}

function buildAssignmentUrl(
  lessonId: string,
  studentId: string,
  songTitle?: string
): string {
  const params = new URLSearchParams({ lessonId, studentId });
  if (songTitle) {
    params.set('songTitle', songTitle);
  }
  return `/dashboard/assignments/new?${params.toString()}`;
}

export function PostLessonPrompt({
  lessonId,
  studentId,
  studentName,
  songs,
}: PostLessonPromptProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Assign Homework</CardTitle>
        </div>
        <CardDescription>
          Create assignments for {studentName} based on this lesson&apos;s songs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {song.title}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href={buildAssignmentUrl(lessonId, studentId, song.title)}>
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Create Assignment</span>
                <span className="sm:hidden">Assign</span>
              </Link>
            </Button>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-2" asChild>
          <Link href={buildAssignmentUrl(lessonId, studentId)}>
            <ClipboardList className="h-4 w-4" />
            Custom Assignment
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
