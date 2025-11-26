import Link from 'next/link';
import { LessonSongSelector } from './LessonSongSelector';
import { LessonSongStatusSelect } from './LessonSongStatusSelect';
import { Database } from '@/database.types';

interface Song {
  id: string;
  title: string;
  author: string;
}

interface LessonSong {
  id: string;
  status: Database['public']['Enums']['lesson_song_status'];
  song: Song | null;
}

interface LessonSongsListProps {
  lessonId: string;
  lessonSongs: LessonSong[];
  canEdit: boolean;
}

export function LessonSongsList({ lessonId, lessonSongs, canEdit }: LessonSongsListProps) {
  const initialSelectedSongIds = lessonSongs
    .filter((ls) => ls.song !== null)
    .map((ls) => ls.song!.id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lesson Songs</h2>
        {canEdit && (
          <LessonSongSelector lessonId={lessonId} initialSelectedSongIds={initialSelectedSongIds} />
        )}
      </div>

      {lessonSongs && lessonSongs.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {lessonSongs.map((ls, index) =>
            ls.song ? (
              <li key={`${ls.song.id}-${index}`} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{ls.song.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ls.song.author}</p>
                </div>
                <div className="flex items-center gap-4">
                  {canEdit && (
                    <LessonSongStatusSelect
                      lessonId={lessonId}
                      songId={ls.song.id}
                      currentStatus={ls.status}
                    />
                  )}
                  <Link
                    href={`/dashboard/songs/${ls.song.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    View
                  </Link>
                </div>
              </li>
            ) : null
          )}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">No songs assigned to this lesson.</p>
      )}
    </div>
  );
}
