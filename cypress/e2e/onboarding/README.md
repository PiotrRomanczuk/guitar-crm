# Onboarding Flow Tests

This directory contains E2E tests for the user onboarding experience.

## Test Coverage

### `complete-flow.cy.ts`

Comprehensive tests for the 3-step onboarding process:

**Step 1: Learning Goals**
- Display welcome screen with goal options
- Require at least one goal selection
- Allow multiple goal selections
- Support skipping to preferences

**Step 2: Skill Level**
- Display skill level options (Beginner, Intermediate, Advanced)
- Allow skill level selection
- Navigate back to goals
- Preserve selections when navigating

**Step 3: Preferences**
- Display learning style options (optional)
- Display instrument preferences (optional)
- Allow multiple selections
- Navigate back to skill level
- Complete without preferences

**Access Control**
- Redirect unauthenticated users to sign-in
- Redirect already onboarded users to dashboard
- Prevent re-entering onboarding after completion

**UI/UX**
- Step indicator shows current progress
- Mobile responsive design
- Accessibility (ARIA labels, keyboard navigation)
- AI personalization badge visible

## Test Limitations

### Skipped Tests

Some tests are skipped because they require fresh user accounts:

1. **Onboarding Completion**: Requires creating a new user who hasn't completed onboarding
2. **Data Persistence**: Requires verifying database state after completion
3. **Prevent Re-entry**: Requires completing onboarding then trying to access again

These tests document the expected behavior but are marked with `.skip()` because:
- Test user accounts are pre-seeded and already onboarded
- Creating/deleting users in E2E tests adds complexity
- Database state verification requires additional setup

### Testing Strategy

**What IS tested:**
- UI rendering and navigation
- Form validation and interactions
- Access control redirects
- Multi-step flow navigation
- Selection state management

**What needs manual testing:**
- Actual onboarding completion with new user
- Database updates (is_student, onboarding_completed)
- Role assignment (user_roles table)
- Session data persistence

## Running Tests

```bash
# Interactive mode (recommended for development)
npm run cypress:open

# Headless mode
npm run cypress:run -- --spec "cypress/e2e/onboarding/**"

# Specific test file
npx cypress run --spec "cypress/e2e/onboarding/complete-flow.cy.ts"
```

## Implementation Details

### Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     /onboarding (main page)                  │
│                                                              │
│  Step 1: Learning Goals (OnboardingForm component)          │
│  - Select 1+ goals (required)                               │
│  - Skip to preferences (optional)                           │
│  - State stored in React useState                           │
│                                                              │
│                           ↓                                  │
│                                                              │
│  Step 2: Skill Level                                        │
│  - Select one: Beginner/Intermediate/Advanced               │
│  - Back to goals                                            │
│  - State stored in React useState                           │
│                                                              │
│                           ↓                                  │
│                                                              │
│  Step 3: Preferences                                        │
│  - Learning styles (optional, multi-select)                 │
│  - Instruments (optional, multi-select)                     │
│  - Back to skill level                                      │
│  - Complete Setup button                                    │
│                                                              │
│                           ↓                                  │
│                                                              │
│  completeOnboarding() Server Action                         │
│  - Update profiles: is_student = true                       │
│  - Update profiles: onboarding_completed = true             │
│  - Insert user_roles: role = 'student'                      │
│  - Redirect to /dashboard                                   │
└─────────────────────────────────────────────────────────────┘
```

### Components

- `/app/onboarding/page.tsx` - Main onboarding page with auth check
- `/components/onboarding/OnboardingForm.tsx` - 3-step form component
- `/components/onboarding/GoalSelector.tsx` - Goal selection cards
- `/components/onboarding/SkillLevelSelector.tsx` - Skill level cards
- `/app/actions/onboarding.ts` - Server action for completion

### Database Updates

On completion, `completeOnboarding()` updates:

```sql
-- profiles table
UPDATE profiles SET
  is_student = true,
  onboarding_completed = true,
  updated_at = now()
WHERE id = user_id;

-- user_roles table
INSERT INTO user_roles (user_id, role)
VALUES (user_id, 'student');
```

### Skip Logic

Already onboarded users are detected by:

```typescript
if (profile?.is_student || profile?.is_teacher || profile?.is_admin) {
  redirect('/dashboard');
}
```

## Future Enhancements

1. **Test Data Setup**: Create utility to generate fresh test users
2. **Database Verification**: Add tests to verify database state
3. **Session Storage**: Test sessionStorage fallback (goals/skill-level pages)
4. **Error Handling**: Test network failures, timeout scenarios
5. **Analytics**: Verify analytics events fired during onboarding
