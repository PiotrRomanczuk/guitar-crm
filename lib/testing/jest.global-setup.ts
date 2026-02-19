// Jest global setup for test environment
// This runs once before all tests

export default async function globalSetup() {
  // Environment setup
  // @ts-expect-error - NODE_ENV is read-only in build but writable at runtime
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

  // Mock external services
  process.env.TESTING = 'true';

  console.log('🧪 Jest Global Setup: Test environment initialized');
}
