import { z } from 'zod';
import { EntityIdSchema } from './common';

export const LegModeSchema = z.enum(['WALK', 'BUS', 'TRAIN']);
export type LegMode = z.infer<typeof LegModeSchema>;

export const JourneyLegSchema = z.object({
  id: z.string(),
  mode: LegModeSchema,
  fromStopId: EntityIdSchema.optional(),
  fromStopName: z.string(),
  toStopId: EntityIdSchema.optional(),
  toStopName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  durationSeconds: z.number().nonnegative(),
  distanceMeters: z.number().nonnegative(),
  routeId: EntityIdSchema.optional(),
  routeShortName: z.string().optional(),
  headsign: z.string().optional(),
  agencyId: z.string().optional(),
  delaySeconds: z.number().nullable().optional(),
  coordinates: z
    .array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
});

export type JourneyLeg = z.infer<typeof JourneyLegSchema>;

export const ItinerarySchema = z.object({
  id: z.string(),
  criteriaTag: z.enum(['fastest', 'transfers', 'walking']),
  departureTime: z.string(),
  arrivalTime: z.string(),
  durationSeconds: z.number().nonnegative(),
  transfersCount: z.number().nonnegative(),
  totalWalkDistanceMeters: z.number().nonnegative(),
  legs: z.array(JourneyLegSchema),
});

export type Itinerary = z.infer<typeof ItinerarySchema>;

export const JourneyResponseSchema = z.object({
  itineraries: z.array(ItinerarySchema),
  searchTimestamp: z.string().optional(),
});

export type JourneyResponse = z.infer<typeof JourneyResponseSchema>;
