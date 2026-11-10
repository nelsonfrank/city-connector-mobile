import type { SearchResponse } from '@/api/schemas/search';
import { mockNearbyStops } from './stopsData';

export const mockSearchResponse: SearchResponse = {
  stops: mockNearbyStops,
  routes: [
    {
      id: 'supermetro:rt_105',
      shortName: '105',
      longName: 'CBD - Westlands - Kikuyu',
      agencyCode: 'SUPERMETRO',
      mode: 'BUS',
    },
    {
      id: 'kbs:rt_46',
      shortName: '46',
      longName: 'CBD - Hurlingham - Kawangware',
      agencyCode: 'KBS',
      mode: 'BUS',
    },
    {
      id: 'ncr:commuter_link',
      shortName: 'NCR-1',
      longName: 'Nairobi Central - Ruiru Commuter Line',
      agencyCode: 'NCR',
      mode: 'TRAIN',
    },
  ],
};
