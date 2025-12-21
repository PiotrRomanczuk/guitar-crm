
import { render, screen } from '@testing-library/react';
import { SongStatsTable } from './SongStatsTable';
import { SongDatabaseStats } from '@/lib/services/song-analytics';

describe('SongStatsTable', () => {
  const mockStats: SongDatabaseStats = {
    totalSongs: 100,
    coverage: {
      chords: 80,
      youtube: 50,
      ultimateGuitar: 30,
      galleryImages: 10,
    },
    counts: {
      withChords: 80,
      withYoutube: 50,
      withUltimateGuitar: 30,
      withGalleryImages: 10,
    },
    missing: {
      chords: [
        { id: '1', title: 'Song 1', author: 'Author 1' },
      ],
      youtube: [],
      ultimateGuitar: [],
      galleryImages: [],
    },
  };

  it('renders all metrics cards', () => {
    render(<SongStatsTable stats={mockStats} />);

    expect(screen.getByText('Chords / Lyrics')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();

    expect(screen.getByText('YouTube Links')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    expect(screen.getByText('Ultimate Guitar Links')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    expect(screen.getByText('Gallery Images')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders missing metadata list', () => {
    render(<SongStatsTable stats={mockStats} />);

    expect(screen.getByText('Missing Metadata Action Items')).toBeInTheDocument();
    expect(screen.getByText('Chords / Lyrics Missing (1)')).toBeInTheDocument();
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Author 1')).toBeInTheDocument();
  });

  it('renders correct color classes based on percentage', () => {
    render(<SongStatsTable stats={mockStats} />);

    // 80% should be green
    const chordsPercentage = screen.getByText('80%');
    expect(chordsPercentage).toHaveClass('text-green-600');
    expect(chordsPercentage).toHaveClass('bg-green-100');

    // 30% should be red
    const ugPercentage = screen.getByText('30%');
    expect(ugPercentage).toHaveClass('text-red-600');
    expect(ugPercentage).toHaveClass('bg-red-100');
  });
});
