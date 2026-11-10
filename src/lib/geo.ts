export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates great-circle distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistanceMeters(from: Coordinates, to: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance in meters to a readable string (e.g. "150 m" or "2.4 km").
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Checks if map camera movement exceeds threshold in meters (used to prevent unnecessary refetches).
 */
export function hasSignificantMovement(
  prev: Coordinates | null,
  next: Coordinates,
  thresholdMeters: number = 75,
): boolean {
  if (!prev) return true;
  return calculateDistanceMeters(prev, next) >= thresholdMeters;
}
