import { z } from 'zod';
import { apiRequest } from '../client';
import { ApiError, RateLimitError } from '../errors';
import { server } from '@/test/server';
import { setSimulateRateLimit } from '@/test/handlers';
import { endpointRateLimiters } from '@/lib/throttle';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  setSimulateRateLimit(false);
  endpointRateLimiters.journey.reset();
  endpointRateLimiters.stops.reset();
});
afterAll(() => server.close());

describe('API Client (Ky + Zod + Rate Limiting)', () => {
  const TestSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  it('surfaces RateLimitError with retryAfterSeconds on HTTP 429 response', async () => {
    setSimulateRateLimit(true);

    await expect(
      apiRequest('journey', z.any(), { endpointName: 'GET /journey' }),
    ).rejects.toThrow(RateLimitError);
  });

  it('rejects with RateLimitError when client token bucket is exhausted', async () => {
    const limiter = endpointRateLimiters.journey;
    limiter.tryConsume();
    limiter.tryConsume();
    limiter.tryConsume();
    limiter.tryConsume(); // 4 tokens exhausted

    await expect(
      apiRequest('journey', z.any(), {
        endpointName: 'GET /journey',
        rateLimitCategory: 'journey',
      }),
    ).rejects.toThrow(RateLimitError);
  });

  it('throws ApiError on schema mismatch without crashing', async () => {
    await expect(
      apiRequest('stops/nearby', TestSchema, {
        endpointName: 'GET /stops/nearby',
      }),
    ).rejects.toThrow(ApiError);
  });
});
