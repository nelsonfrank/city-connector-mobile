import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinates } from '@/lib/geo';
import { logger } from '@/lib/logger';

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface UseLocationResult {
  location: Coordinates | null;
  permissionStatus: LocationPermissionStatus;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  setManualLocation: (coords: Coordinates) => void;
  refreshLocation: () => Promise<void>;
}

// Default fallback transit hub coordinates (Nairobi CBD)
export const DEFAULT_FALLBACK_COORDINATES: Coordinates = {
  latitude: -1.286389,
  longitude: 36.817223,
};

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkPermissionAndFetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } else if (status === 'denied') {
        setPermissionStatus('denied');
        setLocation(DEFAULT_FALLBACK_COORDINATES);
      } else {
        setPermissionStatus('undetermined');
      }
    } catch (err) {
      logger.warn('Failed to obtain device location:', err);
      setError('Unable to fetch current location');
      setLocation(DEFAULT_FALLBACK_COORDINATES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        return true;
      } else {
        setPermissionStatus('denied');
        setLocation(DEFAULT_FALLBACK_COORDINATES);
        return false;
      }
    } catch (err) {
      logger.warn('Error requesting foreground location permissions:', err);
      setError('Location request failed');
      setPermissionStatus('denied');
      setLocation(DEFAULT_FALLBACK_COORDINATES);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setManualLocation = useCallback((coords: Coordinates) => {
    setLocation(coords);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (isCancelled) return;
        if (status === 'granted') {
          setPermissionStatus('granted');
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isCancelled) return;
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        } else if (status === 'denied') {
          setPermissionStatus('denied');
          setLocation(DEFAULT_FALLBACK_COORDINATES);
        } else {
          setPermissionStatus('undetermined');
        }
      } catch (err) {
        if (isCancelled) return;
        logger.warn('Failed to obtain device location:', err);
        setError('Unable to fetch current location');
        setLocation(DEFAULT_FALLBACK_COORDINATES);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    location,
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    setManualLocation,
    refreshLocation: checkPermissionAndFetchLocation,
  };
}
