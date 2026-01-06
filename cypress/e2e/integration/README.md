# Integration Tests

**Purpose**: Test component interactions and data flow  
**Target Runtime**: 2-4 minutes per workflow  
**When to Run**: During feature development, before releases

## Test Organization

### Component Integration
- `form-interactions.cy.ts` - Form submission and validation
- `modal-workflows.cy.ts` - Modal opening, interaction, and closing
- `navigation-flows.cy.ts` - Multi-step navigation scenarios

### Data Flow Integration  
- `student-data-flow.cy.ts` - Student CRUD operations
- `lesson-scheduling.cy.ts` - Lesson creation and management
- `assignment-lifecycle.cy.ts` - Assignment creation to completion

### System Integration
- `auth-protected-routes.cy.ts` - Authentication flow integration
- `role-based-access.cy.ts` - Permission system integration
- `notification-system.cy.ts` - Email and in-app notifications

## Integration Test Patterns

```typescript
// Test data flow between components
it('should update student list when new student is added', () => {
  // Navigate to student management
  // Add new student
  // Verify student appears in list
  // Verify student count updates
})

// Test component state management  
it('should preserve form data during navigation', () => {
  // Fill out form partially
  // Navigate away and back
  // Verify form data persists
})
```

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration workflow
npm run test:integration -- --spec "**/student-data-flow.cy.ts"

# Run integration tests with API mocking
npm run test:integration:mock
```