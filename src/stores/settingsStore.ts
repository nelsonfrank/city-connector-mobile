import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/lib/storage';

export type AppThemeMode = 'system' | 'light' | 'dark';
export type AppLanguage = 'en' | 'sw';
export type AppUnits = 'metric' | 'imperial';

interface SettingsState {
  theme: AppThemeMode;
  language: AppLanguage;
  units: AppUnits;
  realtimeRefreshIntervalMs: number;
  setTheme: (theme: AppThemeMode) => void;
  setLanguage: (lang: AppLanguage) => void;
  setUnits: (units: AppUnits) => void;
  setRealtimeRefreshIntervalMs: (intervalMs: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      units: 'metric',
      realtimeRefreshIntervalMs: 20000,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setUnits: (units) => set({ units }),
      setRealtimeRefreshIntervalMs: (realtimeRefreshIntervalMs) =>
        set({ realtimeRefreshIntervalMs }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
