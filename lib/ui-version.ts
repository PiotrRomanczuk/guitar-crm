/**
 * UI Version Cookie Utility
 *
 * Reads the `strummy-ui-version` cookie to determine
 * whether to render v1 or v2 components.
 *
 * Default: 'v1' (opt-in to v2 via settings toggle)
 */

import { cookies } from 'next/headers';

export type UIVersion = 'v1' | 'v2';

const COOKIE_NAME = 'strummy-ui-version';

/**
 * Server-side helper to read the UI version from the cookie.
 * Use in Server Components (RSC) and page.tsx files.
 */
export async function getUIVersion(): Promise<UIVersion> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_NAME)?.value;
    return value === 'v2' ? 'v2' : 'v1';
  } catch {
    // cookies() may throw outside of request context
    return 'v1';
  }
}
