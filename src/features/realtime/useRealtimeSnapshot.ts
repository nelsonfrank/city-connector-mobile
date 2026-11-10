import { useQuery } from '@tanstack/react-query';
import { useAppState } from '@/hooks/useAppState';
import { useOnline } from '@/hooks/useOnline';
import { fetchRealtimeSnapshot, realtimeQueryKeys } from '@/api/endpoints/realtime';
import type { AgencyFeedStatus, RealtimeSnapshot, VehiclePosition } from '@/api/schemas/realtime';
import { isRealtimeStale } from '@/lib/time';
import { useSettingsStore } from '@/stores/settingsStore';

export interface UseRealtimeResult {
  snapshot: RealtimeSnapshot | undefined;
  activeVehicles: VehiclePosition[];
  agencyStatuses: AgencyFeedStatus[];
  degradedAgencies: AgencyFeedStatus[];
  isLoading: boolean;
  isStale: boolean;
  refetch: () => void;
}

export function useRealtimeSnapshot(isScreenFocused: boolean = true): UseRealtimeResult {
  const appState = useAppState();
  const { isOnline } = useOnline();
  const pollIntervalMs = useSettingsStore((s) => s.realtimeRefreshIntervalMs);

  // Poll only when app is active, screen is focused, and device is online
  const isPollingEnabled = appState === 'active' && isScreenFocused && isOnline;

  const query = useQuery({
    queryKey: realtimeQueryKeys.snapshot(),
    queryFn: ({ signal }) => fetchRealtimeSnapshot(signal),
    refetchInterval: isPollingEnabled ? pollIntervalMs : false,
    staleTime: 0, // Realtime is always immediately evaluated for freshness
    retry: false, // Decoupled: do not hold up UI on realtime poll failures
  });

  const snapshot = query.data;

  // Filter out ghost vehicles (must be younger than staleness threshold)
  const activeVehicles = snapshot?.vehicles.filter((v) => !isRealtimeStale(v.timestamp)) ?? [];

  const agencyStatuses = snapshot?.agencyStatuses ?? [];
  const degradedAgencies = agencyStatuses.filter(
    (status) => status.status === 'stale' || status.status === 'unavailable',
  );

  return {
    snapshot,
    activeVehicles,
    agencyStatuses,
    degradedAgencies,
    isLoading: query.isLoading,
    isStale: query.isStale,
    refetch: query.refetch,
  };
}
