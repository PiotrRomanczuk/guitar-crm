'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { EntityLink, StatusBadge, getStatusVariant } from '@/components/shared';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import type { Song } from '../types';

interface Props {
  songs: Song[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
}

export default function SongListTable({ songs, canDelete = false, onDeleteSuccess }: Props) {
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const router = useRouter();

  const handleDeleteClick = (song: Song) => {
    setSongToDelete(song);
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    setDeletingSongId(songToDelete.id);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('songs').delete().eq('id', songToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      setSongToDelete(null);
      setDeletingSongId(null);
      onDeleteSuccess?.();
    } catch (error) {
      console.error('🎸 [FRONTEND] Delete failed:', error);
      setDeletingSongId(null);
    }
  };

  const handleCancelDelete = () => {
    setSongToDelete(null);
    setDeletingSongId(null);
  };

  return (
    <>
      <div className="overflow-x-auto" data-testid="song-table">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Title
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Author
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Level
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Key
              </th>
              {canDelete && (
                <th className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr
                key={song.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                data-testid="song-row"
                onClick={() => router.push(`/dashboard/songs/${song.id}`)}
              >
                <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  <EntityLink
                    href={`/dashboard/songs/${song.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {song.title}
                  </EntityLink>
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  {song.author}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2">
                  {song.level && (
                    <StatusBadge variant={getStatusVariant(song.level)}>{song.level}</StatusBadge>
                  )}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  {song.key}
                </td>
                {canDelete && (
                  <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2">
                    <button
                      data-testid="song-delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(song);
                      }}
                      disabled={deletingSongId === song.id}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {deletingSongId === song.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {songToDelete && (
        <DeleteConfirmationDialog
          isOpen={true}
          songTitle={songToDelete?.title || ''}
          hasLessonAssignments={false}
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          isDeleting={deletingSongId === songToDelete?.id}
        />
      )}
    </>
  );
}
