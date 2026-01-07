/**
 * Centralized Logging Utility
 * 
 * Provides environment-aware logging that can be disabled in production.
 * Audit logs are always written to the database regardless of console logging.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const enableConsoleLogs = process.env.ENABLE_CONSOLE_LOGS === 'true' || isDevelopment;

/**
 * Logs a message to console only in development or if explicitly enabled
 */
export function log(level: 'log' | 'info' | 'warn' | 'error', ...args: any[]): void {
  if (!enableConsoleLogs) {
    return;
  }

  switch (level) {
    case 'log':
    case 'info':
      console.log(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
  }
}

/**
 * Convenience functions
 */
export const logger = {
  log: (...args: any[]) => log('log', ...args),
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
};

/**
 * Client-side logger (always enabled for debugging, but can be filtered)
 */
export const clientLogger = {
  log: (...args: any[]) => {
    if (isDevelopment || process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production (helps with debugging)
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment || process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true') {
      console.warn(...args);
    }
  },
};
