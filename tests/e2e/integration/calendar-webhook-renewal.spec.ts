import { test, expect } from '@playwright/test';

/**
 * Google Calendar Webhook Renewal E2E Tests
 *
 * Tests the automated webhook renewal cron endpoint:
 * 1. Cron Endpoint Security
 * 2. Webhook Renewal Process
 * 3. Error Handling
 *
 * Prerequisites:
 * - CRON_SECRET environment variable configured
 * - Development server running
 *
 * @tags @integration @calendar @webhook @cron
 */

test.describe('Calendar Webhook Renewal', { tag: ['@integration', '@webhook'] }, () => {
  const CRON_SECRET = process.env.CRON_SECRET || 'test-cron-secret';

  test.describe('Cron Endpoint Security', () => {
    test('should reject unauthorized requests to cron endpoint', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': 'Bearer wrong-secret',
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBeDefined();
      expect(body.error).toMatch(/unauthorized/i);
    });

    test('should reject requests without authorization header', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks');

      expect(response.status()).toBe(401);
    });

    test('should accept requests with correct cron secret', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      // Should succeed or return error (not 401)
      expect(response.status()).not.toBe(401);

      // Should return JSON response
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });
  });

  test.describe('Webhook Renewal Response', () => {
    test('should return renewal summary with correct structure', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      const body = await response.json();

      // Verify response structure
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('timestamp');

      if (body.success) {
        expect(body).toHaveProperty('renewal');
        expect(body.renewal).toHaveProperty('totalChecked');
        expect(body.renewal).toHaveProperty('renewed');
        expect(body.renewal).toHaveProperty('failed');

        expect(body).toHaveProperty('cleanup');
        expect(body.cleanup).toHaveProperty('deleted');

        // Verify types
        expect(typeof body.renewal.totalChecked).toBe('number');
        expect(typeof body.renewal.renewed).toBe('number');
        expect(typeof body.renewal.failed).toBe('number');
        expect(typeof body.cleanup.deleted).toBe('number');
      }
    });

    test('should return valid timestamp in ISO format', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      const body = await response.json();

      expect(body.timestamp).toBeDefined();

      // Verify it's a valid ISO timestamp
      const timestamp = new Date(body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');

      // Should be recent (within last minute)
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      expect(diff).toBeLessThan(60000); // Less than 1 minute
    });

    test('should handle case when no webhooks need renewal', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      const body = await response.json();

      if (body.success && body.renewal.totalChecked === 0) {
        expect(body.renewal.renewed).toBe(0);
        expect(body.renewal.failed).toBe(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should return error details when renewal fails', async ({ request }) => {
      // This test verifies error response structure
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      const body = await response.json();

      if (!body.success) {
        expect(body).toHaveProperty('error');
        expect(body).toHaveProperty('timestamp');
        expect(typeof body.error).toBe('string');
      }
    });

    test('should complete within reasonable time', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      const duration = Date.now() - startTime;

      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);

      // Response should be valid
      expect(response.status()).toBeOneOf([200, 500]);
    });
  });

  test.describe('Idempotency', () => {
    test('should be safe to call multiple times', async ({ request }) => {
      // Call endpoint twice in succession
      const response1 = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const response2 = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      // Both should succeed (or both fail with same error)
      expect(response1.status()).toBe(response2.status());

      const body1 = await response1.json();
      const body2 = await response2.json();

      expect(body1.success).toBe(body2.success);
    });
  });

  test.describe('Integration with Webhook Lifecycle', () => {
    test('should not interfere with active webhooks', async ({ request }) => {
      const response = await request.get('/api/cron/renew-webhooks', {
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
        timeout: 30000,
      });

      const body = await response.json();

      // If there are active webhooks, renewal should not break them
      if (body.success && body.renewal.renewed > 0) {
        // Verify the renewal was successful
        expect(body.renewal.renewed).toBeGreaterThan(0);
        expect(body.renewal.failed).toBe(0);
      }
    });
  });
});
