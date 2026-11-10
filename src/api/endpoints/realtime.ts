import { apiRequest } from '../client';
import {
  RealtimeSnapshotSchema,
  type RealtimeSnapshot,
} from '../schemas/realtime';

export const realtimeQueryKeys = {
  all: ['realtime'] as const,
  snapshot: () => ['realtime', 'snapshot'] as const,
};

export async function fetchRealtimeSnapshot(
  signal?: AbortSignal,
): Promise<RealtimeSnapshot> {
  return apiRequest(
    'realtime/snapshot',
    RealtimeSnapshotSchema,
    {
      endpointName: 'GET /realtime/snapshot',
      signal,
    },
  );
}
