import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchStopDetail, stopsQueryKeys } from '@/api/endpoints/stops';
import type { StopDeparture } from '@/api/schemas/stops';
import { StatusBadge } from '@/components/StatusBadge';
import { parseAgencyCode } from '@/lib/id';
import { formatTransitTime } from '@/lib/time';
import { useAppTheme } from '@/theme';

export interface StopDetailViewProps {
  stopId: string;
}

export const StopDetailView: React.FC<StopDetailViewProps> = ({ stopId }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: stopsQueryKeys.detail(stopId),
    queryFn: ({ signal }) => fetchStopDetail(stopId, signal),
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer} testID="stop-detail-loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer} testID="stop-detail-error">
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {t('common.errorGeneric')}
        </Text>
      </View>
    );
  }

  const { stop, departures } = data;
  const agency = parseAgencyCode(stop.id);

  const renderDepartureItem = ({ item }: { item: StopDeparture }) => {
    const isLive = item.status === 'LIVE' && item.delaySeconds != null;
    const isStale = item.status === 'STALE';
    const departureTime = item.estimatedDepartureTime ?? item.scheduledDepartureTime;

    let badgeVariant: 'live' | 'scheduled' | 'stale' = 'scheduled';
    if (isLive) {
      badgeVariant = 'live';
    } else if (isStale) {
      badgeVariant = 'stale';
    }

    return (
      <View
        style={[
          styles.departureItem,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.surfaceBorder,
          },
        ]}
      >
        <View style={styles.routePill}>
          <Text style={styles.routeNumber}>{item.routeShortName}</Text>
        </View>

        <View style={styles.departureMeta}>
          <Text style={[styles.headsign, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {item.headsign}
          </Text>
          <Text style={[styles.timeScheduled, { color: theme.colors.textMuted }]}>
            {formatTransitTime(departureTime)}
          </Text>
        </View>

        <StatusBadge
          variant={badgeVariant}
          delayMinutes={item.delaySeconds ? Math.round(item.delaySeconds / 60) : undefined}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
        <Text style={[styles.stopName, { color: theme.colors.textPrimary }]}>{stop.name}</Text>
        <View style={styles.subHeader}>
          <View style={[styles.agencyBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.agencyCode, { color: theme.colors.textSecondary }]}>{agency}</Text>
          </View>
          {stop.code && (
            <Text style={[styles.stopCode, { color: theme.colors.textMuted }]}>#{stop.code}</Text>
          )}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {t('nearby.departures')}
      </Text>

      <FlatList
        data={departures}
        keyExtractor={(item) => item.tripId}
        renderItem={renderDepartureItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              {t('nearby.noDepartures')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  stopName: {
    fontSize: 20,
    fontWeight: '700',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  agencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  agencyCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  stopCode: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  departureItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  routePill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 42,
    alignItems: 'center',
  },
  routeNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  departureMeta: {
    flex: 1,
  },
  headsign: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeScheduled: {
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    fontSize: 15,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
