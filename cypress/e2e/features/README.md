# Feature Tests

**Purpose**: Test complete user workflows and business scenarios  
**Target Runtime**: 5-8 minutes per feature  
**When to Run**: Feature completion, acceptance testing

## Feature Categories

### Admin Features
- `admin-student-management.cy.ts` - Complete student lifecycle
- `admin-lesson-scheduling.cy.ts` - Lesson planning and management  
- `admin-reporting.cy.ts` - Analytics and report generation

### Student Features  
- `student-dashboard.cy.ts` - Student portal experience
- `student-practice-logging.cy.ts` - Practice tracking workflow
- `student-progress-review.cy.ts` - Progress viewing and feedback

### Teacher Features
- `teacher-lesson-preparation.cy.ts` - Lesson planning workflow
- `teacher-student-communication.cy.ts` - Communication tools
- `teacher-progress-tracking.cy.ts` - Student progress monitoring

## Feature Test Structure

```typescript
// Complete user journey from start to finish
describe('Admin Student Management Feature', () => {
  it('should complete full student onboarding workflow', () => {
    // 1. Add new student
    // 2. Set up initial lesson schedule  
    // 3. Create practice assignments
    // 4. Review student profile
    // 5. Generate progress report
  })
})
```

## Test Data Management

Feature tests use realistic test data and scenarios:
- Pre-seeded database state
- Realistic user personas
- Common business scenarios
- Edge case handling

## Running Feature Tests

```bash
# Run all feature tests
npm run test:features

# Run admin feature tests only
npm run test:features:admin

# Run student feature tests only  
npm run test:features:student

# Run with full test reporting
npm run test:features:report
```