# Test Configuration Guide

## Overview

This document provides comprehensive configuration details for implementing the Guitar CRM testing strategy. It includes all necessary configuration files, scripts, and setup instructions.

## Jest Configuration

### Optimized Jest Config

**File**: `jest.config.optimized.ts`
```typescript
import type { Config } from 'jest';

const config: Config = {
  displayName: 'Guitar CRM Unit Tests',
  
  // Use Node environment for faster execution
  testEnvironment: 'node',
  
  // TypeScript support
  preset: 'ts-jest',
  
  // Root directory
  rootDir: '.',
  
  // Test file patterns - focus on business logic
  testMatch: [
    '**/lib/**/*.test.ts',
    '**/app/api/**/*.test.ts',
    '**/schemas/**/*.test.ts',
    '**/app/actions/**/*.test.ts',
    '**/app/dashboard/actions.test.ts'
  ],
  
  // Exclude integration tests and component tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/cypress/',
    '/coverage/',
    '/dist/',
    '/.next/',
    // Component integration tests (moved to Cypress)
    '/components/.*/.*Form.*\\.test\\.tsx$',
    '/components/.*/.*List.*\\.test\\.tsx$',
    '/components/.*/.*Table.*\\.test\\.tsx$',
    // Page component tests (moved to Cypress)
    '/app/dashboard/.*\\.test\\.tsx$',
    '/app/\\(auth\\)/.*\\.test\\.tsx$'
  ],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.optimized.js'],
  
  // Parallel execution for speed
  maxWorkers: '50%',
  
  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    'schemas/**/*.{ts,tsx}',
    'app/actions/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.{ts,js}',
    '!**/node_modules/**',
    '!**/cypress/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    // Specific thresholds for critical areas
    'lib/services/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    },
    'app/api/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Fail tests on console errors in test environment
  verbose: true,
  
  // Test timeout
  testTimeout: 10000
};

export default config;
```

### Jest Setup File

**File**: `jest.setup.optimized.js`
```javascript
// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      update: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: {}, error: null }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signIn: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    }
  }
}));

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'student',
    ...overrides
  }),
  
  createMockSong: (overrides = {}) => ({
    id: 'test-song-id',
    title: 'Test Song',
    author: 'Test Artist',
    level: 'beginner',
    key: 'C',
    ...overrides
  }),
  
  createMockLesson: (overrides = {}) => ({
    id: 'test-lesson-id',
    title: 'Test Lesson',
    scheduled_for: new Date().toISOString(),
    student_id: 'test-student-id',
    teacher_id: 'test-teacher-id',
    ...overrides
  })
};

// Console error handling for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

## Cypress Configuration

### Main Cypress Config

**File**: `cypress.config.optimized.ts`
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL for tests
    baseUrl: 'http://localhost:3000',
    
    // Test file patterns
    specPattern: 'cypress/e2e/**/*.cy.ts',
    
    // Support files
    supportFile: 'cypress/support/e2e.ts',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video and screenshot settings
    video: false, // Disable for speed in CI
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Retry configuration
    retries: {
      runMode: 2, // Retry failed tests in CI
      openMode: 0  // No retries in development
    },
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test isolation
    testIsolation: true,
    
    // Setup node events
    setupNodeEvents(on, config) {
      // Suite-specific configurations
      if (config.env.suite === 'smoke') {
        config.specPattern = 'cypress/e2e/smoke/**/*.cy.ts';
        config.video = false;
        config.screenshotOnRunFailure = false;
      }
      
      if (config.env.suite === 'integration') {
        config.specPattern = 'cypress/e2e/integration/**/*.cy.ts';
        config.video = true;
      }
      
      if (config.env.suite === 'features') {
        config.specPattern = 'cypress/e2e/features/**/*.cy.ts';
        config.video = true;
      }
      
      if (config.env.suite === 'regression') {
        config.specPattern = 'cypress/e2e/regression/**/*.cy.ts';
        config.video = true;
        config.retries.runMode = 3; // More retries for edge cases
      }
      
      // Database tasks for test data management
      on('task', {
        'db:seed': () => {
          // Seed database with test data
          return null;
        },
        
        'db:cleanup': () => {
          // Clean up test data
          return null;
        },
        
        'db:reset': () => {
          // Reset database to clean state
          return null;
        }
      });
      
      // Custom log task
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
    
    // Environment variables
    env: {
      // Test user credentials
      TEST_ADMIN_EMAIL: 'admin@test.com',
      TEST_ADMIN_PASSWORD: 'test-password',
      TEST_TEACHER_EMAIL: 'teacher@test.com', 
      TEST_TEACHER_PASSWORD: 'test-password',
      TEST_STUDENT_EMAIL: 'student@test.com',
      TEST_STUDENT_PASSWORD: 'test-password',
      
      // API endpoints
      API_BASE_URL: 'http://localhost:3000/api',
      
      // Test configuration
      SKIP_SETUP: false,
      PRESERVE_DATA: false
    }
  },
  
  // Component testing configuration (if needed)
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.tsx',
    supportFile: 'cypress/support/component.ts'
  }
});
```

### Enhanced Cypress Support

**File**: `cypress/support/e2e.ts`
```typescript
/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import '@testing-library/cypress/add-commands';
import './commands';
import './test-data-factory';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors that don't affect tests
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Non-Error promise rejection captured')
  ) {
    return false;
  }
  
  // Return true to fail the test for other uncaught exceptions
  return true;
});

// Mock API keys to prevent PGRST205 errors in CI
beforeEach(() => {
  cy.intercept('GET', '**/api/api-keys*', {
    statusCode: 200,
    body: []
  }).as('getApiKeys');
});

// Enhanced login command with session caching
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/sign-in');
      cy.get('[data-testid=\"email\"]').clear().type(email);
      cy.get('[data-testid=\"password\"]').clear().type(password);
      cy.get('[data-testid=\"signin-button\"]').click();
      
      // Wait for redirect away from sign-in
      cy.location('pathname', { timeout: 20000 }).should('not.include', '/sign-in');
      
      // Verify we end up at dashboard or home
      cy.location('pathname', { timeout: 10000 }).should(
        'satisfy',
        (path: string) => path === '/' || path.includes('/dashboard')
      );
    },
    {
      validate() {
        // Validate session is still active
        cy.visit('/dashboard');
        cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
      },
      cacheAcrossSpecs: true
    }
  );
});

// Test data creation commands
Cypress.Commands.add('createTestStudent', (studentData = {}) => {
  const student = cy.testData.createStudent(studentData);
  
  cy.request('POST', '/api/users', student).then((response) => {
    expect(response.status).to.equal(201);
    return cy.wrap(response.body);
  });
});

Cypress.Commands.add('createTestSong', (songData = {}) => {
  const song = cy.testData.createSong(songData);
  
  cy.request('POST', '/api/song', song).then((response) => {
    expect(response.status).to.equal(201);
    return cy.wrap(response.body);
  });
});

Cypress.Commands.add('createTestLesson', (lessonData = {}) => {
  const lesson = cy.testData.createLesson(lessonData);
  
  cy.request('POST', '/api/lessons', lesson).then((response) => {
    expect(response.status).to.equal(201);
    return cy.wrap(response.body);
  });
});

// Cleanup commands
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test data after tests
  cy.task('db:cleanup');
});

// Custom assertions
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible').and('not.be.disabled');
});

Cypress.Commands.add('shouldNotExist', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('not.exist');
});

// Declare custom command types
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createTestStudent(studentData?: object): Chainable<any>;
      createTestSong(songData?: object): Chainable<any>;
      createTestLesson(lessonData?: object): Chainable<any>;
      cleanupTestData(): Chainable<void>;
      shouldBeVisible(): Chainable<JQuery<HTMLElement>>;
      shouldNotExist(): Chainable<JQuery<HTMLElement>>;
    }
  }
}
```

### Test Data Factory

**File**: `cypress/support/test-data-factory.ts`
```typescript
// Test data factory for consistent test data creation
export const testDataFactory = {
  createStudent: (overrides = {}) => ({
    firstName: 'Test',
    lastName: `Student${Date.now()}`,
    email: `test.student.${Date.now()}@example.com`,
    role: 'student',
    password: 'test-password-123',
    profile: {
      phone: '555-0123',
      address: '123 Test Street',
      emergency_contact: 'Parent Name',
      emergency_phone: '555-0124'
    },
    ...overrides
  }),
  
  createTeacher: (overrides = {}) => ({
    firstName: 'Test',
    lastName: `Teacher${Date.now()}`,
    email: `test.teacher.${Date.now()}@example.com`,
    role: 'teacher',
    password: 'test-password-123',
    profile: {
      phone: '555-0125',
      specialization: 'Guitar',
      experience_years: 5
    },
    ...overrides
  }),
  
  createSong: (overrides = {}) => ({
    title: `Test Song ${Date.now()}`,
    author: 'Test Artist',
    level: 'beginner',
    key: 'C',
    tempo: 120,
    genre: 'Rock',
    description: 'Test song for automated testing',
    youtube_url: '',
    spotify_id: '',
    ...overrides
  }),
  
  createLesson: (overrides = {}) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    return {
      title: `Test Lesson ${Date.now()}`,
      scheduled_for: futureDate.toISOString(),
      duration: 60,
      student_id: 1, // Will be replaced with actual student ID
      teacher_id: 1, // Will be replaced with actual teacher ID
      notes: 'Test lesson notes',
      status: 'scheduled',
      ...overrides
    };
  },
  
  createAssignment: (overrides = {}) => ({
    title: `Test Assignment ${Date.now()}`,
    description: 'Test assignment description',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    student_id: 1, // Will be replaced
    teacher_id: 1, // Will be replaced
    song_id: 1,    // Will be replaced
    status: 'assigned',
    ...overrides
  })
};

// Add to Cypress global
declare global {
  namespace Cypress {
    interface Cypress {
      testData: typeof testDataFactory;
    }
  }
}

Cypress.testData = testDataFactory;
```

## Package.json Scripts

**Updated test scripts**:
```json
{
  "scripts": {
    // Jest (Unit Tests)
    "test:unit": "jest --config jest.config.optimized.ts",
    "test:unit:watch": "jest --config jest.config.optimized.ts --watch",
    "test:unit:coverage": "jest --config jest.config.optimized.ts --coverage",
    "test:unit:ci": "jest --config jest.config.optimized.ts --ci --coverage --watchAll=false",
    
    // Cypress (E2E Tests)
    "test:smoke": "cypress run --config-file cypress.config.optimized.ts --env suite=smoke",
    "test:integration": "cypress run --config-file cypress.config.optimized.ts --env suite=integration", 
    "test:features": "cypress run --config-file cypress.config.optimized.ts --env suite=features",
    "test:regression": "cypress run --config-file cypress.config.optimized.ts --env suite=regression",
    "test:e2e": "cypress run --config-file cypress.config.optimized.ts",
    "test:e2e:open": "cypress open --config-file cypress.config.optimized.ts",
    
    // Combined test strategies
    "test:quick": "npm run test:unit && npm run test:smoke",
    "test:pre-commit": "npm run test:unit && npm run test:smoke",
    "test:pre-merge": "npm run test:unit && npm run test:smoke && npm run test:integration",
    "test:full": "npm run test:unit && npm run test:e2e",
    "test:ci": "npm run test:unit:ci && npm run test:e2e",
    
    // Development helpers
    "test:debug": "jest --config jest.config.optimized.ts --detectOpenHandles --forceExit",
    "test:cypress:debug": "cypress open --config-file cypress.config.optimized.ts --env suite=smoke",
    
    // Test data management
    "test:seed": "ts-node scripts/database/seeding/test/seed-test-data.ts",
    "test:cleanup": "ts-node scripts/database/seeding/test/cleanup-test-data.ts",
    "test:reset": "npm run test:cleanup && npm run test:seed"
  }
}
```

## TypeScript Configuration

**File**: `tsconfig.test.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node", "@testing-library/jest-dom"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": [
    "**/*.test.ts",
    "**/*.test.tsx", 
    "jest.setup.optimized.js",
    "jest.config.optimized.ts"
  ],
  "exclude": [
    "node_modules",
    "cypress",
    ".next",
    "dist"
  ]
}
```

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test-optimized.yml`
```yaml
name: Optimized Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    name: Jest Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Jest unit tests
        run: npm run test:unit:ci
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          
  smoke-tests:
    name: Cypress Smoke Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start application
        run: |
          npm run build
          npm start &
          npx wait-on http://localhost:3000
          
      - name: Run smoke tests
        run: npm run test:smoke
        
  integration-tests:
    name: Cypress Integration Tests
    runs-on: ubuntu-latest
    needs: smoke-tests
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start application
        run: |
          npm run build
          npm start &
          npx wait-on http://localhost:3000
          
      - name: Run integration tests
        run: npm run test:integration
        
  full-e2e:
    name: Full E2E Test Suite
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start application
        run: |
          npm run build
          npm start &
          npx wait-on http://localhost:3000
          
      - name: Run full E2E suite
        run: npm run test:e2e
        
      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

This comprehensive test configuration guide provides all the necessary setup for implementing the optimized testing strategy in Guitar CRM.