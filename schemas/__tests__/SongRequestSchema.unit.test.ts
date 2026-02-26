import {
  SongRequestFormSchema,
  SongRequestReviewSchema,
  SongRequestStatusEnum,
} from '../SongRequestSchema';

describe('SongRequestFormSchema', () => {
  it('should accept valid form data with all fields', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
      artist: 'Oasis',
      notes: 'I love this song',
      url: 'https://youtube.com/watch?v=abc123',
    });
    expect(result.success).toBe(true);
  });

  it('should accept minimal data with only title', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty optional strings', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
      artist: '',
      notes: '',
      url: '',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = SongRequestFormSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Song title is required');
    }
  });

  it('should reject title over 200 characters', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid URL', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
      url: 'not-a-valid-url',
    });
    expect(result.success).toBe(false);
  });

  it('should reject artist over 100 characters', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
      artist: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('should reject notes over 500 characters', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
      notes: 'N'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('should transform empty URL to undefined', () => {
    const result = SongRequestFormSchema.safeParse({
      title: 'Wonderwall',
      url: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBeUndefined();
    }
  });
});

describe('SongRequestReviewSchema', () => {
  it('should accept approved status', () => {
    const result = SongRequestReviewSchema.safeParse({
      status: 'approved',
    });
    expect(result.success).toBe(true);
  });

  it('should accept rejected status with notes', () => {
    const result = SongRequestReviewSchema.safeParse({
      status: 'rejected',
      reviewNotes: 'Too advanced for now',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = SongRequestReviewSchema.safeParse({
      status: 'pending',
    });
    expect(result.success).toBe(false);
  });

  it('should reject review notes over 500 characters', () => {
    const result = SongRequestReviewSchema.safeParse({
      status: 'approved',
      reviewNotes: 'N'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('SongRequestStatusEnum', () => {
  it('should accept pending', () => {
    expect(SongRequestStatusEnum.safeParse('pending').success).toBe(true);
  });

  it('should accept approved', () => {
    expect(SongRequestStatusEnum.safeParse('approved').success).toBe(true);
  });

  it('should accept rejected', () => {
    expect(SongRequestStatusEnum.safeParse('rejected').success).toBe(true);
  });

  it('should reject unknown status', () => {
    expect(SongRequestStatusEnum.safeParse('unknown').success).toBe(false);
  });
});
