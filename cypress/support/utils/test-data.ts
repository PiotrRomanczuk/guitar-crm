/* eslint-disable @typescript-eslint/no-explicit-any */
// Test data factories for generating realistic test data
// Provides consistent, reusable test data across all tests

export const testUsers = {
  admin: {
    email: 'admin@guitarpro.test',
    password: 'TestAdmin123!',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
  },
  teacher: {
    email: 'teacher@guitarpro.test',
    password: 'TestTeacher123!',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
  },
  student: {
    email: 'student@guitarpro.test',
    password: 'TestStudent123!',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
  },
};

export const generateStudent = (overrides: Partial<any> = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  email: `student${Date.now()}@test.com`,
  phone: '+1-555-0123',
  level: 'beginner',
  instrument: 'guitar',
  lessonType: 'individual',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1-555-0124',
    relationship: 'parent',
  },
  ...overrides,
});

export const generateLesson = (overrides: Partial<any> = {}) => ({
  title: `Guitar Lesson ${Date.now()}`,
  description: 'Basic chord progression practice',
  duration: 30,
  lessonType: 'individual',
  skillLevel: 'beginner',
  instrument: 'guitar',
  objectives: ['Learn basic chords', 'Practice strumming patterns'],
  ...overrides,
});

export const generateSong = (overrides: Partial<any> = {}) => ({
  title: `Test Song ${Date.now()}`,
  artist: 'Test Artist',
  genre: 'rock',
  difficulty: 'beginner',
  key: 'G',
  tempo: 120,
  duration: 180,
  chords: ['G', 'D', 'Em', 'C'],
  lyrics: 'Test lyrics for the song',
  ...overrides,
});

export const generateAssignment = (overrides: Partial<any> = {}) => ({
  title: `Practice Assignment ${Date.now()}`,
  description: 'Daily practice routine',
  type: 'practice',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
  estimatedDuration: 30,
  instructions: 'Practice for 30 minutes daily',
  ...overrides,
});

// Helper functions for test data cleanup
export const cleanupTestData = {
  students: () => {
    // Clean up any students created during tests
    cy.task('db:cleanup', { table: 'students', pattern: 'test%' });
  },
  lessons: () => {
    // Clean up any lessons created during tests
    cy.task('db:cleanup', { table: 'lessons', pattern: 'Test%' });
  },
  songs: () => {
    // Clean up any songs created during tests
    cy.task('db:cleanup', { table: 'songs', pattern: 'Test%' });
  },
  all: () => {
    cleanupTestData.students();
    cleanupTestData.lessons();
    cleanupTestData.songs();
  },
};

// Test environment helpers
export const testEnvironment = {
  isRunningInCI: () => Boolean(Cypress.env('CI')),
  getBaseUrl: () => Cypress.config('baseUrl') || 'http://localhost:3000',
  getTestTimeout: () => Cypress.env('testTimeout') || 30000,
  shouldSkipSlowTests: () => Cypress.env('skipSlowTests') === 'true',
  getTestUserCredentials: (role: 'admin' | 'teacher' | 'student') => {
    const envKey = `TEST_${role.toUpperCase()}`;
    return {
      email: Cypress.env(`${envKey}_EMAIL`),
      password: Cypress.env(`${envKey}_PASSWORD`),
    };
  },
};
