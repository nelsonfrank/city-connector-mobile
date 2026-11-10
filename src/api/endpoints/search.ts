import { apiRequest } from '../client';
import { SearchResponseSchema, type SearchResponse } from '../schemas/search';

export const searchQueryKeys = {
  all: ['search'] as const,
  query: (q: string) => ['search', q.trim().toLowerCase()] as const,
};

export async function searchTransit(query: string, signal?: AbortSignal): Promise<SearchResponse> {
  return apiRequest('search', SearchResponseSchema, {
    endpointName: 'GET /search',
    rateLimitCategory: 'search',
    searchParams: {
      q: query.trim(),
    },
    signal,
  });
}
