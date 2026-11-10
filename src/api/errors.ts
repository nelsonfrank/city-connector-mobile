export class ApiError extends Error {
  readonly statusCode: number;
  readonly endpoint?: string;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, endpoint?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.details = details;
  }
}

export class RateLimitError extends ApiError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number = 60, endpoint?: string) {
    super(
      `Rate limit exceeded. Try again in ${retryAfterSeconds}s.`,
      429,
      endpoint,
      { retryAfterSeconds },
    );
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class NetworkError extends Error {
  readonly originalError?: unknown;

  constructor(message: string = 'Network connection failed.', originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class StaleDataError extends Error {
  readonly agencyCode: string;
  readonly ageMs: number;

  constructor(agencyCode: string, ageMs: number) {
    super(`Realtime feed for agency ${agencyCode} is stale (${Math.round(ageMs / 1000)}s old).`);
    this.name = 'StaleDataError';
    this.agencyCode = agencyCode;
    this.ageMs = ageMs;
  }
}
