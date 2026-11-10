import type { StateStorage } from 'zustand/middleware';

class WebStorage {
  private prefix: string;

  constructor(id: string) {
    this.prefix = `${id}:`;
  }

  set(key: string, value: string | boolean | number): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.prefix + key, String(value));
    } catch {}
  }

  getString(key: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const val = window.localStorage.getItem(this.prefix + key);
      return val ?? undefined;
    } catch {
      return undefined;
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(this.prefix + key);
    } catch {}
  }

  clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(this.prefix))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  }
}

export const appStorage = new WebStorage('city-connector-app');
export const queryCacheStorage = new WebStorage('city-connector-query-cache');

export const zustandMMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    appStorage.set(name, value);
  },
  getItem: (name: string) => {
    return appStorage.getString(name) ?? null;
  },
  removeItem: (name: string) => {
    appStorage.remove(name);
  },
};
