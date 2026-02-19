import { cleanupAllTestData } from './helpers/cleanup';

/**
 * Global Teardown for Playwright Tests
 *
 * Runs after all tests complete to clean up test data.
 * This prevents test data pollution in the database.
 */
async function globalTeardown() {
  console.log('\n🔄 Running global teardown...');

  try {
    await cleanupAllTestData();
    console.log('✅ Global teardown completed\n');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't fail the test run if cleanup fails
    // This ensures test results are still reported
  }
}

export default globalTeardown;
