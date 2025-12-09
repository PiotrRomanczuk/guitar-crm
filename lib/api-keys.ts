/**
 * API Key utilities for bearer token authentication
 */
import crypto from 'crypto';

/**
 * Generate a cryptographically secure API key
 * Format: prefix_randomstring
 * @returns {string} The generated API key
 */
export function generateApiKey(): string {
  const prefix = 'gcrm';
  const random = crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '');
  return `${prefix}_${random}`;
}

/**
 * Hash an API key using SHA256
 * @param key The API key to hash
 * @returns {string} The hashed key
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Verify that a plain key matches a hashed key
 * @param plainKey The plain API key
 * @param hashedKey The hashed API key from database
 * @returns {boolean} Whether the keys match
 */
export function verifyApiKey(plainKey: string, hashedKey: string): boolean {
  return hashApiKey(plainKey) === hashedKey;
}
