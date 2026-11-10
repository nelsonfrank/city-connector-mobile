import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import { mockJourneyResponse } from './fixtures/journeyData';
import { mockRealtimeSnapshot } from './fixtures/realtimeData';
import { mockSearchResponse } from './fixtures/searchData';
import { mockNearbyStops, mockStopDetails } from './fixtures/stopsData';

const baseUrl = env.EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, '');

// Simulated rate limit toggle for tests
export let simulateRateLimit = false;
export function setSimulateRateLimit(value: boolean): void {
  simulateRateLimit = value;
}

export const handlers = [
  // GET /stops/nearby
  http.get(`${baseUrl}/stops/nearby`, () => {
    if (simulateRateLimit) {
      return new HttpResponse(null, {
        status: 429,
        headers: {
          'Retry-After': '15',
          'Content-Type': 'application/json',
        },
      });
    }
    return HttpResponse.json(mockNearbyStops);
  }),

  // GET /stops/:stopId
  http.get(`${baseUrl}/stops/:stopId`, ({ params }) => {
    const stopId = decodeURIComponent(params.stopId as string);
    const detail = mockStopDetails[stopId];
    if (detail) {
      return HttpResponse.json(detail);
    }
    return HttpResponse.json({
      stop: {
        id: stopId,
        name: `Stop ${stopId}`,
        latitude: -1.286,
        longitude: 36.824,
        distanceMeters: 200,
        wheelchairAccessible: true,
      },
      departures: [],
    });
  }),

  // GET /journey
  http.get(`${baseUrl}/journey`, () => {
    if (simulateRateLimit) {
      return new HttpResponse(
        JSON.stringify({ error: 'Rate limit exceeded on /journey' }),
        {
          status: 429,
          headers: {
            'Retry-After': '30',
            'Content-Type': 'application/json',
          },
        },
      );
    }
    return HttpResponse.json(mockJourneyResponse);
  }),

  // GET /search
  http.get(`${baseUrl}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() ?? '';
    const filteredStops = mockSearchResponse.stops.filter((s) =>
      s.name.toLowerCase().includes(query),
    );
    const filteredRoutes = mockSearchResponse.routes.filter(
      (r) =>
        r.shortName.toLowerCase().includes(query) ||
        r.longName.toLowerCase().includes(query),
    );

    return HttpResponse.json({
      stops: filteredStops,
      routes: filteredRoutes,
    });
  }),

  // GET /realtime/snapshot
  http.get(`${baseUrl}/realtime/snapshot`, () => {
    return HttpResponse.json(mockRealtimeSnapshot);
  }),
];
