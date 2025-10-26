import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
		env: {
			E2E_TEST_EMAIL:
				process.env.E2E_TEST_EMAIL || 'e2e.tester@guitarcrm.local',
			E2E_TEST_PASSWORD: process.env.E2E_TEST_PASSWORD || 'E2Epassword123!',
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
