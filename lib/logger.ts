/**
 * Structured logger with Sentry integration.
 *
 * - `logger` -- default singleton for quick usage
 * - `createLogger(prefix)` -- namespaced logger for a specific module
 *
 * Levels:
 *   debug  -- dev-only (verbose), no Sentry
 *   info   -- dev console + Sentry breadcrumb
 *   warn   -- always console.warn + Sentry breadcrumb
 *   error  -- always console.error + Sentry captureException / captureMessage
 */

import * as Sentry from '@sentry/nextjs';

type LogContext = Record<string, unknown>;

// Edge-safe env checks
const isDev =
  typeof process !== 'undefined' &&
  process.env?.NODE_ENV === 'development';

function fmt(
  level: string,
  prefix: string,
  message: string,
  context?: LogContext,
): string {
  const ts = new Date().toISOString();
  const ctx = context ? ` ${JSON.stringify(context)}` : '';
  return `[${ts}] [${level}] [${prefix}] ${message}${ctx}`;
}

function makeLogger(prefix: string) {
  return {
    /** Debug -- dev only, no Sentry */
    debug(message: string, context?: LogContext) {
      if (isDev) console.log(fmt('DEBUG', prefix, message, context));
    },

    /** Info -- dev console + Sentry breadcrumb */
    info(message: string, context?: LogContext) {
      if (isDev) console.log(fmt('INFO', prefix, message, context));
      Sentry.addBreadcrumb({
        message: `[${prefix}] ${message}`,
        data: context,
        level: 'info',
      });
    },

    /** Warn -- always log + Sentry breadcrumb */
    warn(message: string, context?: LogContext) {
      console.warn(fmt('WARN', prefix, message, context));
      Sentry.addBreadcrumb({
        message: `[${prefix}] ${message}`,
        data: context,
        level: 'warning',
      });
    },

    /** Error -- always log + Sentry capture */
    error(
      message: string,
      error?: unknown,
      context?: LogContext,
    ) {
      console.error(
        fmt('ERROR', prefix, message, context),
        error ?? '',
      );
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: { message, prefix, ...context },
        });
      } else {
        Sentry.captureMessage(`[${prefix}] ${message}`, {
          level: 'error',
          extra: { error, prefix, ...context },
        });
      }
    },
  };
}

/** Default (un-prefixed) logger for quick usage */
export const logger = makeLogger('app');

/** Create a namespaced logger -- keeps backward compat with old API */
export function createLogger(prefix: string) {
  return makeLogger(prefix);
}

// Pre-configured loggers for common modules
export const middlewareLogger = createLogger('Middleware');
export const authLogger = createLogger('Auth');
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('Database');
