# Smoke Tests

**Purpose**: Quick verification of critical application functionality  
**Target Runtime**: < 30 seconds  
**When to Run**: Before deployments, after major changes, in CI/CD

## Test Files

- `critical-path.cy.ts` - Core application functionality
- `auth-flow.cy.ts` - Authentication system basics
- `api-health.cy.ts` - Critical API endpoint verification

## What Smoke Tests Cover

✅ **Application Loading**: Basic app startup and rendering  
✅ **Authentication**: Login/logout functionality exists  
✅ **Navigation**: Core navigation elements present  
✅ **API Health**: Critical endpoints responding  
✅ **Error Handling**: 404 pages and error boundaries  
✅ **Responsive Design**: Basic viewport compatibility

## What Smoke Tests DON'T Cover

❌ Full user workflows (covered in integration tests)  
❌ Data validation (covered in unit tests)  
❌ Complex interactions (covered in feature tests)  
❌ Edge cases (covered in regression tests)

## Running Smoke Tests

```bash
# Run only smoke tests
npm run test:smoke

# Run smoke tests in headless mode
npm run test:smoke:headless

# Run smoke tests with video recording
npm run test:smoke:record
```