import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import SongList from '@/components/songs/SongList';

// Mock AuthProvider to avoid useAuth errors in tests
jest.mock('@/components/auth/AuthProvider', () => ({
	AuthProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	useAuth: () => ({
		user: { id: 'test-user' },
		isTeacher: true,
		isAdmin: false,
		isStudent: false,
		loading: false,
	}),
}));

// Render helper
const render = (component: React.ReactElement) => rtlRender(component);

describe('SongList Component - Core Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset fetch mock
		(global.fetch as jest.Mock).mockClear();
	});

	it('should render loading state initially', () => {
		// Mock fetch to never resolve (perpetual loading)
		(global.fetch as jest.Mock).mockImplementation(
			() =>
				new Promise(() => {
					// Never resolves
				})
		);

		render(<SongList />);
		expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
	});

	it('should display error message on fetch failure', async () => {
		// Mock fetch to reject
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('Failed to fetch')
		);

		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
		});
	});

	it('should display empty state when no songs exist', async () => {
		// Mock fetch to return empty array
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [],
		});

		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText(/no songs found/i)).toBeInTheDocument();
		});
	});

	it('should display songs when data is loaded', async () => {
		const mockSongs = [
			{
				id: '1',
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'intermediate',
				key: 'C',
				ultimate_guitar_link: 'https://example.com',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		];

		// Mock fetch to return songs
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => mockSongs,
		});

		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText('Wonderwall')).toBeInTheDocument();
			expect(screen.getByText('Oasis')).toBeInTheDocument();
		});
	});
});
