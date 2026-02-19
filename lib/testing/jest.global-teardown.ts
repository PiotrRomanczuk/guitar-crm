// Jest global teardown for test environment
// This runs once after all tests complete

export default async function globalTeardown() {
  // Cleanup any global resources
  console.log('🧪 Jest Global Teardown: Test environment cleaned up');
}
