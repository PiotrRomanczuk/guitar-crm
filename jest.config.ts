import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Optimized test timeout
  testTimeout: 15000, // Reduced from 30s for faster execution

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mock heavy dependencies for performance
    '^@supabase/supabase-js$': '<rootDir>/lib/testing/__mocks__/supabase.ts',
    '^@/lib/supabase$': '<rootDir>/lib/testing/__mocks__/supabase.ts',
  },

  // Optimized test patterns - Focus on business logic
  testMatch: [
    // Business logic and utilities (priority)
    '<rootDir>/lib/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/lib/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/hooks/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/hooks/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/app/actions/**/*.test.{js,jsx,ts,tsx}',

    // Component unit tests (not integration)
    '<rootDir>/components/**/*.unit.test.{js,jsx,ts,tsx}',
    '<rootDir>/components/shared/**/*.test.{js,jsx,ts,tsx}',

    // Specific unit test files
    '<rootDir>/**/*.unit.test.{js,jsx,ts,tsx}',
  ],

  // Performance optimizations
  maxWorkers: '50%', // Use half available cores
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  clearMocks: true,
  resetMocks: false, // Preserve mocks between tests for performance
  restoreMocks: true,

  // Coverage configuration - Focus on business logic
  coverageReporters: ['text-summary', 'html', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    // Focus on business logic
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'app/actions/**/*.{js,jsx,ts,tsx}',
    'components/shared/**/*.{js,jsx,ts,tsx}',

    // Exclude non-business logic
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/cypress/**',
    '!**/*.config.{js,ts}',
    '!**/middleware.ts',
    '!app/layout.tsx',
    '!app/page.tsx',
    '!app/global-error.tsx',
    '!**/jest.setup.js',
    '!**/__tests__/**',
    '!**/*.test.{js,jsx,ts,tsx}',
  ],

  // Coverage thresholds for quality gates
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 75,
      statements: 75,
    },
    // Stricter thresholds for business logic
    'lib/**/*.{js,jsx,ts,tsx}': {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85,
    },
  },

  // Ignore patterns - Exclude integration tests
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',

    // Integration tests (handled by Cypress)
    '<rootDir>/**/*.integration.test.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.e2e.test.{js,jsx,ts,tsx}',
    '<rootDir>/components/**/*.integration.test.{js,jsx,ts,tsx}',

    // Specific integration test files
    '<rootDir>/__tests__/auth/credentials.test.ts', // Integration tests - require live database
    '<rootDir>/scripts/database/shadow-user-linking.test.ts', // Integration test - requires network
  ],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)',
  ],

  // Use separate TypeScript config for tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },

  // Global setup for test environment
  globalSetup: '<rootDir>/lib/testing/jest.global-setup.ts',
  globalTeardown: '<rootDir>/lib/testing/jest.global-teardown.ts',

  // Watch plugins for better developer experience (disabled due to version conflict)
  // watchPlugins: [
  // 	'jest-watch-typeahead/filename',
  // 	'jest-watch-typeahead/testname',
  // ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
