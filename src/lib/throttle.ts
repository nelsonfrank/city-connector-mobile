export interface TokenBucketOptions {
  /** Maximum number of tokens the bucket can hold */
  maxTokens: number;
  /** Refill rate: number of tokens added per interval */
  refillCount: number;
  /** Refill interval in milliseconds (e.g. 60,000 for 1 minute) */
  refillIntervalMs: number;
}

export class ClientRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillCount: number;
  private readonly refillIntervalMs: number;

  constructor(options: TokenBucketOptions) {
    this.maxTokens = options.maxTokens;
    this.refillCount = options.refillCount;
    this.refillIntervalMs = options.refillIntervalMs;
    this.tokens = options.maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > 0) {
      const tokensToAdd = (elapsed / this.refillIntervalMs) * this.refillCount;
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Attempts to consume 1 token.
   * Returns { allowed: true } if successful, or { allowed: false, retryAfterSeconds: N } if exhausted.
   */
  tryConsume(): { allowed: boolean; retryAfterSeconds: number } {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const missingTokens = 1 - this.tokens;
    const waitTimeMs = (missingTokens / this.refillCount) * this.refillIntervalMs;
    const retryAfterSeconds = Math.max(1, Math.ceil(waitTimeMs / 1000));

    return { allowed: false, retryAfterSeconds };
  }

  /**
   * Resets the token bucket (useful in unit tests).
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

/**
 * Pre-configured rate limiters per endpoint group:
 * - Journey: limit 4 req/min (Gateway limit ~5 req/min)
 * - Stops: limit 15 req/min (Gateway limit ~20 req/min)
 * - Search: limit 30 req/min
 */
export const endpointRateLimiters = {
  journey: new ClientRateLimiter({
    maxTokens: 4,
    refillCount: 4,
    refillIntervalMs: 60000,
  }),
  stops: new ClientRateLimiter({
    maxTokens: 15,
    refillCount: 15,
    refillIntervalMs: 60000,
  }),
  search: new ClientRateLimiter({
    maxTokens: 30,
    refillCount: 30,
    refillIntervalMs: 60000,
  }),
};
