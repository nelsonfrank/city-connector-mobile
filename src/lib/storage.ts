import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Isolated MMKV instances for distinct domains
export const appStorage: MMKV = createMMKV({ id: 'city-connector-app' });
export const queryCacheStorage: MMKV = createMMKV({ id: 'city-connector-query-cache' });

// Zustand MMKV StateStorage adapter
export const zustandMMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    appStorage.set(name, value);
  },
  getItem: (name: string) => {
    const value = appStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    appStorage.remove(name);
  },
};
