import { z } from 'zod';

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

/**
 * Agency-namespaced entity ID: {agency_code}:{entity_id}
 */
export const EntityIdSchema = z.string().min(3);
