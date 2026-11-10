import ky, { type KyInstance, type Options as KyOptions } from 'ky';
import { type ZodType } from 'zod';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { endpointRateLimiters } from '@/lib/throttle';
import { ApiError, NetworkError, RateLimitError } from './errors';

export interface RequestOptions extends Omit<KyOptions, 'searchParams'> {
  endpointName?: string;
  rateLimitCategory?: 'journey' | 'stops' | 'search';
  searchParams?: Record<string, string | number | boolean | undefined>;
}

// Base Ky client
export const rawKyClient: KyInstance = ky.create({
  prefix: env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [500, 502, 503, 504],
    backoffLimit: 3000,
    delay: (attemptCount) => {
      // Exponential backoff with jitter
      const baseDelay = 300 * Math.pow(2, attemptCount);
      const jitter = Math.random() * 200;
      return baseDelay + jitter;
    },
  },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        request.headers.set('Accept', 'application/json');
        request.headers.set('X-Client-Platform', 'react-native');
      },
    ],
  },
});

/**
 * Typed API request runner that applies:
 * 1. Client-side token bucket rate-limiting protection
 * 2. Ky network request with TanStack Query abort signals
 * 3. HTTP 429 Retry-After parsing
 * 4. Zod schema validation and error isolation
 */
export async function apiRequest<T>(
  url: string,
  schema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const { endpointName = url, rateLimitCategory, signal, ...kyOptions } = options;

  // 1. Client-side rate-limit protection
  if (rateLimitCategory) {
    const limiter = endpointRateLimiters[rateLimitCategory];
    const { allowed, retryAfterSeconds } = limiter.tryConsume();
    if (!allowed) {
      logger.warn(`Client rate limit throttled request to ${endpointName}`);
      throw new RateLimitError(retryAfterSeconds, endpointName);
    }
  }

  // Adjust timeout for journey endpoint
  const timeout = endpointName.includes('journey') ? 15000 : 10000;

  try {
    const response = await rawKyClient(url, {
      ...kyOptions,
      timeout,
      signal,
    });

    const data: unknown = await response.json();

    // 2. Schema validation
    const result = schema.safeParse(data);
    if (!result.success) {
      logger.error(`Schema mismatch at endpoint [${endpointName}]:`, result.error.format());
      throw new ApiError(
        `Failed to parse response from ${endpointName}`,
        200,
        endpointName,
        result.error.format(),
      );
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle Ky HTTP errors (e.g. 429)
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response: Response };
      const status = httpError.response.status;

      if (status === 429) {
        const retryAfterHeader = httpError.response.headers.get('Retry-After');
        const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) || 60 : 60;
        logger.warn(`Gateway 429 received on ${endpointName}. Retry-After: ${retrySeconds}s`);
        throw new RateLimitError(retrySeconds, endpointName);
      }

      let errorBody: unknown;
      try {
        errorBody = await httpError.response.json();
      } catch {
        errorBody = null;
      }

      throw new ApiError(
        `Request to ${endpointName} failed with HTTP ${status}`,
        status,
        endpointName,
        errorBody,
      );
    }

    // Check for aborted requests
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    // General network errors
    logger.warn(`Network failure on endpoint ${endpointName}:`, error);
    throw new NetworkError(`Network connection to ${endpointName} failed.`, error);
  }
}
