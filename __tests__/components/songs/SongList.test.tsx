import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import SongList from '@/components/songs/SongList';

// Helper to mock fetch per test
const mockFetch = (response: {
	ok: boolean;
	status?: number;
	json: unknown | (() => unknown);
}) => {
	const g = globalThis as unknown as {
		fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
	};
	return jest.spyOn(g, 'fetch').mockResolvedValue({
		ok: response.ok,
		status: response.status ?? (response.ok ? 200 : 500),
		json: async () =>
			typeof response.json === 'function'
				? await (response.json as () => unknown)()
				: response.json,
		text: async () =>
			JSON.stringify(
				typeof response.json === 'function'
					? await (response.json as () => unknown)()
					: response.json
			),
	} as unknown as Response);
};

// (No supabase usage in this component; API is fetched via fetch per role)

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
		// Let the default fetch resolve; initial render shows loading
		render(<SongList />);

		expect(screen.getByTestId('song-list-loading')).toBeInTheDocument();
	});

	it('should display error message on fetch failure', async () => {
		mockFetch({
			ok: false,
			status: 500,
			json: { error: 'Failed to load songs' },
		});
		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText(/failed to load songs/i)).toBeInTheDocument();
		});
	});

	it('should display empty state when no songs exist', async () => {
		mockFetch({ ok: true, json: [] });
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

		mockFetch({ ok: true, json: mockSongs });
		render(<SongList />);

		await waitFor(() => {
			expect(screen.getByText('Wonderwall')).toBeInTheDocument();
			expect(screen.getByText('Oasis')).toBeInTheDocument();
		});
	});
});
