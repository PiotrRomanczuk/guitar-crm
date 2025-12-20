import { SongSchema, SongInputSchema } from '@/schemas/SongSchema';

describe('SongSchema', () => {
	describe('SongInputSchema', () => {
		it('should validate a valid song input', () => {
			const validSong = {
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'intermediate' as const,
				key: 'C' as const,
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
			};

			expect(() => SongInputSchema.parse(validSong)).not.toThrow();
			const result = SongInputSchema.parse(validSong);
			expect(result.title).toBe('Wonderwall');
			expect(result.author).toBe('Oasis');
			expect(result.level).toBe('intermediate');
			expect(result.key).toBe('C');
		});

		it('should reject song input with missing title', () => {
			const invalidSong = {
				author: 'Oasis',
				level: 'intermediate' as const,
				key: 'C' as const,
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
			};

			expect(() => SongInputSchema.parse(invalidSong)).toThrow();

			try {
				SongInputSchema.parse(invalidSong);
				fail('Expected validation to throw an error');
			} catch (error) {
				// Check that it's a validation error
				expect(error).toBeDefined();
				// Check for the actual error message format from Zod
				const errorString = String(error);
				const hasValidationError =
					errorString.includes('Required') ||
					errorString.includes('title') ||
					errorString.includes('Title is required') ||
					errorString.includes(
						'Invalid input: expected string, received undefined'
					);
				expect(hasValidationError).toBe(true);
			}
		});
		it('should reject song input with invalid level', () => {
			const invalidSong = {
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'expert' as never, // Invalid level
				key: 'C' as const,
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
			};

			expect(() => SongInputSchema.parse(invalidSong)).toThrow();
		});

		it('should reject song input with invalid key', () => {
			const invalidSong = {
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'intermediate' as const,
				key: 'Z' as never, // Invalid key
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
			};

			expect(() => SongInputSchema.parse(invalidSong)).toThrow();
		});

		it('should accept optional fields', () => {
			const songWithOptionals = {
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'intermediate' as const,
				key: 'C' as const,
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
				chords: 'Em7 G D C',
				short_title: 'Wonderwall',
				audio_files: { backing_track: 'url' },
			};

			expect(() => SongInputSchema.parse(songWithOptionals)).not.toThrow();
			const result = SongInputSchema.parse(songWithOptionals);
			expect(result.chords).toBe('Em7 G D C');
			expect(result.short_title).toBe('Wonderwall');
			expect(result.audio_files).toEqual({ backing_track: 'url' });
		});
	});

	describe('SongSchema', () => {
		it('should validate a complete song object', () => {
			const completeSong = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'intermediate' as const,
				key: 'C' as const,
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
				chords: 'Em7 G D C',
				created_at: new Date(),
				updated_at: new Date(),
			};

			expect(() => SongSchema.parse(completeSong)).not.toThrow();
		});

		it('should work without optional id and timestamps', () => {
			const minimalSong = {
				title: 'Wonderwall',
				author: 'Oasis',
				level: 'intermediate' as const,
				key: 'C' as const,
				ultimate_guitar_link:
					'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-82664',
			};

			expect(() => SongSchema.parse(minimalSong)).not.toThrow();
		});
	});
});
