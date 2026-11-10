import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Footprints, GitCommit } from 'lucide-react-native';
import type { Itinerary } from '@/api/schemas/journey';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDistance } from '@/lib/geo';
import { formatDurationMinutes, formatTransitTime } from '@/lib/time';
import { useAppTheme } from '@/theme';

export interface JourneyOptionCardProps {
  itinerary: Itinerary;
  isSelected: boolean;
  onSelect: (itinerary: Itinerary) => void;
}

const JourneyOptionCardComponent: React.FC<JourneyOptionCardProps> = ({
  itinerary,
  isSelected,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  // Aggregate live delays from legs
  const maxDelaySeconds = itinerary.legs.reduce((acc, leg) => {
    return Math.max(acc, leg.delaySeconds ?? 0);
  }, 0);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.surfaceBorder,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={() => onSelect(itinerary)}
      accessibilityRole="button"
      accessibilityLabel={`Itinerary ${itinerary.criteriaTag}: ${formatDurationMinutes(
        itinerary.durationSeconds,
      )}, ${itinerary.transfersCount} transfers`}
      testID={`journey-option-${itinerary.id}`}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.timeGroup}>
          <Text style={[styles.timeText, { color: theme.colors.textPrimary }]}>
            {formatTransitTime(itinerary.departureTime)}
          </Text>
          <ArrowRight size={14} color={theme.colors.textMuted} />
          <Text style={[styles.timeText, { color: theme.colors.textPrimary }]}>
            {formatTransitTime(itinerary.arrivalTime)}
          </Text>
        </View>

        <Text style={[styles.durationText, { color: theme.colors.primary }]}>
          {formatDurationMinutes(itinerary.durationSeconds)}
        </Text>
      </View>

      <View style={styles.legBadgesRow}>
        {itinerary.legs.map((leg) => {
          if (leg.mode === 'WALK') {
            return (
              <View key={leg.id} style={styles.legIcon}>
                <Footprints size={14} color={theme.colors.textMuted} />
              </View>
            );
          }
          return (
            <View
              key={leg.id}
              style={[
                styles.transitPill,
                {
                  backgroundColor: leg.mode === 'TRAIN' ? '#0F766E' : theme.colors.primary,
                },
              ]}
            >
              <Text style={styles.transitPillText}>
                {leg.routeShortName ?? (leg.mode === 'TRAIN' ? t('common.train') : t('common.bus'))}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.bottomRow, { borderTopColor: theme.colors.surfaceBorder }]}>
        <View style={styles.statGroup}>
          <GitCommit size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            {t('journey.transfers', { count: itinerary.transfersCount })}
          </Text>
        </View>

        <View style={styles.statGroup}>
          <Footprints size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            {formatDistance(itinerary.totalWalkDistanceMeters)}
          </Text>
        </View>

        {maxDelaySeconds > 0 ? (
          <StatusBadge variant="delayed" delayMinutes={Math.round(maxDelaySeconds / 60)} />
        ) : (
          <StatusBadge variant="onTime" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const JourneyOptionCard = memo(JourneyOptionCardComponent);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '700',
  },
  legBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  legIcon: {
    padding: 4,
  },
  transitPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  transitPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
