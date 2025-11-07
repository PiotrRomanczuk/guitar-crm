import React from 'react';
import { render, screen } from '@testing-library/react';
import SongDetail from '@/components/songs/SongDetail';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
	supabase: {
		from: jest.fn(),
	},
}));

// Mock AuthProvider
jest.mock('@/components/auth/AuthProvider', () => ({
	useAuth: () => ({
		user: { id: 'test-user' },
		isTeacher: true,
		isAdmin: false,
		isStudent: false,
		loading: false,
	}),
}));

describe('SongDetail Component - Core Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should display loading state initially', () => {
		const mockFrom = jest.fn().mockReturnValue({
			select: jest.fn().mockReturnValue({
				eq: jest.fn().mockReturnValue({
					single: jest.fn().mockReturnValue(
						new Promise(() => {
							// Never resolves
						})
					),
				}),
			}),
		});

		(supabase.from as jest.Mock).mockImplementation(mockFrom);
		render(<SongDetail songId="test-id" />);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});
});

