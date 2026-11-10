import { apiRequest } from '../client';
import { JourneyResponseSchema, type JourneyResponse } from '../schemas/journey';

export interface JourneySearchParams {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  time?: string;
  arriveBy?: boolean;
}

export const journeyQueryKeys = {
  all: ['journey'] as const,
  plan: (params: JourneySearchParams) =>
    [
      'journey',
      'plan',
      params.fromLat.toFixed(3),
      params.fromLng.toFixed(3),
      params.toLat.toFixed(3),
      params.toLng.toFixed(3),
      params.time ?? 'now',
      params.arriveBy ? 'arriveBy' : 'departAt',
    ] as const,
};

export async function fetchJourney(
  params: JourneySearchParams,
  signal?: AbortSignal,
): Promise<JourneyResponse> {
  return apiRequest(
    'journey',
    JourneyResponseSchema,
    {
      endpointName: 'GET /journey',
      rateLimitCategory: 'journey',
      searchParams: {
        from: `${params.fromLat},${params.fromLng}`,
        to: `${params.toLat},${params.toLng}`,
        time: params.time ?? new Date().toISOString(),
        arriveBy: params.arriveBy ?? false,
      },
      signal,
    },
  );
}
