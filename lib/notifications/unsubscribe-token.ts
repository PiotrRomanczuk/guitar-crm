/**
 * Unsubscribe Token Utility
 *
 * Generates and verifies HMAC-SHA256 signed tokens for safe one-click
 * unsubscribe links embedded in emails. Prevents IDOR attacks where an
 * attacker could disable any user's notifications by guessing a UUID.
 *
 * Token format (four base64url parts joined by "~"):
 *   base64url(hmac)~base64url(userId)~base64url(type)~base64url(timestampMs)
 *
 * Security properties:
 * - HMAC-SHA256 over "userId~type~timestamp" using UNSUBSCRIBE_TOKEN_SECRET
 * - Token expires after 30 days
 * - Timing-safe comparison prevents side-channel attacks
 * - Rejects all requests if UNSUBSCRIBE_TOKEN_SECRET is not set
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from '@/lib/logger';

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PART_SEPARATOR = '~';

function getSecret(): string | null {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) {
    logger.warn(
      '[unsubscribe-token] UNSUBSCRIBE_TOKEN_SECRET is not set. ' +
        'All unsubscribe requests will be rejected until the env var is configured.'
    );
    return null;
  }
  return secret;
}

function toBase64url(value: string): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = padded.length % 4;
  const withPadding =
    remainder > 0 ? padded + '='.repeat(4 - remainder) : padded;
  return Buffer.from(withPadding, 'base64').toString('utf-8');
}

function computeHmac(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Generate a URL-safe HMAC-signed unsubscribe token.
 *
 * Throws if UNSUBSCRIBE_TOKEN_SECRET is not configured so callers
 * are aware the environment is misconfigured before sending emails.
 */
export function generateUnsubscribeToken(userId: string, type: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      'Cannot generate unsubscribe token: UNSUBSCRIBE_TOKEN_SECRET env var is not set.'
    );
  }

  const timestamp = Date.now().toString();
  const payload = `${userId}${PART_SEPARATOR}${type}${PART_SEPARATOR}${timestamp}`;
  const hmac = computeHmac(secret, payload);

  return [
    toBase64url(hmac),
    toBase64url(userId),
    toBase64url(type),
    toBase64url(timestamp),
  ].join(PART_SEPARATOR);
}

/**
 * Verify a signed unsubscribe token.
 *
 * Returns { userId, type } if the signature is valid and the token is
 * within its 30-day validity window. Returns null for any invalid input.
 */
export function verifyUnsubscribeToken(
  token: string
): { userId: string; type: string } | null {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const parts = token.split(PART_SEPARATOR);
  if (parts.length !== 4) {
    return null;
  }

  const [encodedHmac, encodedUserId, encodedType, encodedTimestamp] = parts;

  let providedHmac: string;
  let userId: string;
  let type: string;
  let timestamp: string;

  try {
    providedHmac = fromBase64url(encodedHmac);
    userId = fromBase64url(encodedUserId);
    type = fromBase64url(encodedType);
    timestamp = fromBase64url(encodedTimestamp);
  } catch {
    return null;
  }

  const payload = `${userId}${PART_SEPARATOR}${type}${PART_SEPARATOR}${timestamp}`;
  const expectedHmac = computeHmac(secret, payload);

  // Timing-safe byte comparison
  const providedBuf = Buffer.from(providedHmac, 'hex');
  const expectedBuf = Buffer.from(expectedHmac, 'hex');

  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  // Check expiry
  const issuedAt = parseInt(timestamp, 10);
  if (isNaN(issuedAt) || Date.now() - issuedAt > TOKEN_MAX_AGE_MS) {
    return null;
  }

  return { userId, type };
}
