import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SongForm } from '@/components/songs';

jest.setTimeout(30000);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock fetch for API interactions
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('SongForm Component - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123', title: 'New Song' }),
    });
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
      youtube_url: 'https://youtube.com/watch?v=123',
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

  it('submits successfully with valid data (POST)', async () => {
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
    await waitFor(
      () => {
        // Button returns to normal state indicating submission finished
        expect(screen.getByRole('button', { name: /save song/i })).toBeEnabled();
      },
      { timeout: 10000 }
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/song',
      expect.objectContaining({ method: 'POST' })
    );
  }, 15000);

  it('submits successfully with valid data (PUT)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'song-1', title: 'Edited' }),
    });
    const song = {
      id: 'song-1',
      title: 'Old',
      author: 'Auth',
      level: 'beginner' as const,
      key: 'C' as const,
      ultimate_guitar_link: 'https://example.com',
      chords: '',
      short_title: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Cast minimal song object to Song type for test purposes
    render(<SongForm mode="edit" song={song as unknown as import('@/schemas/SongSchema').Song} />);
    fireEvent.change(screen.getByLabelText(/^Title/i), {
      target: { value: 'Edited' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save song/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save song/i })).toBeEnabled();
    });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/song?id=song-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('shows submit error when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Bad' }) });
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
      expect(screen.getByText(/failed to save song/i)).toBeInTheDocument();
    });
  });
});
