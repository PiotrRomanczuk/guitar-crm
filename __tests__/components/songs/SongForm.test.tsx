import React from 'react';
import { render, screen } from '@testing-library/react';
import SongForm from '@/components/songs/SongForm';

describe('SongForm Component - Core Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render create form with title', () => {
		render(<SongForm mode='create' />);
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

		render(<SongForm mode='edit' song={mockSong} />);
		expect(screen.getByText(/edit song/i)).toBeInTheDocument();
	});

	it('should have submit button', () => {
		render(<SongForm mode='create' />);
		expect(
			screen.getByRole('button', { name: /save song/i })
		).toBeInTheDocument();
	});
});
