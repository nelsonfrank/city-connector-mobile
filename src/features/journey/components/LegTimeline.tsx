import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Footprints, Bus, Train, ArrowDown } from 'lucide-react-native';
import type { JourneyLeg } from '@/api/schemas/journey';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDistance } from '@/lib/geo';
import { formatTransitTime } from '@/lib/time';
import { useAppTheme } from '@/theme';

export interface LegTimelineProps {
  legs: JourneyLeg[];
}

export const LegTimeline: React.FC<LegTimelineProps> = ({ legs }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      {legs.map((leg, index) => {
        const nextLeg = legs[index + 1];
        const isAgencyTransfer =
          nextLeg &&
          nextLeg.agencyId &&
          leg.agencyId &&
          nextLeg.agencyId !== leg.agencyId;

        const getModeIcon = () => {
          if (leg.mode === 'WALK') {
            return <Footprints size={16} color={theme.colors.textMuted} />;
          }
          if (leg.mode === 'TRAIN') {
            return <Train size={16} color="#0F766E" />;
          }
          return <Bus size={16} color={theme.colors.primary} />;
        };

        return (
          <View key={leg.id} style={styles.legWrapper}>
            <View style={styles.timeColumn}>
              <Text style={[styles.timeText, { color: theme.colors.textPrimary }]}>
                {formatTransitTime(leg.startTime)}
              </Text>
              <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
                {formatTransitTime(leg.endTime)}
              </Text>
            </View>

            <View style={styles.timelineAxis}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      leg.mode === 'WALK' ? theme.colors.surfaceBorder : theme.colors.primary,
                  },
                ]}
              />
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor:
                      leg.mode === 'WALK' ? theme.colors.surfaceBorder : theme.colors.primary,
                    borderStyle: leg.mode === 'WALK' ? 'dashed' : 'solid',
                  },
                ]}
              />
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      leg.mode === 'WALK' ? theme.colors.surfaceBorder : theme.colors.primary,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.legCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                },
              ]}
            >
              <View style={styles.legHeader}>
                <View style={styles.modeRow}>
                  {getModeIcon()}
                  <Text style={[styles.modeTitle, { color: theme.colors.textPrimary }]}>
                    {leg.mode === 'WALK'
                      ? `${t('common.walk')} (${formatDistance(leg.distanceMeters)})`
                      : `${leg.agencyId?.toUpperCase() ?? ''} ${leg.routeShortName ?? ''}`}
                  </Text>
                </View>
                {leg.delaySeconds != null && (
                  <StatusBadge
                    variant={leg.delaySeconds > 0 ? 'delayed' : 'onTime'}
                    delayMinutes={Math.round(leg.delaySeconds / 60)}
                  />
                )}
              </View>

              <Text style={[styles.stopName, { color: theme.colors.textPrimary }]}>
                {leg.fromStopName}
              </Text>
              <ArrowDown size={14} color={theme.colors.textMuted} style={styles.arrowIcon} />
              <Text style={[styles.stopName, { color: theme.colors.textPrimary }]}>
                {leg.toStopName}
              </Text>

              {isAgencyTransfer && (
                <View
                  style={[
                    styles.transferAlert,
                    {
                      backgroundColor: theme.colors.warningLight,
                      borderColor: theme.colors.warning,
                    },
                  ]}
                >
                  <Text style={[styles.transferAlertText, { color: theme.colors.textPrimary }]}>
                    {t('journey.transferAt', {
                      agency: nextLeg.agencyId?.toUpperCase(),
                      route: nextLeg.routeShortName ?? '',
                      stop: leg.toStopName,
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  legWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    width: 48,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineAxis: {
    alignItems: 'center',
    width: 16,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    flex: 1,
    width: 2,
    marginVertical: 4,
  },
  legCard: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stopName: {
    fontSize: 13,
    fontWeight: '500',
  },
  arrowIcon: {
    marginVertical: 2,
    marginLeft: 4,
  },
  transferAlert: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  transferAlertText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
