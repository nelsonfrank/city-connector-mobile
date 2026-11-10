export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ErrorReportOptions {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

// Ensure coordinates/location are never logged or leaked to error tracking
function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
    };
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('lat') ||
      lowerKey.includes('lng') ||
      lowerKey.includes('lon') ||
      lowerKey.includes('location') ||
      lowerKey.includes('coord') ||
      lowerKey.includes('password') ||
      lowerKey.includes('token')
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export interface ErrorReporter {
  captureException(error: unknown, options?: ErrorReportOptions): void;
  captureMessage(message: string, level?: LogLevel): void;
}

class ConsoleErrorReporter implements ErrorReporter {
  captureException(error: unknown, options?: ErrorReportOptions): void {
    if (__DEV__) {
      console.error('[ErrorReporter]', error, sanitizeData(options));
    }
  }

  captureMessage(message: string, level: LogLevel = 'info'): void {
    if (__DEV__) {
      console.log(`[ErrorReporter:${level}]`, message);
    }
  }
}

let activeReporter: ErrorReporter = new ConsoleErrorReporter();

export function setCustomErrorReporter(reporter: ErrorReporter): void {
  activeReporter = reporter;
}

export const logger = {
  debug(...args: unknown[]): void {
    if (__DEV__) {
      console.debug('[DEBUG]', ...args.map(sanitizeData));
    }
  },
  info(...args: unknown[]): void {
    if (__DEV__) {
      console.info('[INFO]', ...args.map(sanitizeData));
    }
  },
  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args.map(sanitizeData));
  },
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args.map(sanitizeData));
  },
};

export function reportError(error: unknown, options?: ErrorReportOptions): void {
  logger.error('Captured error:', error);
  activeReporter.captureException(error, options);
}
