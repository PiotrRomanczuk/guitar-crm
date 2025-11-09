import React from 'react';
import { render, screen } from '@testing-library/react';
import SongListTable from '@/components/songs/SongList/Table';
import SongListHeader from '@/components/songs/SongList/Header';
import SongListEmpty from '@/components/songs/SongList/Empty';
import type { Tables } from '@/types/database.types';

type Song = Tables<'songs'>;

describe('SongList Components', () => {
  describe('SongListHeader', () => {
    it('should render the header (manage disabled)', () => {
      render(<SongListHeader canManageSongs={false} />);
      expect(screen.getByText('Song Library')).toBeInTheDocument();
    });

    it('should render create button when canManageSongs', () => {
      render(<SongListHeader canManageSongs />);
      expect(screen.getByTestId('song-new-button')).toBeInTheDocument();
    });
  });

  describe('SongListEmpty', () => {
    it('should render empty state', () => {
      render(<SongListEmpty />);
      expect(screen.getByText(/No songs found/i)).toBeInTheDocument();
    });
  });

  describe('SongListTable', () => {
    const mockSongs: Song[] = [
      {
        id: '1',
        title: 'Test Song',
        author: 'Test Artist',
        level: 'beginner',
        key: 'C',
        created_at: '2024-01-01T00:00:00Z',
        ultimate_guitar_link: 'https://example.com',
        chords: 'C G Am F',
        audio_files: null,
        short_title: null,
        updated_at: null,
      },
    ];

    it('should render table with songs', () => {
      render(<SongListTable songs={mockSongs} />);
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });
  });
});
