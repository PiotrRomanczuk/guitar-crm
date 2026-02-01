import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load test environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Load test credentials from cypress.env.json for compatibility
const testCredentials = {
  TEST_ADMIN_EMAIL: 'p.romanczuk@gmail.com',
  TEST_ADMIN_PASSWORD: 'test123_admin',
  TEST_STUDENT_EMAIL: 'student1@example.com',
  TEST_STUDENT_PASSWORD: 'test123_student',
  TEST_TEACHER_EMAIL: 'teacher@example.com',
  TEST_TEACHER_PASSWORD: 'test123_teacher',
};

// Set environment variables for test access
Object.entries(testCredentials).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

/**
 * Playwright Configuration
 * Matches Cypress settings for seamless migration
 * - Viewport: 1280x720
 * - BaseURL: http://localhost:3000
 * - Timeout: 30000ms (increased for auth flows)
 * - Retries: 2 in CI, 0 locally
 * - Screenshot on failure
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,

  // Timeout configuration - increased for auth flows
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  // Output configuration
  outputDir: 'test-results',

  // Run tests in parallel for speed
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry configuration (matches Cypress)
  retries: process.env.CI ? 2 : 0,

  // Parallel workers (use half of CPU cores in CI)
  workers: process.env.CI ? '50%' : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Screenshot and video on failure
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Viewport size matching Cypress
    viewport: { width: 1280, height: 720 },

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 15 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test in other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web server configuration
  // Start Next.js dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
