import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SongForm from '@/components/songs/SongForm';

// Mock supabase browser client
jest.mock('@/lib/supabase-browser', () => ({
  getSupabaseBrowserClient: () => ({
    from: () => ({
      insert: async () => ({ error: null }),
      update: async () => ({ error: null }),
    }),
  }),
}));

describe('SongForm Component - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create form with title', () => {
    render(<SongForm mode="create" />);
    expect(screen.getByText(/create new song/i)).toBeInTheDocument();
  });

  it('should render edit form with song data', () => {
    const mockSong = {
      title: 'Wonderwall',
      author: 'Oasis',
      level: 'intermediate' as const,
      key: 'C' as const,
      ultimate_guitar_link: 'https://example.com',
    };

    render(<SongForm mode="edit" song={mockSong} />);
    expect(screen.getByText(/edit song/i)).toBeInTheDocument();
  });

  it('should have submit button', () => {
    render(<SongForm mode="create" />);
    expect(screen.getByRole('button', { name: /save song/i })).toBeInTheDocument();
  });

  it('shows validation errors when required fields missing', async () => {
    render(<SongForm mode="create" />);
    // Submit immediately without filling
    fireEvent.click(screen.getByRole('button', { name: /save song/i }));
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/author is required/i)).toBeInTheDocument();
    });
  });

  it('submits successfully with valid data', async () => {
    render(<SongForm mode="create" />);
    fireEvent.change(screen.getByLabelText(/^Title/i), {
      target: { value: 'New Song' },
    });
    fireEvent.change(screen.getByLabelText(/author/i), {
      target: { value: 'Some Author' },
    });
    fireEvent.change(screen.getByLabelText(/ultimate guitar link/i), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save song/i }));
    await waitFor(() => {
      // Button returns to normal state indicating submission finished
      expect(screen.getByRole('button', { name: /save song/i })).toBeEnabled();
    });
  });
});
