/* eslint-disable i18next/no-literal-string */
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import type { Coordinates } from '@/lib/geo';
import { useAppTheme } from '@/theme';

export interface MarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  renderMarker?: () => React.ReactNode;
}

export interface TransitMapProps {
  centerCoordinate?: Coordinates;
  zoomLevel?: number;
  markers?: MarkerItem[];
  routeCoordinates?: Coordinates[];
  onRegionChange?: (coords: Coordinates) => void;
  style?: object;
  testID?: string;
}

const TransitMapWebComponent: React.FC<TransitMapProps> = ({
  centerCoordinate = { latitude: -1.286389, longitude: 36.817223 },
  markers = [],
  style,
  testID = 'transit-map',
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.surfaceBorder },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        <MapPin size={32} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Transit Map (Web View)
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Lat: {centerCoordinate.latitude.toFixed(4)}, Lng: {centerCoordinate.longitude.toFixed(4)}
        </Text>
        <Text
          style={[
            styles.badge,
            { backgroundColor: theme.colors.surface, color: theme.colors.primary },
          ]}
        >
          {markers.length} Active Transit Markers
        </Text>
      </View>
    </View>
  );
};

export const TransitMap = memo(TransitMapWebComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
