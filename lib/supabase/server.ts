import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase server client with cookie integration.
 * Adds explicit environment validation so CI failures surface a clear, actionable error.
 * In CI test runs (Cypress) if env vars are missing we throw a descriptive error early.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // In test environments we avoid throwing so Jest can mock the underlying
    // `createServerClient` call (tests mock `@supabase/ssr`). For all other
    // environments keep the explicit, actionable error so CI surfaces missing
    // secrets clearly.
    const isTest =
      process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';

    if (!isTest) {
      // Provide a concise, deterministic failure reason instead of the underlying library's generic throw.
      // This helps GitHub Actions logs point directly to missing secrets configuration.
      throw new Error(
        'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Add them as repository secrets and export them in the CI job.'
      );
    }
    // When running tests, allow the call to proceed so test mocks can provide a fake client.
    // Note: the mocked `createServerClient` in tests will be used instead of the real implementation.
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component without mutation capability; safe to ignore if session refresh handled elsewhere.
        }
      },
    },
  });
}
