import { SongSchema, SongInputSchema, SongUpdateSchema } from '@/schemas/SongSchema';

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

	describe('SongUpdateSchema', () => {
		it('should allow partial updates without requiring id in body', () => {
			const partialUpdate = {
				title: 'Updated Title',
			};

			expect(() => SongUpdateSchema.parse(partialUpdate)).not.toThrow();
			const result = SongUpdateSchema.parse(partialUpdate);
			expect(result.title).toBe('Updated Title');
		});

		it('should allow updating multiple fields without id', () => {
			const multiFieldUpdate = {
				title: 'New Title',
				author: 'New Author',
				level: 'advanced' as const,
			};

			expect(() => SongUpdateSchema.parse(multiFieldUpdate)).not.toThrow();
			const result = SongUpdateSchema.parse(multiFieldUpdate);
			expect(result.title).toBe('New Title');
			expect(result.author).toBe('New Author');
			expect(result.level).toBe('advanced');
		});

		it('should allow empty update object', () => {
			const emptyUpdate = {};

			expect(() => SongUpdateSchema.parse(emptyUpdate)).not.toThrow();
		});

		it('should validate field types even in partial updates', () => {
			const invalidUpdate = {
				level: 'invalid_level' as never,
			};

			expect(() => SongUpdateSchema.parse(invalidUpdate)).toThrow();
		});

		it('should not require id field in the update payload', () => {
			// This test verifies that id is NOT part of the update schema
			const updateWithoutId = {
				title: 'Title Update',
				author: 'Author Update',
			};

			const result = SongUpdateSchema.parse(updateWithoutId);
			// Verify id is not in the parsed result
			expect('id' in result).toBe(false);
		});
	});
});
