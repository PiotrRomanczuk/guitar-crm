'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  const handleDeleteClick = (song: Song) => {
    setSongToDelete(song);
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    setDeletingSongId(songToDelete.id);

    try {
      const response = await fetch(`/api/song?id=${songToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
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
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Author</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Level</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Key</th>
              {canDelete && <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id} className="hover:bg-gray-50" data-testid="song-row">
                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    href={`/dashboard/songs/${song.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {song.title}
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">{song.author}</td>
                <td className="border border-gray-300 px-4 py-2">{song.level}</td>
                <td className="border border-gray-300 px-4 py-2">{song.key}</td>
                {canDelete && (
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      data-testid="song-delete-button"
                      onClick={() => handleDeleteClick(song)}
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
