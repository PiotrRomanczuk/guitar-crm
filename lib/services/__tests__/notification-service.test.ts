import {
  sendNotification,
  queueNotification,
  checkUserPreference,
} from '../notification-service';
import {
  processQueuedNotifications,
  retryFailedNotifications,
} from '../notification-queue-processor';
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

jest.mock('@/lib/logging/notification-logger', () => ({
  logNotificationSent: jest.fn(),
  logNotificationFailed: jest.fn(),
  logNotificationQueued: jest.fn(),
  logNotificationSkipped: jest.fn(),
  logError: jest.fn(),
  logInfo: jest.fn(),
  logDebug: jest.fn(),
  logWarning: jest.fn(),
  logBatchProcessed: jest.fn(),
}));

/**
 * Creates a chainable mock for Supabase client.
 *
 * The key insight: every chainable method (from, select, eq, insert, update, lt,
 * order, limit) returns the same mock object, so chains like
 *   supabase.from('x').select('y').eq('a', 'b').single()
 * all work. The terminal method `.single()` returns a promise with
 * the test data you configure via `mockSingle.mockResolvedValueOnce(...)`.
 *
 * For chains that do NOT end with `.single()` (e.g., update().eq()),
 * `.eq()` itself returns a thenable (the mock has `.then` support via
 * `mockResolvedValue` on the eq level when needed).
 * We handle that by making `.eq()` resolve as a promise when awaited
 * only when the test explicitly overrides it.
 */
function createChainableMock() {
  const mock: Record<string, jest.Mock> = {};

  // All chainable methods return the mock itself
  const chainMethods = ['from', 'select', 'eq', 'insert', 'update', 'lt', 'order', 'limit'];
  for (const method of chainMethods) {
    mock[method] = jest.fn().mockReturnValue(mock);
  }

  // Terminal method: single() returns a promise with data
  mock.single = jest.fn().mockResolvedValue({ data: null, error: null });

  // rpc is a standalone method that returns a promise
  mock.rpc = jest.fn().mockResolvedValue({ data: null, error: null });

  return mock;
}

describe('notification-service', () => {
  let mockSupabase: Record<string, jest.Mock>;

  const mockRecipient = {
    id: 'user-123',
    email: 'student@example.com',
    full_name: 'John Student',
  };

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createChainableMock();
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
      // Mock recipient lookup: from().select().eq().single()
      mockSupabase.single.mockResolvedValueOnce({
        data: mockRecipient,
        error: null,
      });

      // Mock preference check: from().select().eq().eq().single()
      mockSupabase.single.mockResolvedValueOnce({
        data: { enabled: true },
        error: null,
      });

      // Mock log entry creation: from().insert().select().single()
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'log-123' },
        error: null,
      });

      // Mock email sending
      (transporter.sendMail as jest.Mock).mockResolvedValue({ messageId: 'msg-123' });

      // The update chain (from().update().eq()) does not call .single(),
      // it is awaited directly. The chain returns the mock which is not
      // a promise by default, but the source code does `await supabase.from(...).update(...).eq(...)`.
      // Since .eq() returns the mock (a plain object), awaiting it yields the mock itself,
      // which is truthy and doesn't throw. The source only checks for errors on the
      // email send, so this is fine.

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

      // Mock log entry creation (skipped status)
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
      // Mock recipient lookup fails
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
      expect(result.error).toContain('Recipient not found');
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

      // Mock sendNotification dependencies (called internally):
      // 1. recipient lookup
      mockSupabase.single
        .mockResolvedValueOnce({
          data: mockRecipient,
          error: null,
        })
        // 2. preference check
        .mockResolvedValueOnce({
          data: { enabled: true },
          error: null,
        })
        // 3. log entry creation
        .mockResolvedValueOnce({
          data: { id: 'log-123' },
          error: null,
        });

      (transporter.sendMail as jest.Mock).mockResolvedValue({ messageId: 'msg-123' });

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

      // Mock recipient lookup via .single()
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
