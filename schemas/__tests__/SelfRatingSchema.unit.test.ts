/**
 * SelfRatingSchema Tests
 *
 * Tests validation for the student self-rating Zod schema.
 *
 * @see schemas/SelfRatingSchema.ts
 */

import { SelfRatingSchema, SELF_RATING_LABELS } from '../SelfRatingSchema';

describe('SelfRatingSchema', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440001';

  describe('valid inputs', () => {
    it('should accept rating of 1', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 1 });
      expect(result.success).toBe(true);
    });

    it('should accept rating of 5', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 5 });
      expect(result.success).toBe(true);
    });

    it('should accept rating of 3', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 3 });
      expect(result.success).toBe(true);
    });

    it('should accept all valid ratings (1-5)', () => {
      for (let rating = 1; rating <= 5; rating++) {
        const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('invalid ratings', () => {
    it('should reject rating of 0', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject rating of 6', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject negative rating', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject decimal rating', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 3.5 });
      expect(result.success).toBe(false);
    });

    it('should reject string rating', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: '3' });
      expect(result.success).toBe(false);
    });

    it('should reject missing rating', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID });
      expect(result.success).toBe(false);
    });
  });

  describe('invalid repertoireId', () => {
    it('should reject non-UUID repertoireId', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: 'not-a-uuid', rating: 3 });
      expect(result.success).toBe(false);
    });

    it('should reject empty repertoireId', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: '', rating: 3 });
      expect(result.success).toBe(false);
    });

    it('should reject missing repertoireId', () => {
      const result = SelfRatingSchema.safeParse({ rating: 3 });
      expect(result.success).toBe(false);
    });
  });

  describe('error messages', () => {
    it('should show min rating error', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 0 });
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rating must be at least 1');
      }
    });

    it('should show max rating error', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: validUUID, rating: 6 });
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rating must be at most 5');
      }
    });

    it('should show UUID error for invalid repertoireId', () => {
      const result = SelfRatingSchema.safeParse({ repertoireId: 'bad-id', rating: 3 });
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Repertoire entry must be a valid UUID');
      }
    });
  });
});

describe('SELF_RATING_LABELS', () => {
  it('should have labels for all 5 ratings', () => {
    expect(Object.keys(SELF_RATING_LABELS)).toHaveLength(5);
  });

  it('should have the correct label for each rating', () => {
    expect(SELF_RATING_LABELS[1]).toBe('Struggling');
    expect(SELF_RATING_LABELS[2]).toBe('Needs Work');
    expect(SELF_RATING_LABELS[3]).toBe('Okay');
    expect(SELF_RATING_LABELS[4]).toBe('Comfortable');
    expect(SELF_RATING_LABELS[5]).toBe('Mastered');
  });
});
