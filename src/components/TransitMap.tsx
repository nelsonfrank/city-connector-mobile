import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Map, Camera, Marker, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { env } from '@/config/env';
import type { Coordinates } from '@/lib/geo';

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

const TransitMapComponent: React.FC<TransitMapProps> = ({
  centerCoordinate = { latitude: -1.286389, longitude: 36.817223 },
  zoomLevel = 14,
  markers = [],
  routeCoordinates = [],
  onRegionChange,
  style,
  testID = 'transit-map',
}) => {
  // Cap rendered markers to 50 for mobile rendering performance
  const cappedMarkers = markers.slice(0, 50);

  // Convert route coordinates to GeoJSON LineString if present
  const routeGeoJson =
    routeCoordinates.length > 1
      ? {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: routeCoordinates.map((c) => [c.longitude, c.latitude]),
          },
        }
      : null;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Map
        style={styles.map}
        mapStyle={env.EXPO_PUBLIC_MAP_TILE_STYLE_URL}
        onRegionDidChange={(event: any) => {
          if (onRegionChange && event?.nativeEvent) {
            const center = event.nativeEvent.viewState?.center ?? event.nativeEvent.center ?? null;
            if (Array.isArray(center) && center.length >= 2) {
              const [lng, lat] = center;
              if (typeof lat === 'number' && typeof lng === 'number') {
                onRegionChange({ latitude: lat, longitude: lng });
              }
            }
          }
        }}
      >
        <Camera
          initialViewState={{
            center: [centerCoordinate.longitude, centerCoordinate.latitude],
            zoom: zoomLevel,
          }}
        />

        {routeGeoJson && (
          <GeoJSONSource id="route-source" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              layout={{
                'line-cap': 'round',
                'line-join': 'round',
              }}
              paint={{
                'line-color': '#0284C7',
                'line-width': 4,
              }}
            />
          </GeoJSONSource>
        )}

        {cappedMarkers.map((marker) => (
          <Marker key={marker.id} id={marker.id} lngLat={[marker.longitude, marker.latitude]}>
            <View>
              {marker.renderMarker ? (
                marker.renderMarker()
              ) : (
                <View style={styles.defaultMarkerDot} />
              )}
            </View>
          </Marker>
        ))}
      </Map>
    </View>
  );
};

export const TransitMap = memo(TransitMapComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  defaultMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
