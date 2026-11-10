import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { queryCacheStorage } from './storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Network/5xx retries are handled at Ky client level
      staleTime: 30 * 1000, // Default 30s
      gcTime: 24 * 60 * 60 * 1000, // Keep in offline cache for 24 hours
      refetchOnWindowFocus: false,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => Promise.resolve(queryCacheStorage.getString(key) ?? null),
    setItem: (key: string, value: string) => {
      queryCacheStorage.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      queryCacheStorage.remove(key);
      return Promise.resolve();
    },
  },
  throttleTime: 1000,
  key: 'CITY_CONNECTOR_OFFLINE_CACHE',
});
