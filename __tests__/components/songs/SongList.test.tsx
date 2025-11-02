import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import SongList from '@/components/songs/SongList';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
	supabase: {
		from: jest.fn(),
	},
}));

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
	});

	it('should render loading state initially', () => {
		const mockFrom = jest.fn().mockReturnValue({
			select: jest.fn().mockReturnValue(
				new Promise(() => {
					// Never resolves - perpetual loading
				})
			),
		});

		(supabase.from as jest.Mock).mockImplementation(mockFrom);
		render(<SongList />);

		expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
	});

	it('should display error message on fetch failure', async () => {
		const mockFrom = jest.fn().mockReturnValue({
			select: jest.fn().mockResolvedValue({
				data: null,
				error: new Error('Database connection failed'),
			}),
		});

		(supabase.from as jest.Mock).mockImplementation(mockFrom);
		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText(/failed to load songs/i)).toBeInTheDocument();
		});
	});

	it('should display empty state when no songs exist', async () => {
		const mockFrom = jest.fn().mockReturnValue({
			select: jest.fn().mockResolvedValue({
				data: [],
				error: null,
			}),
		});

		(supabase.from as jest.Mock).mockImplementation(mockFrom);
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

		const mockFrom = jest.fn().mockReturnValue({
			select: jest.fn().mockResolvedValue({
				data: mockSongs,
				error: null,
			}),
		});

		(supabase.from as jest.Mock).mockImplementation(mockFrom);
		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText('Wonderwall')).toBeInTheDocument();
			expect(screen.getByText('Oasis')).toBeInTheDocument();
		});
	});
});
