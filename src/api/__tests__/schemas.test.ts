import {
  JourneyResponseSchema,
  NearbyStopsResponseSchema,
  RealtimeSnapshotSchema,
  StopSchema,
} from '../schemas';
import { mockJourneyResponse } from '@/test/fixtures/journeyData';
import { mockRealtimeSnapshot } from '@/test/fixtures/realtimeData';
import { mockNearbyStops } from '@/test/fixtures/stopsData';

describe('Zod API Schemas Validation', () => {
  it('validates realistic mock nearby stops fixture successfully', () => {
    const result = NearbyStopsResponseSchema.safeParse(mockNearbyStops);
    expect(result.success).toBe(true);
  });

  it('rejects stop with invalid schema properties', () => {
    const invalidStop = {
      id: 'kbs:101',
      // missing name
      latitude: 'not-a-number',
      longitude: 36.8,
    };
    const result = StopSchema.safeParse(invalidStop);
    expect(result.success).toBe(false);
  });

  it('validates Pareto journey response fixture successfully', () => {
    const result = JourneyResponseSchema.safeParse(mockJourneyResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itineraries.length).toBe(3);
      expect(result.data.itineraries.map((it) => it.criteriaTag)).toEqual([
        'fastest',
        'transfers',
        'walking',
      ]);
    }
  });

  it('validates realtime snapshot fixture successfully', () => {
    const result = RealtimeSnapshotSchema.safeParse(mockRealtimeSnapshot);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agencyStatuses.length).toBe(3);
      expect(result.data.vehicles.length).toBe(3);
    }
  });
});
