import { cookies } from 'next/headers';

const UI_VERSION_COOKIE = 'strummy-ui-version';

type UIVersion = 'v1' | 'v2';

/**
 * Read the UI version from the cookie in a Server Component.
 * Returns 'v1' if not set (default).
 */
export async function getUIVersion(): Promise<UIVersion> {
  const cookieStore = await cookies();
  const version = cookieStore.get(UI_VERSION_COOKIE)?.value;
  return version === 'v2' ? 'v2' : 'v1';
}
