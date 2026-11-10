import { z } from 'zod';
import { EntityIdSchema } from './common';
import { StopSchema } from './stops';

export const RouteSearchResultSchema = z.object({
  id: EntityIdSchema,
  shortName: z.string(),
  longName: z.string(),
  agencyCode: z.string(),
  mode: z.enum(['BUS', 'TRAIN', 'FERRY', 'TRAM']).default('BUS'),
});

export type RouteSearchResult = z.infer<typeof RouteSearchResultSchema>;

export const SearchResponseSchema = z.object({
  stops: z.array(StopSchema),
  routes: z.array(RouteSearchResultSchema),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
