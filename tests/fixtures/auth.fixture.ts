/* eslint-disable @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks */
import { test as base, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Authentication Fixture
 *
 * Provides session-cached authentication for fast test execution.
 * Sessions are saved to .auth/{role}.json files and reused across tests.
 *
 * Based on Playwright's recommended authentication pattern:
 * https://playwright.dev/docs/auth
 */

type Role = 'admin' | 'teacher' | 'student';

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthFixtures {
  loginAs: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

// Test credentials from environment
const credentials: Record<Role, AuthCredentials> = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'p.romanczuk@gmail.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'test123_admin',
  },
  teacher: {
    email: process.env.TEST_TEACHER_EMAIL || 'teacher@example.com',
    password: process.env.TEST_TEACHER_PASSWORD || 'test123_teacher',
  },
  student: {
    email: process.env.TEST_STUDENT_EMAIL || 'student@example.com',
    password: process.env.TEST_STUDENT_PASSWORD || 'test123_student',
  },
};

// Session storage paths
const authDir = path.join(__dirname, '..', '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}
const getStoragePath = (role: Role) => path.join(authDir, `${role}.json`);

// Track session age to avoid using very stale sessions
const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

function isSessionFresh(storagePath: string): boolean {
  try {
    const stats = fs.statSync(storagePath);
    return Date.now() - stats.mtimeMs < SESSION_MAX_AGE_MS;
  } catch {
    return false;
  }
}

/**
 * Perform login for a specific role and save session state
 */
async function performLogin(page: Page, role: Role): Promise<void> {
  const creds = credentials[role];
  const storagePath = getStoragePath(role);

  // Navigate to sign-in page
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded', timeout: 45000 });

  // Wait for form to be visible (handles isChecking state in sign-in page)
  await page.waitForSelector('[data-testid="email"]', { state: 'visible', timeout: 30000 });

  // Fill in credentials using data-testid
  await page.fill('[data-testid="email"]', creds.email);
  await page.fill('[data-testid="password"]', creds.password);

  // Submit form using data-testid
  await page.click('[data-testid="signin-button"]');

  // Wait for successful login redirect
  await page.waitForURL(/\/dashboard/, { timeout: 60000, waitUntil: 'domcontentloaded' });

  // Verify we're logged in by checking for main content
  await page.locator('main').first().waitFor({ state: 'visible', timeout: 30000 });

  // Save full authenticated state (cookies + localStorage + sessionStorage)
  await page.context().storageState({ path: storagePath });
}

export const test = base.extend<AuthFixtures>({
  /**
   * Login as a specific role with session caching
   */
  loginAs: async ({ page }, use) => {
    const loginFn = async (role: Role) => {
      const storagePath = getStoragePath(role);

      // Only try reusing session if file exists and is fresh
      if (fs.existsSync(storagePath) && isSessionFresh(storagePath)) {
        try {
          const storageState = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));

          // Restore cookies
          if (storageState.cookies?.length) {
            await page.context().addCookies(storageState.cookies);
          }

          // Restore localStorage
          if (storageState.origins?.length) {
            for (const origin of storageState.origins) {
              if (origin.localStorage?.length) {
                await page.goto(origin.origin, { waitUntil: 'domcontentloaded', timeout: 15000 });
                for (const item of origin.localStorage) {
                  await page.evaluate(
                    ([key, value]) => localStorage.setItem(key, value),
                    [item.name, item.value]
                  );
                }
              }
            }
          }

          // Verify session is still valid by navigating to dashboard
          await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });

          // Check we actually landed on dashboard (not redirected to sign-in)
          const url = page.url();
          if (url.includes('/dashboard')) {
            const isLoggedIn = await page.locator('main').first().isVisible({ timeout: 10000 });
            if (isLoggedIn) {
              return; // Session is valid
            }
          }
        } catch {
          // Session restoration failed, delete stale file
          try { fs.unlinkSync(storagePath); } catch { /* ignore */ }
        }
      }

      // Perform fresh login
      await performLogin(page, role);
    };

    await use(loginFn);
  },

  /**
   * Logout from current session
   */
  logout: async ({ page }, use) => {
    const logoutFn = async () => {
      // Click user menu
      await page.click('[data-testid="user-menu"]');

      // Click logout button
      await page.click('[data-testid="logout-button"]');

      // Wait for redirect away from dashboard
      await page.waitForURL((url) => !url.pathname.includes('/dashboard'), {
        timeout: 10000,
      });
    };

    await use(logoutFn);
  },
});

export { expect } from '@playwright/test';
