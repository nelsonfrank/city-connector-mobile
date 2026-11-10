import { apiRequest } from '../client';
import {
  NearbyStopsResponseSchema,
  StopDetailResponseSchema,
  type NearbyStopsResponse,
  type StopDetailResponse,
} from '../schemas/stops';

export const stopsQueryKeys = {
  all: ['stops'] as const,
  nearby: (lat: number, lng: number) => ['stops', 'nearby', lat.toFixed(3), lng.toFixed(3)] as const,
  detail: (stopId: string) => ['stops', 'detail', stopId] as const,
};

export async function fetchNearbyStops(
  latitude: number,
  longitude: number,
  radiusMeters: number = 800,
  signal?: AbortSignal,
): Promise<NearbyStopsResponse> {
  return apiRequest(
    'stops/nearby',
    NearbyStopsResponseSchema,
    {
      endpointName: 'GET /stops/nearby',
      rateLimitCategory: 'stops',
      searchParams: {
        lat: latitude,
        lng: longitude,
        radius: radiusMeters,
      },
      signal,
    },
  );
}

export async function fetchStopDetail(
  stopId: string,
  signal?: AbortSignal,
): Promise<StopDetailResponse> {
  return apiRequest(
    `stops/${encodeURIComponent(stopId)}`,
    StopDetailResponseSchema,
    {
      endpointName: `GET /stops/${stopId}`,
      rateLimitCategory: 'stops',
      signal,
    },
  );
}
