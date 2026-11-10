import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyStops, stopsQueryKeys } from '@/api/endpoints/stops';
import type { Stop } from '@/api/schemas/stops';
import { Button } from '@/components/Button';
import { FeedStatusBanner } from '@/components/FeedStatusBanner';
import { OfflineBanner } from '@/components/OfflineBanner';
import { TransitMap, type MarkerItem } from '@/components/TransitMap';
import { useRealtimeSnapshot } from '@/features/realtime/useRealtimeSnapshot';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_FALLBACK_COORDINATES, useLocation } from '@/hooks/useLocation';
import { hasSignificantMovement, type Coordinates } from '@/lib/geo';
import { useAppTheme } from '@/theme';
import { StopListItem } from './components/StopListItem';

export const NearbyScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const {
    location,
    permissionStatus,
    isLoading: isLocationLoading,
    requestPermission,
  } = useLocation();

  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const activeCenter = useMemo(
    () => mapCenter ?? location ?? DEFAULT_FALLBACK_COORDINATES,
    [mapCenter, location],
  );

  // Debounce map camera movement by 500ms
  const debouncedCenter = useDebounce(activeCenter, 500);

  // Realtime vehicles and degraded agency statuses
  const { activeVehicles, degradedAgencies } = useRealtimeSnapshot(true);

  // Query nearby stops debounced
  const { data: stops, isLoading: isStopsLoading } = useQuery({
    queryKey: stopsQueryKeys.nearby(debouncedCenter.latitude, debouncedCenter.longitude),
    queryFn: ({ signal }) =>
      fetchNearbyStops(debouncedCenter.latitude, debouncedCenter.longitude, 800, signal),
  });

  const handleRegionChange = useCallback(
    (newCoords: Coordinates) => {
      if (hasSignificantMovement(activeCenter, newCoords, 75)) {
        setMapCenter(newCoords);
      }
    },
    [activeCenter],
  );

  const handleStopPress = useCallback(
    (stop: Stop) => {
      router.push(`/stop/${encodeURIComponent(stop.id)}`);
    },
    [router],
  );

  // Map markers: Stop points + Live vehicle points
  const markers: MarkerItem[] = useMemo(() => {
    const stopMarkers: MarkerItem[] = (stops ?? []).map((stop) => ({
      id: `stop-${stop.id}`,
      latitude: stop.latitude,
      longitude: stop.longitude,
      title: stop.name,
    }));

    const vehicleMarkers: MarkerItem[] = activeVehicles.map((v) => ({
      id: `veh-${v.vehicleId}`,
      latitude: v.latitude,
      longitude: v.longitude,
      title: v.vehicleId,
      renderMarker: () => (
        <View style={styles.vehicleMarkerDot}>
          <Text style={styles.vehicleMarkerText}>🚌</Text>
        </View>
      ),
    }));

    return [...stopMarkers, ...vehicleMarkers];
  }, [stops, activeVehicles]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <OfflineBanner />
      <FeedStatusBanner degradedAgencies={degradedAgencies} />

      {permissionStatus === 'undetermined' && (
        <View
          style={[
            styles.permissionRationale,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
          ]}
        >
          <Text style={[styles.rationaleTitle, { color: theme.colors.textPrimary }]}>
            {t('nearby.requestLocation')}
          </Text>
          <Text style={[styles.rationaleText, { color: theme.colors.textSecondary }]}>
            {t('nearby.locationRationale')}
          </Text>
          <Button
            title={t('nearby.requestLocation')}
            onPress={requestPermission}
            loading={isLocationLoading}
          />
        </View>
      )}

      {permissionStatus === 'denied' && (
        <View
          style={[
            styles.deniedBanner,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.colors.surfaceBorder,
            },
          ]}
        >
          <Text style={[styles.deniedText, { color: theme.colors.textSecondary }]}>
            {t('nearby.locationDenied')}
          </Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <TransitMap
          centerCoordinate={activeCenter}
          markers={markers}
          onRegionChange={handleRegionChange}
        />
      </View>

      <View
        style={[
          styles.sheetContainer,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceBorder },
        ]}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>
            {t('nearby.title')}
          </Text>
          {isStopsLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>

        <FlatList
          data={stops ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StopListItem stop={item} onPress={handleStopPress} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isStopsLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  {t('nearby.noStopsNearby')}
                </Text>
              </View>
            ) : undefined
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionRationale: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  rationaleTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rationaleText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  deniedBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  deniedText: {
    fontSize: 12,
  },
  mapContainer: {
    height: '45%',
  },
  sheetContainer: {
    flex: 1,
    borderTopWidth: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  vehicleMarkerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  vehicleMarkerText: {
    fontSize: 14,
  },
});
