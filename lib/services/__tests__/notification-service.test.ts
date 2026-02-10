import {
  sendNotification,
  queueNotification,
  checkUserPreference,
  processQueuedNotifications,
  retryFailedNotifications,
} from '../notification-service';
import { createAdminClient } from '@/lib/supabase/admin';
import transporter from '@/lib/email/smtp-client';
import * as retryHandler from '@/lib/email/retry-handler';

// Mock dependencies
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}));

jest.mock('@/lib/email/smtp-client', () => ({
  sendMail: jest.fn(),
}));

jest.mock('@/lib/email/retry-handler', () => ({
  getRetryableNotifications: jest.fn(),
  updateNotificationRetry: jest.fn(),
  processDeadLetterQueue: jest.fn(),
  shouldMoveToDeadLetter: jest.fn(),
  moveToDeadLetter: jest.fn(),
}));

describe('notification-service', () => {
  let mockSupabase: {
    from: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    single: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    lt: jest.Mock;
    order: jest.Mock;
    limit: jest.Mock;
    rpc: jest.Mock;
  };

  const createMockSupabase = () => {
    const mock = {
      from: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      lt: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
      rpc: jest.fn(),
    };

    // Chain methods return the mock object itself
    mock.from.mockReturnValue(mock);
    mock.select.mockReturnValue(mock);
    mock.eq.mockReturnValue(mock);
    mock.insert.mockReturnValue(mock);
    mock.update.mockReturnValue(mock);
    mock.lt.mockReturnValue(mock);
    mock.order.mockReturnValue(mock);
    mock.limit.mockReturnValue(mock);

    return mock;
  };

  const mockRecipient = {
    id: 'user-123',
    email: 'student@example.com',
    full_name: 'John Student',
  };

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
    (createAdminClient as jest.Mock).mockReturnValue(mockSupabase);

    // Set up environment
    process.env = { ...OLD_ENV };
    process.env.GMAIL_USER = 'test@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('sendNotification', () => {
    it('should successfully send a notification', async () => {
      // Mock recipient lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: mockRecipient,
        error: null,
      });

      // Mock preference check
      mockSupabase.single.mockResolvedValueOnce({
        data: { enabled: true },
        error: null,
      });

      // Mock log entry creation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'log-123' },
        error: null,
      });

      // Mock email sending
      (transporter.sendMail as jest.Mock).mockResolvedValue({ messageId: 'msg-123' });

      // Mock log update
      mockSupabase.eq.mockResolvedValue({ data: null, error: null });

      const result = await sendNotification({
        type: 'lesson_reminder_24h',
        recipientUserId: 'user-123',
        templateData: {
          studentName: 'John',
          lessonDate: '2026-02-10',
          lessonTime: '3:00 PM',
        },
      });

      expect(result.success).toBe(true);
      expect(result.logId).toBe('log-123');
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'student@example.com',
          subject: 'Upcoming Lesson Reminder',
        })
      );
    });

    it('should skip notification if user preference is disabled', async () => {
      // Mock recipient lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: mockRecipient,
        error: null,
      });

      // Mock preference check - disabled
      mockSupabase.single.mockResolvedValueOnce({
        data: { enabled: false },
        error: null,
      });

      // Mock log entry creation (skipped)
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'log-skip-123' },
        error: null,
      });

      const result = await sendNotification({
        type: 'weekly_progress_digest',
        recipientUserId: 'user-123',
        templateData: { weekStart: '2026-02-03' },
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(transporter.sendMail).not.toHaveBeenCalled();
    });

    it('should handle recipient not found error', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await sendNotification({
        type: 'lesson_reminder_24h',
        recipientUserId: 'nonexistent-user',
        templateData: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Recipient not found');
    });

    it('should handle email sending failure', async () => {
      // Mock recipient lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: mockRecipient,
        error: null,
      });

      // Mock preference check
      mockSupabase.single.mockResolvedValueOnce({
        data: { enabled: true },
        error: null,
      });

      // Mock log entry creation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'log-123' },
        error: null,
      });

      // Mock email sending failure
      (transporter.sendMail as jest.Mock).mockRejectedValue(new Error('SMTP error'));

      // Mock log update
      mockSupabase.eq.mockResolvedValue({ data: null, error: null });

      const result = await sendNotification({
        type: 'lesson_reminder_24h',
        recipientUserId: 'user-123',
        templateData: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP error');
      expect(result.logId).toBe('log-123');
    });
  });

  describe('queueNotification', () => {
    it('should successfully queue a notification', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-123' },
        error: null,
      });

      const result = await queueNotification({
        type: 'assignment_due_reminder',
        recipientUserId: 'user-123',
        templateData: { assignmentTitle: 'Practice scales' },
        priority: 8,
        scheduledFor: new Date('2026-02-10T10:00:00Z'),
      });

      expect(result.success).toBe(true);
      expect(result.logId).toBe('queue-123');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          notification_type: 'assignment_due_reminder',
          recipient_user_id: 'user-123',
          priority: 8,
        })
      );
    });

    it('should use default priority and scheduled time', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'queue-456' },
        error: null,
      });

      const result = await queueNotification({
        type: 'lesson_recap',
        recipientUserId: 'user-123',
        templateData: {},
      });

      expect(result.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 5, // default
        })
      );
    });

    it('should handle queue insertion error', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      });

      const result = await queueNotification({
        type: 'lesson_recap',
        recipientUserId: 'user-123',
        templateData: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to queue notification');
    });
  });

  describe('checkUserPreference', () => {
    it('should return true when preference is enabled', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { enabled: true },
        error: null,
      });

      const result = await checkUserPreference('user-123', 'lesson_reminder_24h');

      expect(result).toBe(true);
    });

    it('should return false when preference is disabled', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { enabled: false },
        error: null,
      });

      const result = await checkUserPreference('user-123', 'weekly_progress_digest');

      expect(result).toBe(false);
    });

    it('should default to true when no preference exists', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await checkUserPreference('user-123', 'lesson_reminder_24h');

      expect(result).toBe(true);
    });
  });

  describe('processQueuedNotifications', () => {
    it('should process pending notifications', async () => {
      const queuedNotifications = [
        {
          id: 'queue-1',
          notification_type: 'lesson_reminder_24h',
          recipient_user_id: 'user-123',
          recipient_email: 'student@example.com',
          template_data: { studentName: 'John' },
          priority: 5,
        },
      ];

      mockSupabase.rpc.mockResolvedValueOnce({
        data: queuedNotifications,
        error: null,
      });

      // Mock sendNotification dependencies
      mockSupabase.single
        .mockResolvedValueOnce({
          data: mockRecipient,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { enabled: true },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'log-123' },
          error: null,
        });

      (transporter.sendMail as jest.Mock).mockResolvedValue({ messageId: 'msg-123' });
      mockSupabase.eq.mockResolvedValue({ data: null, error: null });

      const result = await processQueuedNotifications(10);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_pending_notifications', {
        batch_size: 10,
      });
    });

    it('should return zero when no notifications to process', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await processQueuedNotifications();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should handle fetch error gracefully', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await processQueuedNotifications();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('retryFailedNotifications', () => {
    it('should retry failed notifications that are ready', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2); // 2 hours ago

      const failedNotifications = [
        {
          id: 'log-fail-1',
          notification_type: 'lesson_reminder_24h',
          recipient_user_id: 'user-123',
          recipient_email: 'student@example.com',
          subject: 'Upcoming Lesson Reminder',
          template_data: { studentName: 'John' },
          retry_count: 0,
          updated_at: pastDate.toISOString(),
          status: 'failed',
        },
      ];

      // Mock retry handler functions
      (retryHandler.getRetryableNotifications as jest.Mock).mockResolvedValue(failedNotifications);
      (retryHandler.shouldMoveToDeadLetter as jest.Mock).mockReturnValue(false);
      (retryHandler.updateNotificationRetry as jest.Mock).mockResolvedValue(true);
      (retryHandler.processDeadLetterQueue as jest.Mock).mockResolvedValue(0);

      // Mock recipient lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: mockRecipient,
        error: null,
      });

      // Mock email sending
      (transporter.sendMail as jest.Mock).mockResolvedValue({ messageId: 'msg-retry-123' });

      const result = await retryFailedNotifications();

      expect(result.retried).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.deadLettered).toBe(0);
    });

    it('should skip notifications not ready for retry', async () => {
      // Mock empty list (already filtered by retry handler)
      (retryHandler.getRetryableNotifications as jest.Mock).mockResolvedValue([]);
      (retryHandler.processDeadLetterQueue as jest.Mock).mockResolvedValue(0);

      const result = await retryFailedNotifications();

      expect(result.retried).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.deadLettered).toBe(0);
    });

    it('should return zero when no failed notifications exist', async () => {
      (retryHandler.getRetryableNotifications as jest.Mock).mockResolvedValue([]);
      (retryHandler.processDeadLetterQueue as jest.Mock).mockResolvedValue(0);

      const result = await retryFailedNotifications();

      expect(result.retried).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.deadLettered).toBe(0);
    });
  });
});
