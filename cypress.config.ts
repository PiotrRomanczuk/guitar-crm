import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  video: false,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  env: {
    TEST_ADMIN_EMAIL: 'p.romanczuk@gmail.com',
    TEST_ADMIN_PASSWORD: 'test123_admin',
    TEST_TEACHER_EMAIL: 'teacher@example.com',
    TEST_TEACHER_PASSWORD: 'test123_teacher',
    TEST_STUDENT_EMAIL: 'student@example.com',
    TEST_STUDENT_PASSWORD: 'test123_student',
    TEST_STUDENT_1_EMAIL: 'teststudent1@example.com',
    TEST_STUDENT_1_PASSWORD: 'test123_student',
    TEST_STUDENT_2_EMAIL: 'teststudent2@example.com',
    TEST_STUDENT_2_PASSWORD: 'test123_student',
    TEST_STUDENT_3_EMAIL: 'teststudent3@example.com',
    TEST_STUDENT_3_PASSWORD: 'test123_student',
  },
});
