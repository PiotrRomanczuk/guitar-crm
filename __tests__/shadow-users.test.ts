import { createShadowUser, syncLessonsFromCalendar } from '@/app/dashboard/actions';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGoogleOAuth2Client } from '@/lib/google';
import { google } from 'googleapis';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}));

jest.mock('@/lib/google', () => ({
  getGoogleOAuth2Client: jest.fn(),
}));

jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(),
  },
}));

describe('Shadow Users', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  const mockAdminSupabase = {
    from: jest.fn(),
    auth: {
      admin: {
        createUser: jest.fn(),
        listUsers: jest.fn(),
        generateLink: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  };

  const mockCalendar = {
    events: {
      list: jest.fn(),
    },
  };

  const mockOAuth2Client = {
    setCredentials: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (createAdminClient as jest.Mock).mockReturnValue(mockAdminSupabase);
    (getGoogleOAuth2Client as jest.Mock).mockReturnValue(mockOAuth2Client);
    (google.calendar as unknown as jest.Mock).mockReturnValue(mockCalendar);
  });

  it('should create a shadow user if student does not exist', async () => {
    // Mock authenticated user (teacher)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'teacher-123' } },
    });

    // Mock user_integrations lookup (needed for getAuthenticatedCalendarClient)
    const mockIntegrationSelect = jest.fn().mockReturnThis();
    const mockIntegrationEq = jest.fn().mockReturnThis();
    const mockIntegrationSingle = jest.fn().mockResolvedValue({
      data: { access_token: 'fake-token', refresh_token: 'fake-refresh' },
      error: null,
    });

    // Mock profile lookup - student not found
    const mockProfileSelect = jest.fn().mockReturnThis();
    const mockProfileEq = jest.fn().mockReturnThis();
    const mockProfileSingle = jest.fn().mockResolvedValue({ data: null }); // Profile not found

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'user_integrations') {
        return {
          select: mockIntegrationSelect,
          eq: mockIntegrationEq,
          single: mockIntegrationSingle,
        };
      }
      if (table === 'profiles') {
        return {
          select: mockProfileSelect,
          eq: mockProfileEq,
          single: mockProfileSingle,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
      };
    });

    // Mock admin upsert for profile
    const mockAdminUpsert = jest.fn().mockResolvedValue({ error: null });
    mockAdminSupabase.from.mockReturnValue({
      upsert: mockAdminUpsert,
    });

    // Mock auth admin list users (empty initially)
    mockAdminSupabase.auth.admin.listUsers = jest.fn().mockResolvedValue({
        data: { users: [] },
        error: null
    });

    // Mock auth admin generateLink
    mockAdminSupabase.auth.admin.generateLink = jest.fn().mockResolvedValue({
        data: { user: { id: 'new-shadow-id', email: 'newstudent@example.com', email_confirmed_at: null } },
        error: null
    });
    
    // Mock updateUserById
    mockAdminSupabase.auth.admin.updateUserById = jest.fn().mockResolvedValue({
        data: { user: { id: 'new-shadow-id' } },
        error: null
    });

    // Mock auth admin create user (fallback, shouldn't be called if generateLink works)
    mockAdminSupabase.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'new-shadow-id', email: 'newstudent@example.com' } },
      error: null,
    });

    const email = 'newstudent@example.com';
    
    // Act
    const result = await createShadowUser(email);
    
    // Assert
    expect(mockAdminSupabase.auth.admin.generateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: email,
      options: {
          data: { 
              is_student: true,
              full_name: 'newstudent'
          }
      }
    });
    
    expect(mockAdminSupabase.auth.admin.updateUserById).toHaveBeenCalledWith('new-shadow-id', { email_confirm: true });
    
    expect(mockAdminUpsert).toHaveBeenCalledWith(expect.objectContaining({
      id: 'new-shadow-id',
      email: email,
      is_student: true
    }), { onConflict: 'id' });
    
    expect(result).toEqual({ success: true, userId: 'new-shadow-id' });
  });
});

describe('Shadow Users', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  const mockAdminSupabase = {
    from: jest.fn(),
    auth: {
      admin: {
        createUser: jest.fn(),
        listUsers: jest.fn(),
        generateLink: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  };

  const mockCalendar = {
    events: {
      list: jest.fn(),
    },
  };

  const mockOAuth2Client = {
    setCredentials: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (createAdminClient as jest.Mock).mockReturnValue(mockAdminSupabase);
    (getGoogleOAuth2Client as jest.Mock).mockReturnValue(mockOAuth2Client);
    (google.calendar as unknown as jest.Mock).mockReturnValue(mockCalendar);
  });

  it('should create a shadow user if student does not exist', async () => {
    // Mock authenticated user (teacher)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'teacher-123' } },
    });

    // Mock user_integrations lookup (needed for getAuthenticatedCalendarClient)
    const mockIntegrationSelect = jest.fn().mockReturnThis();
    const mockIntegrationEq = jest.fn().mockReturnThis();
    const mockIntegrationSingle = jest.fn().mockResolvedValue({
      data: { access_token: 'fake-token', refresh_token: 'fake-refresh' },
      error: null,
    });

    // Mock profile lookup - student not found
    const mockProfileSelect = jest.fn().mockReturnThis();
    const mockProfileEq = jest.fn().mockReturnThis();
    const mockProfileSingle = jest.fn().mockResolvedValue({ data: null }); // Profile not found

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'user_integrations') {
        return {
          select: mockIntegrationSelect,
          eq: mockIntegrationEq,
          single: mockIntegrationSingle,
        };
      }
      if (table === 'profiles') {
        return {
          select: mockProfileSelect,
          eq: mockProfileEq,
          single: mockProfileSingle,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
      };
    });

    // Mock calendar events
    mockCalendar.events.list.mockResolvedValue({
      data: {
        items: [
          {
            id: 'event-1',
            summary: 'Lesson with newstudent@example.com',
            start: { dateTime: '2023-01-01T10:00:00Z' },
            attendees: [{ email: 'newstudent@example.com' }],
          },
        ],
      },
    });

    // Mock admin client for creating user/profile and lessons
    const mockAdminInsert = jest
      .fn()
      .mockResolvedValue({ data: { id: 'new-shadow-id' }, error: null });
    const mockAdminUpsert = jest
      .fn()
      .mockResolvedValue({ data: { id: 'new-shadow-id' }, error: null });
    const mockAdminSelect = jest.fn().mockReturnThis();
    const mockAdminEq = jest.fn().mockReturnThis();
    const mockAdminSingle = jest.fn().mockResolvedValue({ data: null }); // Lesson not found

    mockAdminSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          insert: mockAdminInsert,
          upsert: mockAdminUpsert,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null }),
        };
      }
      if (table === 'lessons') {
        return {
          select: mockAdminSelect,
          eq: mockAdminEq,
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: mockAdminSingle,
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
      };
    });

    // Mock auth admin list users (empty initially)
    mockAdminSupabase.auth.admin.listUsers = jest.fn().mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    // Mock auth admin generateLink
    mockAdminSupabase.auth.admin.generateLink = jest.fn().mockResolvedValue({
      data: {
        user: { id: 'new-shadow-id', email: 'newstudent@example.com', email_confirmed_at: null },
      },
      error: null,
    });

    // Mock updateUserById
    mockAdminSupabase.auth.admin.updateUserById = jest.fn().mockResolvedValue({
      data: { user: { id: 'new-shadow-id' } },
      error: null,
    });

    // Mock auth admin create user (fallback, shouldn't be called if generateLink works)
    mockAdminSupabase.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'new-shadow-id', email: 'newstudent@example.com' } },
      error: null,
    });

    const email = 'newstudent@example.com';

    // Act
    const result = await syncLessonsFromCalendar(email);

    // Assert
    expect(mockAdminSupabase.auth.admin.generateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: email,
      options: {
        data: {
          is_student: true,
          full_name: 'newstudent',
        },
      },
    });

    expect(mockAdminSupabase.auth.admin.updateUserById).toHaveBeenCalledWith('new-shadow-id', {
      email_confirm: true,
    });

    expect(mockAdminUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'new-shadow-id',
        email: email,
        is_student: true,
      }),
      { onConflict: 'id' }
    );

    expect(result).toEqual({ success: true, count: 1 });
  });
});
