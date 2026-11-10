import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bus, MapPin, ChevronRight, Accessibility } from 'lucide-react-native';
import type { Stop } from '@/api/schemas/stops';
import { formatDistance } from '@/lib/geo';
import { parseAgencyCode } from '@/lib/id';
import { useAppTheme } from '@/theme';

export interface StopListItemProps {
  stop: Stop;
  onPress: (stop: Stop) => void;
}

const StopListItemComponent: React.FC<StopListItemProps> = ({ stop, onPress }) => {
  const { theme } = useAppTheme();
  const agencyCode = parseAgencyCode(stop.id);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
        },
      ]}
      onPress={() => onPress(stop)}
      accessibilityRole="button"
      accessibilityLabel={`Stop: ${stop.name}, Agency: ${agencyCode}, Distance: ${
        stop.distanceMeters ? formatDistance(stop.distanceMeters) : 'nearby'
      }`}
      testID={`stop-item-${stop.id}`}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <Bus size={20} color={theme.colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {stop.name}
          </Text>
          {stop.wheelchairAccessible && (
            <Accessibility
              size={14}
              color={theme.colors.primary}
              accessibilityLabel="Wheelchair accessible"
            />
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.agencyBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.agencyText, { color: theme.colors.textSecondary }]}>
              {agencyCode}
            </Text>
          </View>

          {stop.distanceMeters != null && (
            <View style={styles.distanceRow}>
              <MapPin size={12} color={theme.colors.textMuted} />
              <Text style={[styles.distanceText, { color: theme.colors.textMuted }]}>
                {formatDistance(stop.distanceMeters)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ChevronRight size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
};

export const StopListItem = memo(StopListItemComponent);

const styles = StyleSheet.create({
  container: {
    minHeight: 56, // Meets accessible > 44pt touch target
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  agencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  agencyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 12,
  },
});
