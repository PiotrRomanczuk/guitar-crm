/**
 * Song Request Server Actions Tests
 *
 * Tests for submitSongRequest, getSongRequests, and reviewSongRequest
 */

import { submitSongRequest, getSongRequests, reviewSongRequest } from '../song-requests';

// Mock data
const mockStudentUser = {
  id: 'student-uuid-123',
  email: 'student@test.com',
};

const mockTeacherUser = {
  id: 'teacher-uuid-456',
  email: 'teacher@test.com',
};

const mockSongRequest = {
  id: 'request-uuid-789',
  student_id: 'student-uuid-123',
  title: 'Wonderwall',
  artist: 'Oasis',
  notes: null,
  url: null,
  status: 'pending',
  reviewed_by: null,
  review_notes: null,
  song_id: null,
  created_at: '2026-02-26T00:00:00Z',
  updated_at: '2026-02-26T00:00:00Z',
};

// Mock chain helpers
const mockSingle = jest.fn();
const mockSelectChain = jest.fn();
const mockInsertChain = jest.fn();
const mockUpdateChain = jest.fn();
const mockOrderChain = jest.fn();
const mockEqChain = jest.fn();

const mockFrom = jest.fn();

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock getUserWithRolesSSR
const mockGetUserWithRoles = jest.fn();
jest.mock('@/lib/getUserWithRolesSSR', () => ({
  getUserWithRolesSSR: () => mockGetUserWithRoles(),
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('submitSongRequest', () => {
  it('should reject unauthenticated users', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
      isDevelopment: false,
    });

    const result = await submitSongRequest({ title: 'Wonderwall' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('should reject non-student users', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockTeacherUser,
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
      isDevelopment: false,
    });

    const result = await submitSongRequest({ title: 'Wonderwall' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Only students can submit song requests');
  });

  it('should reject invalid form data', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockStudentUser,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
      isDevelopment: false,
    });

    const result = await submitSongRequest({ title: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Song title is required');
  });

  it('should submit a valid song request', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockStudentUser,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
      isDevelopment: false,
    });

    mockSingle.mockResolvedValue({ data: mockSongRequest, error: null });
    mockSelectChain.mockReturnValue({ single: mockSingle });
    mockInsertChain.mockReturnValue({ select: mockSelectChain });
    mockFrom.mockReturnValue({ insert: mockInsertChain });

    const result = await submitSongRequest({
      title: 'Wonderwall',
      artist: 'Oasis',
    });

    expect(result.success).toBe(true);
    expect(result.request).toEqual(mockSongRequest);
    expect(mockFrom).toHaveBeenCalledWith('song_requests');
  });

  it('should handle database errors gracefully', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockStudentUser,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
      isDevelopment: false,
    });

    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    mockSelectChain.mockReturnValue({ single: mockSingle });
    mockInsertChain.mockReturnValue({ select: mockSelectChain });
    mockFrom.mockReturnValue({ insert: mockInsertChain });

    const result = await submitSongRequest({ title: 'Test' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to submit request');
  });
});

describe('getSongRequests', () => {
  it('should reject unauthenticated users', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
      isDevelopment: false,
    });

    const result = await getSongRequests();
    expect(result.requests).toEqual([]);
    expect(result.error).toBe('Not authenticated');
  });

  it('should load requests for students (filtered to own)', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockStudentUser,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
      isDevelopment: false,
    });

    mockEqChain.mockResolvedValue({ data: [mockSongRequest], error: null });
    mockOrderChain.mockReturnValue({ eq: mockEqChain });
    mockSelectChain.mockReturnValue({ order: mockOrderChain });
    mockFrom.mockReturnValue({ select: mockSelectChain });

    const result = await getSongRequests();
    expect(result.requests).toHaveLength(1);
    expect(result.error).toBeUndefined();
  });

  it('should load all requests for teachers', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockTeacherUser,
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
      isDevelopment: false,
    });

    mockOrderChain.mockResolvedValue({ data: [mockSongRequest], error: null });
    mockSelectChain.mockReturnValue({ order: mockOrderChain });
    mockFrom.mockReturnValue({ select: mockSelectChain });

    const result = await getSongRequests();
    expect(result.requests).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockTeacherUser,
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
      isDevelopment: false,
    });

    mockEqChain.mockResolvedValue({ data: [], error: null });
    mockOrderChain.mockReturnValue({ eq: mockEqChain });
    mockSelectChain.mockReturnValue({ order: mockOrderChain });
    mockFrom.mockReturnValue({ select: mockSelectChain });

    const result = await getSongRequests('approved');
    expect(result.requests).toEqual([]);
  });
});

describe('reviewSongRequest', () => {
  it('should reject unauthenticated users', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
      isDevelopment: false,
    });

    const result = await reviewSongRequest('id', { status: 'approved' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('should reject students', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockStudentUser,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
      isDevelopment: false,
    });

    const result = await reviewSongRequest('id', { status: 'approved' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('should reject invalid review data', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockTeacherUser,
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
      isDevelopment: false,
    });

    // @ts-expect-error - testing invalid status on purpose
    const result = await reviewSongRequest('id', { status: 'pending' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid review data');
  });

  it('should approve a request successfully', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockTeacherUser,
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
      isDevelopment: false,
    });

    mockEqChain.mockResolvedValue({ data: null, error: null });
    mockUpdateChain.mockReturnValue({ eq: mockEqChain });
    mockFrom.mockReturnValue({ update: mockUpdateChain });

    const result = await reviewSongRequest('request-uuid-789', {
      status: 'approved',
      reviewNotes: 'Great choice!',
    });

    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('song_requests');
  });

  it('should handle database errors on review', async () => {
    mockGetUserWithRoles.mockResolvedValue({
      user: mockTeacherUser,
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
      isDevelopment: false,
    });

    mockEqChain.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    mockUpdateChain.mockReturnValue({ eq: mockEqChain });
    mockFrom.mockReturnValue({ update: mockUpdateChain });

    const result = await reviewSongRequest('request-uuid-789', {
      status: 'rejected',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to review request');
  });
});
