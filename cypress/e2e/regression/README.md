# Regression Tests

**Purpose**: Prevent previously fixed bugs from reappearing  
**Target Runtime**: 3-5 minutes  
**When to Run**: Before releases, after bug fixes

## Test Organization

### Bug Prevention

- `auth-edge-cases.cy.ts` - Authentication edge cases and fixes
- `form-validation-edge-cases.cy.ts` - Form validation bug scenarios
- `data-consistency.cy.ts` - Data integrity regression tests

### Performance Regression

- `page-load-performance.cy.ts` - Page load time regression
- `memory-leak-detection.cy.ts` - Memory usage monitoring
- `api-response-times.cy.ts` - API performance regression

### UI Regression

- `responsive-layout-fixes.cy.ts` - Layout and responsive design
- `accessibility-compliance.cy.ts` - Accessibility regression
- `browser-compatibility.cy.ts` - Cross-browser issues

## Regression Test Lifecycle

```typescript
// Example: Test for specific bug fix
describe('Bug #123: User role switching issue', () => {
  it('should maintain correct permissions after role change', () => {
    // Reproduce the original bug scenario
    // Verify the fix is working
    // Test related edge cases
  })
})
```

## Test Maintenance

- **Add New Tests**: When bugs are fixed, add regression test
- **Update Tests**: When features change, update related regression tests
- **Remove Tests**: When features are removed, clean up regression tests
- **Document Tests**: Link tests to bug reports and feature changes

## Running Regression Tests

```bash
# Run all regression tests
npm run test:regression

# Run specific bug regression
npm run test:regression -- --grep "Bug #123"

# Run performance regression only
npm run test:regression:performance

# Run UI regression only  
npm run test:regression:ui
```

## Test Documentation

Each regression test should include:
- Link to original bug report
- Description of the bug scenario
- Steps to reproduce the issue
- Expected behavior after fix