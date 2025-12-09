'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Props {
  songId: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
}

export default function SongDetailActions({
  songId,
  isAdmin = false,
  isTeacher = false,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const canManageSongs = isTeacher || isAdmin;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this song?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Optionally reload or redirect
      window.location.href = '/dashboard/songs';
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete song');
      setDeleting(false);
    }
  };

  if (!canManageSongs) {
    return null;
  }

  return (
    <div className="flex gap-4">
      <Link href={`/dashboard/songs/${songId}/edit`}>
        <button
          data-testid="song-edit-button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit song
        </button>
      </Link>
      <button
        data-testid="song-delete-button"
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
      >
        {deleting ? 'Deleting...' : 'Delete song'}
      </button>
    </div>
  );
}
