/**
 * Unit Tests: Notification Monitoring Service
 *
 * Tests admin alert functions for:
 * - Failure rate checking
 * - Bounce rate checking
 * - Queue backlog checking
 * - Daily summary generation
 */

import { createAdminClient } from '@/lib/supabase/admin';
import transporter from '@/lib/email/smtp-client';
import {
  checkFailureRate,
  checkBounceRate,
  checkQueueBacklog,
  sendDailyAdminSummary,
} from '../notification-monitoring';

// Mock dependencies
jest.mock('@/lib/supabase/admin');
jest.mock('@/lib/email/smtp-client');

const mockSupabase = {
  from: jest.fn(),
  rpc: jest.fn(),
};

const mockSendMail = jest.fn();

describe('Notification Monitoring Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAdminClient as jest.Mock).mockReturnValue(mockSupabase);
    (transporter.sendMail as jest.Mock) = mockSendMail;
  });

  describe('checkFailureRate', () => {
    it('should send alert when failure rate exceeds 10%', async () => {
      // Mock logs with 20% failure rate
      const mockLogs = [
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        {
          status: 'failed',
          notification_type: 'test',
          error_message: 'SMTP connection failed',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockResolvedValue({
            data: mockLogs,
            error: null,
          }),
        }),
      });

      // Mock admin profiles
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ email: 'admin@example.com' }],
                error: null,
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({
              data: mockLogs,
              error: null,
            }),
          }),
        };
      });

      await checkFailureRate();

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: expect.stringContaining('High Notification Failure Rate'),
        })
      );
    });

    it('should not send alert when failure rate is below 10%', async () => {
      // Mock logs with 5% failure rate
      const mockLogs = [
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        { status: 'sent', notification_type: 'test', error_message: null },
        {
          status: 'failed',
          notification_type: 'test',
          error_message: 'SMTP connection failed',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockResolvedValue({
            data: mockLogs,
            error: null,
          }),
        }),
      });

      await checkFailureRate();

      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('checkBounceRate', () => {
    it('should send alert when bounce rate exceeds 5%', async () => {
      // Mock bounce stats with 10% bounce rate
      mockSupabase.rpc.mockResolvedValue({
        data: [
          {
            notification_type: 'lesson_reminder_24h',
            bounce_count: 10,
            total_sent: 100,
          },
        ],
        error: null,
      });

      // Mock admin profiles
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ email: 'admin@example.com' }],
            error: null,
          }),
        }),
      });

      await checkBounceRate();

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: expect.stringContaining('High Email Bounce Rate'),
        })
      );
    });

    it('should not send alert when bounce rate is below 5%', async () => {
      // Mock bounce stats with 2% bounce rate
      mockSupabase.rpc.mockResolvedValue({
        data: [
          {
            notification_type: 'lesson_reminder_24h',
            bounce_count: 2,
            total_sent: 100,
          },
        ],
        error: null,
      });

      await checkBounceRate();

      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('checkQueueBacklog', () => {
    it('should send alert when queue has more than 500 pending', async () => {
      // Mock 600 pending notifications
      const mockQueue = Array.from({ length: 600 }, (_, i) => ({
        created_at: new Date(Date.now() - i * 60000).toISOString(),
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockQueue,
              error: null,
            }),
          }),
        }),
      });

      // Mock admin profiles for the second call
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ email: 'admin@example.com' }],
                error: null,
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockQueue,
                error: null,
              }),
            }),
          }),
        };
      });

      await checkQueueBacklog();

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: expect.stringContaining('Queue Backlog'),
        })
      );
    });

    it('should not send alert when queue is below 500 pending', async () => {
      // Mock 100 pending notifications
      const mockQueue = Array.from({ length: 100 }, (_, i) => ({
        created_at: new Date(Date.now() - i * 60000).toISOString(),
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockQueue,
              error: null,
            }),
          }),
        }),
      });

      await checkQueueBacklog();

      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendDailyAdminSummary', () => {
    it('should send daily summary with stats', async () => {
      const mockLogs = [
        { status: 'sent', notification_type: 'lesson_reminder_24h' },
        { status: 'sent', notification_type: 'lesson_reminder_24h' },
        { status: 'sent', notification_type: 'lesson_recap' },
        { status: 'sent', notification_type: 'assignment_created' },
        { status: 'failed', notification_type: 'lesson_reminder_24h' },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'notification_log') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({
                data: mockLogs,
                error: null,
              }),
            }),
          };
        }
        if (table === 'notification_queue') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ email: 'admin@example.com' }],
                error: null,
              }),
            }),
          };
        }
        return mockSupabase.from(table);
      });

      await sendDailyAdminSummary();

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: expect.stringContaining('Daily Notification Summary'),
        })
      );
    });
  });
});
