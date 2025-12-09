import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

// Load .env.local for Cypress
dotenv.config({ path: '.env.local' });

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    env: {
      E2E_TEST_EMAIL: process.env.E2E_TEST_EMAIL || 'p.romanczuk@gmail.com',
      E2E_TEST_PASSWORD: process.env.E2E_TEST_PASSWORD || 'test123_admin',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    supportFile: 'cypress/support/e2e.ts',
    // Default to running only core tests. Use --spec to run legacy tests.
    specPattern: 'cypress/e2e/core/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: 'cypress/e2e/legacy/**/*',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents() {
      // implement node event listeners here if needed
    },
  },
});
