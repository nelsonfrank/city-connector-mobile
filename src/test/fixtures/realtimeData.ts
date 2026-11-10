import type { RealtimeSnapshot } from '@/api/schemas/realtime';

const now = Date.now();

export const mockRealtimeSnapshot: RealtimeSnapshot = {
  agencyStatuses: [
    {
      agencyCode: 'SUPERMETRO',
      status: 'live',
      lastUpdateTimestamp: now - 4000, // 4s ago -> live
    },
    {
      agencyCode: 'KBS',
      status: 'live',
      lastUpdateTimestamp: now - 8000, // 8s ago -> live
    },
    {
      agencyCode: 'MATATU',
      status: 'stale',
      lastUpdateTimestamp: now - 55000, // 55s ago -> stale (> 30s)
      message: 'GTFS-RT stream degraded from cellular packet loss',
    },
  ],
  vehicles: [
    {
      vehicleId: 'supermetro:veh_512',
      tripId: 'supermetro:trip_801',
      routeId: 'supermetro:rt_105',
      latitude: -1.2845,
      longitude: 36.824,
      bearing: 140,
      speedMps: 8.5,
      timestamp: now - 6000, // Fresh vehicle -> rendered
    },
    {
      vehicleId: 'kbs:veh_104',
      tripId: 'kbs:trip_46',
      routeId: 'kbs:rt_46',
      latitude: -1.288,
      longitude: 36.822,
      bearing: 220,
      speedMps: 12.0,
      timestamp: now - 9000, // Fresh vehicle -> rendered
    },
    {
      // Stale vehicle (> 30s old) - MUST NOT be rendered as a ghost vehicle
      vehicleId: 'matatu:veh_stale_99',
      tripId: 'matatu:trip_99',
      routeId: 'matatu:rt_23',
      latitude: -1.281,
      longitude: 36.821,
      bearing: 90,
      speedMps: 0,
      timestamp: now - 75000, // 75s ago -> stale ghost vehicle
    },
  ],
  delays: [
    {
      tripId: 'supermetro:trip_801',
      delaySeconds: 120, // +2 min delay
      timestamp: now - 5000,
    },
    {
      tripId: 'kbs:trip_46',
      delaySeconds: 0, // on time
      timestamp: now - 8000,
    },
  ],
};
