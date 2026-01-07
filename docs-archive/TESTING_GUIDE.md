# Testing Quick Reference Guide

## 🚀 Quick Start Commands

### Jest Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode (development)
npm run test:dev

# Run with coverage report
npm run test:coverage

# Debug failing unit tests
npm run test:debug:unit
```

### Cypress E2E Tests
```bash
# Quick smoke tests (< 30 seconds)
npm run test:smoke

# Visual test runner (development)
npm run test:debug:e2e

# Full integration tests  
npm run test:integration

# Feature workflow tests
npm run test:features

# Regression tests
npm run test:regression
```

### Complete Test Suites
```bash
# Fast testing (unit + smoke)
npm run test:all

# Full testing (unit + integration + features)  
npm run test:full

# CI/CD pipeline tests
npm run test:ci:fast    # For PR validation
npm run test:ci:full    # For deployment
```

## 📊 Test Strategy Overview

### Unit Tests (Jest)
- **Focus**: Business logic, utilities, helpers
- **Target**: 100-150 focused tests
- **Runtime**: < 15 seconds
- **Coverage**: 75%+ on business logic

### Smoke Tests (Cypress)
- **Focus**: Critical path verification
- **Target**: 8-12 essential tests
- **Runtime**: < 30 seconds
- **Purpose**: Quick deployment validation

### Integration Tests (Cypress)  
- **Focus**: Component interactions, data flow
- **Target**: 25-35 workflow tests
- **Runtime**: 2-4 minutes
- **Purpose**: Feature development validation

### Feature Tests (Cypress)
- **Focus**: Complete user journeys
- **Target**: 35-50 end-to-end scenarios
- **Runtime**: 5-8 minutes
- **Purpose**: Acceptance testing

### Regression Tests (Cypress)
- **Focus**: Bug prevention, edge cases
- **Target**: 20-25 specific scenarios
- **Runtime**: 3-5 minutes
- **Purpose**: Release validation

## 🎯 When to Run Each Test Type

### During Development
```bash
npm run test:dev          # Continuous unit testing
npm run test:smoke        # Before commits
```

### Before Pull Requests
```bash
npm run test:all          # Unit tests + smoke tests
```

### Feature Completion
```bash
npm run test:integration  # Test feature interactions
npm run test:features     # Test complete workflows
```

### Before Releases
```bash
npm run test:full         # Complete test suite
npm run test:regression   # Bug prevention
```

### CI/CD Pipeline
```bash
npm run test:ci:fast      # PR validation (< 2 minutes)
npm run test:ci:full      # Deployment gate (< 15 minutes)
```

## 📁 Test Organization

```
cypress/e2e/
├── smoke/          # Critical path (< 30s)
├── integration/    # Component workflows (2-4 min)
├── features/       # User journeys (5-8 min)
└── regression/     # Bug prevention (3-5 min)

lib/
├── __tests__/      # Unit tests for business logic
├── testing/        # Test utilities and mocks
└── **/*.test.ts    # Co-located unit tests
```

## 🔧 Test Data & Utilities

### Cypress Commands
```typescript
cy.login('admin')           // Authenticate as admin
cy.navigateTo('students')   // Navigate to page
cy.fillForm(userData)       // Fill form with data
cy.verifyToast('Success')   // Verify notifications
```

### Jest Test Utilities
```typescript
import { createMockUser, testUtils } from '@/lib/testing/test-utils'

const mockUser = createMockUser({ role: 'admin' })
const mockRouter = testUtils.mockRouter()
```

## 🎯 Performance Targets

| Test Type | Target Runtime | Max Runtime |
|-----------|---------------|-------------|
| Unit Tests | < 15s | 30s |
| Smoke Tests | < 30s | 60s |
| Integration | 2-4 min | 5 min |
| Features | 5-8 min | 10 min |
| Regression | 3-5 min | 8 min |
| **Full Suite** | **< 13 min** | **20 min** |

## 🐛 Debugging Tests

### Jest Debugging
```bash
npm run test:debug        # Node.js debugger
npm run test -- --verbose # Detailed output
npm run test:coverage     # Coverage report
```

### Cypress Debugging
```bash
npm run e2e:open          # Visual test runner
cypress run --headed      # See browser interactions
cypress run --spec "**/*auth*"  # Run specific tests
```

## ✅ Best Practices

### Unit Tests
- Test business logic, not implementation details
- Use descriptive test names
- Mock external dependencies
- Focus on edge cases and error handling

### E2E Tests
- Test user workflows, not individual functions
- Use realistic test data
- Clean up test data after tests
- Use stable selectors (data-testid)

### Test Maintenance
- Update tests when features change
- Remove tests for deprecated features  
- Add regression tests when bugs are fixed
- Keep test documentation current