/**
 * Environment variable validation.
 * Import this module early (e.g., in instrumentation.ts) to catch
 * missing configuration before runtime errors occur.
 */

const requiredServerVars = [
  'NEXT_PUBLIC_SENTRY_DSN',
] as const;

const requiredForProduction = [
  'CRON_SECRET',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
] as const;

/**
 * Validate that required environment variables are set.
 * Logs warnings for missing optional vars; throws for missing required vars.
 */
export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredServerVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `[env] Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const missingProd: string[] = [];
    for (const key of requiredForProduction) {
      if (!process.env[key]) {
        missingProd.push(key);
      }
    }
    if (missingProd.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missingProd.join(', ')}`
      );
    }
  }
}
