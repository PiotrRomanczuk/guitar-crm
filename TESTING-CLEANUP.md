# Test Data Cleanup System

## Overview

Automated cleanup system to prevent test data pollution in the database from E2E tests.

## What Was Added

### 1. Cleanup Helper (`tests/helpers/cleanup.ts`)
- Identifies test data by pattern matching (titles, artists, names)
- Deletes test songs, lessons, and assignments
- Provides detailed logging and error reporting
- Safe deletion with individual error handling

### 2. Global Teardown (`tests/global-teardown.ts`)
- Runs automatically after all Playwright tests complete
- Calls cleanup functions for all test data types
- Configured in `playwright.config.ts`

### 3. Manual Cleanup Script (`scripts/cleanup-test-data.ts`)
- Standalone script for manual cleanup
- 3-second countdown before execution (Ctrl+C to cancel)
- Accessible via `npm run test:cleanup`

### 4. Documentation (`tests/README.md`)
- Complete guide for E2E testing
- Test organization structure
- Best practices and troubleshooting

## Usage

### Automatic (Recommended)

Cleanup runs automatically after test suites:

```bash
npm run playwright:run
# or
npm run test:pw:songs
# or any other test command
```

After tests complete, you'll see:

```
🧹 Starting test data cleanup...

Found 15 test songs to delete
Deleted test song: E2E Song 1769983443220
Deleted test song: Teacher Song 1769946438355
...

📊 Cleanup Summary:
  Songs deleted: 15
  Lessons deleted: 3
  Assignments deleted: 0
  ✅ Cleanup completed successfully
```

### Manual Cleanup

When you need to clean up immediately:

```bash
npm run test:cleanup
```

Use cases:
- Interrupted test runs
- Failed tests that didn't trigger teardown
- Manual database maintenance
- Before running tests on polluted database

## Test Data Patterns

The system identifies and deletes data matching these patterns:

### Songs
- **Titles**:
  - `E2E Song {timestamp}`
  - `Teacher Song {timestamp}`
  - `E2E Edit Test {timestamp}`
  - Any title ending with `EDITED`
- **Artists**:
  - `E2E Test Artist`
  - `Teacher Test Artist`

### Lessons
- **Titles**:
  - `E2E Lesson {timestamp}`
  - `Teacher Lesson {timestamp}`
  - `Test Lesson {timestamp}`

### Assignments
- **Titles**:
  - `E2E Assignment {timestamp}`
  - `Teacher Assignment {timestamp}`
  - `Test Assignment {timestamp}`

## Customization

### Adding New Patterns

Edit `tests/helpers/cleanup.ts`:

```typescript
const TEST_PATTERNS = {
  songs: {
    titles: [
      /^E2E Song \d+/,
      /^MyNewPattern \d+/,  // Add your pattern
    ],
    artists: [
      'E2E Test Artist',
      'My Test Artist',      // Add your artist
    ],
  },
};
```

### Adding New Data Types

Add cleanup functions for new entities:

```typescript
export async function cleanupTestStudents(): Promise<{ deleted: number; errors: any[] }> {
  const supabase = getSupabaseClient();
  // ... implementation
}

export async function cleanupAllTestData(): Promise<void> {
  // ... existing cleanup
  const students = await cleanupTestStudents();
  // Add to summary
}
```

## Configuration

### Environment Variables

Cleanup uses these environment variables from `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY=your-anon-key
# or
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Playwright Config

Configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  // ...
  globalTeardown: './tests/global-teardown.ts',
  // ...
});
```

## Troubleshooting

### Cleanup not running

**Symptoms**: Test data remains after tests complete

**Solutions**:
1. Verify global teardown is configured in `playwright.config.ts`
2. Check test process completed normally (not killed/interrupted)
3. Run manual cleanup: `npm run test:cleanup`
4. Check console output for cleanup logs

### Environment variable errors

**Symptoms**: `Missing Supabase credentials for cleanup`

**Solutions**:
1. Verify `.env.local` has Supabase credentials
2. Check environment variables are loaded
3. Ensure Supabase local instance is running
4. Verify credentials are correct

### Pattern matching issues

**Symptoms**: Some test data not deleted

**Solutions**:
1. Check test data matches patterns in `cleanup.ts`
2. Add console.log in cleanup to debug pattern matching
3. Update patterns to match your test data format
4. Run manual cleanup to see detailed logging

### Permission errors

**Symptoms**: Database permission errors during cleanup

**Solutions**:
1. Ensure you're using admin/service role key
2. Check RLS policies allow deletion
3. Verify Supabase client configuration
4. Use service role key if anon key doesn't have permissions

## Best Practices

1. **Always use timestamps**: Ensures unique test data and prevents conflicts
   ```typescript
   const timestamp = Date.now();
   const testSong = { title: `E2E Song ${timestamp}` };
   ```

2. **Follow established patterns**: Use existing naming conventions for automatic cleanup

3. **Run cleanup after failed tests**: If tests fail, run `npm run test:cleanup`

4. **Monitor cleanup logs**: Check that cleanup is working in CI/CD pipelines

5. **Keep patterns updated**: Add new test patterns to cleanup config as needed

## CI/CD Integration

Cleanup runs automatically in CI/CD pipelines after Playwright tests:

```yaml
# .github/workflows/test.yml example
- name: Run E2E Tests
  run: npm run playwright:run
  # Cleanup runs automatically via globalTeardown
```

If you need explicit cleanup in CI:

```yaml
- name: Run E2E Tests
  run: npm run playwright:run

- name: Cleanup Test Data
  if: always()  # Run even if tests fail
  run: npm run test:cleanup
```

## Future Improvements

Consider adding:
- [ ] Cleanup before tests (global setup)
- [ ] Age-based cleanup (delete test data older than X days)
- [ ] Cleanup for specific test patterns only
- [ ] Cleanup statistics/reporting
- [ ] Integration with CI/CD reporting
