import type { Stop, StopDetailResponse } from '@/api/schemas/stops';

export const mockNearbyStops: Stop[] = [
  {
    id: 'supermetro:sm_101',
    name: 'Ambassadeur Terminal',
    code: 'SM101',
    latitude: -1.2858,
    longitude: 36.8256,
    distanceMeters: 140,
    wheelchairAccessible: true,
  },
  {
    id: 'kbs:kbs_402',
    name: 'Kencom House Stage',
    code: 'KBS402',
    latitude: -1.2868,
    longitude: 36.8242,
    distanceMeters: 220,
    wheelchairAccessible: false,
  },
  {
    id: 'matatu:mat_88',
    name: 'Odeon Cinema Stage',
    code: 'OD88',
    latitude: -1.2829,
    longitude: 36.8239,
    distanceMeters: 380,
    wheelchairAccessible: false,
  },
  {
    id: 'ncr:rail_01',
    name: 'Nairobi Central Railway Station',
    code: 'NCR01',
    latitude: -1.2912,
    longitude: 36.8285,
    distanceMeters: 620,
    wheelchairAccessible: true,
  },
];

export const mockStopDetails: Record<string, StopDetailResponse> = {
  'supermetro:sm_101': {
    stop: mockNearbyStops[0]!,
    departures: [
      {
        tripId: 'supermetro:trip_801',
        routeId: 'supermetro:rt_105',
        routeShortName: '105',
        routeLongName: 'CBD to Kikuyu via Waiyaki Way',
        headsign: 'Kikuyu Town',
        scheduledDepartureTime: new Date(Date.now() + 6 * 60000).toISOString(),
        estimatedDepartureTime: new Date(Date.now() + 8 * 60000).toISOString(),
        delaySeconds: 120, // +2 min
        status: 'LIVE',
        realtimeTimestamp: Date.now() - 5000, // 5s ago (fresh)
      },
      {
        tripId: 'supermetro:trip_802',
        routeId: 'supermetro:rt_105',
        routeShortName: '105',
        routeLongName: 'CBD to Kikuyu via Waiyaki Way',
        headsign: 'Kikuyu Town',
        scheduledDepartureTime: new Date(Date.now() + 18 * 60000).toISOString(),
        estimatedDepartureTime: new Date(Date.now() + 18 * 60000).toISOString(),
        delaySeconds: 0, // on time
        status: 'LIVE',
        realtimeTimestamp: Date.now() - 10000,
      },
    ],
  },
  'kbs:kbs_402': {
    stop: mockNearbyStops[1]!,
    departures: [
      {
        tripId: 'kbs:trip_46',
        routeId: 'kbs:rt_46',
        routeShortName: '46',
        routeLongName: 'CBD to Kawangware via Hurlingham',
        headsign: 'Kawangware',
        scheduledDepartureTime: new Date(Date.now() + 10 * 60000).toISOString(),
        estimatedDepartureTime: null,
        delaySeconds: null,
        status: 'SCHEDULED', // Scheduled fallback
      },
    ],
  },
  'matatu:mat_88': {
    stop: mockNearbyStops[2]!,
    departures: [
      {
        tripId: 'matatu:trip_99',
        routeId: 'matatu:rt_23',
        routeShortName: '23',
        routeLongName: 'CBD to Westlands',
        headsign: 'Westlands',
        scheduledDepartureTime: new Date(Date.now() + 12 * 60000).toISOString(),
        estimatedDepartureTime: new Date(Date.now() + 20 * 60000).toISOString(),
        delaySeconds: 480,
        status: 'STALE', // Stale feed for matatu agency (> 45s)
        realtimeTimestamp: Date.now() - 65000,
      },
    ],
  },
};
