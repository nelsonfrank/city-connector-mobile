import { z } from 'zod';
import { EntityIdSchema } from './common';

export const VehiclePositionSchema = z.object({
  vehicleId: EntityIdSchema,
  tripId: EntityIdSchema,
  routeId: EntityIdSchema,
  latitude: z.number(),
  longitude: z.number(),
  bearing: z.number().optional(),
  speedMps: z.number().optional(),
  timestamp: z.number(),
});

export type VehiclePosition = z.infer<typeof VehiclePositionSchema>;

export const TripDelaySchema = z.object({
  tripId: EntityIdSchema,
  stopId: EntityIdSchema.optional(),
  delaySeconds: z.number(),
  timestamp: z.number(),
});

export type TripDelay = z.infer<typeof TripDelaySchema>;

export const AgencyFeedStatusSchema = z.object({
  agencyCode: z.string(),
  status: z.enum(['live', 'stale', 'unavailable']),
  lastUpdateTimestamp: z.number(),
  message: z.string().optional(),
});

export type AgencyFeedStatus = z.infer<typeof AgencyFeedStatusSchema>;

export const RealtimeSnapshotSchema = z.object({
  agencyStatuses: z.array(AgencyFeedStatusSchema),
  vehicles: z.array(VehiclePositionSchema),
  delays: z.array(TripDelaySchema),
});

export type RealtimeSnapshot = z.infer<typeof RealtimeSnapshotSchema>;
