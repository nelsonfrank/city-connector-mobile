import { ClientRateLimiter } from '../throttle';

describe('ClientRateLimiter (Token Bucket)', () => {
  it('allows requests within capacity and tracks remaining tokens', () => {
    const limiter = new ClientRateLimiter({
      maxTokens: 3,
      refillCount: 3,
      refillIntervalMs: 60000,
    });

    expect(limiter.tryConsume().allowed).toBe(true);
    expect(limiter.tryConsume().allowed).toBe(true);
    expect(limiter.tryConsume().allowed).toBe(true);

    // 4th request must be rejected
    const exhausted = limiter.tryConsume();
    expect(exhausted.allowed).toBe(false);
    expect(exhausted.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets correctly when reset() is called', () => {
    const limiter = new ClientRateLimiter({
      maxTokens: 2,
      refillCount: 2,
      refillIntervalMs: 60000,
    });

    limiter.tryConsume();
    limiter.tryConsume();
    expect(limiter.tryConsume().allowed).toBe(false);

    limiter.reset();
    expect(limiter.tryConsume().allowed).toBe(true);
  });
});
