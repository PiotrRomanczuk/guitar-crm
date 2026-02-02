# Google Calendar Integration E2E Tests

Comprehensive end-to-end tests for the Google Calendar bidirectional sync integration.

## Test Suites

### 1. google-calendar-sync.spec.ts
Main integration tests covering:
- **Calendar Import Page Access** - Verifies teachers/admins can access import UI
- **Lesson Lifecycle with Calendar Sync** - Tests create/update/delete operations
- **Calendar Event Import Flow** - Validates import UI and date range selectors
- **Calendar Integration Status** - Checks dashboard integration display
- **API Integration Verification** - Verifies correct API calls and error handling

**Tags**: `@integration`, `@calendar`, `@google`

**Key Tests**:
- ✅ Create lesson and trigger calendar sync
- ✅ Update lesson and trigger calendar sync
- ✅ Delete lesson and trigger calendar sync
- ✅ Display event import UI
- ✅ Handle connection errors gracefully
- ✅ Handle network errors during sync

### 2. calendar-webhook-renewal.spec.ts
Webhook auto-renewal system tests covering:
- **Cron Endpoint Security** - Authorization and authentication
- **Webhook Renewal Process** - Renewal logic and response structure
- **Error Handling** - Graceful failure handling
- **Idempotency** - Safe multiple invocations

**Tags**: `@integration`, `@webhook`, `@cron`

**Key Tests**:
- ✅ Reject unauthorized requests
- ✅ Accept requests with correct CRON_SECRET
- ✅ Return renewal summary with correct structure
- ✅ Complete within reasonable time (< 30s)
- ✅ Safe to call multiple times

### 3. calendar-api-sync.spec.ts
API layer integration tests covering:
- **Lesson Creation API** - Create lessons with sync
- **Lesson Update API** - Update lessons with sync
- **Error Handling** - Resilience to failures
- **Database Consistency** - Data integrity verification

**Tags**: `@api`, `@calendar`, `@sync`

**Key Tests**:
- ✅ Create lesson via API and return google_event_id
- ✅ Update lesson and trigger sync
- ✅ Handle sync failures gracefully
- ✅ Maintain lesson data integrity
- ✅ Cleanup test data

## Running Tests

### All Calendar Tests
```bash
npx playwright test tests/e2e/integration/google-calendar-sync.spec.ts
npx playwright test tests/e2e/integration/calendar-webhook-renewal.spec.ts
npx playwright test tests/e2e/integration/calendar-api-sync.spec.ts
```

### By Tag
```bash
npx playwright test --grep @calendar
npx playwright test --grep @webhook
npx playwright test --grep @api
```

### Specific Browser
```bash
npx playwright test --project="Desktop Chrome" tests/e2e/integration/google-calendar-sync.spec.ts
npx playwright test --project="Desktop Firefox" tests/e2e/integration/calendar-webhook-renewal.spec.ts
npx playwright test --project="iPhone 12" tests/e2e/integration/calendar-api-sync.spec.ts
```

### Debug Mode
```bash
npx playwright test --debug tests/e2e/integration/google-calendar-sync.spec.ts
npx playwright test --headed tests/e2e/integration/calendar-webhook-renewal.spec.ts
```

### Watch Mode
```bash
npx playwright test --ui tests/e2e/integration/
```

## Prerequisites

### Environment Variables
Required in `.env.local`:
```bash
# Test credentials (already configured)
TEST_TEACHER_EMAIL=teacher@example.com
TEST_TEACHER_PASSWORD=test123_teacher
TEST_ADMIN_EMAIL=p.romanczuk@gmail.com
TEST_ADMIN_PASSWORD=test123_admin

# Cron secret for webhook renewal tests
CRON_SECRET=your-cron-secret-hex-string

# Optional: Override base URL
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### Database Setup
```bash
npm run seed  # Seed test data
```

### Development Server
```bash
npm run dev  # Must be running on localhost:3000
```

## Test Coverage

### What's Tested ✅
- UI flow for calendar import page
- Lesson creation with sync trigger
- Lesson updates with sync trigger
- Lesson deletion with sync trigger
- API endpoint security (webhook renewal)
- Error handling and resilience
- Database consistency
- Network error recovery
- Multi-browser compatibility

### What's NOT Tested ⚠️
- Actual Google OAuth flow (requires real Google account)
- Real Google Calendar API calls (requires authentication)
- Token refresh mechanism (would need expired tokens)
- Webhook push notification delivery (requires Google's servers)

These limitations are by design - testing real OAuth flows and external API calls is impractical in automated E2E tests. Manual testing is required for these scenarios.

## Manual Testing Checklist

For scenarios that cannot be automated:

- [ ] Complete Google OAuth flow in browser
- [ ] Verify access token storage in database
- [ ] Create lesson and check Google Calendar for new event
- [ ] Update lesson and verify Google Calendar event updated
- [ ] Delete lesson and verify Google Calendar event removed
- [ ] Import events from Google Calendar
- [ ] Enable real-time webhook sync
- [ ] Verify webhook receives push notifications
- [ ] Test token refresh after expiration

## CI/CD Integration

These tests run automatically in CI when:
- Pull requests are created
- Code is pushed to `main` branch
- Scheduled nightly builds

**CI Configuration**: `.github/workflows/e2e-tests.yml` (if exists)

## Debugging Failed Tests

### Screenshot on Failure
Screenshots are automatically captured in `test-results/`:
```bash
ls test-results/**/*.png
```

### Video Recording
Enable video for debugging:
```typescript
// In playwright.config.ts
use: {
  video: 'on', // or 'retain-on-failure'
}
```

### Playwright Trace
Enable trace for detailed debugging:
```bash
npx playwright test --trace on
```

View trace:
```bash
npx playwright show-trace test-results/trace.zip
```

## Contributing

When adding new calendar features:
1. Add corresponding E2E tests
2. Update this README with new test cases
3. Ensure tests pass locally before pushing
4. Add manual testing steps if automation isn't feasible

## Support

For issues or questions:
- Check test logs in `test-results/`
- Review Playwright documentation: https://playwright.dev
- Contact: development team
