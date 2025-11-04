import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import SongList from '@/components/songs/SongList';
import type { SongWithStatus } from '@/components/songs/useSongList';

// Mock useAuth with flexible return values
const mockUseAuth = jest.fn();
jest.mock('@/components/auth/AuthProvider', () => ({
	AuthProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	useAuth: () => mockUseAuth(),
}));

// Render helper
const render = (component: React.ReactElement) => rtlRender(component);

describe('SongList Component - Enhanced Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(global.fetch as jest.Mock).mockClear();

		// Default mock: teacher role
		mockUseAuth.mockReturnValue({
			user: { id: 'test-teacher-id' },
			isTeacher: true,
			isAdmin: false,
			isStudent: false,
			loading: false,
		});
	});

	describe('Loading and Error States', () => {
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

			console.log('✅ Loading state: Rendered correctly');
		});

		it('should display error message on fetch failure', async () => {
			const errorMessage = 'Failed to fetch songs';
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => ({ error: errorMessage }),
			});

			render(<SongList />);

			await waitFor(() => {
				expect(
					screen.getByText(new RegExp(errorMessage, 'i'))
				).toBeInTheDocument();
			});

			// Verify correct endpoint called
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/song/admin-songs?userId=test-teacher-id')
			);

			console.log('✅ Error state: Error message displayed correctly', {
				endpoint: '/api/song/admin-songs',
				errorMessage,
			});
		});

		it('should display error when user is not authenticated', async () => {
			mockUseAuth.mockReturnValue({
				user: null,
				isTeacher: false,
				isAdmin: false,
				isStudent: false,
				loading: false,
			});

			render(<SongList />);

			await waitFor(() => {
				expect(screen.getByText(/not authenticated/i)).toBeInTheDocument();
			});

			console.log('✅ Auth error: Not authenticated message displayed');
		});
	});

	describe('Empty State', () => {
		it('should display empty state when no songs exist', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => [],
			});

			render(<SongList />);

			await waitFor(() => {
				expect(screen.getByText(/no songs found/i)).toBeInTheDocument();
			});

			console.log('✅ Empty state: No songs message displayed');
		});
	});

	describe('Song Display - Teacher/Admin Role', () => {
		it('should display songs for teacher users with correct endpoint', async () => {
			const mockSongs: SongWithStatus[] = [
				{
					id: '1',
					title: 'Wonderwall',
					author: 'Oasis',
					level: 'beginner',
					key: 'C',
					created_at: new Date().toISOString(),
					ultimate_guitar_link:
						'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-62555',
					chords: 'Em7 G Dsus4 A7sus4',
				},
				{
					id: '2',
					title: 'Stairway to Heaven',
					author: 'Led Zeppelin',
					level: 'advanced',
					key: 'Am',
					created_at: new Date().toISOString(),
					ultimate_guitar_link:
						'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-chords-18935',
					chords: 'Am C/G D/F# Fmaj7',
				},
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => mockSongs,
			});

			render(<SongList />);

			await waitFor(() => {
				expect(screen.getByText('Wonderwall')).toBeInTheDocument();
				expect(screen.getByText('Oasis')).toBeInTheDocument();
				expect(screen.getByText('Stairway to Heaven')).toBeInTheDocument();
				expect(screen.getByText('Led Zeppelin')).toBeInTheDocument();
			});

			// Verify correct endpoint for teacher
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/song/admin-songs?userId=test-teacher-id')
			);

			console.log('✅ Teacher view: All songs rendered successfully', {
				songsCount: mockSongs.length,
				songs: mockSongs.map((s) => ({
					title: s.title,
					author: s.author,
					level: s.level,
				})),
				endpoint: '/api/song/admin-songs',
				userId: 'test-teacher-id',
			});
		});

		it('should display songs for admin users with correct endpoint', async () => {
			mockUseAuth.mockReturnValue({
				user: { id: 'test-admin-id' },
				isTeacher: false,
				isAdmin: true,
				isStudent: false,
				loading: false,
			});

			const mockSongs: SongWithStatus[] = [
				{
					id: '3',
					title: 'Hotel California',
					author: 'Eagles',
					level: 'intermediate',
					key: 'Bm',
					created_at: new Date().toISOString(),
					ultimate_guitar_link:
						'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-22394',
					chords: 'Bm F# A E G D Em',
				},
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => mockSongs,
			});

			render(<SongList />);

			await waitFor(() => {
				expect(screen.getByText('Hotel California')).toBeInTheDocument();
				expect(screen.getByText('Eagles')).toBeInTheDocument();
			});

			// Verify correct endpoint for admin
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/song/admin-songs?userId=test-admin-id')
			);

			console.log('✅ Admin view: All songs rendered successfully', {
				songsCount: mockSongs.length,
				songs: mockSongs.map((s) => ({
					title: s.title,
					author: s.author,
					level: s.level,
				})),
				endpoint: '/api/song/admin-songs',
				userId: 'test-admin-id',
			});
		});
	});

	describe('Song Display - Student Role', () => {
		it('should display assigned songs with status for student users', async () => {
			mockUseAuth.mockReturnValue({
				user: { id: 'test-student-id' },
				isTeacher: false,
				isAdmin: false,
				isStudent: true,
				loading: false,
			});

			const mockSongsWithStatus: SongWithStatus[] = [
				{
					id: '1',
					title: 'Wonderwall',
					author: 'Oasis',
					level: 'beginner',
					key: 'C',
					status: 'started',
					created_at: new Date().toISOString(),
					ultimate_guitar_link:
						'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-62555',
					chords: 'Em7 G Dsus4 A7sus4',
				},
				{
					id: '4',
					title: 'Knockin on Heavens Door',
					author: 'Bob Dylan',
					level: 'beginner',
					key: 'G',
					status: 'to_learn',
					created_at: new Date().toISOString(),
					ultimate_guitar_link:
						'https://tabs.ultimate-guitar.com/tab/bob-dylan/knockin-on-heavens-door-chords-23456',
					chords: 'G D Am C',
				},
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => mockSongsWithStatus,
			});

			render(<SongList />);

			await waitFor(() => {
				expect(screen.getByText('Wonderwall')).toBeInTheDocument();
				expect(screen.getByText('Oasis')).toBeInTheDocument();
				expect(screen.getByText('Knockin on Heavens Door')).toBeInTheDocument();
				expect(screen.getByText('Bob Dylan')).toBeInTheDocument();
			});

			// Verify correct endpoint for student
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining(
					'/api/song/student-songs?userId=test-student-id'
				)
			);

			console.log(
				'✅ Student view: All assigned songs with status rendered successfully',
				{
					songsCount: mockSongsWithStatus.length,
					songs: mockSongsWithStatus.map((s) => ({
						title: s.title,
						author: s.author,
						level: s.level,
						status: s.status,
					})),
					endpoint: '/api/song/student-songs',
					userId: 'test-student-id',
				}
			);
		});
	});

	describe('Level Filtering', () => {
		it('should support level filtering in API call', async () => {
			const beginnerSongs: SongWithStatus[] = [
				{
					id: '1',
					title: 'Wonderwall',
					author: 'Oasis',
					level: 'beginner',
					key: 'C',
					created_at: new Date().toISOString(),
					ultimate_guitar_link:
						'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-62555',
					chords: 'Em7 G Dsus4 A7sus4',
				},
			];

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => beginnerSongs,
			});

			render(<SongList />);

			await waitFor(() => {
				expect(screen.getByText('Wonderwall')).toBeInTheDocument();
			});

			// TODO: Add filter interaction test when UI filter is implemented
			// Currently testing that beginner songs are properly displayed

			console.log('✅ Level filtering: Data structure supports filtering', {
				filteredCount: beginnerSongs.length,
				level: 'beginner',
				note: 'UI filter interaction test pending',
			});
		});
	});
});
