import { getLessonsHandler } from '@/app/api/lessons/handlers';

describe('Lesson API Student Filtering', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSupabase: any = {
    from: jest.fn(),
  };

  const mockUser = { id: 'user-123' };
  const adminProfile = { isAdmin: true, isTeacher: null, isStudent: null };
  const teacherProfile = { isAdmin: false, isTeacher: true, isStudent: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('admin can filter by studentId', async () => {
    const baseQueryMock = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };

    mockSupabase.from.mockReturnValue(baseQueryMock);

    await getLessonsHandler(mockSupabase, mockUser, adminProfile, {
      studentId: 'student-456',
    });

    // Verify eq was called with student_id
    expect(baseQueryMock.eq).toHaveBeenCalledWith('student_id', 'student-456');
  });

  it('teacher can filter by studentId', async () => {
    const baseQueryMock = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(), // For teacher_id check in getTeacherStudentIds AND student_id filter
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };

    mockSupabase.from.mockReturnValue(baseQueryMock);

    // Mock getTeacherStudentIds response
    // First call to from('lessons') is inside getTeacherStudentIds
    // We need to handle multiple calls to from()

    // Mock implementation for from()
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: jest.fn().mockImplementation((cols) => {
            if (cols === 'student_id') {
              // This is getTeacherStudentIds query
              return {
                eq: jest.fn().mockResolvedValue({
                  data: [{ student_id: 'student-456' }, { student_id: 'student-789' }],
                }),
              };
            }
            // This is the main query
            return baseQueryMock;
          }),
        };
      }
      return baseQueryMock;
    });

    await getLessonsHandler(mockSupabase, mockUser, teacherProfile, {
      studentId: 'student-456',
    });

    // Verify eq was called with student_id
    expect(baseQueryMock.eq).toHaveBeenCalledWith('student_id', 'student-456');
    // Verify in was called with teacher's students
    expect(baseQueryMock.in).toHaveBeenCalledWith('student_id', ['student-456', 'student-789']);
  });
});
