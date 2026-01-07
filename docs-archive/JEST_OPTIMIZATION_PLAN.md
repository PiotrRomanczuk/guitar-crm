# Jest Test Optimization Plan

## Overview

This document outlines the optimization strategy for Jest tests in Guitar CRM. The goal is to reduce the Jest test suite from 603 tests to ~100-150 focused unit tests while maintaining high confidence in business logic correctness.

## Current State Analysis

### Existing Jest Test Coverage
```
Total Files: 603 test files
Passing Tests: 433 tests  
Runtime: ~25 seconds
Statement Coverage: 22.23%
```

### Coverage by Category
| Category | Current Coverage | Target Coverage | Action |
|----------|-----------------|-----------------|---------|
| API Routes | 72-94% | 90%+ | ✅ Keep & enhance |
| Auth Components | 81-100% | 95%+ | ✅ Keep |
| Form Components | 88-100% | 90%+ | ✅ Keep logic, remove integration |
| Database Utils | 80-93% | 95%+ | ✅ Keep & enhance |
| Services Layer | 0-26% | 85%+ | 🔄 Add comprehensive tests |
| Business Logic | Mixed | 90%+ | 🔄 Focus and enhance |
| Component Integration | Mixed | 0% | ❌ Move to Cypress |
| Page Components | Mixed | 0% | ❌ Move to Cypress |

## Optimization Strategy

### Keep and Enhance (High Value)

#### API Route Handlers
**Current**: 72-94% coverage | **Target**: 95%+ coverage

**Files to enhance:**
```typescript
// High priority - add missing tests
app/api/lessons/handlers.ts (72.76% → 95%+)
app/api/lessons/utils.ts (56.77% → 90%+)
app/api/lessons/[id]/route.ts (76.82% → 95%+)
app/api/lessons/bulk/route.ts (76.3% → 95%+)
```

**Test focus:**
- ✅ Request validation and sanitization
- ✅ Response formatting and error handling  
- ✅ Database interaction edge cases
- ✅ Permission and authentication logic
- ✅ Data transformation accuracy

#### Business Logic and Utilities
**Current**: Mixed coverage | **Target**: 90%+ coverage

**Files to enhance:**
```typescript
// Zero coverage - critical to add
lib/services/song-analytics.ts (0% → 90%+)
lib/services/google-calendar-sync.ts (0% → 90%+)  
lib/services/import-utils.ts (26.88% → 90%+)
lib/database/middleware.ts (0% → 95%+)
lib/database/connection.ts (0% → 85%+)

// Partial coverage - enhance
lib/bearer-auth.ts (30.18% → 85%+)
lib/google.ts (80.76% → 95%+)
lib/logger.ts (62.9% → 85%+)
```

**Test focus:**
- ✅ Pure function correctness
- ✅ Data transformation accuracy
- ✅ Error handling and edge cases
- ✅ Mathematical calculations
- ✅ Date/time manipulation

#### Schema Validation
**Current**: 79-100% coverage | **Target**: 100% coverage

**Files to enhance:**
```typescript
schemas/UserSchema.ts (85.91% → 100%)
schemas/CommonSchema.ts (79.58% → 100%)
schemas/ActivityLogSchema.ts (0% → 90%+)
```

**Test focus:**
- ✅ All validation rules
- ✅ Edge case input validation
- ✅ Error message accuracy
- ✅ Type coercion behavior

#### Critical Action Functions
**Current**: 0-60% coverage | **Target**: 85%+ coverage

**Files to add comprehensive tests:**
```typescript
app/actions/student-management.ts (0% → 85%+)
app/actions/teacher/dashboard.ts (0% → 85%+)
app/actions/assignment-templates.ts (0% → 85%+)
app/actions/api-keys.ts (0% → 85%+)
app/actions/onboarding.ts (0% → 85%+)
```

**Test focus:**
- ✅ Server action logic
- ✅ Data mutation operations
- ✅ Permission enforcement
- ✅ Error handling and rollback

### Remove from Jest (Move to Cypress)

#### Component Integration Tests
**Files to remove from Jest:**
```typescript
// Move these to Cypress E2E tests
components/dashboard/**/*.test.tsx
components/lessons/list/*.test.tsx  
components/songs/list/*.test.tsx
components/users/list/*.test.tsx
app/dashboard/**/*.test.tsx
app/(auth)/**/*.test.tsx (except pure logic)
```

**Reasoning:**
- Component integration better tested in real browser
- User interactions require E2E testing
- DOM manipulation testing is brittle in Jest
- Navigation and routing require real environment

#### Form Submission Workflows  
**Files to remove from Jest:**
```typescript
// Move form workflows to Cypress
components/lessons/form/LessonForm.tsx (keep validation logic)
components/songs/form/*.tsx (keep helpers, move workflows)
components/users/form/*.tsx (keep validation, move submission)
components/auth/*.tsx (keep logic, move flows)
```

**Reasoning:**
- Form submission involves multiple components
- User interaction simulation is complex
- Browser validation behavior differs
- Error state testing requires real UI

#### Page-Level Component Tests
**Files to remove from Jest:**
```typescript
// Move to Cypress integration tests
app/dashboard/songs/page.test.tsx
app/dashboard/users/page.test.tsx  
app/dashboard/lessons/page.test.tsx
components/dashboard/admin/*.test.tsx (UI focused)
```

**Reasoning:**
- Page components orchestrate multiple features
- Real data loading behavior important
- Authentication state matters
- Navigation context required

### Refactor and Focus

#### Keep Component Logic, Remove Integration
**Pattern to follow:**
```typescript
// KEEP: Pure component logic tests
function calculateLessonDuration(start: Date, end: Date): number {
  // Test this logic thoroughly
}

// REMOVE: Component rendering and interaction tests
function LessonForm({ onSubmit }: Props) {
  // Move to Cypress E2E tests
}

// KEEP: Custom hook logic tests  
function useLessonValidation(data: LessonData) {
  // Test validation rules and edge cases
}

// REMOVE: Hook integration with components
function LessonFormWithValidation() {
  // Move to Cypress component tests
}
```

#### Extract Testable Business Logic
**Pattern to implement:**
```typescript
// BEFORE: Hard to test in isolation
const LessonForm = () => {
  const validateLesson = (data) => {
    // Complex validation logic mixed with UI
  };
  
  const handleSubmit = (e) => {
    // Business logic mixed with event handling
  };
};

// AFTER: Testable business logic extracted
// lib/lessons/validation.ts - JEST TESTS
export function validateLessonData(data: LessonData): ValidationResult {
  // Pure function - easy to test thoroughly
}

export function calculateLessonSchedule(params: ScheduleParams): Schedule {
  // Pure function - test all edge cases  
}

// components/lessons/form/LessonForm.tsx - CYPRESS TESTS
const LessonForm = () => {
  // UI concerns only - test in browser
};
```

## Implementation Plan

### Phase 1: Analysis and Cleanup (Week 1)

#### Audit Current Tests
```bash
# Identify tests to remove
find . -name "*.test.tsx" -path "*/components/*" | head -20
find . -name "*.test.tsx" -path "*/app/*" | head -20

# Identify zero-coverage critical files
npm run test:coverage | grep "0%"

# Identify high-value test files to keep
npm run test:coverage | grep -E "[8-9][0-9]%"
```

#### Create Test Classification
```typescript
// test-classification.ts
export const testClassification = {
  keep: [
    'app/api/**/*.test.ts',
    'lib/**/*.test.ts', 
    'schemas/**/*.test.ts',
    'app/actions/**/*.test.ts'
  ],
  
  remove: [
    'components/**/list/*.test.tsx',
    'components/**/form/*.test.tsx', // Keep logic, remove integration
    'app/dashboard/**/*.test.tsx',
    'app/(auth)/**/*.test.tsx'
  ],
  
  refactor: [
    'components/songs/form/helpers.test.ts', // Extract and keep
    'components/lessons/hooks/*.test.ts',    // Keep logic tests
    'lib/mutations/*.test.ts'                // Keep pure functions
  ]
};
```

### Phase 2: Remove Integration Tests (Week 2)

#### Automated Removal
```bash
# Remove component integration tests
rm components/**/list/*.test.tsx
rm components/**/form/*Form*.test.tsx  
rm app/dashboard/**/*.test.tsx

# Keep only logic tests
find components -name "*.test.tsx" | grep -E "(helpers|utils|logic|validation)"
```

#### Verify Cypress Coverage
```bash
# Ensure removed functionality is covered in Cypress
npm run e2e -- --spec "cypress/e2e/features/**/*.cy.ts"
npm run e2e -- --spec "cypress/e2e/integration/**/*.cy.ts"
```

### Phase 3: Add Missing Critical Tests (Week 3)

#### High Priority Test Files
```typescript
// lib/services/song-analytics.test.ts
describe('Song Analytics Service', () => {
  describe('calculateSongDifficulty', () => {
    it('should calculate difficulty based on key changes');
    it('should factor in tempo variations');
    it('should handle edge cases');
  });
  
  describe('generateProgressReport', () => {
    it('should aggregate student progress correctly');
    it('should calculate practice time accurately');
    it('should identify struggling areas');
  });
});

// lib/services/google-calendar-sync.test.ts  
describe('Google Calendar Sync', () => {
  describe('syncLessonEvents', () => {
    it('should create calendar events for lessons');
    it('should update existing events');
    it('should handle API errors gracefully');
  });
  
  describe('handleConflicts', () => {
    it('should detect scheduling conflicts');
    it('should propose alternative times');
    it('should respect teacher availability');
  });
});

// app/actions/student-management.test.ts
describe('Student Management Actions', () => {
  describe('createStudent', () => {
    it('should create student with profile');
    it('should assign to teachers correctly');
    it('should handle validation errors');
  });
  
  describe('updateProgress', () => {
    it('should update lesson completion');
    it('should calculate skill progression');
    it('should trigger notifications');
  });
});
```

#### Database Layer Tests
```typescript
// lib/database/middleware.test.ts
describe('Database Middleware', () => {
  describe('query optimization', () => {
    it('should add appropriate indexes');
    it('should batch queries efficiently');
    it('should handle connection pooling');
  });
  
  describe('error handling', () => {
    it('should retry failed connections');
    it('should log errors appropriately');
    it('should gracefully degrade');
  });
});
```

### Phase 4: Optimize Performance (Week 4)

#### Test Configuration
```typescript
// jest.config.optimized.ts
export default {
  // Faster test execution
  testEnvironment: 'node',
  
  // Only test specific patterns
  testMatch: [
    '**/lib/**/*.test.ts',
    '**/app/api/**/*.test.ts', 
    '**/schemas/**/*.test.ts',
    '**/app/actions/**/*.test.ts'
  ],
  
  // Exclude integration tests
  testPathIgnorePatterns: [
    '/cypress/',
    '/components/.*/.*Form.*test.tsx',
    '/components/.*/.*List.*test.tsx'
  ],
  
  // Parallel execution
  maxWorkers: '50%',
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80, 
      functions: 85,
      lines: 85
    }
  }
};
```

#### Test Scripts Optimization
```json
{
  "scripts": {
    "test:unit": "jest --config jest.config.optimized.ts",
    "test:unit:watch": "jest --config jest.config.optimized.ts --watch",
    "test:unit:coverage": "jest --config jest.config.optimized.ts --coverage",
    "test:integration": "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
    "test:smoke": "cypress run --spec 'cypress/e2e/smoke/**/*.cy.ts'",
    "test:full": "npm run test:unit && npm run test:smoke"
  }
}
```

## Expected Outcomes

### Performance Improvements
```
BEFORE:
- 603 test files
- ~25 seconds runtime
- 22.23% statement coverage
- Mixed test reliability

AFTER:
- ~100-150 test files  
- ~15 seconds runtime
- 85%+ coverage on tested code
- High test reliability
```

### Maintenance Improvements
```
BEFORE:
- Complex mocking setups
- Brittle component tests
- Duplicate test patterns
- High maintenance overhead

AFTER:  
- Pure function tests
- Clear test purposes
- Minimal mocking needed
- Low maintenance overhead
```

### Development Workflow
```
BEFORE:
- Slow test feedback
- False positive failures
- Unclear test failures
- Testing uncertainty

AFTER:
- Fast unit test feedback (15s)
- Clear test failure attribution  
- Reliable test results
- High confidence in logic
```

## Risk Mitigation

### Ensuring Coverage Gaps Are Filled
- **Cypress audit**: Verify all removed functionality tested in E2E
- **Code review**: Manual review of critical logic extraction
- **Gradual rollout**: Remove tests incrementally with verification
- **Rollback plan**: Keep removed tests in backup branch temporarily

### Maintaining Test Quality
- **Test templates**: Standardized patterns for new tests
- **Code review focus**: Emphasize test quality in reviews
- **Regular audits**: Monthly test coverage and quality reviews
- **Team training**: Jest best practices for business logic testing

### Performance Monitoring
- **CI/CD integration**: Track test execution times
- **Flakiness monitoring**: Identify and fix unreliable tests
- **Coverage tracking**: Ensure coverage maintains target levels
- **Developer feedback**: Regular team input on test experience

## Success Metrics

### Quantitative Goals
- **Test count**: 603 → 100-150 tests
- **Runtime**: 25s → 15s
- **Coverage**: 22% overall → 85%+ on tested code
- **Reliability**: >99% pass rate

### Qualitative Goals
- **Clear test purposes**: Each test has obvious value
- **Fast feedback**: Immediate results for logic changes
- **Easy debugging**: Clear failure attribution
- **Low maintenance**: Minimal test updates for UI changes

### Long-term Benefits
- **Faster development**: Quick iteration on business logic
- **Higher confidence**: Thorough testing of critical paths
- **Better architecture**: Clear separation of concerns
- **Scalable approach**: Easy to add tests for new features

This Jest optimization plan ensures we maintain high confidence in business logic correctness while dramatically improving test suite performance and maintainability.