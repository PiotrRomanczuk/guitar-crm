'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  const router = useRouter();
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

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
      router.refresh();
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
                <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  {song.level}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  {song.key}
                </td>
                {canDelete && (
                  <td className="border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(song);
                      }}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      data-testid="delete-song-button"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationDialog
        isOpen={!!songToDelete}
        title="Delete Song"
        message={`Are you sure you want to delete "${songToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={!!deletingSongId}
      />
    </>
  );
}
