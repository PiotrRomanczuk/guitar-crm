/**
 * Environment-aware logger for server-side debugging
 * Only logs in development mode, silent in production
 * Compatible with Edge runtime (middleware) and Node.js
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

// Check environment - works in both Edge and Node.js runtimes
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
const isVerbose = typeof process !== 'undefined' && process.env?.LOG_VERBOSE === 'true';

/**
 * Format log message with timestamp and context
 */
function formatMessage(
  level: LogLevel,
  prefix: string,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${prefix}] ${message}${contextStr}`;
}

/**
 * Create a namespaced logger for a specific module
 */
export function createLogger(prefix: string) {
  return {
    debug(message: string, context?: LogContext) {
      if (isDevelopment && isVerbose) {
        console.log(formatMessage('debug', prefix, message, context));
      }
    },
    info(message: string, context?: LogContext) {
      if (isDevelopment) {
        console.log(formatMessage('info', prefix, message, context));
      }
    },
    warn(message: string, context?: LogContext) {
      if (isDevelopment) {
        console.warn(formatMessage('warn', prefix, message, context));
      }
    },
    error(message: string, context?: LogContext) {
      // Errors are always logged (but could be sent to Sentry in production)
      console.error(formatMessage('error', prefix, message, context));
    },
  };
}

// Pre-configured loggers for common modules
export const middlewareLogger = createLogger('Middleware');
export const authLogger = createLogger('Auth');
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('Database');
