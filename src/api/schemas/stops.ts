import { z } from 'zod';
import { EntityIdSchema } from './common';

export const StopSchema = z.object({
  id: EntityIdSchema,
  name: z.string(),
  code: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  distanceMeters: z.number().optional(),
  wheelchairAccessible: z.boolean().default(false),
});

export type Stop = z.infer<typeof StopSchema>;

export const StopDepartureSchema = z.object({
  tripId: EntityIdSchema,
  routeId: EntityIdSchema,
  routeShortName: z.string(),
  routeLongName: z.string().optional(),
  headsign: z.string(),
  scheduledDepartureTime: z.string(),
  estimatedDepartureTime: z.string().nullable().optional(),
  delaySeconds: z.number().nullable().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'STALE']).default('SCHEDULED'),
  realtimeTimestamp: z.number().optional(),
});

export type StopDeparture = z.infer<typeof StopDepartureSchema>;

export const NearbyStopsResponseSchema = z.array(StopSchema);
export type NearbyStopsResponse = z.infer<typeof NearbyStopsResponseSchema>;

export const StopDetailResponseSchema = z.object({
  stop: StopSchema,
  departures: z.array(StopDepartureSchema),
});
export type StopDetailResponse = z.infer<typeof StopDetailResponseSchema>;
