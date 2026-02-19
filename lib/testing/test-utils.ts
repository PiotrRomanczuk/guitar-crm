/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */
// Jest testing utilities for unit tests
// Provides mock factories, test helpers, and common test patterns

// Mock factories for database entities
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockStudent = (overrides: Partial<any> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  firstName: 'Test',
  lastName: 'Student',
  email: 'student@test.com',
  phone: '+1-555-0123',
  level: 'beginner',
  instrument: 'guitar',
  emergencyContactName: 'Parent Name',
  emergencyContactPhone: '+1-555-0124',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockLesson = (overrides: Partial<any> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  title: 'Guitar Lesson 1',
  description: 'Introduction to basic chords',
  duration: 30,
  skillLevel: 'beginner',
  instrument: 'guitar',
  lessonType: 'individual',
  objectives: ['Learn G chord', 'Learn D chord'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSong = (overrides: Partial<any> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174003',
  title: 'Test Song',
  artist: 'Test Artist',
  genre: 'rock',
  difficulty: 'beginner',
  key: 'G',
  tempo: 120,
  duration: 180,
  chords: ['G', 'D', 'Em', 'C'],
  lyrics: 'Test song lyrics',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// API response mocks
export const createMockApiResponse = (data: any = null, error: any = null) => ({
  data,
  error,
  count: data ? (Array.isArray(data) ? data.length : 1) : 0,
});

export const createMockErrorResponse = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code: code || 'TEST_ERROR',
    details: null,
  },
});

// Form data helpers
export const createValidStudentFormData = (overrides: Partial<any> = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phone: '+1-555-0123',
  level: 'beginner',
  instrument: 'guitar',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '+1-555-0124',
  emergencyContactRelationship: 'parent',
  ...overrides,
});

export const createValidLessonFormData = (overrides: Partial<any> = {}) => ({
  title: 'Guitar Basics',
  description: 'Learn fundamental guitar techniques',
  duration: 30,
  skillLevel: 'beginner',
  instrument: 'guitar',
  lessonType: 'individual',
  objectives: 'Learn basic chords and strumming',
  ...overrides,
});

// Test environment utilities
export const testUtils = {
  // Mock localStorage
  mockLocalStorage: () => {
    const store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    };
  },

  // Mock Next.js router
  mockRouter: (overrides: Partial<any> = {}) => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/test',
    query: {},
    asPath: '/test',
    ...overrides,
  }),

  // Mock React Query client
  mockQueryClient: () => ({
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn(),
    clear: jest.fn(),
  }),

  // Wait for async operations
  waitFor: async (callback: () => void | Promise<void>, timeout = 1000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await callback();
        return;
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    throw new Error(`waitFor timed out after ${timeout}ms`);
  },
};

// Test data validation helpers
export const validation = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidPhone: (phone: string) => /^\+?[\d\s\-\(\)]+$/.test(phone),
  isValidUUID: (uuid: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid),
};

// Common test patterns
export const testPatterns = {
  // Test async function with success and error cases
  testAsyncFunction: async (fn: Function, successData: any, errorMessage: string) => {
    // Test success case
    const successResult = await fn(successData);
    expect(successResult.error).toBeNull();
    expect(successResult.data).toBeDefined();

    // Test error case
    const errorResult = await fn(null);
    expect(errorResult.error).toBeDefined();
    expect(errorResult.error.message).toContain(errorMessage);
  },

  // Test form validation
  testFormValidation: (
    validateFn: Function,
    validData: any,
    invalidCases: Array<{ data: any; expectedError: string }>
  ) => {
    // Test valid data
    const validResult = validateFn(validData);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toEqual({});

    // Test invalid cases
    invalidCases.forEach(({ data, expectedError }) => {
      const invalidResult = validateFn(data);
      expect(invalidResult.isValid).toBe(false);
      expect(Object.values(invalidResult.errors).join(' ')).toContain(expectedError);
    });
  },
};

// Performance testing utilities
export const performance = {
  measureExecutionTime: async (fn: Function): Promise<number> => {
    const start = globalThis.performance.now();
    await fn();
    const end = globalThis.performance.now();
    return end - start;
  },

  expectFastExecution: async (fn: Function, maxTimeMs = 100): Promise<void> => {
    const executionTime = await performance.measureExecutionTime(fn);
    expect(executionTime).toBeLessThan(maxTimeMs);
  },
};
