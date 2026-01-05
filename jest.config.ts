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

  testTimeout: 30000,

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test patterns
  testMatch: ['<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}'],

  // Coverage configuration
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/next.config.js',
    '!**/postcss.config.js',
    '!**/tailwind.config.js',
  ],

  // Coverage thresholds - TEMPORARILY DISABLED
  // coverageThreshold: {
  // 	global: {
  // 		branches: 70,
  // 		functions: 70,
  // 		lines: 70,
  // 		statements: 70,
  // 	},
  // },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
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

  // Watch plugins for better developer experience (disabled due to version conflict)
  // watchPlugins: [
  // 	'jest-watch-typeahead/filename',
  // 	'jest-watch-typeahead/testname',
  // ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
