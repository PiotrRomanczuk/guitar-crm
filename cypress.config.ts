import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

// Load .env.local for Cypress
dotenv.config({ path: '.env.local' });

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    env: {
      E2E_TEST_EMAIL: process.env.E2E_TEST_EMAIL || 'e2e.tester@guitarcrm.local',
      E2E_TEST_PASSWORD: process.env.E2E_TEST_PASSWORD || 'E2Epassword123!',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents() {
      // implement node event listeners here if needed
    },
  },
});
